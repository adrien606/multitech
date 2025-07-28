import { useState } from "react";
import { TaskStats } from "@/components/TaskStats";
import { TaskCard } from "@/components/TaskCard";
import { BuildingSelector } from "@/components/BuildingSelector";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { NewTaskModal } from "@/components/NewTaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskStatus } from "@/types";
import { mockTasks, mockBuildings } from "@/data/mockData";
import { Plus, Search, Filter, Users, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAgents } from "@/hooks/useAgents";

export default function Dashboard() {
  const { profile } = useAuth();
  const { agents, loading: agentsLoading } = useAgents();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesBuilding = !selectedBuilding || task.buildingId === selectedBuilding;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesBuilding && matchesStatus && matchesSearch;
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks);
    
    // Mettre à jour selectedTask si c'est la tâche courante
    if (selectedTask && selectedTask.id === taskId) {
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      createdAt: new Date(),
      // Utiliser le nom complet de l'utilisateur connecté si assignedTo n'est pas défini
      assignedTo: newTaskData.assignedTo || profile?.full_name || 'Utilisateur',
    };
    setTasks([newTask, ...tasks]);
  };

  const handleAddComment = (taskId: string, commentData: Omit<import("@/types").TaskComment, 'id' | 'createdAt'>) => {
    const newComment = {
      ...commentData,
      id: `comment_${Date.now()}`,
      createdAt: new Date(),
      // Utiliser le nom complet de l'utilisateur connecté
      author: profile?.full_name || 'Utilisateur',
    };
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...task.comments, newComment] }
        : task
    );
    
    setTasks(updatedTasks);
    
    // Mettre à jour selectedTask si c'est la tâche courante
    if (selectedTask && selectedTask.id === taskId) {
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  };

  const handleAddPhotos = (taskId: string, newPhotos: Omit<import("@/types").TaskPhoto, 'id'>[], files: File[]) => {
    const photosWithIds = newPhotos.map(photo => ({
      ...photo,
      id: `photo_${Date.now()}_${Math.random()}`,
    }));
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, photos: [...task.photos, ...photosWithIds] }
        : task
    );
    
    setTasks(updatedTasks);
    
    // Mettre à jour selectedTask si c'est la tâche courante
    if (selectedTask && selectedTask.id === taskId) {
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  };

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
              <Link to="/buildings">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Building className="w-4 h-4 mr-2" />
                  Bâtiments
                </Button>
              </Link>
              <Link to="/agents">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Users className="w-4 h-4 mr-2" />
                  Agents
                </Button>
              </Link>
              <Button onClick={() => setIsNewTaskOpen(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle tâche
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistiques */}
        <TaskStats tasks={tasks} />

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
                  buildings={mockBuildings}
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
        buildings={mockBuildings}
        agents={agents}
        onTaskCreate={handleCreateTask}
      />
    </div>
  );
}