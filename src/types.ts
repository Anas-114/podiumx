export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Program {
  id: string;
  name: string;
  programNumber: string;
  type: 'single' | 'group';
  maxParticipants: number;
}

export interface Result {
  id: string;
  programId: string;
  programName?: string; // Hydrated
  category: string;
  resultNumber: number;
  resultScope: 'program' | 'team';
  publishedAt: string;
  posterUrl?: string;
  templateId?: string;
}

export interface Entry {
  id: string;
  resultId: string;
  name: string;
  team: string;
  points: number;
  grade: 'A' | 'B' | 'C';
  position: number;
}

export const CATEGORIES = [
  'LP', 'UP', 'HS', 'HSS', 'General', 'Junior', 'Senior', 'Campus Girls'
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}
