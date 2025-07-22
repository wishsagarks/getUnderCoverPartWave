import { createUser, authenticateUser, verifyToken } from './database';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export async function signUp(email: string, password: string, username: string): Promise<AuthResult> {
  const user = await createUser(email, password, username);
  const { token } = await authenticateUser(email, password);
  return { user, token };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  return await authenticateUser(email, password);
}

export function getCurrentUser(token: string): User | null {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return {
    id: decoded.userId,
    email: decoded.email,
    username: decoded.username || decoded.email.split('@')[0]
  };
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}