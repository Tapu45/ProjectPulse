// src/types/prisma-enums.ts
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT'
}

export enum Category {
  BUG = 'BUG',
  DELAY = 'DELAY',
  QUALITY = 'QUALITY',
  COMMUNICATION = 'COMMUNICATION',
  OTHER = 'OTHER'
}

export enum Status {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationType {
  COMPLAINT_SUBMITTED = 'COMPLAINT_SUBMITTED',
  STATUS_UPDATED = 'STATUS_UPDATED',
  NEW_RESPONSE = 'NEW_RESPONSE',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED'
}