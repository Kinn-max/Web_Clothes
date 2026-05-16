export interface AuthUser {
  userId?: string;      // Firebase UID
  neonId?: number;      // id từ bảng users Neon
  email?: string;
  full_name?: string;
  role?: string;
}