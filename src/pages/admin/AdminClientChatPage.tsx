
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Edit, Trash2, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clientChatAPI, Message, ServiceConversation, User } from '@/services/api';

interface ClientInfo {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
}

interface EnhancedServiceConversation extends Omit<ServiceConversation, 'clientInfo' | 'messages'> {
  clientInfo: ClientInfo;
  messages: Message[];
}

const AdminClientChatPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<EnhancedServiceConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<EnhancedServiceConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Signaler que l'administrateur est en ligne
    clientChatAPI.setOnline();
    
    // Charger les conversations
    loadConversations();
    
    return () => {
      // Signaler que l'administrateur est hors ligne à la fermeture de la page
      clientChatAPI.setOffline();
    };
  }, []);
  
  useEffect(() => {
    // Mise à jour des messages lorsqu'une conversation est sélectionnée
    if (selectedConversation) {
      setMessages(selectedConversation.messages || []);
    }
  }, [selectedConversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await clientChatAPI.getServiceConversations();
      
      // Type assertion pour corriger le problème de type
      const enhancedConversations = response.data as unknown as EnhancedServiceConversation[];
      
      setConversations(enhancedConversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast.error('Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };
  
  const selectConversation = (conversation: EnhancedServiceConversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
    setNewMessage('');
    setIsEditing(null);
  };
  
  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    try {
      await clientChatAPI.sendServiceReply(selectedConversation.id, newMessage);
      setNewMessage('');
      loadConversations();
      
      // Mettre à jour les messages de la conversation sélectionnée
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
        setMessages(updated.messages || []);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Impossible d\'envoyer le message');
    }
  };
  
  const startEditing = (message: Message) => {
    setIsEditing(message.id);
    setEditContent(message.content);
  };
  
  const saveEdit = async () => {
    if (!isEditing || !selectedConversation || !editContent.trim()) return;
    
    try {
      await clientChatAPI.editMessage(isEditing, editContent, selectedConversation.id);
      setIsEditing(null);
      
      // Recharger les conversations pour mettre à jour les messages
      loadConversations();
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
      toast.error('Impossible de modifier le message');
    }
  };
  
  const deleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;
    
    try {
      await clientChatAPI.deleteMessage(messageId, selectedConversation.id);
      loadConversations();
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      toast.error('Impossible de supprimer le message');
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isEditing) {
        saveEdit();
      } else {
        sendMessage();
      }
    }
  };
  
  // Formater la date du dernier message
  const formatLastMessageTime = (conversation: EnhancedServiceConversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Pas de messages';
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return formatDistanceToNow(new Date(lastMessage.timestamp), { 
      addSuffix: true,
      locale: fr 
    });
  };
  
  // Obtenir le contenu du dernier message
  const getLastMessageContent = (conversation: EnhancedServiceConversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'Pas de messages';
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.content.length > 20
      ? `${lastMessage.content.substring(0, 20)}...`
      : lastMessage.content;
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="text-xl font-bold mb-4">Support Client</div>
      
      <div className="flex flex-1 gap-4 h-full">
        {/* Liste des conversations */}
        <Card className="w-1/4 min-w-[250px]">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-4 space-y-1">
                {loading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-800"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <p>Aucune conversation avec les clients</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div 
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                        selectedConversation?.id === conversation.id ? 'bg-gray-100 dark:bg-neutral-800' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={`/images/avatars/avatar-${conversation.clientInfo.id}.jpg`} alt={conversation.clientInfo.nom} />
                          <AvatarFallback>
                            {conversation.clientInfo.prenom?.[0] || ''}{conversation.clientInfo.nom?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {conversation.clientInfo.prenom} {conversation.clientInfo.nom}
                          </span>
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500">{conversation.unreadCount}</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 truncate">
                          {getLastMessageContent(conversation)}
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          {formatLastMessageTime(conversation)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Zone de conversation */}
        <Card className="flex-1">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* En-tête de la conversation */}
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage 
                        src={`/images/avatars/avatar-${selectedConversation.clientInfo.id}.jpg`} 
                        alt={selectedConversation.clientInfo.nom} 
                      />
                      <AvatarFallback>
                        {selectedConversation.clientInfo.prenom?.[0] || ''}{selectedConversation.clientInfo.nom?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="font-medium">
                        {selectedConversation.clientInfo.prenom} {selectedConversation.clientInfo.nom}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedConversation.clientInfo.email}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                        <p>Aucun message dans cette conversation</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === user?.id
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 dark:bg-neutral-800'
                            }`}
                          >
                            {isEditing === message.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="bg-white dark:bg-neutral-700"
                                  onKeyPress={handleKeyPress}
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(null)}
                                  >
                                    Annuler
                                  </Button>
                                  <Button size="sm" onClick={saveEdit}>
                                    Sauvegarder
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p>{message.content}</p>
                                <div className="mt-1 flex justify-between items-center text-xs">
                                  <span className={message.senderId === user?.id ? 'text-white/70' : 'text-gray-500'}>
                                    {format(new Date(message.timestamp), 'dd/MM HH:mm', { locale: fr })}
                                  </span>
                                  
                                  {message.senderId === user?.id && (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => startEditing(message)}
                                        className="text-white/70 hover:text-white"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() => deleteMessage(message.id)}
                                        className="text-white/70 hover:text-white"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                
                                {message.isEdited && (
                                  <span className="text-xs italic text-white/50">modifié</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Zone de saisie */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="mb-2">Sélectionnez une conversation client pour répondre</p>
                  <p className="text-sm">Les demandes de support client apparaîtront ici</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminClientChatPage;
