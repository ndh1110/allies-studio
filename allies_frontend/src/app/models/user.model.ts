export interface User {
  id: number;
  tenDn: string;
  email: string;
  avatar?: string;
  avarta?: string; // Backend uses 'avarta'
  online?: boolean;
  lastSeen?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type?: string;
  id: number;
  username: string;
}
