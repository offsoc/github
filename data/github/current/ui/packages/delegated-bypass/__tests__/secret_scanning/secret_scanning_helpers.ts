import type {Repository} from '@github-ui/current-repository'
import type {ExemptionRequest, ExemptionResponse, RuleSuite} from '../../delegated-bypass-types'
// eslint-disable-next-line @github-ui/github-monorepo/restrict-package-deep-imports
import type {ContentScanSecretsMetadata, RuleRun} from '@github-ui/repos-rules/types/rules-types'

import type {User} from '@github-ui/user-selector'

export const monalisaUser: User = {
  name: 'Mona Lisa',
  login: 'monalisa',
  primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/2?s=80',
  path: '/monalisa',
}

export const collaborator: User = {
  name: 'Collab Orator',
  login: 'collaborator',
  primaryAvatarUrl: 'https://example.com/avatar.png',
  path: '/collaborator',
}

const metadata: Record<string, unknown> = {
  reason: 'false_positive',
  label: 'GitHub Secret Scanning',
}

export const pendingSecretScanningRequest: ExemptionRequest = {
  id: 1,
  number: 1,
  resourceId: 'ksuid123',
  requester: monalisaUser,
  createdAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
  expired: false,
  status: 'pending',
  requestType: 'secret_scanning',
  requesterComment: 'Please approve this request',
  exemptionResponses: [],
  metadata,
  rulesetNames: [],
  repoExemptionsBaseUrl: '',
  changedRulesets: [],
}

const approvedSecretScanningResponse: ExemptionResponse = {
  reviewer: collaborator,
  status: 'approved',
  createdAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
  id: 1,
  updatedAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
}

export const approvedSecretScanningRequest: ExemptionRequest = {
  ...pendingSecretScanningRequest,
  id: 2,
  number: 2,
  status: 'approved',
  exemptionResponses: [approvedSecretScanningResponse],
}

const rejectedSecretScanningResponse: ExemptionResponse = {
  reviewer: collaborator,
  status: 'rejected',
  createdAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
  id: 1,
  updatedAt: new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  }),
}

export const rejectedSecretScanningRequest: ExemptionRequest = {
  ...pendingSecretScanningRequest,
  id: 3,
  number: 3,
  status: 'rejected',
  exemptionResponses: [rejectedSecretScanningResponse],
}

export const completedSecretScanningRequest: ExemptionRequest = {
  ...approvedSecretScanningRequest,
  id: 4,
  number: 4,
  status: 'completed',
  exemptionResponses: [approvedSecretScanningResponse],
}

export const sampleRepo: Repository = {
  id: 1,
  name: 'maximum-effort',
  ownerLogin: 'github',
  defaultBranch: 'main',
  createdAt: '',
  currentUserCanPush: true,
  isFork: false,
  isEmpty: false,
  isOrgOwned: false,
  ownerAvatar: '',
  public: true,
  private: false,
}

export const sampleRuleSuite: RuleSuite = {
  id: 1,
  refName: 'refs/head/main',
  result: 'failed',
  createdAt: new Date(),
  evaluationMetadata: {},
  actor: monalisaUser,
  afterOid: '03598142f0025b539de64d3229f81a5d8ae5955c',
  repository: {
    ...sampleRepo,
    url: '/my-org/my-repo',
    nameWithOwner: 'my-org/my-repo',
  },
  ruleRuns: [
    {
      ruleType: 'secret_scanning',
      ruleDisplayName: 'GitHub Secret Scanning',
      insightsCategory: {
        name: '',
        id: null,
      },
      insightsSourceOutOfDate: false,
      id: 1,
      message: 'Push cannot contain secrets',
      result: 'failed',
      metadata: {
        completed: true,
        num_secrets_found_over_limit: 0,
        secrets: [
          {
            type: 'SECRET_SCANNING_SAMPLE_TOKEN',
            bypass_placeholder_ksuid: 'ksuid123',
            token_metadata: {
              label: 'GitHub Secret Scanning',
              slug: 'secret_scanning_sample_token',
              provider: 'GitHub Secret Scanning',
              token_type: 'SECRET_SCANNING_SAMPLE_TOKEN',
            },
            locations: [
              {
                path: 'README.md',
                blob_oid: '3aa46d5dffbaec3cadd41c17abc7a9ebd226f7de',
                end_line: 3,
                commit_oid: '03598142f0025b539de64d3229f81a5d8ae5955c',
                start_line: 3,
                end_line_byte_position: 55,
                start_line_byte_position: 0,
              },
              {
                path: 'README.md',
                blob_oid: '50cfe538f4a8777ab14dd2d5e5e2ac5d4cc18d19',
                end_line: 3,
                commit_oid: '8936c5965603876828495a7664001e7ef30ef3af',
                start_line: 3,
                end_line_byte_position: 55,
                start_line_byte_position: 0,
              },
            ],
            fingerprint: '',
          },
        ],
      },
    },
  ],
}

const contentScanRuleMetadata: ContentScanSecretsMetadata = {
  '/home/README.md': {
    completed: true,
    num_secrets_found_over_limit: 0,
    secrets: [
      {
        type: 'SECRET_SCANNING_SAMPLE_TOKEN',
        bypass_placeholder_ksuid: 'ksuid123',
        token_metadata: {
          label: 'GitHub Secret Scanning',
          slug: 'secret_scanning_sample_token',
          provider: 'GitHub Secret Scanning',
          token_type: 'SECRET_SCANNING_SAMPLE_TOKEN',
        },
        locations: [
          {
            path: 'README.md',
            blob_oid: '3aa46d5dffbaec3cadd41c17abc7a9ebd226f7de',
            end_line: 3,
            commit_oid: '03598142f0025b539de64d3229f81a5d8ae5955c',
            start_line: 3,
            end_line_byte_position: 55,
            start_line_byte_position: 0,
          },
          {
            path: 'README.md',
            blob_oid: '50cfe538f4a8777ab14dd2d5e5e2ac5d4cc18d19',
            end_line: 3,
            commit_oid: '8936c5965603876828495a7664001e7ef30ef3af',
            start_line: 3,
            end_line_byte_position: 55,
            start_line_byte_position: 0,
          },
        ],
        fingerprint: '',
      },
    ],
  },
}

export const sampleContentScanRuleRun: RuleRun = {
  ruleType: 'secret_scanning',
  ruleDisplayName: 'GitHub Secret Scanning',
  insightsCategory: {
    name: '',
    id: null,
  },
  insightsSourceOutOfDate: false,
  id: 1,
  message: 'Push cannot contain secrets',
  result: 'failed',
  metadata: contentScanRuleMetadata,
}

export const sampleContentScanRuleSuite: RuleSuite = {
  ...sampleRuleSuite,
  ruleRuns: [sampleContentScanRuleRun],
}
