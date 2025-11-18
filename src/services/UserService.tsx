import { Platform } from "react-native";
import DatabaseService from "./DatabaseService";
import { User } from "../models/UserModel";

/**
 * Serviço de Usuários - Cache Local (SQLite)
 * 
 * IMPORTANTE: Este serviço NÃO faz autenticação!
 * Autenticação é feita via ApiService (backend)
 * SQLite apenas armazena dados do usuário logado (cache)
 * 
 * Funciona apenas em MOBILE (não funciona no web)
 */
class UserService {
  /**
   * Salva/atualiza dados do usuário no cache local (após login via backend)
   */
  static async syncUserFromBackend(userData: any): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const db = DatabaseService.getDatabase();
      if (!db) {
        console.warn("Database não disponível para sync");
        return;
      }

      if (!userData || !userData.id) {
        console.warn("Dados de usuário inválidos para sync");
        return;
      }

      const existing = await db.getFirstAsync(
        "SELECT * FROM users WHERE id = ?",
        [userData.id]
      );

      if (existing) {
        await db.runAsync(
          `UPDATE users SET 
            name = ?, 
            email = ?, 
            handle = ?,
            college = ?, 
            level = ?,
            xpTotal = ?,
            avatarUrl = ?,
            bio = ?,
            synced_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            userData.name || '',
            userData.email || '',
            userData.handle || null,
            userData.collegeId || null,
            userData.level || 1,
            userData.xpTotal || 0,
            userData.avatarUrl || null,
            userData.bio || null,
            userData.id
          ]
        );
      } else {
        await db.runAsync(
          `INSERT INTO users (id, name, email, handle, college, level, xpTotal, avatarUrl, bio) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.id,
            userData.name || '',
            userData.email || '',
            userData.handle || null,
            userData.collegeId || null,
            userData.level || 1,
            userData.xpTotal || 0,
            userData.avatarUrl || null,
            userData.bio || null
          ]
        );
      }
    } catch (error: any) {
      // Log do erro mas não interrompe o fluxo
      console.error("Erro ao sincronizar usuário com banco local:", error);
      // Não re-throw para não quebrar o fluxo de autenticação
    }
  }

  /**
   * Busca dados do usuário no cache local
   */
  static async getUserById(id: string | number): Promise<User | null> {
    if (Platform.OS === 'web') return null;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return null;

      const user = await db.getFirstAsync<User>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      return user || null;
    } catch (error) {
      
      return null;
    }
  }

  /**
   * Limpa o cache do usuário (usado no logout)
   */
  static async clearUserCache(userId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM users WHERE id = ?", [userId]);
      
    } catch (error) {
      
    }
  }

  /**
   * Limpa todo o cache local
   */
  static async clearAllCache(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM users");
      
    } catch (error) {
      
    }
  }
}

export default UserService;
