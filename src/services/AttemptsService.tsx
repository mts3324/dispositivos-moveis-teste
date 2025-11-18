import ApiService from './ApiService';

export type ChallengeAttemptStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface ChallengeAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  code: string;
  timeSpentMs: number;
  status: ChallengeAttemptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertAttemptRequest {
  exerciseId: string;
  code?: string;
  timeSpentMs?: number;
  status?: ChallengeAttemptStatus;
}

class AttemptsService {
  async getCurrent(exerciseId: string): Promise<ChallengeAttempt | null> {
    try {
      const response = await ApiService['api'].get(`/attempts/${exerciseId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async saveAttempt(payload: UpsertAttemptRequest): Promise<ChallengeAttempt | null> {
    try {
      const response = await ApiService['api'].post('/attempts', payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error?.message || 
        error?.message || 
        'Erro ao salvar tentativa'
      );
    }
  }

  async deleteAttempt(exerciseId: string): Promise<void> {
    try {
      await ApiService['api'].delete(`/attempts/${exerciseId}`);
    } catch (error: any) {
      // Ignorar erro se não existir
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }
}

export default new AttemptsService();

