export interface SendCodeRequest {
  tg_username: string
}

export interface SendCodeResponse {
  expires_at: string
}

export interface VerifyRequest {
  tg_username: string
  code: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface VerifyResponse extends TokenPair {}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse extends TokenPair {}

export interface AuthError {
  message: string
  status: number
}

export interface SaveTgUserRequest {
  tg_id: number
  tg_username: string
} 