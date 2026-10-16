const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    csrfToken,
    parseJson = true,
  } = options;

  const requestHeaders = { ...headers };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] ??= 'application/json';
  }

  if (csrfToken) {
    requestHeaders['X-CSRFToken'] = csrfToken;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      credentials: 'include',
      headers: requestHeaders,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the LibroHub API at ${API_BASE_URL}. Check that Flask is running, the API URL is correct, and CORS allows this frontend origin.`);
    }
    throw error;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed.');
  }

  return parseJson ? payload : text;
}

export { API_BASE_URL };
