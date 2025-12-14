import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginCredentials, SignupData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'transport_facility_users';
  private readonly CURRENT_USER_KEY = 'transport_facility_current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsersToStorage(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  private getCurrentUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  }

  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.currentUserSubject.next(user);
  }

  signup(signupData: SignupData): { success: boolean; message: string } {
    const users = this.getUsersFromStorage();

    // Check if employee ID already exists
    if (users.some(u => u.employeeId === signupData.employeeId)) {
      return { success: false, message: 'Employee ID already registered' };
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === signupData.email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }

    // Validate password match
    if (signupData.password !== signupData.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      employeeId: signupData.employeeId,
      email: signupData.email.toLowerCase(),
      password: signupData.password, // In production, this should be hashed
      createdAt: new Date()
    };

    users.push(newUser);
    this.saveUsersToStorage(users);

    // Auto-login after signup
    this.setCurrentUser(newUser);

    return { success: true, message: 'Account created successfully!' };
  }

  login(credentials: LoginCredentials): { success: boolean; message: string } {
    const users = this.getUsersFromStorage();
    const identifier = credentials.identifier.toLowerCase().trim();

    // Find user by employee ID or email
    const user = users.find(u => 
      u.employeeId.toLowerCase() === identifier || 
      u.email.toLowerCase() === identifier
    );

    if (!user) {
      return { success: false, message: 'Invalid employee ID/email or password' };
    }

    // In production, compare hashed passwords
    if (user.password !== credentials.password) {
      return { success: false, message: 'Invalid employee ID/email or password' };
    }

    this.setCurrentUser(user);
    return { success: true, message: 'Login successful!' };
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

