import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import settingsApi from '@/services/api/settingsApi';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Download, Upload, Trash2, Eye, EyeOff,
  AlertTriangle, UserCog, ArrowUpCircle, ArrowDownCircle, Radio
} from 'lucide-react';
import PasswordStrengthChecker from '@/components/PasswordStrengthChecker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import IndisponibiliteSection from './IndisponibiliteSection';
import ModuleSettingsSection from './ModuleSettingsSection';

const premiumBtnClass = "group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 px-4 py-2 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  specification?: string;
}

const ParametresSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Delete
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Role
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<UserData | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  // Specification
  const [changingSpec, setChangingSpec] = useState(false);

  // Backup
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [isBackupCodeValid, setIsBackupCodeValid] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  // Restore
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [showRestoreCode, setShowRestoreCode] = useState(false);
  const [isRestoreCodeValid, setIsRestoreCodeValid] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoring, setRestoring] = useState(false);

  const isAdmin = user?.role === 'administrateur' || user?.role === 'administrateur principale';
  const isAdminPrincipal = user?.role === 'administrateur principale';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await settingsApi.getSettings();
        setSettings(data || {});
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isAdminPrincipal) {
      const loadUsers = async () => {
        try {
          setLoadingUsers(true);
          const users = await settingsApi.getAllUsers();
          setAllUsers(users || []);
        } catch {
          // ignore
        } finally {
          setLoadingUsers(false);
        }
      };
      loadUsers();
    }
  }, [isAdminPrincipal]);

  const handleSettingChange = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      await settingsApi.updateSettings(updated);
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder le paramètre', variant: 'destructive' });
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      await settingsApi.deleteAllData(deletePassword);
      toast({ title: '✅ Données supprimées', className: 'bg-green-600 text-white border-green-600' });
      setShowDeleteDialog(false);
    } catch {
      toast({ title: 'Erreur', description: 'Mot de passe incorrect ou erreur serveur', variant: 'destructive' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser) return;
    try {
      setChangingRole(true);
      await settingsApi.updateUserRole(roleChangeUser.id, roleChangeTarget || '');
      setAllUsers(prev => prev.map(u => u.id === roleChangeUser.id ? { ...u, role: roleChangeTarget || '' } : u));
      toast({ title: '✅ Rôle modifié', className: 'bg-green-600 text-white border-green-600' });
      setShowRoleDialog(false);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle', variant: 'destructive' });
    } finally {
      setChangingRole(false);
    }
  };

  const handleSetSpecification = async (userId: string, spec: string) => {
    try {
      setChangingSpec(true);
      await settingsApi.updateUserSpecification(userId, spec);
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, specification: spec } : u));
      toast({ title: '✅ Spécification mise à jour', className: 'bg-green-600 text-white border-green-600' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de modifier la spécification', variant: 'destructive' });
    } finally {
      setChangingSpec(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      const blob = await settingsApi.backupData(backupCode);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: '✅ Sauvegarde téléchargée', className: 'bg-green-600 text-white border-green-600' });
      setShowBackupDialog(false);
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'destructive' });
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      setRestoreFileName(file.name);
      setShowRestoreDialog(true);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    try {
      setRestoring(true);
      await settingsApi.restoreData(restoreFile, restoreCode);
      toast({ title: '✅ Données restaurées', description: 'Rechargement...', className: 'bg-green-600 text-white border-green-600' });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast({ title: 'Erreur', description: 'Code incorrect ou fichier invalide', variant: 'destructive' });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-white/5 border border-violet-200/30 dark:border-violet-800/20 shadow-2xl shadow-violet-500/5 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Paramètres</h3>
              <p className="text-xs text-muted-foreground">Configuration du site et gestion des données</p>
            </div>
          </div>

          {/* Indisponibilités / Congés */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <IndisponibiliteSection />
          </div>

          {/* Module Settings */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">Paramètres des modules</span>
            </div>
            <ModuleSettingsSection />
          </div>

          {/* ADMIN BUTTONS */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Zone Administrateur</span>
              </div>

              <div className={`grid grid-cols-1 ${isAdminPrincipal ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                <Button
                  onClick={() => setShowBackupDialog(true)}
                  className={`${premiumBtnClass} bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-300/30 text-emerald-600 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className={`${premiumBtnClass} bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-300/30 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-indigo-500/20`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Injecter
                </Button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

                {isAdminPrincipal && (
                  <Button
                    onClick={() => { setShowDeleteDialog(true); setDeletePassword(''); setConfirmDeleteStep(false); }}
                    className={`${premiumBtnClass} bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-300/30 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-rose-500/20`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer tout
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* SPECIFICATION MANAGEMENT */}
          {isAdminPrincipal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Gestion spécification</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Sélectionnez un administrateur pour recevoir les messages live des visiteurs en priorité.
              </p>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.filter(u => u.role === 'administrateur').map(u => (
                    <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        {u.specification === 'live' && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            🟢 Spécification: Live
                          </span>
                        )}
                      </div>
                      <div>
                        {u.specification === 'live' ? (
                          <Button size="sm" disabled={changingSpec} onClick={() => handleSetSpecification(u.id, '')}
                            className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs hover:from-orange-500/20 hover:to-red-500/20">
                            Retirer Live
                          </Button>
                        ) : (
                          <Button size="sm" disabled={changingSpec} onClick={() => handleSetSpecification(u.id, 'live')}
                            className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-300/30 text-emerald-600 dark:text-emerald-400 text-xs hover:from-emerald-500/20 hover:to-teal-500/20">
                            <Radio className="w-3 h-3 mr-1" /> Définir Live
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {allUsers.filter(u => u.role === 'administrateur').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun administrateur disponible</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ROLE MANAGEMENT */}
          {isAdminPrincipal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 pt-6 border-t border-border/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <UserCog className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Gestion des rôles</span>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {allUsers.filter(u => u.role !== 'administrateur principale').map(u => (
                    <div key={u.id} className="flex items-center justify-between rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/[0.02] border border-border/50 p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                          u.role === 'administrateur'
                            ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                            : 'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                        }`}>
                          {u.role === 'administrateur' ? 'Administrateur' : 'Simple utilisateur'}
                        </span>
                      </div>
                      <div>
                        {u.role === 'administrateur' ? (
                          <Button size="sm"
                            onClick={() => { setRoleChangeUser(u); setRoleChangeTarget(''); setShowRoleDialog(true); }}
                            className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-300/30 text-orange-600 dark:text-orange-400 text-xs hover:from-orange-500/20 hover:to-red-500/20">
                            <ArrowDownCircle className="w-3 h-3 mr-1" /> Rétrograder
                          </Button>
                        ) : (
                          <Button size="sm"
                            onClick={() => { setRoleChangeUser(u); setRoleChangeTarget('administrateur'); setShowRoleDialog(true); }}
                            className="rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-300/30 text-violet-600 dark:text-violet-400 text-xs hover:from-violet-500/20 hover:to-fuchsia-500/20">
                            <ArrowUpCircle className="w-3 h-3 mr-1" /> Promouvoir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {allUsers.filter(u => u.role !== 'administrateur principale').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun autre utilisateur</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ========== DELETE DIALOG ========== */}
      <AlertDialog open={showDeleteDialog} onOpenChange={v => { setShowDeleteDialog(v); if (!v) { setDeletePassword(''); setConfirmDeleteStep(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-red-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Suppression totale des données
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block text-red-500 font-bold">⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !</span>
              <span className="block">Toutes les données seront supprimées sauf votre compte administrateur principale.</span>
              <span className="block text-xs text-red-400 font-semibold">⚡ Vous n'avez qu'UNE SEULE tentative. Un mot de passe incorrect = déconnexion immédiate.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!confirmDeleteStep ? (
            <div className="space-y-4 py-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Mot de passe administrateur
              </label>
              <div className="relative">
                <Input
                  type={showDeletePw ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  className="rounded-xl border-red-200/30 dark:border-red-800/20 pr-10"
                />
                <button type="button" onClick={() => setShowDeletePw(!showDeletePw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showDeletePw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthChecker password={deletePassword} />
            </div>
          ) : (
            <div className="py-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-red-600">Confirmez-vous la suppression TOTALE ?</p>
              <p className="text-xs text-muted-foreground mt-1">Cette action ne peut pas être annulée</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            {!confirmDeleteStep ? (
              <Button
                onClick={() => setConfirmDeleteStep(true)}
                disabled={!deletePassword}
                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
              >
                Continuer
              </Button>
            ) : (
              <Button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
              >
                {deleting ? 'Suppression...' : '🗑️ Supprimer définitivement'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== ROLE CHANGE DIALOG ========== */}
      <AlertDialog open={showRoleDialog} onOpenChange={v => { setShowRoleDialog(v); if (!v) { setRoleChangeUser(null); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-violet-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-violet-600">
              <UserCog className="w-5 h-5" /> Modifier le rôle
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser && (
                <>
                  <span className="font-semibold">{roleChangeUser.firstName} {roleChangeUser.lastName}</span>
                  <br />
                  {roleChangeTarget === 'administrateur'
                    ? 'Promouvoir en Administrateur ?'
                    : 'Rétrograder en simple utilisateur ?'
                  }
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={handleRoleChange}
              disabled={changingRole}
              className={`rounded-xl text-white ${
                roleChangeTarget === 'administrateur'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
            >
              {changingRole ? 'Modification...' : 'Confirmer'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== BACKUP DIALOG ========== */}
      <AlertDialog open={showBackupDialog} onOpenChange={v => { setShowBackupDialog(v); if (!v) { setBackupCode(''); setIsBackupCodeValid(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-emerald-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <Download className="w-5 h-5" /> Sauvegarder les données
            </AlertDialogTitle>
            <AlertDialogDescription>
              Créez un code de cryptage pour protéger votre sauvegarde. Ce code sera nécessaire pour restaurer les données.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Code de cryptage
            </label>
            <div className="relative">
              <Input
                type={showBackupCode ? 'text' : 'password'}
                value={backupCode}
                onChange={e => setBackupCode(e.target.value)}
                placeholder="Créez un code de cryptage sécurisé"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="rounded-xl border-emerald-200/30 dark:border-emerald-800/20 pr-10"
              />
              <button type="button" onClick={() => setShowBackupCode(!showBackupCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showBackupCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthChecker password={backupCode} onValidityChange={setIsBackupCodeValid} />
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Mémorisez bien ce code ! Sans lui, les données ne pourront pas être restaurées.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={handleBackup}
              disabled={!isBackupCodeValid || backingUp}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            >
              {backingUp ? 'Sauvegarde...' : '📦 Sauvegarder et télécharger'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== RESTORE DIALOG ========== */}
      <AlertDialog open={showRestoreDialog} onOpenChange={v => { setShowRestoreDialog(v); if (!v) { setRestoreCode(''); setRestoreFile(null); setIsRestoreCodeValid(false); } }}>
        <AlertDialogContent className="rounded-3xl backdrop-blur-2xl bg-white/95 dark:bg-[#0a0020]/95 border border-blue-200/30 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-blue-600">
              <Upload className="w-5 h-5" /> Restaurer les données
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fichier sélectionné : <strong>{restoreFileName}</strong>
              <br />Saisissez le code de cryptage utilisé lors de la sauvegarde.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Code de décryptage
            </label>
            <div className="relative">
              <Input
                type={showRestoreCode ? 'text' : 'password'}
                value={restoreCode}
                onChange={e => setRestoreCode(e.target.value)}
                placeholder="Saisissez le code de sauvegarde"
                autoComplete="new-password"
                data-lpignore="true"
                data-form-type="other"
                className="rounded-xl border-blue-200/30 dark:border-blue-800/20 pr-10"
              />
              <button type="button" onClick={() => setShowRestoreCode(!showRestoreCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showRestoreCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthChecker password={restoreCode} onValidityChange={setIsRestoreCodeValid} />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <Button
              onClick={handleRestore}
              disabled={!isRestoreCodeValid || restoring}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              {restoring ? 'Restauration...' : '📥 Restaurer les données'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ParametresSection;
