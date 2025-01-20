import {BingIcon} from '@github-ui/copilot-reference-preview/components/WebSearchReferencePreview'
import {sendEvent} from '@github-ui/hydro-analytics'
import {CreateIssueDialogEntry} from '@github-ui/issue-create/CreateIssueDialogEntry'
import {noop} from '@github-ui/noop'
import {
  BookIcon,
  CodeSquareIcon,
  CommentDiscussionIcon,
  DiffIcon as BaseDiffIcon,
  FileIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  PlayIcon,
  RepoIcon,
  SearchIcon,
  ShieldIcon,
  TagIcon,
  TasklistIcon,
} from '@primer/octicons-react'
import {Box, Button, Heading, Link, Text, Truncate} from '@primer/react'
import {useMemo, useState} from 'react'

import type {CopilotChatManager} from '../utils/copilot-chat-manager'
import {
  type CopilotChatReference,
  type CreateIssueArguments,
  type FunctionArguments,
  type SkillExecution,
  SUPPORTED_FUNCTIONS,
} from '../utils/copilot-chat-types'
import {copilotLocalStorage} from '../utils/copilot-local-storage'
import {
  BingFunctionButton,
  CodeSearchButton,
  GetAlertButton,
  GetCommitButton,
  GetDiffButton,
  GetDiffByRangeButton,
  GetDiscussionButton,
  GetFileButton,
  GetFileChangesButton,
  GetGitHubDataButton,
  GetIssueButton,
  GetJobLogsButton,
  getJobLogsSkillExecutionTopic,
  GetPullRequestButton,
  GetPullRequestCommitsButton,
  GetReleaseButton,
  GetRepoButton,
  KnowledgeBaseSearchButton,
  PathSearchButton,
  PlanButton,
  SupportSearchButton,
  SymbolSearchButton,
} from './FunctionCallButton'

export const CodeSearchIcon = () => <SearchIcon />
export const PathSearchIcon = () => <FileIcon />
export const GetFileIcon = () => <FileIcon />
export const SymbolSearchIcon = () => <CodeSquareIcon />
const IssueIcon = () => <IssueOpenedIcon />
const CommitIcon = () => <GitCommitIcon />
const ReleaseIcon = () => <TagIcon />
const RepositoryIcon = () => <RepoIcon />
const JobIcon = () => <PlayIcon />
const DiffIcon = () => <BaseDiffIcon />
const KnowledgeBaseIcon = () => <BookIcon />
const DiscussionIcon = () => <CommentDiscussionIcon />
const PullRequestIcon = () => <GitPullRequestIcon />
const PlanIcon = () => <TasklistIcon />

interface FunctionMetadata {
  id: string
  loadingText: string
  completedText: string
  icon: () => JSX.Element
  referenceType?: CopilotChatReference['type']
  name: string
  activeSkillText: string
}

