
import React from 'react';
import { Settings, Wrench, Clock, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';

const MaintenancePage = () => {
  const { generalSettings } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Settings className="h-20 w-20 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
                <Wrench className="h-8 w-8 text-orange-500 absolute -bottom-1 -right-1" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {generalSettings?.siteName || 'Riziky-Boutic'}
            </h1>
            
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Site en Maintenance
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {generalSettings?.siteDescription || 'Notre site est temporairement en maintenance pour vous offrir une meilleure expérience. Nous reviendrons bientôt avec des améliorations !'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-gray-700 font-medium">Maintenance en cours</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Mail className="h-6 w-6 text-green-600" />
              <span className="text-gray-700 font-medium">Bientôt de retour</span>
            </div>
          </div>

          {generalSettings?.contactEmail && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 mb-3">
                Pour toute question urgente, contactez-nous :
              </p>
              <div className="space-y-2">
                <a 
                  href={`mailto:${generalSettings.contactEmail}`}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Mail className="h-4 w-4" />
                  <span>{generalSettings.contactEmail}</span>
                </a>
                
                {generalSettings.phoneNumber && (
                  <div className="flex items-center justify-center space-x-2 text-gray-700">
                    <span>📞</span>
                    <span>{generalSettings.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500">
            <p>Merci pour votre patience</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;
