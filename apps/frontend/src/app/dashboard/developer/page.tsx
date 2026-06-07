"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Briefcase } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  useDeveloper,
  type Application,
  type DeveloperProfile,
  type Job,
} from "@/hooks/useDeveloper"
import { getApiErrorMessage } from "@/lib/api"
import { getSession } from "@/lib/auth"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusStyles: Record<Application["status"], string> = {
  APPLIED: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  SEEN: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  REJECTED: "bg-destructive/10 text-destructive",
}

export default function DeveloperDashboardPage() {
  const router = useRouter()
  const { getProfile, getApplications, getOpenJobs, applyToJob } = useDeveloper()

  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [openJobs, setOpenJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)

  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications]
  )

  const jobsById = useMemo(
    () => Object.fromEntries(openJobs.map((job) => [job.id, job])),
    [openJobs]
  )

  useEffect(() => {
    async function loadDashboard() {
      try {
        await getSession()
      } catch {
        router.replace("/sign-in")
        return
      }
      setIsLoading(true)
      setError(null)

      try {
        const [profileData, applicationsData, jobsData] = await Promise.allSettled([
          getProfile(),
          getApplications(),
          getOpenJobs(),
        ])

        if (profileData.status === "fulfilled") {
          setProfile(profileData.value)
          setNeedsProfile(false)
        } else if (
          axios.isAxiosError(profileData.reason) &&
          profileData.reason.response?.status === 404
        ) {
          setNeedsProfile(true)
        } else if (profileData.status === "rejected") {
          throw profileData.reason
        }

        if (applicationsData.status === "fulfilled") {
          setApplications(applicationsData.value)
        } else if (
          !(
            axios.isAxiosError(applicationsData.reason) &&
            applicationsData.reason.response?.status === 404
          )
        ) {
          throw applicationsData.reason
        }

        if (jobsData.status === "fulfilled") {
          setOpenJobs(jobsData.value)
        }
      } catch {
        setError("Failed to load dashboard. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [getProfile, getApplications, getOpenJobs, router])

  const handleApply = async (jobId: string) => {
    setApplyError(null)
    setApplyingJobId(jobId)

    try {
      await applyToJob(jobId)
      const updatedApplications = await getApplications()
      setApplications(updatedApplications)
    } catch (err) {
      setApplyError(getApiErrorMessage(err, "Could not apply to this job."))
    } finally {
      setApplyingJobId(null)
    }
  }

  const avatarLabel = profile?.name ?? "Developer"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 md:p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Developer Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Browse open jobs and track your applications
          </p>
        </div>

        <Link
          href="/dashboard/developer/profile"
          className="rounded-full transition-opacity hover:opacity-80"
          aria-label="View profile"
        >
          <Avatar className="size-10 cursor-pointer">
            <AvatarFallback>{getInitials(avatarLabel)}</AvatarFallback>
          </Avatar>
        </Link>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isLoading && needsProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              Set up your developer profile before browsing jobs and applying.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/developer/profile">Create profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !needsProfile && (
        <>
          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">Open Jobs</h2>
              <p className="text-xs text-muted-foreground">
                Apply to roles that match your skills
              </p>
            </div>

            {applyError && (
              <p className="text-xs text-destructive">{applyError}</p>
            )}

            {openJobs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No open jobs right now.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {openJobs.map((job) => {
                  const hasApplied = appliedJobIds.has(job.id)
                  const isApplying = applyingJobId === job.id

                  return (
                    <Card key={job.id}>
                      <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription>
                            {job.location} · {job.salary}
                          </CardDescription>
                        </div>
                        <Button
                          size="sm"
                          disabled={hasApplied || isApplying}
                          onClick={() => handleApply(job.id)}
                        >
                          {hasApplied ? "Applied" : isApplying ? "Applying..." : "Apply"}
                        </Button>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-medium">My Applications</h2>
              <p className="text-xs text-muted-foreground">
                Track the jobs you&apos;ve applied to
              </p>
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <Briefcase className="size-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">No applications yet</p>
                    <p className="text-xs text-muted-foreground">
                      Apply to an open job above to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {applications.map((application) => {
                  const job = jobsById[application.jobId]

                  return (
                    <Card key={application.id}>
                      <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle>
                            {job?.title ?? `Job ${application.jobId.slice(0, 8)}`}
                          </CardTitle>
                          <CardDescription>
                            {job
                              ? `${job.location} · ${job.salary}`
                              : `Applied ${formatDate(application.createdAt)}`}
                          </CardDescription>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide",
                            statusStyles[application.status]
                          )}
                        >
                          {application.status}
                        </span>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Applied on {formatDate(application.createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
