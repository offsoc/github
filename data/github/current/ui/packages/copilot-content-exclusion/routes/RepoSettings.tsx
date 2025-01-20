import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ShieldLockIcon} from '@primer/octicons-react'
import {FormControl, Heading, Label, Link, Text, Textarea} from '@primer/react'
import React from 'react'
import {ContentExclusionPaths} from '../components/ContentExclusionPaths'
import {FeedbackLink, PageHeading, Stack} from '../components/Ui'
import type {RepoSettingsPayload} from '../types'

export function RepoSettings() {
  const payload = useRoutePayload<RepoSettingsPayload>()

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
        <Heading as="h4" sx={{font: 'var(--text-subtitle-shorthand)'}}>
          Excluded paths
        </Heading>

        <Stack space="spacious">
          <div>
            <p>
              Choose the repositories and paths within your organization that GitHub Copilot should exclude.{' '}
              <Text sx={{fontWeight: 'bold'}}>
                Copilot won&apos;t be able to access or utilize the contents located in those specified paths
              </Text>
              . All exclusions defined at the repository level will apply to all the members of your enterprise.{' '}
              <Link inline href="https://gh.io/copilot-content-exclusion" target="_blank">
                Learn more about setup and usage
              </Link>
              .
            </p>
          </div>

          {payload.orgLevelRules.length && <OrgLevelRules rules={payload.orgLevelRules} />}

          <ContentExclusionPaths
            endpoint={`/${payload.organization}/${payload.repo}/settings/copilot/content_exclusion`}
            initialLastEdited={payload.lastEdited}
            initialValue={payload.repoDocument ?? ''}
            label="Paths to exclude in this repository:"
            placeholder={restrictionPathsPlaceholder}
          />
        </Stack>
      </Stack>
    </>
  )
}

type Rule = {paths: string[]; link: string; name: string}
function OrgLevelRules(props: {rules: Rule[]}) {
  function renderOrg(rule: Rule, index: number) {
    return (
      <FormControl key={index} disabled>
        <FormControl.Label>
          Excluded paths inherited from <MaybeLink link={rule.link}>{rule.name}</MaybeLink>:
        </FormControl.Label>
        <FormControl.Caption>
          <ShieldLockIcon size="small" /> Values defined by {rule.name}&apos;s administrators can&apos;t be edited
        </FormControl.Caption>
        <Textarea
          block
          resize="vertical"
          rows={4}
          sx={{fontFamily: 'monospace'}}
          defaultValue={rule.paths.join('\n')}
        />
      </FormControl>
    )
  }

  return <>{props.rules.map(renderOrg)}</>
}

function MaybeLink(props: React.PropsWithChildren<{link?: string}>) {
  const {link, ...rest} = props
  if (link) return <Link href={link} {...rest} />

  return <React.Fragment {...rest} />
}

const restrictionPathsPlaceholder = `# Example patterns:

- /**/*.env
- /*/releases/**/*
`
