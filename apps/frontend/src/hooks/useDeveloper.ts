"use client"

import { useCallback, useState } from "react"
import { api, getApiErrorMessage } from "@/lib/api"

export type DeveloperProfile = {
  id: string
  userId: string
  name: string
  bio: string
  skills: string[]
  resumeUrl: string
}

export type Job = {
  id: string
  companyId: string
  title: string
  description: string
  skills: string[]
  location: string
  salary: string
  status: "OPEN" | "CLOSED"
}

export type Application = {
  id: string
  jobId: string
  developerId: string
  status: "APPLIED" | "SEEN" | "REJECTED"
  createdAt: string
}

export type CreateDeveloperProfileInput = {
  name: string
  bio: string
  skills: string[]
  resumeUrl: string
}

export function useDeveloper() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withRequest = useCallback(async <T>(request: () => Promise<T>): Promise<T> => {
    setIsLoading(true)
    setError(null)
    try {
      return await request()
    } catch (err) {
      const message = getApiErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const getProfile = useCallback(async () => {
    return withRequest(async () => {
      const { data } = await api.get<{ profile: DeveloperProfile }>("/api/developer/profile")
      return data.profile
    })
  }, [withRequest])

  const createProfile = useCallback(async (input: CreateDeveloperProfileInput) => {
    return withRequest(async () => {
      const { data } = await api.post<{ profile: DeveloperProfile }>("/api/developer/profile", input)
      return data.profile
    })
  }, [withRequest])

  const getOpenJobs = useCallback(async () => {
    return withRequest(async () => {
      const { data } = await api.get<{ jobs: Job[] }>("/api/jobs")
      return data.jobs
    })
  }, [withRequest])

  const applyToJob = useCallback(async (jobId: string) => {
    return withRequest(async () => {
      const { data } = await api.post<{ message: string }>(`/api/jobs/${jobId}/apply`)
      return data.message
    })
  }, [withRequest])

  const getApplications = useCallback(async () => {
    return withRequest(async () => {
      const { data } = await api.get<{ applications: Application[] }>("/api/applications")
      return data.applications
    })
  }, [withRequest])

  return {
    isLoading,
    error,
    clearError,
    getProfile,
    createProfile,
    getOpenJobs,
    applyToJob,
    getApplications,
  }
}
