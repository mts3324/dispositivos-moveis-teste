import ApiService from './ApiService';

export interface Language {
  id: string;
  name: string;
  slug: string;
}

class LanguagesService {
  async getAll(): Promise<Language[]> {
    try {
      const response = await ApiService['api'].get('/languages', {
        params: { page: 1, limit: 100 }
      });
      
      if (response.data?.items) {
        return response.data.items;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.warn('Erro ao buscar linguagens:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Language> {
    try {
      const response = await ApiService['api'].get(`/languages/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error?.message || 
        error?.message || 
        'Erro ao buscar linguagem'
      );
    }
  }
}

export default new LanguagesService();

