import type {SafeHTMLString} from '@github-ui/safe-html'

export type IndexPayload = {
  featured: Listing[]
  recommended: Listing[]
  recentlyAdded: Listing[]
  searchResults: SearchResults
  featuredModels: Model[]
  categories: {
    apps: Category[]
    actions: Category[]
  }
}

export type ShowAppPayload = {
  listing: AppListing
  screenshots: Screenshot[]
  plan_info: PlanInfo
  supported_languages: string[]
  verified_domain?: string
  user_can_edit: boolean
  customers: FeaturedCustomer[]
}

export type ShowActionPayload = {
  action: ActionListing
}

export type IndexModelsPayload = {
  models: Model[]
  categories: {
    apps: Category[]
    actions: Category[]
  }
  on_waitlist: boolean
}

export type MarkdownHeadingsTocItem = {
  level: number
  text: SafeHTMLString
  anchor: string
  htmlText: SafeHTMLString
}

export type ShowModelPayload = {
  model: Model
  modelReadme: SafeHTMLString
  modelInputSchema: ModelInputSchema
  readmeToc: MarkdownHeadingsTocItem[]
  modelTransparencyContent: SafeHTMLString
  playgroundUrl: string
  on_waitlist?: boolean
  miniplaygroundIcebreaker?: string
  modelLicense: SafeHTMLString
  modelEvaluation: SafeHTMLString
  canProvideAdditionalFeedback: boolean
  isLoggedIn: boolean
}

export type ModelInputSchema = {
  sampleInputs: Array<{messages?: Array<{content?: string}>}>
  parameters: ModelInputSchemaParameter[]
  capabilities: Record<string, boolean>
}

export type ModelInputSchemaParameter = {
  key: string
  type: 'number' | 'integer' | 'array' | 'string' | 'boolean'
  payloadPath: string
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  default?: number | string | boolean | any[]
  min?: number
  max?: number
  required: boolean
  description?: string
  friendlyName?: string
}

export type Listing = AppListing | ActionListing | ModelListing

export type AppListing = {
  bgColor: string
  copilotApp: boolean
  documentationUrl?: string
  extendedDescription?: string
  fullDescription?: string
  id: number
  installationCount: number
  isVerifiedOwner: boolean
  listingLogoUrl?: string
  name: string
  ownerLogin?: string
  pricingUrl?: string
  primaryCategory?: string
  privacyPolicyUrl?: string
  secondaryCategory?: string
  shortDescription?: string
  slug: string
  statusUrl?: string
  supportUrl?: string
  tosUrl?: string
  type: 'marketplace_listing'
}

export type ActionListing = {
  categories: string[]
  color: string
  description?: string
  iconSvg?: string
  id: number
  isVerifiedOwner: boolean
  name: string
  ownerLogin?: string
  slug?: string
  stars: number
  type: 'repository_action'
}

export type ModelListing = {
  description?: string
  highlights?: {description?: string; 'name.ngram': string | string[]}
  logo_url?: string
  model_url: string
  id: string
  name: string
  friendly_name: string
  type: 'model'
}

export type ModelSnippet = {
  friendly_name: string
  sdks: {
    [key in 'azure-ai-inference' | 'curl']: {
      friendly_name: string
      code: string
    }
  }
}

export type Model = {
  id: string
  registry: string
  name: string
  original_name: string
  friendly_name: string
  publisher: string
  task: string
  description: string
  samples: {
    code: {rest: ModelSnippet; js: ModelSnippet; python: ModelSnippet}
    inputs?: Array<{messages?: Array<{content?: string}>}>
  }
  summary: string
  license: string
  logo_url: string
  tags: string[]
  rate_limit_tier: string | null
  supported_languages: string[]
  max_output_tokens: number | null
  max_input_tokens: number
  training_data_date: string | null
  model_family: string
  evaluation: string
  notes: string
}

export type Category = {
  name: string
  slug: string
  description_html: string
}

export type SearchResults = {
  results: Listing[]
  total: number
  totalPages: number
}

export type Screenshot = {
  id: number
  src: string
  caption?: string
  alt_text?: string
}

export type PlanInfo = {
  plans: Plan[]
  is_user_billed_monthly: boolean
  selected_plan_id?: string
  is_regular_emu_user: boolean
  emu_owner_but_not_admin: boolean
  can_sign_end_user_agreement: boolean
  end_user_agreement?: {html: string; id: number; name: string; user_signed_at?: string; version: string}
  order_preview?: {quantity?: number}
  selected_account?: string
  organizations: Array<{display_login: string; has_extensibility_access: boolean; image?: string}>
  is_buyable: boolean
  subscription_item: {on_free_trial?: boolean}
  any_account_eligible_for_free_trial: boolean
  free_trial_length: string
  viewer_free_trial_days_left?: number
  free_trials_used: boolean
  installation_url_requirement_met: boolean
  user_can_edit_listing: boolean
  listing_by_github: boolean
  is_logged_in: boolean
  support_email?: string
  viewer_has_purchased: boolean
  any_orgs_purchased: boolean
  viewer_billed_organizations: string[]
  viewer_has_purchased_for_all_organizations: boolean
  installed_for_viewer: boolean
  plan_id_by_login: Record<string, string>
  current_user?: {display_login: string; has_extensibility_access: boolean; image?: string}
}

export type Plan = {
  id: string
  name: string
  description: string
  yearly_price_in_cents: number
  monthly_price_in_cents: number
  per_unit: boolean
  unit_name?: string
  is_paid: boolean
  has_free_trial: boolean
  price: string
  direct_billing: boolean
  for_organizations_only: boolean
  for_users_only: boolean
  bullets: string[]
}

export type FeaturedCustomer = {
  displayLogin: string
  image?: string
}

export type PlaygroundAPIMessage = {
  role: PlaygroundAPIMessageAuthor
  content: string
}

export const PlaygroundAPIMessageAuthorValues = ['user', 'system', 'assistant', 'error'] as const
export type PlaygroundAPIMessageAuthor = (typeof PlaygroundAPIMessageAuthorValues)[number]
