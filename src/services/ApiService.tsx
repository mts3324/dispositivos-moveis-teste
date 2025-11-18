import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Configuração da API
 *
 * Usa `EXPO_PUBLIC_API_BASE_URL` se definido (ex.: http://192.168.1.100:3000/api)
 * Caso contrário, escolhe um valor padrão por plataforma:
 * - Android (emulador): http://10.0.2.2:3000/api
 * - iOS (simulador) / Web: http://localhost:3000/api
 */
const BASE_URL = 'http://10.0.0.127:3000/api'
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.0.127:3000/api'
    : 'http://localhost:3000/api');

// Chaves de armazenamento
const TOKEN_KEY = '@app:access_token';
const REFRESH_TOKEN_KEY = '@app:refresh_token';

/**
 * Serviço de API - Conecta ao backend Node.js
 */
class ApiService {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado - tentar renovar
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            try {
              const newTokens = await this.refreshTokens(refreshToken);
              await this.saveTokens(newTokens.accessToken, newTokens.refreshToken);
              // Retentar a requisição original
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return this.api.request(error.config);
              }
            } catch {
              // Falha ao renovar - fazer logout
              await this.clearTokens();
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * AUTH - Cadastro
   */
  async signup(data: {
    name: string;
    email: string;
    password: string;
    handle: string;
    collegeId?: string;
  }) {
    const response = await this.api.post('/auth/signup', data);
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }


  /**
 * Retornar o token JWT salvo (para uso no AuthContext/biometria)
 */
async getToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
} 

  /**
   * AUTH - Login
   */
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const { user, tokens } = response.data;
    await this.saveTokens(tokens.accessToken, tokens.refreshToken);
    return { user, tokens };
  }

  /**
   * AUTH - Renovar token
   */
  async refreshTokens(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.tokens;
  }

  /**
   * USERS - Perfil atual
   */
  async getMe() {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  /**
   * USERS - Atualizar perfil
   */
  async updateMe(data: {
    name?: string;
    handle?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    const response = await this.api.patch('/users/me', data);
    return response.data;
  }

  /**
   * LEADERBOARDS - Ranking por grupo
   */
  async getLeaderboardByGroup(groupId: string, params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/leaderboards/by-group', { params: { groupId, ...(params || {}) } });
    return response.data;
  }

  /**
   * USERS - Perfil público
   */
  async getPublicProfile(userId: string) {
    const response = await this.api.get(`/users/${userId}/profile`);
    return response.data;
  }

  /**
   * USERS - Perfil completo com estatísticas, desafios e submissões
   */
  async getUserCompleteProfile() {
    const response = await this.api.get('/users/me/profile/complete');
    return response.data;
  }

  /**
   * CHALLENGES - Criar desafio
   */
  async createChallenge(data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    const response = await this.api.post('/exercises', data);
    return response.data;
  }

  /**
   * CHALLENGES - Listar meus desafios
   */
  async getMyChallenges(params?: {
    status?: 'Draft' | 'Published' | 'all';
    page?: number;
    limit?: number;
  }) {
    // Verificar se há token antes de fazer a requisição
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new Error('Não autenticado. Faça login novamente.');
    }
    
    // O backend espera page e limit como query params
    const config = params && Object.keys(params).length > 0 ? { params } : {};
    const response = await this.api.get('/exercises/mine', config);
    return response.data; // { items: [], total: number }
  }

  /**
   * CHALLENGES - Atualizar desafio
   */
  async updateChallenge(challengeId: string, data: {
    title?: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    const response = await this.api.patch(`/exercises/${challengeId}`, data);
    return response.data;
  }

  /**
   * CHALLENGES - Buscar desafio por ID
   */
  async getChallengeById(exerciseId: string) {
    const response = await this.api.get(`/exercises/${exerciseId}`);
    return response.data;
  }

  /**
   * CHALLENGES - Excluir desafio
   */
  async deleteChallenge(challengeId: string) {
    const response = await this.api.delete(`/exercises/${challengeId}`);
    return response.data;
  }

  /**
   * SUBMISSIONS - Listar minhas submissões
   */
  async getMySubmissions(params?: {
    page?: number;
    limit?: number;
    status?: 'Accepted' | 'Rejected' | 'Pending' | 'all';
  }) {
    const response = await this.api.get('/submissions/my', { params });
    return response.data;
  }

  /**
   * COLLEGES - Listar faculdades
   */
  async getColleges() {
    const response = await this.api.get('/colleges');
    return response.data;
  }

  /**
   * CHALLENGES - Listar desafios publicados
   */
  async getChallenges(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    languageId?: string;
    q?: string;
  }) {
    try {
      const response = await this.api.get('/exercises', { params });
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          return { items: response.data, total: response.data.length };
        }
        if (response.data.items || response.data.data) {
          return {
            items: response.data.items || response.data.data || [],
            total: response.data.total || (response.data.items || response.data.data || []).length
          };
        }
      }
      return { items: [], total: 0 };
    } catch (error: any) {
      return { items: [], total: 0 };
    }
  }

  /**
   * SUBMISSIONS - Submeter solução
   */
  async submitChallenge(data: {
    exerciseId: string;
    code: string;
    languageId: string;
  }) {
    const response = await this.api.post('/submissions', data);
    return response.data;
  }

  /**
   * LEADERBOARDS - Rankings
   */
  async getLeaderboards(params?: {
    seasonId?: string;
    collegeId?: string;
    limit?: number;
  }) {
    try {
      const response = await this.api.get('/leaderboards', { params });
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const isNetworkIssue = !error?.response;
      if (Platform.OS === 'web' && (status === 404 || isNetworkIssue)) {
        const mock = [
          { id: 'u1', name: 'Victor Demarque', xpTotal: 10000 },
          { id: 'u2', name: 'João Antônio Souza', xpTotal: 3200 },
          { id: 'u3', name: 'Maria Silva', xpTotal: 1500 },
          { id: 'u4', name: 'Samuel Carlos', xpTotal: 300 },
          { id: 'u5', name: 'Testando Silva', xpTotal: 0 },
          { id: 'u6', name: 'Ana Pereira', xpTotal: 980 },
          { id: 'u7', name: 'Lucas Lima', xpTotal: 750 },
          { id: 'u8', name: 'Beatriz Santos', xpTotal: 640 },
          { id: 'u9', name: 'Rafael Torres', xpTotal: 520 },
          { id: 'u10', name: 'Carla Nunes', xpTotal: 410 },
        ];
        return mock;
      }
      throw error;
    }
  }

  /**
   * LANGUAGES - Linguagens disponíveis
   */
  async getLanguages() {
    const response = await this.api.get('/languages');
    return response.data;
  }

  /**
   * FORUMS - Fóruns públicos e fóruns do usuário
   */
  async getPublicForums(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/forum/foruns', { params });
    return response.data;
  }

  async getMyForums(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/forum/meus', { params });
    return response.data;
  }

  async createForum(data: {
    exerciseCode: string;
    nome: string;
    assunto: string;
    descricao?: string;
    isPublic?: boolean;
  }) {
    const payload: any = {
      exerciseCode: data.exerciseCode,
      nome: data.nome,
      assunto: data.assunto,
      descricao: data.descricao,
    };

    if (typeof data.isPublic === 'boolean') {
      payload.statusPrivacidade = data.isPublic ? 'PUBLICO' : 'PRIVADO';
    }

    const response = await this.api.post('/forum', payload);
    return response.data;
  }

  /**
   * GROUPS - Grupos
   */
  async getGroups() {
    const response = await this.api.get('/groups');
    return response.data;
  }

  /**
   * GROUPS - Meus grupos
   */
  async getMyGroups() {
    const response = await this.api.get('/groups/my');
    return response.data;
  }

  /**
   * GROUPS - Criar grupo
   */
  async createGroup(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) {
    const payload: any = {
      name: data.name,
      description: data.description,
    };
    if (typeof data.isPublic === 'boolean') {
      payload.visibility = data.isPublic ? 'PUBLIC' : 'PRIVATE';
    }
    const response = await this.api.post('/groups', payload);
    return response.data;
  }

  /**
   * GROUPS - Atualizar grupo
   */
  async updateGroup(groupId: string, data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }) {
    const payload: any = {
      name: data.name,
      description: data.description,
    };
    if (typeof data.isPublic === 'boolean') {
      payload.visibility = data.isPublic ? 'PUBLIC' : 'PRIVATE';
    }
    const response = await this.api.patch(`/groups/${groupId}`, payload);
    return response.data;
  }

  /**
   * GROUPS - Detalhes de um grupo
   */
  async getGroup(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}`);
    return response.data;
  }

  /**
   * GROUPS - Membros do grupo
   */
  async getGroupMembers(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}/members`);
    return response.data;
  }

  /**
   * GROUPS - Desafios (exercícios) do grupo
   */
  async getGroupChallenges(groupId: string) {
    const response = await this.api.get(`/groups/${groupId}/exercises`);
    return response.data;
  }

  /**
   * GROUPS - Criar desafio (exercise) no grupo
   * Backend espera POST /exercises com { groupId, baseXp, ... }
   */
  async createGroupChallenge(groupId: string, data: {
    title: string;
    description?: string;
    difficulty?: number;
    codeTemplate?: string;
    isPublic?: boolean;
    languageId?: string;
    xp?: number;
  }) {
    const payload: any = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      codeTemplate: data.codeTemplate,
      languageId: data.languageId,
      baseXp: data.xp, // mapear xp -> baseXp
      groupId: groupId,
    };
    const response = await this.api.post(`/exercises`, payload);
    return response.data;
  }

  /**
   * GROUPS - Entrar/Sair do grupo
   */
  async joinGroup(groupId: string) {
    const response = await this.api.post(`/groups/${groupId}/join`);
    return response.data;
  }

  async leaveGroup(groupId: string) {
    const response = await this.api.post(`/groups/${groupId}/leave`);
    return response.data;
  }

  async generateGroupInviteLink(groupId: string) {
    const response = await this.api.post(`/groups/${groupId}/invite-link`);
    return response.data;
  }

  async joinGroupByToken(groupId: string, token: string) {
    const response = await this.api.post(`/groups/${groupId}/join-by-token`, { token });
    return response.data;
  }

  /**
   * STATS - Estatísticas
   */
  async getStats() {
    const response = await this.api.get('/stats');
    return response.data;
  }

  /**
   * STATS - Estatísticas do dashboard
   * Retorna: { languages, challenges, forumsCreated, totalXp, level, weekProgress }
   */
  async getDashboardStats(userId: string) {
    try {
      const response = await this.api.get(`/stats/users/${userId}`);
      return {
        languages: response.data.languagesUsed || 0,
        challenges: response.data.publishedChallenges || 0,
        forumsCreated: response.data.forumsCreated || 0,
        totalXp: response.data.totalXp || 0,
        level: response.data.level || 1,
        weekProgress: response.data.weekProgress || 0,
      };
    } catch (error) {
      // Retornar valores padrão em caso de erro
      return {
        languages: 0,
        challenges: 0,
        forumsCreated: 0,
        totalXp: 0,
        level: 1,
        weekProgress: 0,
      };
    }
  }

  /**
   * SUBMISSIONS - Listar IDs de exercícios concluídos pelo usuário
   */
  async getMyCompletedExercises(): Promise<string[]> {
    try {
      const response = await this.api.get('/submissions/me/completed');
      // Backend retorna { exerciseIds: string[] }
      return response.data?.exerciseIds || [];
    } catch (error) {
      // Se o endpoint não existir, retornar array vazio
      return [];
    }
  }

  /**
   * Utilitários - Salvar tokens
   */
  private async saveTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Utilitários - Limpar tokens (logout)
   */
  async clearTokens() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Utilitários - Verificar se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  /**
   * Utilitários - Obter a base URL da API
   */
  getBaseUrl(): string {
    return BASE_URL.replace('/api', ''); // Remove /api para obter apenas a base
  }

  /**
   * Utilitários - Tratamento de erros
   */
  handleError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Erro da API
        const message = error.response.data?.message || error.response.data?.error;
        return message || 'Erro ao comunicar com o servidor';
      } else if (error.request) {
        // Sem resposta do servidor
        return 'Não foi possível conectar ao servidor. Verifique sua conexão e se o servidor está rodando em ' + BASE_URL;
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        return 'Tempo de conexão esgotado. Verifique sua conexão.';
      }
    }
    
    // Erro de rede ou outros
    if (error.message?.includes('Network Error') || error.message?.includes('network')) {
      return 'Erro de rede. Verifique sua conexão com a internet.';
    }
    
    return error.message || 'Erro desconhecido';
  }
}

export default new ApiService();

