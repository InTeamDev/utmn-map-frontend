import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyRequest,
  VerifyResponse,
  RefreshRequest,
  RefreshResponse,
  SaveTgUserRequest,
  AuthError
} from './interfaces/auth'

declare const process: {
  env: {
    REACT_APP_AUTH_API: string
  }
}

const API_BASE_URL = process.env.REACT_APP_AUTH_API || 'https://utmn-map.zetoqqq.ru/authapi'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: AuthError = {
      message: `HTTP error! status: ${response.status}`,
      status: response.status
    }
    throw error
  }
  return response.json() as Promise<T>
}

export const authApi = {
  async sendCode(request: SendCodeRequest): Promise<SendCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/send_code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse<SendCodeResponse>(response)
  },

  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse<VerifyResponse>(response)
  },

  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse<RefreshResponse>(response)
  },

  async saveTgUser(request: SaveTgUserRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/save_tg_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa('admin:admin')}`, // Replace with actual admin credentials
      },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error: AuthError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!response.ok) {
      const error: AuthError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },
} 