export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}
