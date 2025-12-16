// ============================================
// UTILITY: Create Default Company Admin
// ============================================

import * as SecureStore from 'expo-secure-store';
import { AuthService } from '@/services/auth.service';

const STORAGE_KEYS = {
  USERS: 'garage_square_users',
};

/**
 * Get all registered users (for debugging/testing)
 */
export async function getAllUsers() {
  try {
    const usersJson = await SecureStore.getItemAsync(STORAGE_KEYS.USERS);
    if (!usersJson) {
      return [];
    }
    
    const users: Array<{ email: string; password: string; userData: any }> = JSON.parse(usersJson);
    return users.map(u => ({
      email: u.email,
      password: u.password,
      role: u.userData?.profile?.role?.name || 'pending',
      fullName: u.userData?.profile?.full_name || 'N/A',
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

/**
 * Create a default company admin user
 * Email: varun2@gmail.com
 * Password: 123456
 */
export async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const users = await getAllUsers();
    const adminExists = users.some(u => u.email.toLowerCase() === 'varun2@gmail.com');
    
    if (adminExists) {
      console.log('Company Admin (varun2@gmail.com) already exists!');
      return { success: false, message: 'Company Admin already exists' };
    }

    // Create default admin
    const result = await AuthService.signUp({
      email: 'varun2@gmail.com',
      password: '123456',
      full_name: 'Company Admin',
      phone: '+1234567890',
      role_id: 'company_admin_role_id',
    });

    console.log('Default Company Admin created successfully!');
    console.log('Email: varun2@gmail.com');
    console.log('Password: 123456');
    
    return { success: true, message: 'Default admin created', user: result };
  } catch (error: any) {
    console.error('Error creating default admin:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Print all users to console (for debugging)
 */
export async function printAllUsers() {
  const users = await getAllUsers();
  console.log('\n=== REGISTERED USERS ===');
  if (users.length === 0) {
    console.log('No users found. Please sign up first.');
  } else {
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Name: ${user.fullName}`);
      console.log(`  Role: ${user.role}`);
    });
  }
  console.log('\n========================\n');
}