export const functionMetadataCollection = (args: FunctionArguments): FunctionMetadata | undefined => {
  switch (args.kind) {
    case 'bing-search':
      return {
        id: 'bing-search',
        referenceType: 'web-search',
        loadingText: `Using Bing to search for "${args.query}"`,
        completedText: `Bing results for "${args.query}"`,
        icon: BingIcon,
        name: 'Bing search',
        activeSkillText: 'searching Bing',
      }
    case 'codesearch':
      return {
        id: 'codesearch',
        loadingText: `Search for "${args.query}" in "${args.scopingQuery}"`,
        completedText: `Search results for "${args.query}" in "${args.scopingQuery}"`,
        icon: CodeSearchIcon,
        name: 'Code search',
        activeSkillText: 'searching the codebase',
      }
    case 'kb-search':
      return {
        id: 'kb-search',
        loadingText: `Searching for "${args.query}" in the knowledge base`,
        completedText: `Knowledge base search results for "${args.query}"`,
        icon: KnowledgeBaseIcon,
        name: 'Knowledge base search',
        activeSkillText: 'searching the knowledge base',
      }
    case 'githubissuecreate':
      return {
        id: 'githubissuecreate',
        loadingText: 'Create issue',
        completedText: 'Create issue',
        icon: IssueIcon,
        name: 'List issues',
        activeSkillText: 'retrieving issues',
      }
    case 'pathsearch':
      return {
        id: 'pathsearch',
        loadingText: `Reading file "${args.filename}" in "${args.scopingQuery}"`,
        completedText: `File contents for "${args.filename}" in "${args.scopingQuery}"`,
        icon: PathSearchIcon,
        name: 'File search',
        activeSkillText: 'searching for files',
      }
    case 'show-symbol-definition':
      return {
        id: 'show-symbol-definition',
        loadingText: `Search for "${args.symbolName}" in "${args.scopingQuery}"`,
        completedText: `Search results for "${args.symbolName}" in "${args.scopingQuery}"`,
        icon: SymbolSearchIcon,
        name: 'Symbol search',
        activeSkillText: 'searching for symbols',
      }
    case 'getissue':
      return {
        id: 'getissue',
        loadingText: `Retrieving issue #${args.issueNumber} in ${args.repo}`,
        completedText: `Issue #${args.issueNumber} in ${args.repo}`,
        icon: IssueIcon,
        name: 'Get issue',
        activeSkillText: 'getting issue',
      }
    case 'getalert':
      return {
        id: 'getalert',
        loadingText: `Retrieving information about alerts`,
        completedText: `Including information about alerts`,
        icon: () => <ShieldIcon />,
        name: 'Get alert',
        activeSkillText: 'getting alert',
      }
    case 'getprcommits':
      return {
        id: 'getprcommits',
        loadingText: `Retrieving commits for pull request #${args.pullRequestNumber} in ${args.repo}`,
        completedText: `Commits for pull request #${args.pullRequestNumber} in ${args.repo}`,
        icon: CommitIcon,
        name: 'Get pull request commits',
        activeSkillText: 'getting pull request commits',
      }
    case 'getcommit':
      return {
        id: 'getcommit',
        loadingText: `Retrieving commit #${args.commitish} in ${args.repo}`,
        completedText: `Commit #${args.commitish} in ${args.repo}`,
        icon: CommitIcon,
        name: 'Get commit',
        activeSkillText: 'getting commit',
      }
    case 'getrelease': {
      const tagName = args.tagName || ''
      return {
        id: 'getrelease',
        loadingText: `Retrieving release ${tagName} in ${args.repo}`,
        completedText: `Release ${tagName} in ${args.repo}`,
        icon: ReleaseIcon,
        name: 'Get release',
        activeSkillText: 'getting release',
      }
    }
    case 'get-github-data': {
      return {
        id: 'get-github-data',
        loadingText: `Fetching ${args.endpoint}`,
        completedText: `Results of ${args.endpoint}`,
        icon: ReleaseIcon,
        name: 'Get GitHub Data',
        activeSkillText: 'getting data',
      }
    }
    case 'getrepo': {
      return {
        id: 'getrepo',
        loadingText: `Fetching information about ${args.repo}`,
        completedText: `Details about ${args.repo}`,
        icon: RepositoryIcon,
        name: 'Get repository',
        activeSkillText: 'getting repository details',
      }
    }
    case 'get-actions-job-logs': {
      const topic = getJobLogsSkillExecutionTopic(args)
      const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1)
      return {
        id: 'get-actions-jog-logs',
        loadingText: `Retrieving ${topic} in ${args.repo}`,
        completedText: `${capitalizedTopic} in ${args.repo}`,
        icon: JobIcon,
        name: 'Get job logs',
        activeSkillText: 'getting job logs',
      }
    }
    case 'getdiff': {
      return {
        id: 'getdiff',
        loadingText: `Fetching diff`,
        completedText: `Details about diff`,
        icon: DiffIcon,
        name: 'Get diff',
        activeSkillText: 'getting diff',
      }
    }
    case 'getdiscussion': {
      return {
        id: 'getdiscussion',
        loadingText: `Fetching discussion ${args.discussionNumber}`,
        completedText: `Details about discussion #${args.discussionNumber}`,
        icon: DiscussionIcon,
        name: 'Get discussion',
        activeSkillText: 'getting discussion',
      }
    }
    case 'get-diff-by-range': {
      return {
        id: 'get-diff-by-range',
        loadingText: `Fetching diff`,
        completedText: `Using results of get diff by range`,
        icon: DiffIcon,
        name: 'Get diff by range',
        activeSkillText: 'getting diff by range',
      }
    }
    case 'getfile': {
      return {
        id: 'getfile',
        loadingText: `Searching for file`,
        completedText: `Using results of get file`,
        icon: GetFileIcon,
        name: 'Get file',
        activeSkillText: 'searching for file',
      }
    }
    case 'getfilechanges': {
      return {
        id: 'getfilechanges',
        loadingText: `Searching for file changes`,
        completedText: `File changes for ${args.path} in ${args.repo}`,
        icon: GetFileIcon,
        name: 'Get file changes',
        activeSkillText: 'searching for file changes',
      }
    }
    case 'getpullrequest': {
      return {
        id: 'getpullrequest',
        loadingText: `Fetching pull request`,
        completedText: `Using results of get pull request`,
        icon: PullRequestIcon,
        name: 'Get pull request',
        activeSkillText: 'getting pull request',
      }
    }
    case 'planskill': {
      return {
        id: 'planskill',
        loadingText: `Creating plan...`,
        completedText: `Plan created`,
        icon: PlanIcon,
        name: 'Plan skill',
        activeSkillText: 'creating plan',
      }
    }
    case 'support-search': {
      return {
        id: 'supportsearch',
        loadingText: `Searching for support documents`,
        completedText: `Using results of support search`,
        icon: KnowledgeBaseIcon,
        name: 'Support search',
        activeSkillText: 'searching for support documents',
      }
    }
  }
}

