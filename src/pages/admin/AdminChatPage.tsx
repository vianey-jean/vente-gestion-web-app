
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Edit, Trash2, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminChatAPI, Message, User } from '@/services/api';
import { format } from 'date-fns';

interface Admin extends User {
  online?: boolean;
}

const AdminChatPage: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Signaler que l'administrateur est en ligne
    adminChatAPI.setOnline();
    
    // Charger les administrateurs et les conversations
    loadAdmins();
    loadConversations();
    
    // Signaler que l'administrateur est hors ligne à la fermeture de la page
    return () => {
      adminChatAPI.setOffline();
    };
  }, []);

  useEffect(() => {
    // Charger les messages si un administrateur est sélectionné
    if (selectedAdmin) {
      loadMessages(selectedAdmin.id);
    }
  }, [selectedAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAdmins = async () => {
    try {
      const response = await adminChatAPI.getAdmins();
      // Filtrer l'administrateur actuel de la liste
      const filteredAdmins = response.data.filter((admin: Admin) => admin.id !== user?.id);
      setAdmins(filteredAdmins);
    } catch (error) {
      console.error('Erreur lors du chargement des administrateurs:', error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await adminChatAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (adminId: string) => {
    try {
      const response = await adminChatAPI.getConversation(adminId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Impossible de charger les messages');
    }
  };

  const selectAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    // Réinitialiser les états de message et d'édition
    setNewMessage('');
    setIsEditing(null);
  };

  const sendMessage = async () => {
    if (!selectedAdmin || !newMessage.trim()) return;
    
    try {
      await adminChatAPI.sendMessage(selectedAdmin.id, newMessage);
      setNewMessage('');
      loadMessages(selectedAdmin.id);
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
    if (!isEditing || !selectedAdmin || !editContent.trim()) return;
    
    try {
      await adminChatAPI.editMessage(isEditing, editContent, selectedAdmin.id);
      setIsEditing(null);
      loadMessages(selectedAdmin.id);
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
      toast.error('Impossible de modifier le message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!selectedAdmin) return;
    
    try {
      await adminChatAPI.deleteMessage(messageId, selectedAdmin.id);
      loadMessages(selectedAdmin.id);
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

  // Trouver la conversation pour un admin donné
  const findConversation = (adminId: string) => {
    return conversations.find(conv => 
      conv.participants.includes(adminId) && conv.participants.includes(user?.id)
    );
  };

  // Compter les messages non lus pour un admin donné
  const countUnreadMessages = (adminId: string) => {
    const conversation = findConversation(adminId);
    if (!conversation) return 0;
    
    return conversation.messages?.filter(
      (msg: Message) => msg.senderId === adminId && !msg.read
    ).length || 0;
  };

  // Trouver le dernier message pour un admin donné
  const getLastMessage = (adminId: string) => {
    const conversation = findConversation(adminId);
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return null;
    }
    
    return conversation.messages[conversation.messages.length - 1];
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="text-xl font-bold mb-4">Messagerie des administrateurs</div>
      
      <div className="flex flex-1 gap-4 h-full">
        {/* Liste des administrateurs */}
        <Card className="w-1/4 min-w-[250px]">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-4 space-y-1">
                {loading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-800"></div>
                  </div>
                ) : (
                  admins.map((admin) => {
                    const unreadCount = countUnreadMessages(admin.id);
                    const lastMessage = getLastMessage(admin.id);
                    
                    return (
                      <div 
                        key={admin.id}
                        onClick={() => selectAdmin(admin)}
                        className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                          selectedAdmin?.id === admin.id ? 'bg-gray-100 dark:bg-neutral-800' : ''
                        }`}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={`/images/avatars/avatar-${admin.id}.jpg`} alt={admin.nom} />
                            <AvatarFallback>
                              {admin.prenom ? admin.prenom[0] : ''}{admin.nom ? admin.nom[0] : ''}
                            </AvatarFallback>
                          </Avatar>
                          <span 
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${
                              admin.online ? 'bg-green-500' : 'bg-gray-400'
                            } border-2 border-white`}
                          ></span>
                        </div>
                        
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {admin.prenom} {admin.nom}
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          
                          {lastMessage && (
                            <div className="text-sm text-gray-500 truncate">
                              {lastMessage.content.length > 20
                                ? `${lastMessage.content.substring(0, 20)}...`
                                : lastMessage.content}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400">
                            {lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { 
                              addSuffix: true,
                              locale: fr 
                            }) : 'Pas de messages'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Zone de conversation */}
        <Card className="flex-1">
          <CardContent className="p-0 h-full flex flex-col">
            {selectedAdmin ? (
              <>
                {/* En-tête de la conversation */}
                <div className="p-4 border-b flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`/images/avatars/avatar-${selectedAdmin.id}.jpg`} alt={selectedAdmin.nom} />
                    <AvatarFallback>
                      {selectedAdmin.prenom ? selectedAdmin.prenom[0] : ''}{selectedAdmin.nom ? selectedAdmin.nom[0] : ''}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{selectedAdmin.prenom} {selectedAdmin.nom}</div>
                    <div className="text-xs flex items-center">
                      <Circle size={8} className={selectedAdmin.online ? 'text-green-500' : 'text-gray-400'} />
                      <span className="ml-1">{selectedAdmin.online ? 'En ligne' : 'Hors ligne'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                        <p>Aucun message pour le moment.</p>
                        <p>Commencez la conversation avec {selectedAdmin.prenom}.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
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
                  <p className="mb-2">Sélectionnez un administrateur pour commencer une conversation</p>
                  <p className="text-sm">Ou envoyez un message à un client dans l'onglet "Support Client"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChatPage;
