// Service API pour les données de comptabilité
import api from './api';
import { AxiosResponse } from 'axios';

export interface ComptaMonthData {
  id: string;
  month: number;
  year: number;
  updatedAt: string;
  salesTotal: number;
  salesCost: number;
  salesProfit: number;
  salesCount: number;
  achatsTotal: number;
  depensesTotal: number;
  beneficeReel: number;
  totalCredit: number;
  totalDebit: number;
  soldeNet: number;
  achatsCount: number;
  depensesCount: number;
}

export interface ComptaYearlySummary {
  year: number;
  totalSales: number;
  totalProfit: number;
  totalAchats: number;
  totalDepenses: number;
  beneficeReel: number;
  salesCount: number;
  monthlyData: {
    month: number;
    salesProfit: number;
    achats: number;
    depenses: number;
    beneficeReel: number;
  }[];
}

export const comptaApiService = {
  // Récupérer toutes les données de comptabilité
  async getAll(): Promise<ComptaMonthData[]> {
    console.log('📊 Fetching all compta data...');
    const response: AxiosResponse<ComptaMonthData[]> = await api.get('/compta');
    console.log(`✅ Retrieved ${response.data.length} compta entries`);
    return response.data;
  },

  // Récupérer les données par mois et année
  async getByMonthYear(year: number, month: number): Promise<ComptaMonthData> {
    console.log(`📊 Fetching compta for ${month}/${year}...`);
    const response: AxiosResponse<ComptaMonthData> = await api.get(`/compta/monthly/${year}/${month}`);
    return response.data;
  },

  // Récupérer les données par année
  async getByYear(year: number): Promise<ComptaMonthData[]> {
    console.log(`📊 Fetching compta for year ${year}...`);
    const response: AxiosResponse<ComptaMonthData[]> = await api.get(`/compta/yearly/${year}`);
    return response.data;
  },

  // Récupérer le résumé annuel
  async getYearlySummary(year: number): Promise<ComptaYearlySummary> {
    console.log(`📊 Fetching yearly summary for ${year}...`);
    const response: AxiosResponse<ComptaYearlySummary> = await api.get(`/compta/summary/${year}`);
    return response.data;
  },

  // Recalculer un mois
  async calculateMonth(year: number, month: number): Promise<ComptaMonthData> {
    console.log(`📊 Calculating compta for ${month}/${year}...`);
    const response: AxiosResponse<ComptaMonthData> = await api.post(`/compta/calculate/${year}/${month}`);
    return response.data;
  },

  // Recalculer toute l'année
  async recalculateYear(year: number): Promise<{ year: number; months: number; data: ComptaMonthData[] }> {
    console.log(`📊 Recalculating compta for year ${year}...`);
    const response = await api.post(`/compta/recalculate/${year}`);
    return response.data;
  }
};

export default comptaApiService;
