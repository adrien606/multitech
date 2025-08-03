import { useState } from "react";
import { TaskCard } from "@/components/TaskCard";
import { TaskStats } from "@/components/TaskStats";
import { BuildingSelector } from "@/components/BuildingSelector";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { NewTaskModal } from "@/components/NewTaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Users, Building, LogOut, Shield, Home, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";
import { useBuildings } from "@/hooks/useBuildings";
import { useTasks, Task, TaskStatus } from "@/hooks/useTasks";
import { toast } from "sonner";
import { getRoleLabel } from "@/utils/userRole.utils";

export default function Dashboard() {
  const { profile, role, signOut } = useAuth();
  const { agents, loading: agentsLoading } = useAgents();
  const { buildings, loading: buildingsLoading } = useBuildings();
  const { tasks, loading: tasksLoading, createTask, updateTaskStatus, addComment, addPhotos, deleteTask } = useTasks();
  
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Convertir les tâches pour compatibilité avec les types existants
  const compatibleTasks = tasks.map(task => ({
    ...task,
    buildingId: task.building_id,
    buildingName: task.building_name || 'Bâtiment inconnu',
    assignedTo: task.assigned_to_name || 'Non assigné',
    dueDate: new Date(task.due_date),
    createdAt: new Date(task.created_at),
    photos: task.photos?.map(photo => ({
      ...photo,
      uploadedAt: new Date(photo.uploaded_at)
    })) || [],
    comments: task.comments?.map(comment => ({
      ...comment,
      type: comment.comment_type,
      createdAt: new Date(comment.created_at),
      photo: comment.photo_url ? {
        url: comment.photo_url,
        filename: comment.photo_filename || 'photo.jpg'
      } : undefined
    })) || [],
    proofPhoto: task.proof_photo
  }));

  const filteredTasks = compatibleTasks.filter((task) => {
    const matchesBuilding = !selectedBuilding || task.buildingId === selectedBuilding;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesBuilding && matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, comment?: string) => {
    try {
      // Mettre à jour selectedTask immédiatement pour la modal
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: newStatus,
        });
      }

      const result = await updateTaskStatus(taskId, newStatus);
      if (result.error) {
        // En cas d'erreur, restaurer l'état précédent dans selectedTask
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            status: selectedTask.status, // Restaurer le statut original
          });
        }
        toast.error(result.error);
        return;
      }

      // Ajouter un commentaire automatique si fourni
      if (comment) {
        await addComment(taskId, {
          text: comment,
          author: `${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`,
          comment_type: 'progress',
        });
      }

      toast.success('Statut mis à jour avec succès');
      
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleViewDetails = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    building_id: string;
    due_date: string;
    assigned_to_id?: string;
  }, files?: File[]) => {
    try {
      const result = await createTask(taskData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Ajouter le commentaire de création
      if (result.data) {
        await addComment(result.data.id, {
          text: "Tâche créée et assignée.",
          author: `${profile?.full_name || 'Utilisateur'} (${getRoleLabel(role || 'agent')})`,
          comment_type: 'assignment',
        });

        // Si des photos sont présentes, les ajouter
        if (files && files.length > 0) {
          const photoResult = await addPhotos(result.data.id, files);
          if (photoResult.error) {
            toast.error("Tâche créée mais erreur lors de l'ajout des photos: " + photoResult.error);
          } else {
            toast.success('Tâche créée avec succès avec photos');
          }
        } else {
          toast.success('Tâche créée avec succès');
        }
      }

      setIsNewTaskOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erreur lors de la création de la tâche');
    }
  };

  const handleAddComment = async (taskId: string, commentData: any, photoFile?: File) => {
    try {
      const result = await addComment(taskId, {
        text: commentData.text,
        author: commentData.author,
        comment_type: commentData.type,
      }, photoFile);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Commentaire ajouté avec succès');
      
      // Mettre à jour selectedTask si c'est la tâche courante
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = compatibleTasks.find(task => task.id === taskId);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  const handleAddPhotos = async (taskId: string, newPhotos: any[], files: File[]) => {
    try {
      const result = await addPhotos(taskId, files);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Photos ajoutées avec succès');
      
      // Mettre à jour selectedTask si c'est la tâche courante
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = compatibleTasks.find(task => task.id === taskId);
        if (updatedTask) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error('Error adding photos:', error);
      toast.error('Erreur lors de l\'ajout des photos');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Tâche supprimée avec succès');
      
      // Fermer la modal si la tâche supprimée était ouverte
      if (selectedTask && selectedTask.id === taskId) {
        setIsTaskDetailOpen(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const loading = tasksLoading || buildingsLoading || agentsLoading;
  
  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Maintenance</h1>
              <p className="text-muted-foreground mt-1">
                Gestion des tâches d'entretien multi-bâtiments
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Button>
              </Link>
              <Link to="/regulatory-controls">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Shield className="w-4 h-4 mr-2" />
                  Contrôles Réglementaires
                </Button>
              </Link>
              <Link to="/buildings">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Building className="w-4 h-4 mr-2" />
                  Bâtiments
                </Button>
              </Link>
              <Link to="/meters">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Zap className="w-4 h-4 mr-2" />
                  Compteurs
                </Button>
              </Link>
              <Link to="/users">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </Button>
              </Link>
              <Button onClick={() => setIsNewTaskOpen(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle tâche
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="w-full sm:w-auto text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistiques */}
        <TaskStats tasks={compatibleTasks} />

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une tâche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bâtiment</label>
                <BuildingSelector
                  buildings={buildings.map(b => ({ id: b.id, name: b.name, address: b.address, description: b.description, createdAt: new Date(b.created_at) }))}
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                  placeholder="Tous les bâtiments"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="progress">En cours</option>
                  <option value="validated">Validées</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des tâches */}
        <Card>
          <CardHeader>
            <CardTitle>
              Tâches ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune tâche trouvée avec les filtres sélectionnés.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
        onAddPhotos={handleAddPhotos}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        buildings={buildings.map(b => ({ id: b.id, name: b.name, address: b.address, description: b.description, createdAt: new Date(b.created_at) }))}
        agents={agents}
        onTaskCreate={handleCreateTask}
      />
    </div>
  );
}