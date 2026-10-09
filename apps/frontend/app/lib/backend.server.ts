export interface BackendResponse<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  data: T | null;
  text: string | null;
}

function getBackendBaseUrl() {
  return process.env.BACKEND_API_URL ?? 'http://localhost:3000';
}

function toBackendUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl().replace(/\/$/, '')}${normalizedPath}`;
}

export async function callBackend<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<BackendResponse<T>> {
  const response = await fetch(toBackendUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  let data: T | null = null;
  let text: string | null = null;

  if (contentType.includes('application/json')) {
    data = (await response.json()) as T;
  } else {
    text = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
    text,
  };
}
