import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const db = Platform.OS !== "web" ? SQLite.openDatabaseSync("appdb.db") : null;

/**
 * Serviço de Banco de Dados
 * Responsável por criar tabelas e fornecer acesso ao banco
 */
class DatabaseService {
  /**
   * Inicializa o banco de dados e cria as tabelas
   */
  static async initDatabase() {
    if (Platform.OS === "web") {
      return;
    }

    try {
      // Cria tabela de usuários (SEM SENHA - usa backend para auth)
      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          handle TEXT,
          college TEXT,
          level INTEGER DEFAULT 1,
          xpTotal INTEGER DEFAULT 0,
          avatarUrl TEXT,
          bio TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          difficulty INTEGER DEFAULT 1,
          baseXp INTEGER DEFAULT 100,
          isPublic INTEGER DEFAULT 1,
          codeTemplate TEXT,
          status TEXT DEFAULT 'Draft',
          progress INTEGER DEFAULT 0,
          userId TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Retorna a instância do banco de dados
   */
  static getDatabase() {
    if (Platform.OS === "web") return null;
    return db;
  }

  /**
   * Limpa todas as tabelas (útil para desenvolvimento)
   */
  static async clearDatabase() {
    if (Platform.OS === "web") return;

    try {
      await db!.execAsync("DROP TABLE IF EXISTS users;");
      await db!.execAsync("DROP TABLE IF EXISTS challenges;");
      await this.initDatabase();
    } catch (error) {}
  }

  /**
   * Lista todos os registros de uma tabela (debug)
   */
  static async debugTable(tableName: string) {
    if (Platform.OS === "web") {
      return;
    }

    try {
      const result = await db!.getAllAsync(`SELECT * FROM ${tableName}`);
      return result;
    } catch (error) {}
  }
}

export default DatabaseService;
