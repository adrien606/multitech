import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStorageUpload } from './useStorageUpload';

export type TaskStatus = 'pending' | 'progress' | 'validation_requested' | 'validated';

export interface TaskPhoto {
  id: string;
  url: string;
  filename: string;
  uploaded_at: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  comment_type: 'assignment' | 'progress' | 'clarification';
  photo_url?: string;
  photo_filename?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  building_id: string;
  building_name?: string;
  status: TaskStatus;
  priority: number;
  due_date: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  proof_photo?: string;
  created_at: string;
  updated_at: string;
  photos?: TaskPhoto[];
  comments?: TaskComment[];
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile, uploadMultipleFiles } = useStorageUpload();

  const fetchTasks = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      
      // Récupérer les tâches avec les informations des bâtiments et agents
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          buildings!inner(name),
          agents(full_name)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Pour chaque tâche, récupérer ses photos et commentaires
      const tasksWithDetails = await Promise.all(
        (tasksData || []).map(async (task) => {
          // Récupérer les photos
          const { data: photos } = await supabase
            .from('task_photos')
            .select('*')
            .eq('task_id', task.id)
            .order('uploaded_at', { ascending: true });

          // Récupérer les commentaires
          const { data: comments } = await supabase
            .from('task_comments')
            .select('*')
            .eq('task_id', task.id)
            .order('created_at', { ascending: true });

          return {
            ...task,
            building_name: task.buildings?.name,
            assigned_to_name: task.agents?.full_name,
            photos: photos || [],
            comments: comments || [],
            status: task.status as TaskStatus,
            priority: task.priority ?? 2,
          } as Task;
        })
      );

      setTasks(tasksWithDetails);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description: string;
    building_id: string;
    due_date: string;
    assigned_to_id?: string;
    priority?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      // Mise à jour optimiste - ajouter la nouvelle tâche sans rechargement complet
      const newTask: Task = {
        ...data,
        building_name: undefined,
        assigned_to_name: undefined,
        status: data.status as TaskStatus,
        priority: data.priority ?? 2,
        photos: [],
        comments: []
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Refetch en arrière-plan pour avoir les relations complètes
      fetchTasks(false);
      
      return { data, error: null };
    } catch (err) {
      console.error('Error creating task:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus, proofPhoto?: string) => {
    try {
      // Mise à jour optimiste AVANT la requête pour un changement instantané
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id 
            ? { ...task, status, proof_photo: proofPhoto || task.proof_photo }
            : task
        )
      );

      const updateData: any = { status };
      if (proofPhoto) {
        updateData.proof_photo = proofPhoto;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // En cas d'erreur, restaurer l'état précédent
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === id 
              ? { ...task, status: task.status === status ? 'pending' : task.status }
              : task
          )
        );
        throw error;
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating task status:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' };
    }
  };

  const addComment = async (taskId: string, commentData: {
    text: string;
    author: string;
    comment_type: 'assignment' | 'progress' | 'clarification';
    photo_url?: string;
    photo_filename?: string;
  }, photoFile?: File) => {
    try {
      let finalCommentData = { ...commentData };
      
      // Si une photo est fournie, l'uploader d'abord
      if (photoFile) {
        const uploadResult = await uploadFile(photoFile, 'task-comments');
        finalCommentData.photo_url = uploadResult.url;
        finalCommentData.photo_filename = uploadResult.filename;
      }
      
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{ task_id: taskId, ...finalCommentData }])
        .select()
        .single();

      if (error) throw error;
      
      // Mise à jour optimiste - ajouter le commentaire localement
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                comments: [...(task.comments || []), {
                  id: data.id,
                  text: data.text,
                  author: data.author,
                  comment_type: data.comment_type as 'assignment' | 'progress' | 'clarification',
                  photo_url: data.photo_url,
                  photo_filename: data.photo_filename,
                  created_at: data.created_at
                }]
              }
            : task
        )
      );
      
      // Refetch en arrière-plan pour synchroniser
      fetchTasks(false);
      
      return { data, error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire' };
    }
  };

  const addPhotos = async (taskId: string, files: File[]) => {
    try {
      // Upload tous les fichiers vers Supabase Storage
      const uploadResults = await uploadMultipleFiles(files, 'task-photos');
      
      // Insérer les informations des photos dans la base de données
      const photosData = uploadResults.map(result => ({
        task_id: taskId,
        url: result.url,
        filename: result.filename
      }));

      const { data, error } = await supabase
        .from('task_photos')
        .insert(photosData)
        .select();

      if (error) throw error;
      
      // Mise à jour optimiste - ajouter les photos localement
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                photos: [...(task.photos || []), ...(data || []).map(photo => ({
                  id: photo.id,
                  url: photo.url,
                  filename: photo.filename,
                  uploaded_at: photo.uploaded_at
                }))]
              }
            : task
        )
      );
      
      // Refetch en arrière-plan pour synchroniser
      fetchTasks(false);
      
      return { data, error: null };
    } catch (err) {
      console.error('Error adding photos:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de l\'ajout des photos' };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Supprimer d'abord les photos et commentaires associés
      await supabase.from('task_photos').delete().eq('task_id', taskId);
      await supabase.from('task_comments').delete().eq('task_id', taskId);
      
      // Puis supprimer la tâche
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      // Mise à jour optimiste - retirer la tâche localement
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return { error: null };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' };
    }
  };

  const updateTaskPriority = async (taskId: string, priority: number) => {
    try {
      // Mise à jour optimiste
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, priority } : task
        )
      );

      const { data, error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        // Restaurer en cas d'erreur
        fetchTasks(false);
        throw error;
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating task priority:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la priorité' };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTaskStatus,
    updateTaskPriority,
    addComment,
    addPhotos,
    deleteTask,
  };
};