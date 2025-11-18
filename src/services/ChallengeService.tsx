import { Platform } from "react-native";
import DatabaseService from "./DatabaseService";

interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty: number;
  baseXp: number; // Padronizado para baseXp (backend usa baseXp)
  isPublic: boolean;
  codeTemplate?: string;
  status?: string;
  progress?: number;
  userId?: string;
}

class ChallengeService {
  static async syncChallengeFromBackend(challengeData: any): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;

      const existing = await db.getFirstAsync(
        "SELECT * FROM challenges WHERE id = ?",
        [challengeData.id]
      );

      // Usar baseXp do backend, com fallback para xp (compatibilidade)
      const baseXp = challengeData.baseXp || challengeData.xp || 100;
      
      if (existing) {
        await db.runAsync(
          `UPDATE challenges SET 
            title = ?, 
            description = ?,
            difficulty = ?,
            baseXp = ?,
            isPublic = ?,
            codeTemplate = ?,
            status = ?,
            progress = ?,
            userId = ?,
            synced_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [
            challengeData.title,
            challengeData.description || null,
            challengeData.difficulty || 1,
            baseXp,
            challengeData.isPublic ? 1 : 0,
            challengeData.codeTemplate || null,
            challengeData.status || 'Draft',
            challengeData.progress || 0,
            challengeData.userId || null,
            challengeData.id
          ]
        );
      } else {
        await db.runAsync(
          `INSERT INTO challenges (id, title, description, difficulty, baseXp, isPublic, codeTemplate, status, progress, userId) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            challengeData.id,
            challengeData.title,
            challengeData.description || null,
            challengeData.difficulty || 1,
            baseXp,
            challengeData.isPublic ? 1 : 0,
            challengeData.codeTemplate || null,
            challengeData.status || 'Draft',
            challengeData.progress || 0,
            challengeData.userId || null
          ]
        );
      }
    } catch (error: any) {
      throw error;
    }
  }

  static async getChallengesByUserId(userId: string): Promise<Challenge[]> {
    if (Platform.OS === 'web') return [];

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return [];

      const challenges = await db.getAllAsync<Challenge>(
        "SELECT * FROM challenges WHERE userId = ? ORDER BY synced_at DESC",
        [userId]
      );

      return challenges.map(ch => ({
        ...ch,
        isPublic: !!ch.isPublic,
      }));
    } catch (error) {
      return [];
    }
  }

  static async getChallengeById(id: string): Promise<Challenge | null> {
    if (Platform.OS === 'web') return null;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return null;

      const challenge = await db.getFirstAsync<Challenge>(
        "SELECT * FROM challenges WHERE id = ?",
        [id]
      );

      if (!challenge) return null;

      return {
        ...challenge,
        isPublic: !!challenge.isPublic,
      };
    } catch (error) {
      return null;
    }
  }

  static async deleteChallenge(challengeId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM challenges WHERE id = ?", [challengeId]);
    } catch (error) {
    }
  }

  static async clearUserChallenges(userId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const db = DatabaseService.getDatabase();
      if (!db) return;
      
      await db.runAsync("DELETE FROM challenges WHERE userId = ?", [userId]);
    } catch (error) {
    }
  }
}

export default ChallengeService;

