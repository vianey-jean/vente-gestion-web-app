
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Smile } from 'lucide-react';
import FileUploadButton from '@/components/chat/FileUploadButton';
import VoiceRecorder from '@/components/chat/VoiceRecorder';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onEmojiSelect: (emoji: any) => void;
  onFileSelect?: (file: File) => void;
  onVoiceRecording?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onEmojiSelect,
  onFileSelect,
  onVoiceRecording,
  disabled = false,
  placeholder = "Écrivez votre message..."
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  const handleFileSelect = (file: File) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleVoiceRecording = (audioBlob: Blob) => {
    if (onVoiceRecording) {
      onVoiceRecording(audioBlob);
    }
  };

  return (
    <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        {/* Bouton d'upload de fichier */}
        {onFileSelect && (
          <FileUploadButton
            onFileSelect={handleFileSelect}
            accept="*/*"
            maxSize={50}
            disabled={disabled}
          />
        )}
        
        {/* Enregistreur vocal */}
        {onVoiceRecording && (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            disabled={disabled}
          />
        )}
        
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full"
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {/* Emoji picker temporairement désactivé */}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md rounded-full px-6"
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
