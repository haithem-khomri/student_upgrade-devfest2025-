/**
 * Authentication utility functions
 */

export function isDemoToken(token: string | null): boolean {
  if (!token) return false;
  return token.startsWith('demo-token-') || token.startsWith('mock-jwt-token-');
}

export function isValidJWT(token: string | null): boolean {
  if (!token) return false;
  if (isDemoToken(token)) return false;
  
  // Basic JWT format check (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3;
}

