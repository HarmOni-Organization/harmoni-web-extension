export interface User {
  id: string;
  username: string;
  email?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface VerifyTokenResponse {
  user: User;
  isValid: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}
