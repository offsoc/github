export interface FormValues {
  languages: string[]
  private_telemetry?: boolean
  repository_nwos: string[] | null
}

export interface FormErrors {
  general_errors?: ErrorContent[]
  languages?: string[]
  repository_nwos?: string[]
}

export interface ErrorContent {
  heading: string
  message: string
}

export interface FormErrorResponse {
  errors: FormErrors
}

interface CreateSuccessResponse {
  id: number
  message: string
  redirect_url: string
}

export interface FormSuccessResponse {
  layout?: string
  payload: CreateSuccessResponse
  title?: string
}
