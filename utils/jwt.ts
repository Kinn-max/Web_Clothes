/**
 * Utility functions for JWT token handling
 */

export interface JWTPayload {
    userId: number;
    email: string;
    full_name: string;
    phone: string;
    address: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Decode JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded) as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) {
        return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
}

/**
 * Check if user has admin role
 * @param token - JWT token string
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) {
        return false;
    }

    return payload.role?.toLowerCase() === 'admin';
}
