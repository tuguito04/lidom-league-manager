const BASE_URL = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  return res.json();
}

// ── Teams ─────────────────────────────────────
export const teamsApi = {
  getAll: () => request<{ data: import('./types').Team[] }>('/teams'),
  getById: (id: number) => request<{ data: import('./types').Team }>(`/teams/${id}`),
  create: (body: import('./types').TeamForm) => request('/teams', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: import('./types').TeamForm) => request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request(`/teams/${id}`, { method: 'DELETE' }),
};

// ── Players ───────────────────────────────────
export const playersApi = {
  getAll: (team_id?: number) => request<{ data: import('./types').Player[] }>(`/players${team_id ? `?team_id=${team_id}` : ''}`),
  getById: (id: number) => request<{ data: import('./types').Player }>(`/players/${id}`),
  create: (body: any) => request('/players', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request(`/players/${id}`, { method: 'DELETE' }),
};

// ── Games ─────────────────────────────────────
export const gamesApi = {
  getAll: (filters?: { status?: string; team_id?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.team_id) params.append('team_id', String(filters.team_id));
    const query = params.toString();
    return request<{ data: import('./types').Game[] }>(`/games${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => request<{ data: import('./types').Game }>(`/games/${id}`),
  create: (body: import('./types').GameForm) => request('/games', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: string) => request(`/games/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateScore: (id: number, home_score: number, away_score: number) => request(`/games/${id}/score`, { method: 'PUT', body: JSON.stringify({ home_score, away_score }) }),
  delete: (id: number) => request(`/games/${id}`, { method: 'DELETE' }),
};

// ── Standings ─────────────────────────────────
export const standingsApi = {
  getAll: () => request<{ data: import('./types').Standing[] }>('/standings'),
};