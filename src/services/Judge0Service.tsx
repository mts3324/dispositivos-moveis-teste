import ApiService from './ApiService';

export interface ExecuteCodeRequest {
  sourceCode: string;
  languageId: number;
}

export interface ExecuteCodeResponse {
  sucesso: boolean;
  resultado: string;
}

class Judge0Service {
  async executeCode(sourceCode: string, languageId: number): Promise<ExecuteCodeResponse> {
    try {
      const response = await ApiService['api'].post('/execute', {
        sourceCode,
        languageId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error?.message || 
        error?.message || 
        'Erro ao executar código'
      );
    }
  }
}

export default new Judge0Service();

