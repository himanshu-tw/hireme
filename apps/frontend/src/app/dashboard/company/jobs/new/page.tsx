"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCompany, type Job } from "@/hooks/useCompany"
import { getSession } from "@/lib/auth"

export default function CreateJobPage() {
  const router = useRouter()
  const { createJob, isLoading, error } = useCompany()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")
  const [location, setLocation] = useState("")
  const [salary, setSalary] = useState("")
  const [status, setStatus] = useState<Job["status"]>("OPEN")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getSession().catch(() => router.replace("/sign-in"))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      await createJob({
        title,
        description,
        skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        location,
        salary,
        status,
      })
      router.push("/dashboard/company")
    } catch {
      setFormError("Could not create job. Please check your details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard/company" aria-label="Back to dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Create job</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New job posting</CardTitle>
          <CardDescription>
            Fill in the details for the role you want to hire for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Frontend Engineer"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role responsibilities and requirements"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                required
              />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="$120k - $150k"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Job["status"])}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formError || error) && (
              <p className="text-xs text-destructive">{formError ?? error}</p>
            )}

            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Creating..." : "Post job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
