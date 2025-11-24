export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface UserWithPassword extends User {
  passwordHash: string
}

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
