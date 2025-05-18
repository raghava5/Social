import React, { useState } from 'react';
import { 
  CheckIcon, 
  EllipsisHorizontalIcon, 
  FaceSmileIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowUturnLeftIcon,
  PhotoIcon,
  DocumentIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Message, MessageStatus } from '../core/types';

interface MessageBubbleProps {
  message: Message;
  isGroupChat?: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string, forEveryone: boolean) => void;
  onSeen?: (messageId: string) => void;
  onForward?: (messageId: string) => void;
  onCopy?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGroupChat = false,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onSeen,
  onForward,
  onCopy
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  
  // Common emojis for quick reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '👏'];
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine message status icon
  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex">
            <CheckIcon className="h-3 w-3 text-gray-400" />
            <CheckIcon className="h-3 w-3 text-gray-400 -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <CheckIcon className="h-3 w-3 text-blue-500" />
            <CheckIcon className="h-3 w-3 text-blue-500 -ml-1" />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Handle attachment display
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-1 space-y-1">
        {message.attachments.map((attachment, index) => {
          // Image attachments
          if (attachment.type === 'image') {
            return (
              <div key={index} className="relative rounded-md overflow-hidden">
                <img 
                  src={attachment.url} 
                  alt={attachment.name || 'Image'} 
                  className="max-w-xs rounded-md max-h-60 object-cover"
                />
              </div>
            );
          }
          
          // Video attachments
          if (attachment.type === 'video') {
            return (
              <div key={index} className="relative rounded-md overflow-hidden">
                <video 
                  controls 
                  className="max-w-xs rounded-md max-h-60" 
                  poster={attachment.thumbnailUrl}
                >
                  <source src={attachment.url} type={attachment.mimeType || 'video/mp4'} />
                  Your browser does not support video playback.
                </video>
              </div>
            );
          }
          
          // Audio attachments
          if (attachment.type === 'audio') {
            return (
              <div key={index} className="flex items-center p-2 bg-gray-100 rounded-md">
                <MicrophoneIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">{attachment.name || 'Voice Message'}</p>
                  <audio controls className="w-full h-8 mt-1">
                    <source src={attachment.url} type={attachment.mimeType || 'audio/mpeg'} />
                  </audio>
                </div>
              </div>
            );
          }
          
          // File attachments
          if (attachment.type === 'file') {
            return (
              <a 
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <DocumentIcon className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium">{attachment.name || 'File'}</p>
                  {attachment.size && (
                    <p className="text-xs text-gray-600">
                      {Math.round(attachment.size / 1024)} KB
                    </p>
                  )}
                </div>
              </a>
            );
          }
          
          // GIF attachments
          if (attachment.type === 'gif') {
            return (
              <div key={index} className="relative rounded-md overflow-hidden">
                <img 
                  src={attachment.url} 
                  alt={attachment.name || 'GIF'} 
                  className="max-w-xs rounded-md"
                />
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  // Reply quote if message is a reply
  const renderReplyQuote = () => {
    if (!message.replyTo) return null;
    
    return (
      <div className="mb-1 pl-2 border-l-2 border-gray-300 text-xs text-gray-500">
        <p className="font-medium">{message.replyTo.sender}</p>
        <p className="truncate">{message.replyTo.content}</p>
      </div>
    );
  };
  
  // Handle reactions display
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    // Group reactions by emoji
    const groupedReactions: Record<string, number> = {};
    message.reactions.forEach(reaction => {
      if (groupedReactions[reaction.emoji]) {
        groupedReactions[reaction.emoji]++;
      } else {
        groupedReactions[reaction.emoji] = 1;
      }
    });
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(groupedReactions).map(([emoji, count]) => (
          <div 
            key={emoji}
            className="flex items-center bg-white bg-opacity-70 rounded-full px-1.5 py-0.5 text-xs border border-gray-200"
          >
            <span>{emoji}</span>
            {count > 1 && <span className="ml-1 text-gray-700">{count}</span>}
          </div>
        ))}
      </div>
    );
  };
  
  // Deleted message display
  if (message.isDeleted) {
    return (
      <div className={`flex my-1 ${message.sender.id === 'me' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] px-3 py-2 rounded-lg text-gray-500 italic text-sm bg-gray-100`}>
          This message was deleted
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex my-1 relative group ${message.sender.id === 'me' ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
        setShowDeleteOptions(false);
      }}
    >
      {/* Profile picture for group chats (non-sender) */}
      {isGroupChat && message.sender.id !== 'me' && (
        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 flex-shrink-0 overflow-hidden">
          {message.sender.avatar ? (
            <img src={message.sender.avatar} alt={message.sender.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 font-medium">
              {message.sender.name.charAt(0)}
            </div>
          )}
        </div>
      )}
      
      <div className="max-w-[70%] flex flex-col">
        {/* Sender name for group chats */}
        {isGroupChat && message.sender.id !== 'me' && (
          <span className="text-xs text-gray-500 ml-1 mb-1">{message.sender.name}</span>
        )}
        
        {/* Message content with bubble */}
        <div 
          className={`relative rounded-lg px-3 py-2 ${
            message.sender.id === 'me' 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {/* Reply quote */}
          {renderReplyQuote()}
          
          {/* Message text */}
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* Attachments */}
          {renderAttachments()}
          
          {/* Edit indicator */}
          {message.isEdited && (
            <span className="text-[10px] opacity-70 ml-1">(edited)</span>
          )}
          
          {/* Message metadata */}
          <div className={`flex justify-end items-center mt-1 gap-1 ${
            message.sender.id === 'me' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span className="text-[10px]">{formatTime(message.timestamp)}</span>
            {message.sender.id === 'me' && getStatusIcon(message.status)}
          </div>
          
          {/* Reactions */}
          {renderReactions()}
          
          {/* Quick actions */}
          {showActions && (
            <div 
              className={`absolute top-0 ${
                message.sender.id === 'me' ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'
              } bg-white shadow-md rounded-full flex items-center`}
            >
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => setShowReactions(!showReactions)}
              >
                <FaceSmileIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => onReply && onReply(message.id)}
              >
                <ArrowUturnLeftIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => onForward && onForward(message.id)}
              >
                <LinkIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => onCopy && onCopy(message.id)}
              >
                <DocumentDuplicateIcon className="h-4 w-4 text-gray-600" />
              </button>
              {message.sender.id === 'me' && (
                <>
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                    onClick={() => onEdit && onEdit(message.id)}
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                    onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                  >
                    <TrashIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </>
              )}
              <button
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => onSeen && onSeen(message.id)}
              >
                <EyeIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
          
          {/* Reaction picker */}
          {showReactions && (
            <div className="absolute top-0 -mt-10 bg-white shadow-md rounded-full flex items-center p-1 z-10">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  className="p-1 hover:bg-gray-100 rounded-full text-xl"
                  onClick={() => {
                    onReact && onReact(message.id, emoji);
                    setShowReactions(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          
          {/* Delete options */}
          {showDeleteOptions && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 bg-white shadow-md rounded-lg flex flex-col p-1 z-10 w-36">
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-sm text-gray-700 flex items-center"
                onClick={() => {
                  onDelete && onDelete(message.id, false);
                  setShowDeleteOptions(false);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete for me
              </button>
              <button
                className="p-1.5 hover:bg-gray-100 rounded text-sm text-red-600 flex items-center"
                onClick={() => {
                  onDelete && onDelete(message.id, true);
                  setShowDeleteOptions(false);
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete for everyone
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 