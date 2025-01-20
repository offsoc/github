import type {RepositoryPickerRepositoryIssueTemplates$data} from '@github-ui/item-picker/RepositoryPickerRepositoryIssueTemplates.graphql'
import {repoHasAvailableTemplates} from '../model'

type buildTemplatesProps = {
  hasTemplates?: boolean
  hasForms?: boolean
  hasSecurityPolicy?: boolean
  hasContactLinks?: boolean
}

function buildTemplates({
  hasTemplates = false,
  hasForms = false,
  hasSecurityPolicy = false,
  hasContactLinks = false,
}: buildTemplatesProps): RepositoryPickerRepositoryIssueTemplates$data {
  return {
    issueTemplates: hasTemplates ? ['template'] : null,
    issueForms: hasForms ? ['form'] : null,
    contactLinks: hasContactLinks ? ['link'] : null,
    isSecurityPolicyEnabled: hasSecurityPolicy,
  } as RepositoryPickerRepositoryIssueTemplates$data
}

test('`repoHasAvailableTemplates` correctly returns based on input', () => {
  expect(repoHasAvailableTemplates(null)).toBe(false)
  expect(repoHasAvailableTemplates(buildTemplates({hasTemplates: true}))).toBe(true)
  expect(repoHasAvailableTemplates(buildTemplates({hasForms: true}))).toBe(true)
  expect(repoHasAvailableTemplates(buildTemplates({hasSecurityPolicy: true}))).toBe(false)
  expect(repoHasAvailableTemplates(buildTemplates({hasContactLinks: true}))).toBe(true)
})
