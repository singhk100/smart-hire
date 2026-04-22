export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
}
