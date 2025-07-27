import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentModal } from "@/components/AgentModal";
import { Agent } from "@/types/agent";
import { mockAgents } from "@/data/mockAgents";
import { Plus, Edit, Trash2, Phone, Mail, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      setAgents(agents.filter(agent => agent.id !== agentId));
    }
  };

  const handleSaveAgent = (agentData: Omit<Agent, 'id' | 'createdAt'> | Agent) => {
    if (modalMode === 'create') {
      const newAgent: Agent = {
        ...(agentData as Omit<Agent, 'id' | 'createdAt'>),
        id: `agent_${Date.now()}`,
        createdAt: new Date(),
      };
      setAgents([newAgent, ...agents]);
    } else {
      setAgents(agents.map(agent => 
        agent.id === (agentData as Agent).id ? (agentData as Agent) : agent
      ));
    }
  };

  const activeAgents = agents.filter(agent => agent.isActive);
  const inactiveAgents = agents.filter(agent => !agent.isActive);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Agents Techniques</h1>
                <p className="text-muted-foreground mt-1">
                  Gestion des agents multitechniques
                </p>
              </div>
            </div>
            <Button onClick={handleCreateAgent}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel agent
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agents actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-validated">{activeAgents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agents inactifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{inactiveAgents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Agents actifs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Agents actifs ({activeAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeAgents.map((agent) => (
                  <Card key={agent.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          <Badge variant="validated" className="mt-1">Actif</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAgent(agent)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{agent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{agent.phone}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                          Créé le {format(agent.createdAt, 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun agent actif.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agents inactifs */}
        {inactiveAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Agents inactifs ({inactiveAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveAgents.map((agent) => (
                  <Card key={agent.id} className="transition-all hover:shadow-md opacity-60">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          <Badge variant="secondary" className="mt-1">Inactif</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAgent(agent)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{agent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{agent.phone}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                          Créé le {format(agent.createdAt, 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <AgentModal
        agent={selectedAgent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAgent}
        mode={modalMode}
      />
    </div>
  );
}