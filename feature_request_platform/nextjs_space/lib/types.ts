import { Role, RequestStatus, Priority } from "@prisma/client";

export type { Role, RequestStatus, Priority };

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface RequestWithRelations {
  id: string;
  title: string;
  description: string;
  requestedBy?: string | null;
  businessJustification?: string | null;
  reason?: string | null;
  status: RequestStatus;
  priority?: Priority | null;
  finalPriority?: Priority | null;
  declineReason?: string | null;
  adminNotes?: string | null;
  supportNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name?: string | null;
    email: string;
  };
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  attachments: {
    id: string;
    fileName: string;
    cloudStoragePath: string;
    isPublic: boolean;
    contentType: string;
    size: number;
  }[];
  notes: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name?: string | null;
      role: Role;
    };
  }[];
}
