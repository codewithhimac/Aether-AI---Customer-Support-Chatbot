// services/apiClient.ts

import { Role } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function sendMessage(
  message: string,
  history: { role: Role; content: string }[]
): Promise<{ reply: string }> {

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,   // ← THIS sends hiistory to the backend
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}
