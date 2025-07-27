import { Building, Task } from "@/types";

export const mockBuildings: Building[] = [
  {
    id: "1",
    name: "Bâtiment A - Bureaux",
    address: "123 Avenue des Entreprises, 75001 Paris",
    description: "Immeuble de bureaux de 8 étages",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2", 
    name: "Bâtiment B - Résidentiel",
    address: "456 Rue de la Paix, 75002 Paris",
    description: "Résidence de 15 appartements",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Entrepôt C",
    address: "789 Zone Industrielle, 94000 Créteil",
    description: "Entrepôt logistique 2000m²",
    createdAt: new Date("2024-01-30"),
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Vérification système de chauffage",
    description: "Contrôle annuel du système de chauffage central. Vérifier la pression, les radiateurs et la chaudière.",
    buildingId: "1",
    buildingName: "Bâtiment A - Bureaux",
    status: "pending",
    dueDate: new Date("2024-01-30"),
    createdAt: new Date("2024-01-20"),
    assignedTo: "Agent Technique",
    photos: [],
    comments: [
      {
        id: "c1",
        text: "Contrôle programmé dans le cadre de la maintenance préventive annuelle.",
        createdAt: new Date("2024-01-20"),
        author: "Responsable Maintenance",
        type: "assignment",
      },
    ],
  },
  {
    id: "2",
    title: "Remplacement éclairage hall d'entrée",
    description: "Remplacer les 6 spots LED défaillants dans le hall d'entrée principal.",
    buildingId: "1",
    buildingName: "Bâtiment A - Bureaux",
    status: "progress",
    dueDate: new Date("2024-01-28"),
    createdAt: new Date("2024-01-18"),
    assignedTo: "Agent Technique",
    photos: [
      {
        id: "p1",
        url: "/api/placeholder/300/200",
        filename: "spots_defaillants.jpg",
        uploadedAt: new Date("2024-01-18"),
      },
    ],
    comments: [
      {
        id: "c2",
        text: "Commande des nouveaux spots effectuée. Intervention prévue dès réception.",
        createdAt: new Date("2024-01-19"),
        author: "Agent Technique",
        type: "progress",
      },
    ],
  },
  {
    id: "3",
    title: "Nettoyage conduits ventilation",
    description: "Nettoyage et désinfection des conduits de ventilation du 2ème étage.",
    buildingId: "2",
    buildingName: "Bâtiment B - Résidentiel",
    status: "validated",
    dueDate: new Date("2024-01-25"),
    createdAt: new Date("2024-01-15"),
    assignedTo: "Agent Technique",
    photos: [],
    comments: [],
    proofPhoto: "/api/placeholder/300/200",
  },
  {
    id: "4",
    title: "Réparation porte automatique",
    description: "La porte automatique de l'entrée principale ne fonctionne plus correctement.",
    buildingId: "3",
    buildingName: "Entrepôt C",
    status: "pending",
    dueDate: new Date("2024-01-26"),
    createdAt: new Date("2024-01-22"),
    assignedTo: "Agent Technique",
    photos: [
      {
        id: "p2",
        url: "/api/placeholder/300/200",
        filename: "porte_defectueuse.jpg",
        uploadedAt: new Date("2024-01-22"),
      },
    ],
    comments: [
      {
        id: "c3",
        text: "Problème signalé par l'équipe de sécurité. Intervention urgente requise.",
        createdAt: new Date("2024-01-22"),
        author: "Sécurité",
        type: "assignment",
      },
    ],
  },
];