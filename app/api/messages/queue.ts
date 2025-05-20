// For this demo, we'll use in-memory storage
interface MessageQueue {
  [userId: string]: {
    messages: any[];
    statusUpdates: any[];
    typingUpdates: any[];
    lastPolled: number;
  };
}

const messageQueues: MessageQueue = {};

// Helper to get or create a user's message queue
export const getUserQueue = (userId: string) => {
  if (!messageQueues[userId]) {
    messageQueues[userId] = {
      messages: [],
      statusUpdates: [],
      typingUpdates: [],
      lastPolled: Date.now()
    };
  }
  return messageQueues[userId];
};

// Add a message to a user's queue
export const queueMessageForUser = (userId: string, message: any) => {
  const queue = getUserQueue(userId);
  queue.messages.push(message);
  
  // Clean up old messages (keep last 100)
  if (queue.messages.length > 100) {
    queue.messages = queue.messages.slice(-100);
  }
};

// Add a status update to a user's queue
export const queueStatusUpdateForUser = (userId: string, status: any) => {
  const queue = getUserQueue(userId);
  
  // Replace any existing status for the same user
  const existingIndex = queue.statusUpdates.findIndex(
    (s: any) => s.userId === status.userId
  );
  
  if (existingIndex !== -1) {
    queue.statusUpdates[existingIndex] = status;
  } else {
    queue.statusUpdates.push(status);
  }
  
  // Clean up old statuses (keep last 50)
  if (queue.statusUpdates.length > 50) {
    queue.statusUpdates = queue.statusUpdates.slice(-50);
  }
};

// Add a typing update to a user's queue
export const queueTypingUpdateForUser = (userId: string, typingStatus: any) => {
  const queue = getUserQueue(userId);
  
  // Replace any existing typing status for the same user/conversation
  const existingIndex = queue.typingUpdates.findIndex(
    (t: any) => t.userId === typingStatus.userId && t.conversationId === typingStatus.conversationId
  );
  
  if (existingIndex !== -1) {
    queue.typingUpdates[existingIndex] = typingStatus;
  } else {
    queue.typingUpdates.push(typingStatus);
  }
  
  // Clean up old typing updates (keep last 20)
  if (queue.typingUpdates.length > 20) {
    queue.typingUpdates = queue.typingUpdates.slice(-20);
  }
}; 