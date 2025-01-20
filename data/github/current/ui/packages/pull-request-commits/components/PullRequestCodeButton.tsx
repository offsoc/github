import {ActionList, Link, Octicon} from '@primer/react'
import {DesktopDownloadIcon, TerminalIcon} from '@primer/octicons-react'
import {CodeDropdownButton} from '@github-ui/code-dropdown-button'
import {CloneUrl} from '@github-ui/code-dropdown-button/components/LocalTab'
import type {Repository} from '@github-ui/current-repository'
import {useNavigate} from '@github-ui/use-navigate'
import {buildCodespacesPath} from '@github-ui/code-dropdown-button/components/CodespacesTab'

export interface PullRequestCodeButtonProps {
  codespacesEnabled: boolean
  copilotEnabled: boolean
  editorEnabled: boolean
  headBranch: string
  isEnterprise: boolean
  pullRequestNumber: number
  repository: Repository
}

export function PullRequestCodeButton({
  codespacesEnabled,
  copilotEnabled,
  editorEnabled,
  headBranch,
  isEnterprise,
  pullRequestNumber,
  repository,
}: PullRequestCodeButtonProps) {
  const copilotTabProps = {repoOwner: repository.ownerLogin, repoName: repository.name, refName: headBranch}
  const codespacesPath = buildCodespacesPath(repository.id, headBranch)
  const editorPath = `/${repository.ownerLogin}/${repository.name}/pull/${pullRequestNumber}/edit`

  return (
    <CodeDropdownButton
      primary={false}
      size="small"
      isEnterprise={isEnterprise}
      showCodespacesTab={codespacesEnabled}
      codespacesPath={codespacesPath}
      showCopilotTab={copilotEnabled}
      copilotTabProps={copilotTabProps}
      showGitHubEditorTab={editorEnabled}
      editorPath={editorPath}
      localTab={<LocalTab pullNumber={pullRequestNumber} />}
    />
  )
}

interface LocalTabProps {
  pullNumber: number
}

function LocalTab(props: LocalTabProps) {
  const {pullNumber} = props
  const cloneText = `gh pr checkout ${pullNumber}`
  const navigate = useNavigate()

  return (
    <>
      <div className="m-3">
        <div className="d-flex flex-items-center mb-2">
          <Octicon className="mr-2" icon={TerminalIcon} />
          <p className="text-bold mb-0">Checkout with GitHub CLI</p>
        </div>
        <div className="d-flex flex-column">
          <div className="mb-2">
            <CloneUrl url={cloneText} />
          </div>
          <p className="color-fg-muted">
            Work fast with our official CLI.{' '}
            <Link inline href="https://cli.github.com" target="_blank" aria-label="Learn more about the GitHub CLI">
              Learn more
            </Link>
          </p>
        </div>
      </div>
      <ActionList className="py-0">
        <ActionList.Item
          onSelect={() => {
            // Perform the navigation in an onClick because ActionList.LinkItems
            // close the overlay when clicked.
            navigate('https:desktop.github.com')
          }}
          className="mx-0 width-full border-top color-border-subtle p-3"
        >
          <div className="d-flex flex-items-center">
            <Octicon className="mr-2" icon={DesktopDownloadIcon} />
            <p className="text-bold mb-0">Checkout with GitHub Desktop</p>
          </div>
        </ActionList.Item>
      </ActionList>
    </>
  )
}
