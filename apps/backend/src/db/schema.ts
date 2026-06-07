import { pgTable, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['COMPANY', 'DEVELOPER'])
export const jobStatusEnum = pgEnum('job_status', ['OPEN', 'CLOSED'])
export const applicationStatusEnum = pgEnum('application_status', ['APPLIED', 'SEEN', 'REJECTED'])

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: roleEnum('role').notNull(),
  isVerified: boolean('is_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const companyProfiles = pgTable('company_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  website: text('website').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
})

export const developerProfiles = pgTable('developer_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  bio: text('bio').notNull(),
  skills: text('skills').array().notNull(),
  resumeUrl: text('resume_url').notNull(),
})

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: text('company_id').notNull().references(() => companyProfiles.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  skills: text('skills').array().notNull(),
  location: text('location').notNull(),
  salary: text('salary').notNull(),
  status: jobStatusEnum('status').notNull(),
})

export const applications = pgTable('applications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text('job_id').notNull().references(() => jobs.id),
  developerId: text('developer_id').notNull().references(() => developerProfiles.id),
  status: applicationStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})