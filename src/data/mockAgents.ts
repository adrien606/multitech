import { Agent } from "@/types/agent";

export const mockAgents: Agent[] = [
  {
    id: "1",
    firstName: "Jean",
    lastName: "Dupont",
    phone: "06 12 34 56 78",
    email: "jean.dupont@maintenance.com",
    createdAt: new Date("2024-01-10"),
    isActive: true,
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Martin",
    phone: "06 87 65 43 21",
    email: "marie.martin@maintenance.com",
    createdAt: new Date("2024-01-12"),
    isActive: true,
  },
  {
    id: "3",
    firstName: "Pierre",
    lastName: "Durand",
    phone: "06 55 44 33 22",
    email: "pierre.durand@maintenance.com",
    createdAt: new Date("2024-01-15"),
    isActive: false,
  },
];