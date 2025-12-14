export interface User {
  id: string;
  employeeId: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface LoginCredentials {
  identifier: string; // employeeId or email
  password: string;
}

export interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

