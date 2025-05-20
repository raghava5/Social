export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Social media specific fields
  bio?: string;
  location?: string;
  website?: string;
  followers?: number;
  following?: number;
  posts?: number;
  
  // Settings and preferences
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacySettings?: {
    isPrivate: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
} 