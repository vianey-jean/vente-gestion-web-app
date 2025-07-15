
/**
 * PAGE D'ANALYSE DES TENDANCES
 * ===========================
 * 
 * Cette page affiche les tendances et analyses des ventes sous forme
 * de graphiques et statistiques. Elle permet aux utilisateurs de
 * visualiser l'évolution de leur activité commerciale.
 * 
 * Fonctionnalités principales :
 * - Graphiques de tendances des ventes
 * - Analyses temporelles (mensuel, annuel)
 * - Métriques de performance
 * - Filtres et options d'affichage
 * - Export des données (future fonctionnalité)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, BarChart3, PieChart, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

// Types pour les données de tendances
interface TrendData {
  month: string;
  ventes: number;
  benefices: number;
  commandes: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

/**
 * Composant principal de la page des tendances
 * Affiche les analyses et graphiques des performances commerciales
 */
const TendancesPage: React.FC = () => {
  // Ici on attend l'initialisation des hooks et du state local
  const { toast } = useToast();

  // État pour les données de tendances
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  
  // État pour les contrôles d'affichage
  const [timeRange, setTimeRange] = useState('6months');
  const [chartType, setChartType] = useState('line');
  
  // État de chargement
  const [isLoading, setIsLoading] = useState(true);

  // Couleurs pour le graphique en secteurs
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  /**
   * Fonction pour générer des données de test
   * Simule les données réelles qui viendraient d'une API
   */
  const generateMockData = (): { trends: TrendData[], categories: CategoryData[] } => {
    // Ici on attend la génération des données de tendances
    const trends: TrendData[] = [
      { month: 'Jan', ventes: 12000, benefices: 3000, commandes: 45 },
      { month: 'Fév', ventes: 15000, benefices: 4200, commandes: 52 },
      { month: 'Mar', ventes: 18000, benefices: 5100, commandes: 61 },
      { month: 'Avr', ventes: 16000, benefices: 4800, commandes: 58 },
      { month: 'Mai', ventes: 21000, benefices: 6300, commandes: 73 },
      { month: 'Juin', ventes: 25000, benefices: 7500, commandes: 84 }
    ];

    // Ici on attend la génération des données par catégories
    const categories: CategoryData[] = [
      { name: 'Perruques', value: 35, color: COLORS[0] },
      { name: 'Tissages', value: 28, color: COLORS[1] },
      { name: 'Accessoires', value: 20, color: COLORS[2] },
      { name: 'Produits capillaires', value: 12, color: COLORS[3] },
      { name: 'Autres', value: 5, color: COLORS[4] }
    ];

    return { trends, categories };
  };

  /**
   * Fonction de chargement des données
   * Simule un appel API et met à jour l'état
   */
  const loadTrendData = async () => {
    // Ici on attend le chargement des données de tendances
    setIsLoading(true);
    
    try {
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici on a ajouté la génération des données de test
      const { trends, categories } = generateMockData();
      setTrendData(trends);
      setCategoryData(categories);
    } catch (error) {
      // Ici on a ajouté la gestion des erreurs de chargement
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de tendances",
        variant: "destructive"
      });
    } finally {
      // Ici on a ajouté la désactivation du loading
      setIsLoading(false);
    }
  };

  /**
   * Effet pour charger les données au montage du composant
   * Se déclenche également lors du changement de période
   */
  useEffect(() => {
    // Ici on attend le chargement initial des données
    loadTrendData();
  }, [timeRange]);

  /**
   * Fonction pour calculer les métriques de performance
   * Analyse les tendances et calcule les variations
   */
  const calculateMetrics = () => {
    // Ici on attend le calcul des métriques basées sur les données
    if (trendData.length < 2) return null;

    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];

    // Calcul des variations en pourcentage
    const ventesChange = ((latest.ventes - previous.ventes) / previous.ventes) * 100;
    const beneficesChange = ((latest.benefices - previous.benefices) / previous.benefices) * 100;
    const commandesChange = ((latest.commandes - previous.commandes) / previous.commandes) * 100;

    return {
      ventesChange: ventesChange.toFixed(1),
      beneficesChange: beneficesChange.toFixed(1),
      commandesChange: commandesChange.toFixed(1),
      latest
    };
  };

  /**
   * Fonction pour exporter les données
   * Prépare et télécharge les données au format CSV
   */
  const handleExport = () => {
    // Ici on attend la préparation des données pour l'export
    const csvContent = [
      ['Mois', 'Ventes', 'Bénéfices', 'Commandes'],
      ...trendData.map(item => [item.month, item.ventes, item.benefices, item.commandes])
    ].map(row => row.join(',')).join('\n');

    // Ici on a ajouté la création et le téléchargement du fichier
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tendances-ventes.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    // Ici on a ajouté la notification de succès
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées avec succès"
    });
  };

  // Ici on attend le calcul des métriques actuelles
  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Chargement des tendances..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tendances & Analyses</h1>
            <p className="text-muted-foreground mt-2">
              Analysez les performances de vos ventes avec des graphiques détaillés
            </p>
          </div>
          
          {/* Contrôles d'affichage */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Sélecteur de période */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 derniers mois</SelectItem>
                <SelectItem value="6months">6 derniers mois</SelectItem>
                <SelectItem value="1year">12 derniers mois</SelectItem>
              </SelectContent>
            </Select>

            {/* Sélecteur de type de graphique */}
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[180px]">
                <BarChart3 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type de graphique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Courbes</SelectItem>
                <SelectItem value="bar">Barres</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton d'export */}
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Métriques de performance */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Carte Ventes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes Totales</CardTitle>
                {parseFloat(metrics.ventesChange) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.latest.ventes.toLocaleString()} €</div>
                <Badge 
                  variant={parseFloat(metrics.ventesChange) > 0 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {parseFloat(metrics.ventesChange) > 0 ? '+' : ''}{metrics.ventesChange}%
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">vs mois précédent</p>
              </CardContent>
            </Card>

            {/* Carte Bénéfices */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bénéfices</CardTitle>
                {parseFloat(metrics.beneficesChange) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.latest.benefices.toLocaleString()} €</div>
                <Badge 
                  variant={parseFloat(metrics.beneficesChange) > 0 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {parseFloat(metrics.beneficesChange) > 0 ? '+' : ''}{metrics.beneficesChange}%
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">vs mois précédent</p>
              </CardContent>
            </Card>

            {/* Carte Commandes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nombre de Commandes</CardTitle>
                {parseFloat(metrics.commandesChange) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.latest.commandes}</div>
                <Badge 
                  variant={parseFloat(metrics.commandesChange) > 0 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {parseFloat(metrics.commandesChange) > 0 ? '+' : ''}{metrics.commandesChange}%
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">vs mois précédent</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Graphiques d'analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique principal des ventes et bénéfices */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des Ventes et Bénéfices</CardTitle>
              <CardDescription>
                Suivi temporel des performances commerciales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ventes" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Ventes"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="benefices" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="Bénéfices"
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                      <Legend />
                      <Bar dataKey="ventes" fill="#8884d8" name="Ventes" />
                      <Bar dataKey="benefices" fill="#82ca9d" name="Bénéfices" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Graphique en secteurs des catégories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" />
                Répartition par Catégories
              </CardTitle>
              <CardDescription>
                Distribution des ventes par type de produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Graphique des commandes */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Commandes</CardTitle>
              <CardDescription>
                Nombre de commandes par mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="commandes" fill="#ffc658" name="Commandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé et recommandations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résumé des Performances</CardTitle>
            <CardDescription>
              Analyse automatique de vos tendances commerciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Analyse des tendances */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📈 Tendance Générale
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Vos ventes montrent une croissance positive sur la période analysée. 
                  Le mois de juin présente les meilleures performances avec 25 000€ de chiffre d'affaires.
                </p>
              </div>

              {/* Recommandations */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  💡 Recommandations
                </h4>
                <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                  <li>• Focalisez-vous sur les perruques qui représentent 35% de vos ventes</li>
                  <li>• Développez la catégorie "Produits capillaires" qui a un potentiel de croissance</li>
                  <li>• Maintenez l'effort sur les tissages qui performent bien</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TendancesPage;
