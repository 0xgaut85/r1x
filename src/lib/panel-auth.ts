/**
 * Panel Access Control Utilities
 * 
 * Simple role-based access control for user and platform panels
 */

export type UserRole = 'user' | 'admin';

/**
 * Check if a user address has admin access
 * In production, this would check against a database or auth service
 */
export function isAdminAddress(address: string): boolean {
  if (!address) return false;
  
  // For now, check against environment variable
  // In production, this should be a database check or use a proper auth service
  const adminAddresses = (process.env.ADMIN_ADDRESSES || '')
    .split(',')
    .map(addr => addr.toLowerCase().trim())
    .filter(Boolean);
  
  return adminAddresses.includes(address.toLowerCase());
}

/**
 * Check if user can access user panel
 * Any authenticated user can access their own panel
 */
export function canAccessUserPanel(userAddress: string, requestedAddress?: string): boolean {
  if (!userAddress) return false;
  
  // Users can only access their own panel
  if (requestedAddress) {
    return userAddress.toLowerCase() === requestedAddress.toLowerCase();
  }
  
  return true;
}

/**
 * Check if user can access platform panel
 * Only admins can access platform panel
 */
export function canAccessPlatformPanel(userAddress: string): boolean {
  return isAdminAddress(userAddress);
}

/**
 * Get user role from address
 */
export function getUserRole(address: string): UserRole {
  return isAdminAddress(address) ? 'admin' : 'user';
}

