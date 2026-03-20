import api from '../../service/api';

export interface AppSettings {
  modules?: Record<string, boolean>;
  [key: string]: any;
}

const settingsApi = {
  async getSettings(): Promise<AppSettings> {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch {
      return {};
    }
  },

  async updateSettings(data: Partial<AppSettings>): Promise<{ success: boolean }> {
    const response = await api.put('/api/settings', data);
    return response.data;
  },

  async getAllUsers(): Promise<any[]> {
    const response = await api.get('/api/auth/users');
    return response.data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ success: boolean }> {
    const response = await api.put(`/api/auth/users/${userId}/role`, { role });
    return response.data;
  },

  async updateUserSpecification(userId: string, specification: string): Promise<{ success: boolean }> {
    const response = await api.put(`/api/auth/users/${userId}/specification`, { specification });
    return response.data;
  },

  async deleteAllData(password: string): Promise<{ success: boolean }> {
    const response = await api.post('/api/settings/delete-all', { password });
    return response.data;
  },

  async backupData(code: string): Promise<Blob> {
    const response = await api.post('/api/settings/backup', { code }, { responseType: 'blob' });
    return response.data;
  },

  async restoreData(file: File, code: string): Promise<{ success: boolean }> {
    const formData = new FormData();
    formData.append('backup', file);
    formData.append('code', code);
    const response = await api.post('/api/settings/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default settingsApi;
