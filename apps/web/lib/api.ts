const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ── Generic fetch wrapper ─────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(`${res.status} ${body?.message ?? res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Public — Jobs ─────────────────────────────────────────────────────────────

export interface JobFilters {
  keyword?: string
  locationType?: string
  employmentType?: string
  salaryMin?: number
  page?: number
}

export interface JobSummary {
  id: string
  slug: string
  title: string
  locationType: string
  city?: string
  employmentType: string
  salaryMin: number
  salaryMax: number
  currency: string
  featured: boolean
  deadline: string
  createdAt: string
  company: {
    name: string
    slug: string
    logoUrl?: string
    verified: boolean
    responseRate: number
  }
}

export interface JobDetail extends JobSummary {
  description: string
  craftDescription: string
  requirements: string
  benefits: string
  company: JobSummary['company'] & {
    tagline?: string
    description: string
    size: string
    hqLocation?: string
    website: string
    avgResponseDays: number
    totalApplications: number
  }
}

export interface JobsResponse {
  jobs: JobSummary[]
  total: number
  page: number
  totalPages: number
}

export const jobsApi = {
  list: (filters?: JobFilters) => {
    const params = new URLSearchParams()
    if (filters?.keyword)        params.set('keyword', filters.keyword)
    if (filters?.locationType)   params.set('locationType', filters.locationType)
    if (filters?.employmentType) params.set('employmentType', filters.employmentType)
    if (filters?.salaryMin)      params.set('salaryMin', String(filters.salaryMin))
    if (filters?.page)           params.set('page', String(filters.page))
    return request<JobsResponse>(`/api/jobs?${params}`)
  },
  get: (slug: string) => request<{ job: JobDetail }>(`/api/jobs/${slug}`),
}

// ── Public — Companies ────────────────────────────────────────────────────────

export interface CompanySummary {
  id: string
  slug: string
  name: string
  tagline?: string
  logoUrl?: string
  size: string
  hqLocation?: string
  responseRate: number
  verified: boolean
  _count: { jobs: number }
}

export interface CompanyDetail extends CompanySummary {
  description: string
  craftStatement?: string
  teamPhotos: string[]
  founded?: number
  website: string
  socialLinks?: Record<string, string>
  avgResponseDays: number
  totalApplications: number
  jobs: JobSummary[]
}

export const companiesApi = {
  list: () => request<{ companies: CompanySummary[] }>('/api/companies'),
  get:  (slug: string) => request<{ company: CompanyDetail }>(`/api/companies/${slug}`),
}

// ── Public — Applications ─────────────────────────────────────────────────────

export interface ApplicationStatusResponse {
  status: string
  jobTitle: string
  companyName: string
  submittedAt: string
  respondedAt?: string
  employerNote?: string
}

export const applicationsApi = {
  submit: (formData: FormData) =>
    fetch(`${BASE}/api/applications`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(body?.message ?? res.statusText)
      }
      return res.json()
    }),
  checkStatus: (token: string) =>
    request<ApplicationStatusResponse>(`/api/applications/status/${token}`),
}

// ── Public — Alerts ───────────────────────────────────────────────────────────

export const alertsApi = {
  subscribe: (data: { email: string; keyword?: string; location?: string; salaryMin?: number }) =>
    request('/api/alerts', { method: 'POST', body: JSON.stringify(data) }),
  unsubscribe: (token: string) =>
    request(`/api/alerts/unsubscribe/${token}`, { method: 'DELETE' }),
}

// ── Employer ──────────────────────────────────────────────────────────────────

export interface EmployerDashboard {
  company: {
    id: string
    name: string
    logoUrl?: string
    planStatus: string
    responseRate: number
    avgResponseDays: number
    totalApplications: number
    plan?: { name: string; maxListings: number; hasAnalytics: boolean }
  }
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  recentApplications: Array<{
    id: string
    name: string
    jobTitle: string
    status: string
    createdAt: string
  }>
}

export interface EmployerJob {
  id: string
  slug: string
  title: string
  status: string
  locationType: string
  employmentType: string
  deadline: string
  createdAt: string
  _count: { applications: number }
}

export interface EmployerApplication {
  id: string
  name: string
  email: string
  status: string
  note?: string
  cvUrl?: string  // pre-signed, server-side only
  createdAt: string
  respondedAt?: string
  job: { id: string; title: string; slug: string }
}

export const employerApi = {
  requestAccess: (data: {
    companyName: string; website: string; description: string
    rolesHired: string; hiresPerYear: string; linkedinUrl?: string
    contactName: string; contactEmail: string
  }) => request('/api/employers/request', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/api/employers/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request('/api/employers/logout', { method: 'POST' }),

  me: () => request<EmployerDashboard>('/api/employers/me'),

  jobs: () => request<{ jobs: EmployerJob[] }>('/api/employers/jobs'),

  updateProfile: (data: Partial<{
    tagline: string; description: string; craftStatement: string
    size: string; founded: number; hqLocation: string; website: string
  }>) => request('/api/employers/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  uploadLogo: (formData: FormData) =>
    fetch(`${BASE}/api/employers/logo`, {
      method: 'POST', credentials: 'include', body: formData,
    }).then(r => r.json()),

  createJob: (data: unknown) =>
    request<{ job: { id: string; slug: string } }>('/api/jobs', {
      method: 'POST', body: JSON.stringify(data),
    }),

  updateJob: (id: string, data: unknown) =>
    request(`/api/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  updateJobStatus: (id: string, status: string) =>
    request(`/api/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  applications: (filters?: { jobId?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.jobId)  params.set('jobId', filters.jobId)
    if (filters?.status) params.set('status', filters.status)
    return request<{ applications: EmployerApplication[] }>(`/api/applications?${params}`)
  },

  getApplication: (id: string) =>
    request<{ application: EmployerApplication & { cvSignedUrl: string } }>(
      `/api/applications/${id}`,
    ),

  respondToApplication: (id: string, data: { action: string; note?: string }) =>
    request(`/api/applications/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  stats: {
    totalCompanies: number
    activeListings: number
    totalApplications: number
    pendingRequests: number
    avgResponseRate: number
  }
  recentRequests: Array<{
    id: string; companyName: string; contactEmail: string
    status: string; createdAt: string
  }>
}

export const adminApi = {
  login: (data: { email: string; password: string }) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request('/api/admin/logout', { method: 'POST' }),

  dashboard: () => request<AdminDashboard>('/api/admin/dashboard'),

  plans: () => request<{ plans: unknown[] }>('/api/admin/plans'),
  createPlan: (data: unknown) => request('/api/admin/plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id: string, data: unknown) => request(`/api/admin/plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  employerRequests: (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return request<{ requests: unknown[] }>(`/api/admin/employer-requests${params}`)
  },
  approveRequest: (id: string) =>
    request(`/api/admin/employer-requests/${id}/approve`, { method: 'POST' }),
  rejectRequest: (id: string, data: { reason?: string }) =>
    request(`/api/admin/employer-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),

  employers: () => request<{ employers: unknown[] }>('/api/admin/employers'),
  updateEmployerPlan: (id: string, planId: string) =>
    request(`/api/admin/employers/${id}/plan`, { method: 'PATCH', body: JSON.stringify({ planId }) }),
  suspendEmployer: (id: string, suspended: boolean) =>
    request(`/api/admin/employers/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspended }) }),

  listings: () => request<{ listings: unknown[] }>('/api/admin/listings'),
  updateListing: (id: string, data: unknown) =>
    request(`/api/admin/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  analytics: () => request<unknown>('/api/admin/analytics'),
  responsRates: () => request<unknown>('/api/admin/response-rates'),
  applications: () => request<unknown>('/api/admin/applications'),
}