function FunctionCompleted({maxWidth, functionMetadata}: {maxWidth: number; functionMetadata: FunctionMetadata}) {
  return (
    <>
      {functionMetadata.icon()}
      <Truncate title={functionMetadata.completedText} sx={{maxWidth}}>
        {functionMetadata.completedText}
      </Truncate>
    </>
  )
}

function FunctionLoading({maxWidth, functionMetadata}: {maxWidth: number; functionMetadata: FunctionMetadata}) {
  return (
    <>
      {functionMetadata.icon()}
      <Truncate title={functionMetadata.loadingText} sx={{maxWidth}}>
        {functionMetadata.loadingText}
      </Truncate>
    </>
  )
}

function FunctionError({
  functionCall,
  functionMetadata,
}: {
  functionCall: SkillExecution
  functionMetadata: FunctionMetadata
}) {
  return (
    <Box sx={{p: 2}}>
      <Heading as="h3" sx={{fontSize: 1}}>
        An error occurred while {functionMetadata.activeSkillText}
      </Heading>
      <Text as="p" sx={{m: 0}}>
        {functionCall.errorMessage}
      </Text>
      <Text
        as="p"
        sx={{
          mt: 2,
          mb: 0,
          fontSize: 0,
          fontWeight: 'normal',
          color: 'fg.subtle',
        }}
      >
        Copilot used the <Text sx={{fontWeight: 'semibold'}}>{functionMetadata.name}</Text> tool
      </Text>
    </Box>
  )
}

function FunctionTitle({
  functionCall,
  functionMetadata,
  panelWidth,
}: {
  functionCall: SkillExecution
  functionMetadata: FunctionMetadata
  panelWidth: number | undefined
}) {
  const maxWidth = panelWidth ? panelWidth - 130 : copilotLocalStorage.DEFAULT_PANEL_WIDTH
  const innerElement =
    functionCall?.status === 'error' ? (
      <FunctionError functionCall={functionCall} functionMetadata={functionMetadata} />
    ) : functionCall?.status === 'completed' ? (
      <FunctionCompleted maxWidth={maxWidth} functionMetadata={functionMetadata} />
    ) : (
      <FunctionLoading maxWidth={maxWidth} functionMetadata={functionMetadata} />
    )

  return <Box sx={{display: 'flex', gap: '6px', alignItems: 'center'}}>{innerElement}</Box>
}

function FunctionButton({
  disabled,
  functionCall,
  functionMetadata,
  onClick,
  panelWidth,
}: {
  disabled: boolean
  functionCall: SkillExecution
  functionMetadata: FunctionMetadata
  onClick: () => void
  panelWidth: number | undefined
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      sx={{
        alignSelf: 'flex-start',
      }}
    >
      <FunctionTitle functionCall={functionCall} functionMetadata={functionMetadata} panelWidth={panelWidth} />
    </Button>
  )
}

