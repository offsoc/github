export interface Feature {
  title: string
  individual: boolean
  business: boolean
  enterprise: boolean
}

export interface FeatureGroup {
  title: string
  features: Feature[]
}

// Set type as array of Feature
const chatFeatures: Feature[] = [
  {
    title: 'Unlimited messages and interactions',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Context-aware coding support and explanations',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Debugging and security remediation assistance',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Conversations tailored to your organization’s repositories',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Answers based on your organization’s knowledge base',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Access to knowledge from top open source repositories',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Pull request diff analysis',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Web search powered by Bing (Public Beta)',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Ability to ask about a failed Actions jobs (Public Beta)',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Answers about issues, PRs, discussions, files, commits etc.',
    individual: false,
    business: false,
    enterprise: true,
  },
]

const codeCompletionFeatures: Feature[] = [
  {
    title: 'Real time code suggestions',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Comments to code',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Fine-tuned models (coming soon as add-on)',
    individual: false,
    business: false,
    enterprise: true,
  },
]

const smartActionsFeatures: Feature[] = [
  {
    title: 'Inline chat and prompt suggestions',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Slash commands and context variables',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Commit message generation',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'Pull request description and summarization',
    individual: false,
    business: false,
    enterprise: true,
  },
]

const devEnvFeatures: Feature[] = [
  {
    title: 'IDE, CLI and GitHub Mobile',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'GitHub.com',
    individual: false,
    business: false,
    enterprise: true,
  },
]

const managementPoliciesFeatures: Feature[] = [
  {
    title: 'Public code filter',
    individual: true,
    business: true,
    enterprise: true,
  },
  {
    title: 'User management',
    individual: false,
    business: true,
    enterprise: true,
  },
  {
    title: 'Data excluded from training by default',
    individual: false,
    business: true,
    enterprise: true,
  },
  {
    title: 'IP indemnity',
    individual: false,
    business: true,
    enterprise: true,
  },
  {
    title: 'Content exclusions',
    individual: false,
    business: true,
    enterprise: true,
  },
  {
    title: 'SAML SSO authentication¹',
    individual: false,
    business: true,
    enterprise: true,
  },
  {
    title: 'Requires GitHub Enterprise Cloud',
    individual: false,
    business: false,
    enterprise: true,
  },
  {
    title: 'Usage metrics',
    individual: false,
    business: true,
    enterprise: true,
  },
]

export const allFeatures: FeatureGroup[] = [
  {
    title: 'Chat',
    features: chatFeatures,
  },
  {
    title: 'Code completion',
    features: codeCompletionFeatures,
  },
  {
    title: 'Smart actions',
    features: smartActionsFeatures,
  },
  {
    title: 'Supported environments',
    features: devEnvFeatures,
  },
  {
    title: 'Management and policies',
    features: managementPoliciesFeatures,
  },
]
