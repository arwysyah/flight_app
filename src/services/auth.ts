import { AuthCredentials, AuthUser } from '../types/auth';
import { storageService } from './storage.service';

// Simulate API calls - replace with actual backend
const simulateApiCall = <T>(data: T, delay: number = 1000): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate random failures for testing
      if (Math.random() < 0.1) {
        // 10% failure rate
        reject(new Error('Network error'));
      } else {
        resolve(data);
      }
    }, delay);
  });

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    return 'Password must contain both uppercase and lowercase letters';
  }
  return null;
};

export const authService = {
  async signUp(credentials: AuthCredentials): Promise<AuthUser> {
    if (!credentials.name?.trim()) {
      throw new Error('Name is required');
    }

    if (!validateEmail(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordError = validatePassword(credentials.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    // Check if user already exists
    const existingUsers = (await storageService.getItem<AuthUser[]>('users')) || [];
    if (existingUsers.find((user: AuthUser) => user.email === credentials.email)) {
      throw new Error('User with this email already exists');
    }

    const newUser: AuthUser = {
      id: Math.random().toString(36).substring(2, 11),
      email: credentials.email,
      name: credentials.name,
      createdAt: new Date().toISOString(),
    };

    // Save user and update users list
    const updatedUsers = [...existingUsers, newUser];
    await storageService.setItem('users', updatedUsers);
    await storageService.setItem('current_user', newUser);
    await storageService.setItem('auth_token', `token-${newUser.id}`);

    return simulateApiCall(newUser);
  },

  async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    if (!validateEmail(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    const users = (await storageService.getItem<AuthUser[]>('users')) || [];
    const user = users.find((u: AuthUser) => u.email === credentials.email);

    if (!user) {
      throw new Error('No account found with this email');
    }

    // In real app, you'd verify password hash
    // For demo, we'll just check if password meets requirements
    const passwordError = validatePassword(credentials.password);
    if (passwordError) {
      throw new Error('Invalid password');
    }

    await storageService.setItem('current_user', user);
    await storageService.setItem('auth_token', `token-${user.id}`);

    return simulateApiCall(user);
  },

  async signOut(): Promise<void> {
    await storageService.removeItem('current_user');
    await storageService.removeItem('auth_token');
    return simulateApiCall(undefined, 500);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    return storageService.getItem<AuthUser>('current_user');
  },

  async updateProfile(
    userId: string,
    updates: Partial<AuthUser>,
  ): Promise<AuthUser> {
    const users = (await storageService.getItem<AuthUser[]>('users')) || [];
    const userIndex = users.findIndex((u: AuthUser) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;

    await storageService.setItem('users', users);
    await storageService.setItem('current_user', updatedUser);

    return simulateApiCall(updatedUser);
  },
};