function GitHubIssueCreateButton({
  ...commonProps
}: {
  functionCall: SkillExecution
  functionMetadata: FunctionMetadata
  panelWidth: number | undefined
  parsedArgs: CreateIssueArguments
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [createdIssue, setCreatedIssue] = useState<{url: string; title: string}>()
  const args = commonProps.parsedArgs
  const splitRepo = args.repo?.split('/')
  const repository = splitRepo && splitRepo[0] && splitRepo[1] ? {owner: splitRepo[0], name: splitRepo[1]} : undefined
  return (
    <>
      {createdIssue ? (
        <div className="d-flex flex-row gap-2 flex-items-center">
          <IssueOpenedIcon className="fgColor-open" />
          <Link href={createdIssue.url}>{createdIssue.title}</Link>
        </div>
      ) : (
        <FunctionButton disabled={false} onClick={() => setIsOpen(v => !v)} {...commonProps} />
      )}
      {isOpen && (
        <CreateIssueDialogEntry
          isCreateDialogOpen={isOpen}
          navigate={noop}
          onCreateSuccess={({issue}) => {
            sendEvent('copilot_chat_issue_created', {
              titleChanged: args.title !== issue.title,
            })
            setCreatedIssue({url: issue.url, title: issue.title})
            setIsOpen(false)
          }}
          optionConfig={{
            issueCreateArguments: {
              repository,
              initialValues: {
                title: args.title,
                body: args.body,
              },
            },
          }}
          setIsCreateDialogOpen={setIsOpen}
        />
      )}
    </>
  )
}

function functionRenderer(
  functionCall: SkillExecution,
  functionMetadata: FunctionMetadata,
  manager: CopilotChatManager,
  panelWidth: number | undefined,
  parsedArgs: FunctionArguments,
  useSelectReference: boolean,
) {
  // We may need a better way to indicate that a function call failed due to a confirmation error
  // like a status of confirmationNeeded or some other flag.
  if (functionCall && functionCall.errorMessage !== 'confirmation error') {
    const commonProps = {functionCall, functionMetadata, panelWidth, parsedArgs}

    switch (parsedArgs.kind) {
      case 'bing-search':
        return (
          <BingFunctionButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'codesearch':
        return (
          <CodeSearchButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getcommit':
        return (
          <GetCommitButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getissue':
        return (
          <GetIssueButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'pathsearch':
        return (
          <PathSearchButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'show-symbol-definition':
        return (
          <SymbolSearchButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getalert':
        return (
          <GetAlertButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getprcommits':
        return (
          <GetPullRequestCommitsButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getrelease':
        return (
          <GetReleaseButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getrepo':
        return (
          <GetRepoButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getdiff':
        return (
          <GetDiffButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'get-diff-by-range':
        return (
          <GetDiffByRangeButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getfile':
        return (
          <GetFileButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getfilechanges':
        return (
          <GetFileChangesButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getdiscussion':
        return (
          <GetDiscussionButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'get-actions-job-logs':
        return (
          <GetJobLogsButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'githubissuecreate':
        return <GitHubIssueCreateButton {...commonProps} parsedArgs={parsedArgs} />
      case 'kb-search':
        return (
          <KnowledgeBaseSearchButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'getpullrequest':
        return (
          <GetPullRequestButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'planskill':
        return (
          <PlanButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'get-github-data':
        return (
          <GetGitHubDataButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      case 'support-search':
        return (
          <SupportSearchButton
            chatManager={manager}
            functionCall={functionCall}
            skillArgs={parsedArgs}
            useSelectReference={useSelectReference}
          />
        )
      default: {
        return (
          <div className={`border rounded-2 p-2`}>
            <FunctionTitle {...commonProps} />
          </div>
        )
      }
    }
  } else {
    return null
  }
}

export function useFunctionMetadata(functionCall: SkillExecution): {
  functionMetadata: FunctionMetadata | undefined
  functionRenderer: typeof functionRenderer | undefined
  parsedArgs: FunctionArguments | undefined
} {
  return useMemo(() => {
    if (!functionCall.arguments || !SUPPORTED_FUNCTIONS.includes(functionCall.slug)) {
      return {
        functionMetadata: undefined,
        functionRenderer: undefined,
        parsedArgs: undefined,
      }
    }
    const parsedArgs = {
      ...JSON.parse(functionCall.arguments),
      kind: functionCall.slug,
    } as FunctionArguments
    const functionMetadata = functionMetadataCollection(parsedArgs)

    return {
      functionMetadata,
      functionRenderer,
      parsedArgs,
    }
  }, [functionCall])
}
