/**
 * User Model
 * 
 * IMPORTANTE: NÃO contém senha!
 * Senha é gerenciada apenas pelo backend
 */
export interface User {
  id?: string | number;
  name?: string;
  email: string;
  handle?: string;
  collegeId?: string;
  college?: string;
  level?: number;
  xpTotal?: number;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
  created_at?: string;
  synced_at?: string;
}
