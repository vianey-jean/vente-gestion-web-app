import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import SalesReport from '../components/dashboard/reports/SalesReport';
import ProfitEvolution from '../components/dashboard/reports/ProfitEvolution';
import AISalesPredictor from '../components/dashboard/ai/AISalesPredictor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Tendances: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="responsive-container space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="responsive-h1">{t('trends.title')}</h1>
        </div>

        <Tabs defaultValue="reports" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-1 xs:grid-cols-3 gap-1.5 sm:gap-2 h-auto p-1.5 sm:p-2">
            <TabsTrigger value="reports" className="text-xs sm:text-sm py-2.5 sm:py-3">
              <span className="hidden xs:inline">{t('trends.tab.reports')}</span>
              <span className="xs:hidden">{t('common.report')}</span>
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs sm:text-sm py-2.5 sm:py-3">
              <span className="hidden xs:inline">{t('trends.tab.profit')}</span>
              <span className="xs:hidden">{t('common.total')}</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs sm:text-sm py-2.5 sm:py-3">
              <span className="hidden xs:inline">{t('trends.tab.predictions')}</span>
              <span className="xs:hidden">IA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <SalesReport />
          </TabsContent>

          <TabsContent value="profit" className="space-y-4 sm:space-y-6">
            <ProfitEvolution />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4 sm:space-y-6">
            <AISalesPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Tendances;
