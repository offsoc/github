import type RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {RelayEnvironmentProvider} from 'react-relay'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {CreateIssueDialogEntry} from '@github-ui/issue-create/CreateIssueDialogEntry'
import {useNavigate} from '@github-ui/use-navigate'
import {useEffect} from 'react'

export type CreateIssueDialogProps = {
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  setIsLoaded: (value: boolean) => void
  setIsParentMenuOpen: (value: boolean) => void
  owner?: string
  repo?: string
  environment?: RelayModernEnvironment | RelayMockEnvironment
}

const defaultEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

export default function CreateIssueDialog({
  isVisible,
  setIsVisible,
  setIsLoaded,
  setIsParentMenuOpen,
  owner,
  repo,
  environment = defaultEnvironment,
}: CreateIssueDialogProps) {
  const navigate = useNavigate()
  useEffect(() => {
    setIsLoaded(true)
    // we only want to run this effect on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (isVisible) {
      // ensure we close the GlobalCreateMenu when the dialog is opened
      setIsParentMenuOpen(false)
    }
  }, [isVisible, setIsParentMenuOpen])

  return (
    <RelayEnvironmentProvider environment={environment}>
      <CreateIssueDialogEntry
        navigate={navigate}
        isCreateDialogOpen={isVisible}
        setIsCreateDialogOpen={setIsVisible}
        optionConfig={
          owner && repo
            ? {
                issueCreateArguments: {
                  repository: {
                    owner,
                    name: repo,
                  },
                },
              }
            : undefined
        }
      />
    </RelayEnvironmentProvider>
  )
}
