// Types pour compatibilité avec les composants existants
export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string;
  createdAt: Date;
}

export type TaskStatus = 'pending' | 'progress' | 'validated';

export interface Task {
  id: string;
  title: string;
  description: string;
  buildingId: string;
  buildingName: string;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  assignedTo: string;
  photos: TaskPhoto[];
  comments: TaskComment[];
  proofPhoto?: string;
}

export interface TaskPhoto {
  id: string;
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  text: string;
  createdAt: Date;
  author: string;
  type: 'assignment' | 'progress' | 'clarification';
  photo?: {
    url: string;
    filename: string;
  };
}