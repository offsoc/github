import {useEffect, useMemo, useState} from 'react'
import {PartialEntry} from '@github-ui/react-core/partial-entry'
import {CreateIssueDialogEntry} from './CreateIssueDialogEntry'
import {VALUES} from '../constants/values'
import {noop} from '@github-ui/noop'
import {RelayEnvironmentProvider} from 'react-relay'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {getSafeConfig} from '../utils/option-config'
import {AnalyticsProvider} from '@github-ui/analytics-provider'

export function GetElement(props: CreateIssueModalProps) {
  return (
    <PartialEntry
      partialName="issue-create"
      embeddedData={{
        props,
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Component={WrapperComponent as any}
      wasServerRendered={false}
    />
  )
}

const environment = relayEnvironmentWithMissingFieldHandlerForNode()

function WrapperComponent(props: CreateIssueModalProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <AnalyticsProvider
        appName={props.analyticsAppName ?? 'UNKNOWN'}
        category={props.analyticsNamespace ?? 'issue-create-web-component'}
        metadata={{}}
      >
        <CreateIssueModal {...props} />
      </AnalyticsProvider>
    </RelayEnvironmentProvider>
  )
}

export type CreateIssueModalProps = {
  owner?: string
  repository?: string
  analyticsAppName?: string
  analyticsNamespace?: string
}

export function CreateIssueModal({owner, repository}: CreateIssueModalProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const repo = useMemo(
    () =>
      owner && repository
        ? {
            repository: {
              owner,
              name: repository,
            },
          }
        : undefined,
    [owner, repository],
  )

  if (!isVisible) return null

  // TODO: setup real value for the config below
  return (
    <CreateIssueDialogEntry
      navigate={noop}
      isCreateDialogOpen={isVisible}
      setIsCreateDialogOpen={setIsVisible}
      optionConfig={getSafeConfig({
        storageKeyPrefix: VALUES.storageKeyPrefixes.globalAdd,
        pasteUrlsAsPlainText: false,
        singleKeyShortcutsEnabled: true,
        useMonospaceFont: false,
        issueCreateArguments: repo,
        showFullScreenButton: false,
      })}
    />
  )
}
