export type MessageStatus = 'sent' | 'delivered' | 'read';

export type MessageAttachment = {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file' | 'gif';
  url: string;
  name?: string;
  size?: number;
  thumbnailUrl?: string;
  mimeType?: string;
};

export type MessageReaction = {
  emoji: string;
  userId: string;
  username: string;
  timestamp: string;
};

export type Message = {
  id: string;
  conversationId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  readBy: string[]; // Array of user IDs who have read the message
  deliveredTo: string[]; // Array of user IDs message was delivered to
};

export type Conversation = {
  id: string;
  type: 'direct' | 'group' | 'expert' | 'random' | 'discussion';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    isTyping?: boolean;
    role?: 'admin' | 'member' | 'moderator';
  }[];
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
    status: MessageStatus;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
};

export type MessageEvent = {
  type: 'message_sent' | 'message_delivered' | 'message_read' | 'message_edited' | 'message_deleted' | 'typing_started' | 'typing_stopped' | 'message_reaction';
  payload: any;
  timestamp: string;
  conversationId: string;
  userId: string;
};

export type TypingStatus = {
  userId: string;
  username: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
};

export type OnlineStatus = {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
};

export type EncryptionKeys = {
  publicKey: string;
  privateKey: string;
}; 