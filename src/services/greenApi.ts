import type {
  CheckAccountResponse,
  Credentials,
  NotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from '../types/chat';

const DEFAULT_API_URL = 'https://api.green-api.com/v3';

function getApiUrl(): string {
  const configuredUrl = import.meta.env.VITE_GREEN_API_URL?.trim();
  return (configuredUrl || DEFAULT_API_URL).replace(/\/$/, '');
}

function endpoint(credentials: Credentials, method: string): string {
  const { idInstance, apiTokenInstance } = credentials;
  return `${getApiUrl()}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  const apiError =
    typeof payload === 'object' &&
    payload !== null &&
    'status' in payload &&
    (payload as { status?: unknown }).status === 'error';

  if (!response.ok || apiError) {
    const details = typeof payload === 'string' ? payload : JSON.stringify(payload);
    throw new Error(`GREEN-API: ${response.status}${details ? ` — ${details}` : ''}`);
  }

  return payload as T;
}

export async function getStateInstance(
  credentials: Credentials,
): Promise<StateInstanceResponse> {
  const response = await fetch(endpoint(credentials, 'getStateInstance'));
  return parseResponse<StateInstanceResponse>(response);
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: string,
): Promise<CheckAccountResponse> {
  const response = await fetch(endpoint(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  });

  return parseResponse<CheckAccountResponse>(response);
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await fetch(endpoint(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  });

  return parseResponse<SendMessageResponse>(response);
}

export async function receiveNotification(
  credentials: Credentials,
  signal: AbortSignal,
  receiveTimeout = 30,
): Promise<NotificationResponse | null> {
  const url = `${endpoint(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`;
  const response = await fetch(url, { signal });

  if (response.status === 204 || response.status === 200) {
    const text = await response.text();
    if (!text.trim()) {
      return null;
    }

    const payload = JSON.parse(text) as NotificationResponse;

    if (!payload || typeof payload.receiptId !== 'number' || !payload.body) {
      throw new Error('GREEN-API вернул некорректное уведомление.');
    }

    return payload;
  }

  return parseResponse<NotificationResponse>(response);
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    `${endpoint(credentials, 'deleteNotification')}/${receiptId}`,
    { method: 'DELETE' },
  );

  await parseResponse(response);
}
