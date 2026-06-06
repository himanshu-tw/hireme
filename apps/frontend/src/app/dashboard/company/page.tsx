"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Briefcase, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCompany, type CompanyProfile, type Job } from "@/hooks/useCompany"
import { getApiErrorMessage } from "@/lib/api"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const statusStyles: Record<Job["status"], string> = {
  OPEN: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "bg-muted text-muted-foreground",
}

export default function CompanyDashboardPage() {
  const router = useRouter()
  const { getProfile, getJobs, updateJobStatus } = useCompany()

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/sign-in")
      return
    }

    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const [profileData, jobsData] = await Promise.allSettled([
          getProfile(),
          getJobs(),
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

        if (jobsData.status === "fulfilled") {
          setJobs(jobsData.value)
        } else if (
          !(
            axios.isAxiosError(jobsData.reason) &&
            jobsData.reason.response?.status === 404
          )
        ) {
          throw jobsData.reason
        }
      } catch {
        setError("Failed to load dashboard. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [getProfile, getJobs, router])

  const handleToggleStatus = async (job: Job) => {
    setActionError(null)
    setUpdatingJobId(job.id)

    const nextStatus: Job["status"] = job.status === "OPEN" ? "CLOSED" : "OPEN"

    try {
      const updatedJob = await updateJobStatus(job.id, { status: nextStatus })
      setJobs((current) =>
        current.map((item) => (item.id === job.id ? updatedJob : item))
      )
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update job status."))
    } finally {
      setUpdatingJobId(null)
    }
  }

  const avatarLabel = profile?.name ?? "Company"
  const canCreateJobs = !needsProfile

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">My Jobs</h1>
          <p className="text-xs text-muted-foreground">
            Manage the jobs you&apos;ve posted
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreateJobs && (
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company/jobs/new" aria-label="Create job">
                <Plus />
              </Link>
            </Button>
          )}

          <Link
            href="/dashboard/company/profile"
            className="rounded-full transition-opacity hover:opacity-80"
            aria-label="View profile"
          >
            <Avatar className="size-10 cursor-pointer">
              <AvatarFallback>{getInitials(avatarLabel)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading your jobs...</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      {!isLoading && needsProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Complete your profile</CardTitle>
            <CardDescription>
              Set up your company profile before posting jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/company/profile">Create profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !needsProfile && jobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Briefcase className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No jobs yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first job posting to start hiring.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/company/jobs/new">
                <Plus />
                Create job
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    {job.location} · {job.salary}
                  </CardDescription>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide",
                      statusStyles[job.status]
                    )}
                  >
                    {job.status}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/company/jobs/${job.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={updatingJobId === job.id}
                      onClick={() => handleToggleStatus(job)}
                    >
                      {updatingJobId === job.id
                        ? "Updating..."
                        : job.status === "OPEN"
                          ? "Close"
                          : "Reopen"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {job.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
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
          ))}
        </div>
      )}

      {canCreateJobs && !isLoading && (
        <Button
          size="icon-lg"
          className="fixed right-6 bottom-6 size-12 rounded-full shadow-lg"
          asChild
        >
          <Link href="/dashboard/company/jobs/new" aria-label="Create job">
            <Plus className="size-5" />
          </Link>
        </Button>
      )}
    </div>
  )
}
