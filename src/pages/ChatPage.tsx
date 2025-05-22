
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Send, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clientChatAPI, Message } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      
      // Signaler que l'utilisateur est en ligne
      clientChatAPI.setOnline();
      
      // Signaler que l'utilisateur est hors ligne à la fermeture de la page
      return () => {
        clientChatAPI.setOffline();
      };
    }
  }, [user]);

  // Charger les messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await clientChatAPI.getServiceChat();
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Impossible de charger les messages');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await clientChatAPI.sendServiceMessage(newMessage.trim());
      setNewMessage('');
      loadMessages(); // Recharger les messages après envoi
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Impossible d\'envoyer le message');
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId: string) => {
    try {
      await clientChatAPI.deleteMessage(messageId, 'service');
      loadMessages();
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      toast.error('Impossible de supprimer le message');
    }
  };

  // Modifier un message
  const startEditing = (message: Message) => {
    setIsEditing(message.id);
    setEditContent(message.content);
  };

  const saveEdit = async () => {
    if (!isEditing || !editContent.trim()) return;
    
    try {
      await clientChatAPI.editMessage(isEditing, editContent, 'service');
      setIsEditing(null);
      loadMessages();
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
      toast.error('Impossible de modifier le message');
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
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

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-red-100">
                <AvatarFallback className="text-red-700">SC</AvatarFallback>
              </Avatar>
              Service Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-md p-4 h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>Aucun message pour le moment.</p>
                  <p>Commencez la conversation avec notre service client.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === user?.id
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-neutral-800 dark:text-white'
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
                                onClick={cancelEdit}
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
                              
                              {message.senderId === user?.id && !message.isSystemMessage && (
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
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <Separator className="my-4" />

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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChatPage;
