import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  FaceSmileIcon, 
  MicrophoneIcon, 
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChevronUpIcon,
  GifIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { MessageAttachment } from '../core/types';

interface MessageInputProps {
  onSendMessage: (content: string, attachments: MessageAttachment[]) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  replyingTo?: {
    id: string;
    content: string;
    sender: string;
  } | null;
  onCancelReply?: () => void;
  isEncrypted?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  replyingTo = null,
  onCancelReply,
  isEncrypted = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Common emojis for quick access
  const quickEmojis = ['👍', '❤️', '😂', '👏', '🔥', '🎉', '🙏', '😢'];
  
  // Handle input changes and trigger typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Trigger typing indicator
    onTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };
  
  // Handle keyboard shortcuts and auto-resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to send
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };
    
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.addEventListener('keydown', handleKeyDown);
      
      // Auto-resize text area
      textArea.style.height = 'auto';
      textArea.style.height = `${Math.min(textArea.scrollHeight, 150)}px`;
    }
    
    return () => {
      if (textArea) {
        textArea.removeEventListener('keydown', handleKeyDown);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message]);
  
  // Handle sending messages
  const handleSendMessage = () => {
    if ((message.trim() === '' && attachments.length === 0) || disabled) return;
    
    onSendMessage(message, attachments);
    
    // Reset state
    setMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);
    setShowAttachmentOptions(false);
    
    // Reset typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false);
    
    // Focus back on the input
    textAreaRef.current?.focus();
  };
  
  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio' | 'file') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    Array.from(e.target.files).forEach(file => {
      // Create a unique URL for the file
      const url = URL.createObjectURL(file);
      
      // Create a new attachment
      const newAttachment: MessageAttachment = {
        id: Math.random().toString(36).substring(2, 11),
        type,
        url,
        name: file.name,
        size: file.size,
        mimeType: file.type
      };
      
      // For images and videos, create a thumbnail
      if (type === 'image' || type === 'video') {
        if (type === 'image') {
          newAttachment.thumbnailUrl = url;
        } else if (type === 'video') {
          // Create video thumbnail
          const video = document.createElement('video');
          video.src = url;
          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            newAttachment.thumbnailUrl = canvas.toDataURL('image/jpeg');
            
            // Update the attachment in state
            setAttachments(prev => 
              prev.map(att => att.id === newAttachment.id ? { ...att, thumbnailUrl: newAttachment.thumbnailUrl } : att)
            );
          };
        }
      }
      
      // Add to attachments
      setAttachments(prev => [...prev, newAttachment]);
    });
    
    // Reset file input
    e.target.value = '';
  };
  
  // Remove an attachment
  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };
  
  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create new audio attachment
        const newAttachment: MessageAttachment = {
          id: Math.random().toString(36).substring(2, 11),
          type: 'audio',
          url: audioUrl,
          name: 'Voice Message',
          size: audioBlob.size,
          mimeType: 'audio/mpeg'
        };
        
        setAttachments(prev => [...prev, newAttachment]);
        
        // Close audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error recording audio:', error);
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textAreaRef.current?.focus();
  };
  
  // Render attachment previews
  const renderAttachmentPreviews = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {attachments.map(attachment => (
          <div key={attachment.id} className="relative group">
            {/* Image preview */}
            {attachment.type === 'image' && (
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={attachment.url} 
                  alt={attachment.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Video preview */}
            {attachment.type === 'video' && (
              <div className="w-24 h-24 bg-gray-800 rounded-md overflow-hidden flex items-center justify-center relative">
                {attachment.thumbnailUrl ? (
                  <img 
                    src={attachment.thumbnailUrl} 
                    alt={attachment.name} 
                    className="w-full h-full object-cover opacity-70"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <VideoCameraIcon className="h-8 w-8 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white bg-opacity-70 p-1.5">
                    <VideoCameraIcon className="h-4 w-4 text-gray-900" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Audio preview */}
            {attachment.type === 'audio' && (
              <div className="w-40 h-16 bg-gray-100 rounded-md overflow-hidden p-2 flex flex-col">
                <div className="flex items-center text-xs text-gray-800 font-medium mb-1">
                  <MicrophoneIcon className="h-3 w-3 mr-1" />
                  {attachment.name}
                </div>
                <audio 
                  src={attachment.url} 
                  controls 
                  className="w-full h-8" 
                />
              </div>
            )}
            
            {/* File preview */}
            {attachment.type === 'file' && (
              <div className="w-40 h-16 bg-gray-100 rounded-md overflow-hidden p-2 flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" />
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {attachment.name}
                  </div>
                  {attachment.size && (
                    <div className="text-xs text-gray-500">
                      {Math.round(attachment.size / 1024)} KB
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Remove button */}
            <button 
              onClick={() => removeAttachment(attachment.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  // Render reply preview
  const renderReplyPreview = () => {
    if (!replyingTo) return null;
    
    return (
      <div className="border-l-2 border-blue-500 pl-2 mb-2 flex justify-between items-start">
        <div className="flex-1">
          <div className="text-xs font-medium text-blue-600">
            Replying to {replyingTo.sender}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {replyingTo.content}
          </div>
        </div>
        <button 
          onClick={onCancelReply}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };
  
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      {/* Reply preview */}
      {renderReplyPreview()}
      
      {/* Attachment previews */}
      {renderAttachmentPreviews()}
      
      {/* Input area */}
      <div className="flex items-end">
        <div className="mr-2 relative">
          <button
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            type="button"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          
          {/* Attachment options dropdown */}
          {showAttachmentOptions && (
            <div className="absolute bottom-full mb-2 left-0 bg-white shadow-md rounded-lg p-2 w-48 z-10">
              <button
                onClick={() => {
                  imageInputRef.current?.click();
                  setShowAttachmentOptions(false);
                }}
                className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
              >
                <PhotoIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm">Photo</span>
              </button>
              
              <button
                onClick={() => {
                  videoInputRef.current?.click();
                  setShowAttachmentOptions(false);
                }}
                className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
              >
                <VideoCameraIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm">Video</span>
              </button>
              
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAttachmentOptions(false);
                }}
                className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
              >
                <DocumentTextIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm">Document</span>
              </button>
              
              <button
                onClick={() => {
                  setShowAttachmentOptions(false);
                  // Implementation for GIF picker would go here
                }}
                className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
              >
                <GifIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm">GIF</span>
              </button>
              
              <button
                onClick={() => {
                  setShowAttachmentOptions(false);
                  // Implementation for location sharing would go here
                }}
                className="flex items-center w-full p-2 hover:bg-gray-100 rounded-md text-left"
              >
                <MapPinIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm">Location</span>
              </button>
            </div>
          )}
          
          {/* Hidden file inputs */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, 'file')}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            multiple
          />
          
          <input 
            type="file" 
            ref={imageInputRef}
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
            accept="image/*"
            multiple
          />
          
          <input 
            type="file" 
            ref={videoInputRef}
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
            accept="video/*"
            multiple
          />
          
          <input 
            type="file" 
            ref={audioInputRef}
            onChange={(e) => handleFileChange(e, 'audio')}
            className="hidden"
            accept="audio/*"
            multiple
          />
        </div>
        
        <div className="flex-1 relative">
          <div className="flex items-center rounded-full border border-gray-300 bg-white pr-10">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full py-2 px-4 rounded-full resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            
            <div className="absolute right-3 flex items-center">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                type="button"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 right-0 bg-white shadow-md rounded-lg p-2 z-10">
              <div className="grid grid-cols-8 gap-1">
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="p-1.5 hover:bg-gray-100 rounded text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-2 pt-2 border-t border-gray-200">
                <button
                  className="text-xs text-blue-500 hover:underline"
                  onClick={() => {
                    setShowEmojiPicker(false);
                    // Here you would implement a more extensive emoji picker
                  }}
                >
                  View all emojis
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="ml-2 flex items-center">
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-full ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-100'
            }`}
            type="button"
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleSendMessage}
            className={`ml-1 p-2 rounded-full ${
              message.trim() === '' && attachments.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-white bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={message.trim() === '' && attachments.length === 0}
            type="button"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Encryption indicator */}
      {isEncrypted && (
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
            Messages are end-to-end encrypted
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput; 