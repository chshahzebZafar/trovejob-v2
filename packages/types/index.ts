// ── Enums ─────────────────────────────────────────────────────────────────────

export type LocationType    = 'remote' | 'hybrid' | 'onsite'
export type EmploymentType  = 'fulltime' | 'parttime' | 'contract'
export type JobStatus       = 'draft' | 'active' | 'filled' | 'paused'
export type AppStatus       = 'received' | 'viewed' | 'responded' | 'hired'
export type PlanStatus      = 'trial' | 'active' | 'suspended' | 'cancelled'
export type RequestStatus   = 'pending' | 'approved' | 'rejected'

// ── Core entities ──────────────────────────────────────────────────────────────

export interface Plan {
  id:               string
  name:             string
  priceMonthly:     number
  maxListings:      number        // -1 = unlimited
  hasProfile:       boolean
  hasCvAccess:      boolean
  hasAnalytics:     boolean
  hasFeaturedBoost: boolean
  createdAt:        string
}

export interface Company {
  id:                   string
  name:                 string
  slug:                 string
  website:              string
  tagline:              string | null
  description:          string
  craftStatement:       string | null
  logoUrl:              string | null
  teamPhotos:           string[]
  size:                 string
  founded:              number | null
  hqLocation:           string | null
  verified:             boolean
  planId:               string | null
  planStatus:           PlanStatus
  trialEndsAt:          string | null
  responseRate:         number
  avgResponseDays:      number
  createdAt:            string
}

export interface Job {
  id:               string
  companyId:        string
  company?:         Pick<Company, 'id' | 'name' | 'slug' | 'logoUrl' | 'responseRate' | 'avgResponseDays' | 'verified'>
  title:            string
  slug:             string
  salaryMin:        number
  salaryMax:        number
  currency:         string
  locationType:     LocationType
  city:             string | null
  employmentType:   EmploymentType
  description:      string
  craftDescription: string
  requirements:     string
  benefits:         string
  deadline:         string
  status:           JobStatus
  featured:         boolean
  createdAt:        string
  updatedAt:        string
}

export interface Application {
  id:           string
  jobId:        string
  job?:         Pick<Job, 'id' | 'title' | 'slug'>
  name:         string
  email:        string
  cvUrl:        string
  note:         string | null
  token:        string
  status:       AppStatus
  employerNote: string | null
  createdAt:    string
  respondedAt:  string | null
}

export interface EmployerRequest {
  id:            string
  companyName:   string
  website:       string
  description:   string
  rolesHired:    string
  hiresPerYear:  string
  linkedinUrl:   string | null
  contactName:   string
  contactEmail:  string
  status:        RequestStatus
  adminNotes:    string | null
  createdAt:     string
}

export interface JobAlert {
  id:        string
  email:     string
  keyword:   string | null
  location:  string | null
  salaryMin: number | null
  createdAt: string
}

// ── API payloads ───────────────────────────────────────────────────────────────

export interface CreateJobBody {
  title:            string
  salaryMin:        number
  salaryMax:        number
  currency:         string
  locationType:     LocationType
  city?:            string
  employmentType:   EmploymentType
  description:      string
  craftDescription: string
  requirements:     string
  benefits:         string
  deadline:         string
}

export interface SubmitApplicationBody {
  jobId: string
  name:  string
  email: string
  note?: string
  // cv uploaded as multipart
}

export interface RespondToApplicationBody {
  action:      'forward' | 'reject' | 'keep'
  personalNote?: string
}

export interface JobFilters {
  keyword?:       string
  locationType?:  LocationType
  industry?:      string
  salaryMin?:     number
  employmentType?: EmploymentType
  companySize?:   string
  page?:          number
  limit?:         number
}
