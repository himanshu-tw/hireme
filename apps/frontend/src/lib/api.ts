import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message as string
  }
  return fallback
}
