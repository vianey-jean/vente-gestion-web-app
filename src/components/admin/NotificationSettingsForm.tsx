
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NotificationSettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Smartphone, Clock, Volume2 } from 'lucide-react';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onSave: (settings: Partial<NotificationSettings>) => void;
  isLoading?: boolean;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const { toast } = useToast();
  
  const form = useForm<NotificationSettings>({
    defaultValues: settings
  });

  const onSubmit = (data: NotificationSettings) => {
    onSave(data);
    toast({
      title: "Notifications sauvegardées",
      description: "Les paramètres de notification ont été mis à jour avec succès.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Notifications Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notifications Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emailNotifications.orderConfirmation"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Confirmation de commande</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.orderStatusUpdate"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Mise à jour statut commande</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.paymentConfirmation"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Confirmation de paiement</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.shippingNotification"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Notification d'expédition</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.deliveryConfirmation"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Confirmation de livraison</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.refundNotification"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Notification de remboursement</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.promotionalEmails"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Emails promotionnels</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.newsletterSubscription"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Newsletter</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.reviewReminder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Rappel d'évaluation</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.stockAlert"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Alerte de stock</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.newProductAlert"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouveaux produits</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailNotifications.flashSaleAlert"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Ventes flash</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Push */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications Push
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pushNotifications.browserNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Notifications navigateur</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications.orderUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Mises à jour commandes</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications.promotions"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Promotions</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications.flashSales"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Ventes flash</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications.newProducts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouveaux produits</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications.lowStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Stock faible</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notifications Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adminNotifications.newOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouvelle commande</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.newUser"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouvel utilisateur</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.newReview"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouvel avis</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.newContact"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Nouveau contact</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.lowStock"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Stock faible</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.paymentFailed"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Paiement échoué</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.refundRequest"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Demande de remboursement</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminNotifications.systemErrors"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Erreurs système</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications SMS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Notifications SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="smsNotifications.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Activer les SMS</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('smsNotifications.enabled') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="smsNotifications.orderConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Confirmation commande</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications.shippingNotification"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Expédition</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications.deliveryConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Livraison</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration avancée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configuration avancée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="notificationFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence des notifications</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediate">Immédiate</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quietHours.enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Heures de silence</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('quietHours.enabled') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quietHours.startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Début</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quietHours.endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder les notifications'}
        </Button>
      </form>
    </Form>
  );
};

export default NotificationSettingsForm;
