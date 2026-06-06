"use client"

import { useCallback, useState } from "react"
import { api, getApiErrorMessage } from "@/lib/api"

export type CompanyProfile = {
  id: string
  userId: string
  name: string
  website: string
  description: string
  location: string
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

export type CreateCompanyProfileInput = {
  name: string
  description: string
  websiteUrl: string
  location: string
}

export type CreateJobInput = {
  title: string
  description: string
  skills: string[]
  location: string
  salary: string
  status: "OPEN" | "CLOSED"
}

export type UpdateJobInput = CreateJobInput

export type UpdateJobStatusInput = {
  status: "OPEN" | "CLOSED"
}

export function useCompany() {
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
      const { data } = await api.get<{ profile: CompanyProfile }>("/api/company/profile")
      return data.profile
    })
  }, [withRequest])

  const createProfile = useCallback(async (input: CreateCompanyProfileInput) => {
    return withRequest(async () => {
      const { data } = await api.post<{ profile: CompanyProfile }>("/api/company/profile", input)
      return data.profile
    })
  }, [withRequest])

  const getJobs = useCallback(async () => {
    return withRequest(async () => {
      const { data } = await api.get<{ jobs: Job[] }>("/api/company/jobs")
      return data.jobs
    })
  }, [withRequest])

  const createJob = useCallback(async (input: CreateJobInput) => {
    return withRequest(async () => {
      const { data } = await api.post<{ job: Job }>("/api/company/jobs", input)
      return data.job
    })
  }, [withRequest])

  const updateJob = useCallback(async (jobId: string, input: UpdateJobInput) => {
    return withRequest(async () => {
      const { data } = await api.put<{ job: Job }>(`/api/company/jobs/${jobId}`, input)
      return data.job
    })
  }, [withRequest])

  const updateJobStatus = useCallback(async (jobId: string, input: UpdateJobStatusInput) => {
    return withRequest(async () => {
      const { data } = await api.patch<{ job: Job }>(`/api/company/job/${jobId}/status`, input)
      return data.job
    })
  }, [withRequest])

  return {
    isLoading,
    error,
    clearError,
    getProfile,
    createProfile,
    getJobs,
    createJob,
    updateJob,
    updateJobStatus,
  }
}
