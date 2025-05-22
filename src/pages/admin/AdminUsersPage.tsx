
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Search, Mail, Key, Trash2, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType, authAPI } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<(UserType & { password?: string; passwordUnique?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    // Ne pas permettre la suppression de son propre compte
    if (userId === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        toast.success('Utilisateur supprimé avec succès');
        loadUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer l\'utilisateur');
      }
    }
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    generateTempPassword();
    setShowPasswordDialog(true);
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(result);
  };

  const setUserTempPassword = async () => {
    if (!selectedUserId) return;
    
    try {
      await authAPI.setTempPassword(selectedUserId, tempPassword);
      toast.success('Mot de passe temporaire défini avec succès');
      setShowPasswordDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la définition du mot de passe temporaire:', error);
      toast.error('Impossible de définir le mot de passe temporaire');
    }
  };

  const openEmailDialog = (email: string) => {
    setSelectedUserEmail(email);
    setEmailSubject('');
    setEmailContent('');
    setShowEmailDialog(true);
  };

  const sendEmail = async () => {
    // Cette fonction serait implémentée si nous avions un service d'envoi d'emails
    toast.info('Fonctionnalité d\'envoi d\'email non implémentée pour le moment');
    setShowEmailDialog(false);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.nom?.toLowerCase() || '').includes(searchLower) ||
      (user.prenom?.toLowerCase() || '').includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{`${user.prenom || ''} ${user.nom || ''}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {user.role === 'admin' ? 'Admin' : 'Client'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.dateCreation ? format(new Date(user.dateCreation), 'dd/MM/yyyy', { locale: fr }) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openEmailDialog(user.email)}>
                            <Mail size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => openPasswordDialog(user.id)}>
                            <Key size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === user.id} // Désactiver pour l'utilisateur actuel
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour définir un mot de passe temporaire */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Définir un mot de passe temporaire</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tempPassword">Mot de passe temporaire</Label>
              <div className="flex space-x-2">
                <Input
                  id="tempPassword"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
                <Button variant="outline" onClick={generateTempPassword}>
                  Générer
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Ce mot de passe sera utilisable une seule fois pour permettre à l'utilisateur de définir un nouveau mot de passe.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Annuler
              </Button>
              <Button onClick={setUserTempPassword}>
                Définir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour envoyer un email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTo">Destinataire</Label>
              <div className="flex items-center border p-2 rounded-md bg-gray-50">
                <User size={16} className="text-gray-400 mr-2" />
                <span>{selectedUserEmail}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Sujet</Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailContent">Contenu</Label>
              <textarea
                id="emailContent"
                className="w-full min-h-[150px] p-2 border rounded-md"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEmailDialog(false)}>
                Annuler
              </Button>
              <Button onClick={sendEmail}>
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
