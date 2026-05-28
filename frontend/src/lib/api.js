const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'taskmanager_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const request = async (path, { method = 'GET', body, auth = true } = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload?.message || 'Request failed'
    throw new Error(message)
  }

  return payload
}

export const api = {
  register: (data) => request('/api/user/register', { method: 'POST', body: data, auth: false }),
  login: (data) => request('/api/user/login', { method: 'POST', body: data, auth: false }),
  getCurrentUser: () => request('/api/user/me'),
  updateProfile: (data) => request('/api/user/update', { method: 'PUT', body: data }),
  changePassword: (data) => request('/api/user/update-password', { method: 'PUT', body: data }),
  getTasks: () => request('/api/task/gp'),
  createTask: (data) => request('/api/task/gp', { method: 'POST', body: data }),
  updateTask: (id, data) => request(`/api/task/${id}/gp`, { method: 'PUT', body: data }),
  deleteTask: (id) => request(`/api/task/${id}/gp`, { method: 'DELETE' }),
  searchTasks: (term) => request(`/api/task/search?name=${encodeURIComponent(term)}`),
}
