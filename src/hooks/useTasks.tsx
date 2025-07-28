import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TaskStatus = 'pending' | 'progress' | 'validated';

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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
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
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTasks(); // Recharger pour avoir les relations
      return { data, error: null };
    } catch (err) {
      console.error('Error creating task:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de la création' };
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus, proofPhoto?: string) => {
    try {
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

      if (error) throw error;
      
      await fetchTasks(); // Recharger pour avoir les données mises à jour
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
  }) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([{ task_id: taskId, ...commentData }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTasks(); // Recharger pour avoir les commentaires mis à jour
      return { data, error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire' };
    }
  };

  const addPhotos = async (taskId: string, photos: { url: string; filename: string }[]) => {
    try {
      const photosData = photos.map(photo => ({
        task_id: taskId,
        ...photo
      }));

      const { data, error } = await supabase
        .from('task_photos')
        .insert(photosData)
        .select();

      if (error) throw error;
      
      await fetchTasks(); // Recharger pour avoir les photos mises à jour
      return { data, error: null };
    } catch (err) {
      console.error('Error adding photos:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Erreur lors de l\'ajout des photos' };
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
    addComment,
    addPhotos,
  };
};