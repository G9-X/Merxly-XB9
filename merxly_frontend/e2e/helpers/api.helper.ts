import { API_BASE_URL } from './test-data';

export class ApiHelper {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: this.headers });
    const body = await res.json();
    if (!body.isSuccess) throw new Error(`GET ${path} failed: ${body.message}`);
    return body.data;
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    const body = await res.json();
    if (!body.isSuccess) throw new Error(`POST ${path} failed: ${body.message}`);
    return body.data;
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    const body = await res.json();
    if (!body.isSuccess) throw new Error(`PUT ${path} failed: ${body.message}`);
    return body.data;
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    const body = await res.json();
    if (!body.isSuccess) throw new Error(`DELETE ${path} failed: ${body.message}`);
  }
}
