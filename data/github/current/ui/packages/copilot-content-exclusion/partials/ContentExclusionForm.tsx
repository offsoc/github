import {PreviewCardOutlet} from '@github-ui/preview-card'
import {Label, Link, Text} from '@primer/react'

import {ContentExclusionPaths} from '../components/ContentExclusionPaths'
import {FeedbackLink, PageHeading, Stack} from '../components/Ui'

import type {LastEditedPayload} from '../types'

export interface ContentExclusionFormPayload {
  updateEndpoint: string
  document?: string
  lastEditedBy?: LastEditedPayload
}

export default function ContentExclusionFormApp(props: {initialPayload: ContentExclusionFormPayload}) {
  const {updateEndpoint, document, lastEditedBy} = props.initialPayload

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
            Choose the repositories and paths that GitHub Copilot should exclude.{' '}
            <Text sx={{fontWeight: 'bold'}}>
              Copilot won’t be able to access or utilize the contents located in those specified paths.{' '}
            </Text>
          </p>
          <p>
            All exclusions defined will apply to all members of your enterprise.{' '}
            <Link href="https://gh.io/copilot-content-exclusion" target="_blank" inline>
              Learn more about setup and usage.
            </Link>
          </p>
        </div>

        <ContentExclusionPaths
          label="Repositories and paths to exclude:"
          endpoint={updateEndpoint}
          initialValue={document ?? ''}
          placeholder={PATHS_PLACEHOLDER}
          initialLastEdited={lastEditedBy}
        />
      </Stack>

      <PreviewCardOutlet />
    </>
  )
}

const PATHS_PLACEHOLDER = `# Example patterns:

git@ssh.dev.azure.com:v3/org/project/repo:
 - **/*.env

git@internal.corp.net:my-team/my-repo:
 - /**/*.env
 - /*/releases/**/*
`
