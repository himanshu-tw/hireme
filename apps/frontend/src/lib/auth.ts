import { api } from "@/lib/api"

export type Session = {
  id: string
  role: "COMPANY" | "DEVELOPER"
}

export async function getSession(): Promise<Session> {
  const { data } = await api.get<Session>("/api/auth/me")
  return data
}

export async function logout() {
  await api.post("/api/auth/logout")
}

export async function requireAuth(): Promise<Session> {
  return getSession()
}
