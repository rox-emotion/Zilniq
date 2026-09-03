const BASE_URL = 'https://payload-cms-production-c64b.up.railway.app';

type ApiOptions = RequestInit & {
  token: string;
};

export class ApiError extends Error {
  status: number;
  body: string;
  path: string;

  constructor(status: number, body: string, path: string) {
    super(`HTTP ${status} on ${path}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.path = path;
  }
}

export async function apiFetch<T>(
  path: string,
  { token, ...init }: ApiOptions,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new ApiError(response.status, errorBody, path);
  }

  return response.json();
}
