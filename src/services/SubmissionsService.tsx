import ApiService from './ApiService';

export interface Submission {
  id: string;
  userId: string;
  exerciseId: string;
  code: string;
  score: number;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  timeSpentMs: number;
  xpAwarded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionRequest {
  exerciseId: string;
  code: string;
  score: number;
  timeSpentMs: number;
}

class SubmissionsService {
  async create(data: CreateSubmissionRequest): Promise<Submission> {
    try {
      const response = await ApiService['api'].post('/submissions', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error?.message || 
        error?.message || 
        'Erro ao submeter solução'
      );
    }
  }

  async getMyCompletedExercises(): Promise<string[]> {
    try {
      const response = await ApiService['api'].get('/submissions/me/completed');
      return response.data?.exerciseIds || [];
    } catch (error: any) {
      // Se o endpoint não existir, retornar array vazio
      if (error?.response?.status === 404) {
        return [];
      }
      console.warn('Erro ao buscar exercícios concluídos:', error);
      return [];
    }
  }

  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    status?: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  }): Promise<{ items: Submission[]; total: number }> {
    try {
      const response = await ApiService['api'].get('/submissions/my', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error?.message || 
        error?.message || 
        'Erro ao buscar submissões'
      );
    }
  }
}

export default new SubmissionsService();

