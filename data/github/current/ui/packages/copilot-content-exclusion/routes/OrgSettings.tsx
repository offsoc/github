import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Label, Link, Text} from '@primer/react'
import {ContentExclusionPaths} from '../components/ContentExclusionPaths'
import {FeedbackLink, PageHeading, Stack} from '../components/Ui'
import type {OrgSettingsPayload} from '../types'

export function OrgSettings() {
  return (
    <>
      <PageHeading
        name="Content exclusion"
        meta={
          <>
            <Label variant="success">Beta</Label>&nbsp;
            <FeedbackLink />
          </>
        }
      />
      <Stack space="normal" data-hpc>
        <div>
          <p>
            Choose the repositories and paths within your organization that GitHub Copilot should exclude.{' '}
            <Text sx={{fontWeight: 'bold'}}>
              Copilot won’t be able to access or utilize the contents located in those specified paths.{' '}
            </Text>
          </p>
          <p>
            All exclusions defined at the repository and organization level will apply to all members of your
            enterprise.{' '}
            <Link inline href="https://gh.io/copilot-content-exclusion" target="_blank">
              Learn more about setup and usage.
            </Link>
          </p>
        </div>

        <ContentExclusionPathsForm />
      </Stack>
    </>
  )
}

function ContentExclusionPathsForm() {
  const payload = useRoutePayload<OrgSettingsPayload>()

  return (
    <ContentExclusionPaths
      endpoint={`/organizations/${payload.organization}/settings/copilot/content_exclusion`}
      initialLastEdited={payload.lastEdited}
      initialValue={payload.document ?? ''}
      label="Repositories and paths to exclude:"
      placeholder={restrictionPathsPlaceholder}
    />
  )
}

const restrictionPathsPlaceholder = `# Example patterns:

smile:
 - /secrets/*

git@internal.corp.net:my-team/my-repo:
 - /**/*.env
 - /*/releases/**/*
`
