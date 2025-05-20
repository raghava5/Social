import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationCircleIcon, 
  UserIcon, 
  ClockIcon, 
  PhoneIcon, 
  VideoCameraIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon,
  CogIcon,
  EllipsisHorizontalIcon,
  ArrowSmallLeftIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Message, Conversation, MessageAttachment, TypingStatus } from '../core/types';
import messagingService from '../core/messagingService';
import encryptionService from '../core/encryptionService';

interface DirectMessagingProps {
  conversation: Conversation | null;
  onBack?: () => void;
  userId: string;
  userName: string;
  isFullScreen?: boolean;
}

const DirectMessaging: React.FC<DirectMessagingProps> = ({ 
  conversation, 
  onBack,
  userId,
  userName,
  isFullScreen = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender: string } | null>(null);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);
  const [showEncryptionInfo, setShowEncryptionInfo] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [conversationKey, setConversationKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastLoadRef = useRef<number>(Date.now());
  const isLoadingMoreRef = useRef<boolean>(false);
  
  // Load conversation messages
  useEffect(() => {
    if (!conversation) return;
    
    const loadConversation = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, you would call an API to load messages
        // For now, we'll simulate it with a timeout and dummy data
        setTimeout(() => {
          // Generate some dummy messages for display
          const dummyMessages: Message[] = generateDummyMessages(conversation);
          setMessages(dummyMessages);
          setIsLoading(false);
          
          // Generate or retrieve conversation key for E2E encryption
          const convKey = localStorage.getItem(`conv_key_${conversation.id}`) || encryptionService.generateConversationKey();
          localStorage.setItem(`conv_key_${conversation.id}`, convKey);
          setConversationKey(convKey);
        }, 700);
        
        // Initialize messaging service
        await messagingService.initialize(userId);
        
        // Subscribe to new messages
        const unsubscribe = messagingService.onMessage(handleNewMessage);
        
        // Subscribe to typing status
        const unsubscribeTyping = messagingService.onTypingStatusChange(handleTypingStatusChange);
        
        return () => {
          unsubscribe();
          unsubscribeTyping();
        };
      } catch (error) {
        console.error('Error loading conversation:', error);
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversation, userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle scroll to load more messages
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current || isLoadingMoreRef.current) return;
      
      const { scrollTop } = messagesContainerRef.current;
      
      // If we're at the top and not already loading, load more messages
      if (scrollTop === 0 && Date.now() - lastLoadRef.current > 1000) {
        loadMoreMessages();
      }
    };
    
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Generate dummy messages for demonstration
  const generateDummyMessages = (conv: Conversation): Message[] => {
    if (!conv) return [];
    
    const otherUser = conv.participants.find(p => p.id !== userId);
    const now = new Date();
    
    return [
      {
        id: '1',
        conversationId: conv.id,
        content: `Hi ${userName}, how are you doing today?`,
        sender: {
          id: otherUser?.id || 'other',
          name: otherUser?.name || 'User',
          avatar: otherUser?.avatar
        },
        timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        status: 'read',
        isEdited: false,
        isDeleted: false,
        reactions: [{ emoji: '👍', userId, username: userName, timestamp: new Date().toISOString() }],
        attachments: [],
        readBy: [userId, otherUser?.id || 'other'],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '2',
        conversationId: conv.id,
        content: "I'm doing great! Just finished working on a new project.",
        sender: {
          id: userId,
          name: userName,
        },
        timestamp: new Date(now.getTime() - 3540000).toISOString(), // 59 minutes ago
        status: 'read',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [],
        readBy: [userId, otherUser?.id || 'other'],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '3',
        conversationId: conv.id,
        content: "That's awesome! What kind of project were you working on?",
        sender: {
          id: otherUser?.id || 'other',
          name: otherUser?.name || 'User',
          avatar: otherUser?.avatar
        },
        timestamp: new Date(now.getTime() - 3500000).toISOString(), // 58 minutes ago
        status: 'read',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [],
        readBy: [userId],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '4',
        conversationId: conv.id,
        content: "It's a new messaging application with real-time capabilities and end-to-end encryption for secure communications.",
        sender: {
          id: userId,
          name: userName,
        },
        timestamp: new Date(now.getTime() - 3000000).toISOString(), // 50 minutes ago
        status: 'read',
        isEdited: false,
        isDeleted: false,
        reactions: [{ emoji: '🔥', userId: otherUser?.id || 'other', username: otherUser?.name || 'User', timestamp: new Date().toISOString() }],
        attachments: [],
        readBy: [userId, otherUser?.id || 'other'],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '5',
        conversationId: conv.id,
        content: "Sounds interesting! I'd love to see it when it's ready.",
        sender: {
          id: otherUser?.id || 'other',
          name: otherUser?.name || 'User',
          avatar: otherUser?.avatar
        },
        timestamp: new Date(now.getTime() - 1800000).toISOString(), // 30 minutes ago
        status: 'read',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [],
        readBy: [userId],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '6',
        conversationId: conv.id,
        content: "Here's a screenshot of the interface so far:",
        sender: {
          id: userId,
          name: userName,
        },
        timestamp: new Date(now.getTime() - 1200000).toISOString(), // 20 minutes ago
        status: 'delivered',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [
          {
            id: 'att1',
            type: 'image',
            url: 'https://via.placeholder.com/800x600?text=Chat+Interface+Screenshot',
            name: 'screenshot.png',
            size: 256000,
            mimeType: 'image/png'
          }
        ],
        readBy: [userId],
        deliveredTo: [userId, otherUser?.id || 'other']
      },
      {
        id: '7',
        conversationId: conv.id,
        content: "Wow, that looks really well designed! I especially like the clean message bubbles.",
        sender: {
          id: otherUser?.id || 'other',
          name: otherUser?.name || 'User',
          avatar: otherUser?.avatar
        },
        timestamp: new Date(now.getTime() - 600000).toISOString(), // 10 minutes ago
        status: 'delivered',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [],
        readBy: [userId],
        deliveredTo: [userId, otherUser?.id || 'other']
      }
    ];
  };
  
  // Load more messages (older)
  const loadMoreMessages = async () => {
    if (isLoadingMoreRef.current || !conversation) return;
    
    isLoadingMoreRef.current = true;
    lastLoadRef.current = Date.now();
    
    try {
      // In a real implementation, you would load older messages from an API
      // Simulating with a timeout and dummy data
      setTimeout(() => {
        const oldestMessageDate = new Date(
          Math.min(...messages.map(m => new Date(m.timestamp).getTime()))
        );
        
        const otherUser = conversation.participants.find(p => p.id !== userId);
        
        // Generate 5 more dummy messages
        const moreMessages: Message[] = Array.from({ length: 5 }).map((_, i) => ({
          id: `old-${Date.now()}-${i}`,
          conversationId: conversation.id,
          content: `This is an older message #${i + 1}`,
          sender: {
            id: i % 2 === 0 ? otherUser?.id || 'other' : userId,
            name: i % 2 === 0 ? otherUser?.name || 'User' : userName,
            avatar: i % 2 === 0 ? otherUser?.avatar : undefined
          },
          timestamp: new Date(oldestMessageDate.getTime() - (i + 1) * 3600000).toISOString(), // Progressively older
          status: 'read',
          isEdited: false,
          isDeleted: false,
          reactions: [],
          attachments: [],
          readBy: [userId, otherUser?.id || 'other'],
          deliveredTo: [userId, otherUser?.id || 'other']
        }));
        
        setMessages(prev => [...moreMessages, ...prev]);
        isLoadingMoreRef.current = false;
        
        // Preserve scroll position
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 100;
        }
      }, 1000);
    } catch (error) {
      console.error('Error loading more messages:', error);
      isLoadingMoreRef.current = false;
    }
  };
  
  // Handle new messages
  const handleNewMessage = async (message: Message) => {
    // If the message is for the current conversation, add it
    if (message.conversationId === conversation?.id) {
      // Decrypt if needed
      let decryptedContent = message.content;
      
      if (isEncrypted && conversationKey && message.sender.id !== userId) {
        try {
          decryptedContent = await encryptionService.decryptWithAES(message.content, conversationKey);
          message = { ...message, content: decryptedContent };
        } catch (error) {
          console.error('Failed to decrypt message:', error);
        }
      }
      
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Mark as read
      messagingService.markAsRead(message.id, message.conversationId);
    }
  };
  
  // Handle typing status changes
  const handleTypingStatusChange = (status: TypingStatus) => {
    if (status.conversationId === conversation?.id && status.userId !== userId) {
      setTypingStatus(status);
      
      // Clear typing status after 3 seconds of no updates
      setTimeout(() => {
        setTypingStatus(prev => 
          prev && prev.userId === status.userId && prev.timestamp === status.timestamp
            ? null
            : prev
        );
      }, 3000);
    }
  };
  
  // Send a message
  const handleSendMessage = async (content: string, attachments: MessageAttachment[]) => {
    if (!conversation) return;
    
    let encryptedContent = content;
    
    if (isEncrypted && conversationKey) {
      try {
        encryptedContent = await encryptionService.encryptWithAES(content, conversationKey);
      } catch (error) {
        console.error('Failed to encrypt message:', error);
      }
    }
    
    try {
      const newMessage = await messagingService.sendMessage(
        conversation.id,
        encryptedContent,
        attachments,
        replyingTo?.id
      );
      
      // In dev mode, we'll add the message directly
      // In a real app, this would happen through the socket event
      setMessages(prev => [...prev, { ...newMessage, content }]);
      
      // Clear reply state
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (!conversation) return;
    messagingService.sendTypingStatus(conversation.id, isTyping);
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle message reply
  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyingTo({
        id: message.id,
        content: message.content,
        sender: message.sender.name
      });
    }
  };
  
  // Handle message reactions
  const handleReact = (messageId: string, emoji: string) => {
    if (!conversation) return;
    
    // Update local state first for immediate feedback
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.userId === userId && r.emoji === emoji);
          
          // If already reacted with this emoji, remove it
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.filter(r => !(r.userId === userId && r.emoji === emoji))
            };
          }
          
          // Otherwise add the reaction
          return {
            ...msg,
            reactions: [...msg.reactions, {
              emoji,
              userId,
              username: userName,
              timestamp: new Date().toISOString()
            }]
          };
        }
        return msg;
      })
    );
    
    // Send to server
    messagingService.addReaction(messageId, conversation.id, emoji);
  };
  
  // Handle message edit
  const handleEdit = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.sender.id === userId) {
      // In a real app, you'd show an edit field
      const newContent = prompt('Edit message:', message.content);
      
      if (newContent && newContent !== message.content) {
        // Update local state first
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId
              ? { ...msg, content: newContent, isEdited: true }
              : msg
          )
        );
        
        // Send to server
        if (conversation) {
          messagingService.editMessage(messageId, conversation.id, newContent);
        }
      }
    }
  };
  
  // Handle message delete
  const handleDelete = (messageId: string, forEveryone: boolean) => {
    const message = messages.find(m => m.id === messageId);
    
    if (message && message.sender.id === userId) {
      // Update local state first
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId
            ? { ...msg, isDeleted: true, content: '' }
            : msg
        )
      );
      
      // Send to server
      if (conversation) {
        messagingService.deleteMessage(messageId, conversation.id, forEveryone);
      }
    }
  };
  
  // Toggle E2E encryption
  const toggleEncryption = () => {
    setIsEncrypted(!isEncrypted);
    setShowSettingsMenu(false);
  };

  // No conversation selected view
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No conversation selected</h3>
          <p className="text-gray-500 max-w-md">
            Select a conversation from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }
  
  const otherUser = conversation.participants.find(p => p.id !== userId);
  
  return (
    <div className={`flex flex-col h-full ${isFullScreen ? 'w-full' : ''}`}>
      {/* Conversation header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        {onBack && (
          <button 
            onClick={onBack}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowSmallLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
        
        <div className="relative mr-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {otherUser?.avatar ? (
              <img 
                src={otherUser.avatar} 
                alt={otherUser.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
                {otherUser?.name.charAt(0)}
              </div>
            )}
          </div>
          
          {otherUser?.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h3 className="font-medium text-gray-900">{otherUser?.name}</h3>
          <p className="text-xs text-gray-500 truncate">
            {otherUser?.isTyping ? (
              <span className="text-blue-600">typing...</span>
            ) : otherUser?.isOnline ? (
              'Online'
            ) : otherUser?.lastSeen ? (
              `Last seen ${new Date(otherUser.lastSeen).toLocaleString()}`
            ) : (
              'Offline'
            )}
          </p>
        </div>
        
        <div className="flex">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <PhoneIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <VideoCameraIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
            
            {/* Settings dropdown */}
            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowEncryptionInfo(true);
                      setShowSettingsMenu(false);
                    }}
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Encryption info
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={toggleEncryption}
                  >
                    {isEncrypted ? (
                      <>
                        <EyeIcon className="h-4 w-4 mr-2 text-red-500" />
                        Disable encryption
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="h-4 w-4 mr-2 text-green-500" />
                        Enable encryption
                      </>
                    )}
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Copy conversation ID
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Add participant
                  </button>
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => setShowSettingsMenu(false)}
                  >
                    <ExclamationCircleIcon className="h-4 w-4 mr-2" />
                    Clear conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        ref={messagesContainerRef}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Loading indicator for older messages */}
            {isLoadingMoreRef.current && (
              <div className="flex justify-center my-2">
                <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {/* Messages */}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  ...message,
                  sender: {
                    ...message.sender,
                    id: message.sender.id === userId ? 'me' : message.sender.id
                  }
                }}
                isGroupChat={false}
                onReply={handleReply}
                onReact={handleReact}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            
            {/* Typing indicator */}
            {typingStatus && typingStatus.isTyping && (
              <div className="flex items-center my-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
                <div className="bg-gray-100 py-2 px-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="bg-gray-500 h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scrollable anchor */}
            <div ref={messagesEndRef}></div>
          </>
        )}
      </div>
      
      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={isLoading}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        isEncrypted={isEncrypted}
      />
      
      {/* Encryption info modal */}
      {showEncryptionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                End-to-End Encryption
              </h3>
              <button
                onClick={() => setShowEncryptionInfo(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Messages in this conversation are {isEncrypted ? 'encrypted' : 'not encrypted'} end-to-end.
              </p>
              
              {isEncrypted ? (
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                  <p className="font-medium mb-1">Your messages are secure</p>
                  <p>
                    Messages are encrypted using AES-256 encryption. Only you and the recipient can read these messages.
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700">
                  <p className="font-medium mb-1">Your messages are not encrypted</p>
                  <p>
                    Messages sent in this conversation are not protected by end-to-end encryption.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-sm mb-2">Encryption Details</h4>
              <dl className="text-xs text-gray-600 space-y-2">
                <div className="flex">
                  <dt className="w-1/3 font-medium">Encryption Type:</dt>
                  <dd>AES-256-GCM</dd>
                </div>
                <div className="flex">
                  <dt className="w-1/3 font-medium">Key Exchange:</dt>
                  <dd>RSA-OAEP 2048-bit</dd>
                </div>
                <div className="flex">
                  <dt className="w-1/3 font-medium">Verification:</dt>
                  <dd>
                    <button className="text-blue-600 hover:underline">
                      Verify security code
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowEncryptionInfo(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2"
              >
                Close
              </button>
              <button
                onClick={toggleEncryption}
                className={`px-4 py-2 rounded-md ${
                  isEncrypted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEncrypted ? 'Disable Encryption' : 'Enable Encryption'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessaging;export default DirectMessaging;
