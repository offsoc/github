import {
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  CommentDiscussionIcon,
  FileIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  HashIcon,
  type Icon,
  InfoIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  PlayIcon,
  RepoIcon,
  ShieldIcon,
  TagIcon,
} from '@primer/octicons-react'
import {ActionList, Button, Link, Octicon, Spinner, Truncate} from '@primer/react'
import {useId, useState} from 'react'

import {referenceFileName, referenceName, referencePath} from '../utils/copilot-chat-helpers'
import type {CopilotChatManager} from '../utils/copilot-chat-manager'
import type {
  BingSearchArguments,
  CodeSearchArguments,
  CopilotChatReference,
  FilePathSearchArguments,
  GetAlertArguments,
  GetCommitArguments,
  GetDiffArguments,
  GetDiffByRangeArguments,
  GetDiscussionArguments,
  GetFileArguments,
  GetFileChangesArguments,
  GetIssueArguments,
  GetPullRequestArguments,
  GetPullRequestCommitsArguments,
  GetReleaseArguments,
  GetRepoArguments,
  GitHubAPIArguments,
  JobLogsArguments,
  KnowledgeBaseSearchArguments,
  PlanArguments,
  SkillExecution,
  SupportDocumentReference,
  SupportSearchArguments,
  SymbolSearchArguments,
  WebSearchReference,
} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import styles from './FunctionLoadingUtils.module.css'

export function BingFunctionButton({
  chatManager,
  functionCall,
  skillArgs,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: BingSearchArguments
  useSelectReference: boolean
}) {
  const query = skillArgs.query

  return (
    <ExpandableFunctionButton
      additionalFooterContent={
        <Link href="https://privacy.microsoft.com/en-us/privacystatement" rel="nofollow" target="_blank">
          Microsoft Privacy Statement
        </Link>
      }
      chatManager={chatManager}
      errorButtonText={`An error occurred when searching for “${query}”`}
      errorTitle="An error occurred when searching the web"
      toolLink="https://bing.com"
      toolName="Bing search"
      functionCall={functionCall}
      inProgressMessage={`Searching the web for “${query}”`}
      noResultsMessage={`No web search results for “${query}” were found`}
      resultsMapper={execution => {
        // bing results are a bit special as they come back as one reference containing all the search results
        const results = (execution.references?.[0] as WebSearchReference | undefined)?.results ?? []
        return results.map(result => ({
          title: result.title,
          url: result.url,
          description: result.excerpt,
        }))
      }}
      successButtonText={`Using web search results for “${query}”`}
      useSelectReference={false}
    />
  )
}

export function CodeSearchButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: CodeSearchArguments
  useSelectReference: boolean
}) {
  const query = skillArgs.query
  let scopingQuery = skillArgs.scopingQuery

  if (scopingQuery) {
    scopingQuery = stripRepoQualifier(scopingQuery)
  }

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when searching for “${query}”`}
      errorTitle="An error occurred when searching code"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Semantic code search"
      functionCall={functionCall}
      inProgressMessage={`Searching for “${query}”${scopingQuery && ` in ${scopingQuery}`}`}
      noResultsMessage={`No results were found when searching for “${query}”${scopingQuery && ` in ${scopingQuery}`}`}
      resultsMapper={snippetMapper}
      successButtonText={`Using search results for “${query}”${scopingQuery && ` in ${scopingQuery}`}`}
      useSelectReference={useSelectReference}
    />
  )
}

/**
 * Shows snippet results from knowledge base search.
 */
export function KnowledgeBaseSearchButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: KnowledgeBaseSearchArguments
  useSelectReference: boolean
}) {
  const query = skillArgs.query
  const knowledgeBaseId = skillArgs.kbID

  const {knowledgeBases} = useChatState()

  const knowledgeBase = knowledgeBases.find(kb => kb.id === knowledgeBaseId)
  const knowledgeBaseName = knowledgeBase?.name ?? 'the knowledge base'

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when searching for “${query}” in ${knowledgeBaseName}`}
      errorTitle="An error occurred when searching the knowledge base"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Knowledge base search"
      functionCall={functionCall}
      inProgressMessage={`Searching the ${knowledgeBaseName} knowledge base for “${query}”`}
      noResultsMessage={`No results were found when searching the ${knowledgeBaseName} knowledge base for “${query}”`}
      resultsMapper={snippetMapper}
      successButtonText={`Using search results from the ${knowledgeBaseName} knowledge base for “${query}”`}
      useSelectReference={useSelectReference}
    />
  )
}

export function PathSearchButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: FilePathSearchArguments
  useSelectReference: boolean
}) {
  let filename = skillArgs.filename
  let scopingQuery = skillArgs.scopingQuery

  if (filename) {
    filename = filename.split('/').pop() ?? filename
  } else {
    filename = 'unknown'
  }
  if (scopingQuery) {
    scopingQuery = stripRepoQualifier(scopingQuery)
  }

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when finding “${filename}”`}
      errorTitle="An error occurred when searching for a file"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Path search"
      functionCall={functionCall}
      inProgressMessage={`Finding “${filename}”${scopingQuery && ` in ${scopingQuery}`}`}
      noResultsMessage={`No files matching “${filename}”${scopingQuery && ` in ${scopingQuery}`} were found`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'file' || reference.type === 'snippet'
            ? {
                description: `${reference.repoOwner}/${reference.repoName}`,
                leadingIcon: FileIcon,
                reference,
                title: referenceFileName(reference),
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={`Using “${filename}”${scopingQuery && ` in ${scopingQuery}`}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetFileButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetFileArguments
  useSelectReference: boolean
}) {
  const {path, repo, ref} = skillArgs

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={withRefSuffix(`An error occurred when finding “${path}” in ${repo}`, ref)}
      errorTitle="An error occurred when finding a file"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get file"
      functionCall={functionCall}
      inProgressMessage={withRefSuffix(`File results for “${path} in ${repo}`, ref)}
      noResultsMessage={withRefSuffix(`No files matching “${path}” in ${repo} were found`, ref)}
      resultsMapper={execution => {
        const results = execution.references ?? []

        return results.map(reference =>
          reference.type === 'file-v2'
            ? {
                description: `${reference.repoName}/${reference.path}`,
                leadingIcon: FileIcon,
                reference,
                title: referenceFileName(reference),
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={withRefSuffix(`Using results for “${path}” in ${repo}`, ref)}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetFileChangesButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetFileChangesArguments
  useSelectReference: boolean
}) {
  const {path, repo, ref} = skillArgs
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={withRefSuffix(`An error occurred when finding file changes for “${path}” in ${repo}`, ref)}
      errorTitle="An error occurred when finding the file changes"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get file changes"
      functionCall={functionCall}
      inProgressMessage={withRefSuffix(`File changes results for “${path} in ${repo}`, ref)}
      noResultsMessage={withRefSuffix(`No files changes were found for “${path}” in ${repo}`, ref)}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'file-changes'
            ? {
                description: `${reference.repository.name}/${path}`,
                leadingIcon: FileIcon,
                reference,
                title: referenceFileName(reference),
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={withRefSuffix(`Using results for “${path}” in ${repo}`, ref)}
      useSelectReference={useSelectReference}
    />
  )
}

const withRefSuffix = (string: string, ref?: string): string => {
  return ref ? `${string} on ref ${ref}` : string
}

export function GetIssueButton({
  chatManager,
  functionCall,
  skillArgs,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetIssueArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching issue #${skillArgs.issueNumber} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching an issue"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get issue"
      functionCall={functionCall}
      inProgressMessage={`Fetching issue #${skillArgs.issueNumber} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch issue #${skillArgs.issueNumber} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'issue'
            ? {
                description: `#${reference.number} · ${reference.repository.owner}/${reference.repository.name}`,
                leadingIcon: reference.state === 'open' ? IssueOpenedIcon : IssueClosedIcon,
                leadingIconColor: reference.state === 'open' ? 'open.fg' : 'done.fg',
                title: reference.title ?? 'Issue',
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={`Using issue #${skillArgs.issueNumber} in ${skillArgs.repo}`}
      useSelectReference={false} // until such time as we have an IssueReferencePreview
    />
  )
}

export function GetReleaseButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetReleaseArguments
  useSelectReference: boolean
}) {
  const tagName = skillArgs.tagName || ''
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching release ${tagName} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching release"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get release"
      functionCall={functionCall}
      inProgressMessage={`Fetching release ${tagName} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch release ${tagName} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'release'
            ? {
                description: `Release ${tagName} · ${reference.repository.owner}/${reference.repository.name}`,
                leadingIcon: TagIcon,
                title: reference.name ?? 'Release',
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={`Using release ${tagName} in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function SymbolSearchButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: SymbolSearchArguments
  useSelectReference: boolean
}) {
  const symbolName = skillArgs.symbolName
  let scopingQuery = skillArgs.scopingQuery
  scopingQuery = scopingQuery ? stripRepoQualifier(scopingQuery) : ''

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when searching for symbol “${symbolName}” in ${scopingQuery}`}
      errorTitle="An error occurred when retrieving issues"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Symbol search"
      functionCall={functionCall}
      inProgressMessage={`Searching for symbol “${symbolName}” in ${scopingQuery}`}
      noResultsMessage={`No results were found when searching for symbol “${symbolName}” in ${scopingQuery}`}
      resultsMapper={snippetMapper}
      successButtonText={`Using search results for the symbol “${symbolName}” from ${scopingQuery}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetAlertButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetAlertArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching alert information for ${skillArgs.url}`}
      errorTitle="An error occurred when fetching alert information"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get alert information"
      functionCall={functionCall}
      inProgressMessage={`Fetching alert information`}
      noResultsMessage={`Unable to fetch alert information`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'alert.api'
            ? {
                description: `Alert`,
                leadingIcon: () => <ShieldIcon />,
                title: 'Alert',
              }
            : undefined,
        )
      }}
      successButtonText={`Using alert information`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetPullRequestCommitsButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetPullRequestCommitsArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching commits for pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching commits for a pull request"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get pull request commits"
      functionCall={functionCall}
      inProgressMessage={`Fetching commits for pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch commits for pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'commit'
            ? {
                description: `Pull request #${skillArgs.pullRequestNumber} · ${skillArgs.repo}`,
                leadingIcon: GitCommitIcon,
                title: reference.message ?? 'Commit',
                url: reference.permalink,
              }
            : undefined,
        )
      }}
      successButtonText={`Using commits for pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetCommitButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetCommitArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching commit ${skillArgs.commitish} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching a commit"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get commit"
      functionCall={functionCall}
      inProgressMessage={`Fetching commit ${skillArgs.commitish} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch commit ${skillArgs.commitish} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'commit'
            ? {
                description: `${reference.oid} · ${reference.repository.owner}/${reference.repository.name}`,
                leadingIcon: GitCommitIcon,
                title: reference.message ?? 'Commit',
                url: reference.permalink,
              }
            : undefined,
        )
      }}
      successButtonText={`Using commit ${skillArgs.commitish} in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetRepoButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetRepoArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching repository ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching repository"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get repository"
      functionCall={functionCall}
      inProgressMessage={`Fetching repository ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch repository ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'repository'
            ? {
                description: reference.description || '',
                title: reference.name,
                leadingIcon: RepoIcon,
              }
            : undefined,
        )
      }}
      successButtonText={`Using repository ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetDiffButton({
  chatManager,
  functionCall,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetDiffArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when trying to fetch diff`}
      errorTitle="An error occurred when fetching diff"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get diff"
      functionCall={functionCall}
      inProgressMessage={`Fetching diff..`}
      noResultsMessage={`Unable to fetch diff`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'tree-comparison'
            ? {
                title: `Displaying diff`,
                description: `Using ${reference.diffHunks.length} diff ${
                  reference.diffHunks.length === 1 ? 'hunk' : 'hunks'
                }`,
              }
            : undefined,
        )
      }}
      successButtonText={`Using results of getdiff call`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetDiffByRangeButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetDiffByRangeArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText="An error occurred when diff by range"
      errorTitle="An error occurred when fetching diff by range"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get diff by range"
      functionCall={functionCall}
      inProgressMessage={`Fetching diff in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch diff in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'tree-comparison'
            ? {
                title: `Displaying diff in ${skillArgs.repo}`,
                description: `Using ${reference.diffHunks.length} diff ${
                  reference.diffHunks.length === 1 ? 'hunk' : 'hunks'
                }`,
              }
            : undefined,
        )
      }}
      successButtonText={`Using diff in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetDiscussionButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetDiscussionArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText="An error occurred when fetching discussion"
      errorTitle="An error occurred when fetching discussion"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get discussion"
      functionCall={functionCall}
      inProgressMessage={`Fetching discussion ${skillArgs.discussionNumber}`}
      noResultsMessage={`Unable to fetch discussion ${skillArgs.discussionNumber}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'discussion'
            ? {
                title: reference.title ?? 'Discussion',
                description: `Using discussion #${reference.number} for ${reference.repository.owner}/${reference.repository.name}`,
                url: reference.url,
                leadingIcon: CommentDiscussionIcon,
              }
            : undefined,
        )
      }}
      successButtonText={`Using discussion #${skillArgs.discussionNumber}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function PlanButton({
  functionCall,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: PlanArguments
  useSelectReference: boolean
}) {
  const {status} = functionCall

  if (status === 'started') {
    return (
      <div className={styles.functionLoading}>
        <Spinner size="small" /> Coming up with a plan
      </div>
    )
  }
}

export function GetJobLogsButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: JobLogsArguments
  useSelectReference: boolean
}) {
  const topic = getJobLogsSkillExecutionTopic(skillArgs)
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching logs for ${topic} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching a commit"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get job logs"
      functionCall={functionCall}
      inProgressMessage={`Fetching logs for ${topic} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch logs for ${topic} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results
          .filter(ref => ref.type === 'job')
          .map(reference => ({
            description: `${reference.id} · ${reference.repoOwner}/${reference.repoName}`,
            leadingIcon: PlayIcon,
            title: 'Job',
          }))
      }}
      successButtonText={`Using logs for ${topic} in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function getJobLogsSkillExecutionTopic(skillArgs: JobLogsArguments) {
  if (skillArgs.jobId) return `job ${skillArgs.jobId}`

  if (skillArgs.runId) return `workflow run ${skillArgs.runId}`

  if (skillArgs.pullRequestNumber) return `pull request ${skillArgs.pullRequestNumber}`

  if (skillArgs.workflowPath) return `workflow ${skillArgs.workflowPath}`

  return 'unknown job'
}

interface SkillExecutionDisplayData {
  title: string
  url?: string
  description: string
  leadingIcon?: Icon
  leadingIconColor?: string
  reference?: CopilotChatReference
}

function ExpandableFunctionButton({
  additionalFooterContent,
  chatManager,
  errorButtonText,
  errorTitle,
  functionCall,
  inProgressMessage,
  noResultsMessage,
  resultsMapper,
  successButtonText,
  toolLink,
  toolName,
  useSelectReference,
}: {
  /** content to go in the footer after the "Copilot used the X tool" bit */
  additionalFooterContent?: JSX.Element
  chatManager: CopilotChatManager
  /** caption of the button when an error occurred executing the skill */
  errorButtonText: string
  /** title displayed above the error message if there was an error */
  errorTitle: string
  /** the execution we're showing a button for */
  functionCall: SkillExecution
  /** caption of the button while the skill is executing */
  inProgressMessage: string
  /** message shown when the skill returns no results */
  noResultsMessage: string
  /** provide a function that maps the skill results into a standard data shape for display */
  resultsMapper: (functionCall: SkillExecution) => Array<SkillExecutionDisplayData | undefined>
  /** caption of the button after a successful skill execution */
  successButtonText: string
  toolLink: string
  toolName: string
  /** will use manager.selectReference() to display a reference instead of following the link */
  useSelectReference: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const containerId = useId()
  const results = resultsMapper(functionCall)
  let {status, errorMessage} = functionCall

  if (functionCall.references?.length === 1) {
    const reference = functionCall.references[0]

    if (reference) {
      switch (reference.type) {
        case 'text':
          status = 'error'
          errorMessage = reference.text
          break
        case 'unsupported':
          status = 'unsupported'
          errorMessage = reference.text
          break
      }
    }
  }

  if (status === 'started') {
    return (
      <div className={styles.functionLoading}>
        <Spinner size="small" /> {inProgressMessage}
      </div>
    )
  }

  return (
    <>
      <Button
        aria-expanded={expanded}
        aria-controls={containerId}
        className={styles.functionReferenceButton}
        leadingVisual={expanded ? ChevronUpIcon : ChevronDownIcon}
        onClick={() => setExpanded(exp => !exp)}
        variant="invisible"
        sx={{marginBottom: 1}}
      >
        <span className={styles.functionReferenceButtonContents}>
          {status === 'error' ? errorButtonText : status === 'unsupported' ? noResultsMessage : successButtonText}
        </span>
      </Button>
      {expanded && (
        <div id={containerId} className={styles.functionReferenceListContainer}>
          <ActionList>
            {status === 'error' ? (
              <ActionList.Item>
                {errorTitle}
                <ActionList.Description variant="block">{errorMessage}</ActionList.Description>
              </ActionList.Item>
            ) : status === 'unsupported' ? (
              <ActionList.Item>
                {errorMessage}
                <ActionList.Description>{''}</ActionList.Description>
              </ActionList.Item>
            ) : results.length === 0 ? (
              <ActionList.Item>
                {noResultsMessage}
                <ActionList.Description>Try modifying your query by reframing your question.</ActionList.Description>
              </ActionList.Item>
            ) : (
              results.map(
                (res, i) =>
                  res && (
                    <ActionList.LinkItem
                      key={i}
                      className="width-fit"
                      href={res.url}
                      onClick={e => {
                        if (useSelectReference && res.reference) {
                          chatManager.selectReference(res.reference)
                          e.preventDefault()
                        }
                      }}
                      target="_blank"
                      rel="noopener"
                    >
                      {res.leadingIcon && (
                        <ActionList.LeadingVisual>
                          <Octicon
                            icon={res.leadingIcon}
                            sx={{...(res.leadingIconColor && {color: res.leadingIconColor})}}
                          />
                        </ActionList.LeadingVisual>
                      )}
                      <Truncate className={styles.functionReferenceTitle} title={res.title}>
                        {res.title}
                      </Truncate>
                      <ActionList.Description variant="block">{res.description}</ActionList.Description>
                    </ActionList.LinkItem>
                  ),
              )
            )}
          </ActionList>
          <span className={styles.functionReferenceListFooter}>
            Copilot used the{' '}
            <a href={toolLink} target="_blank" rel="noopener noreferrer">
              {toolName}
            </a>{' '}
            tool{additionalFooterContent && <>. {additionalFooterContent}</>}
          </span>
        </div>
      )}
    </>
  )
}

export function GetPullRequestButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GetPullRequestArguments
  useSelectReference: boolean
}) {
  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorButtonText={`An error occurred when fetching pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      errorTitle="An error occurred when fetching commits for a pull request"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName="Get pull request"
      functionCall={functionCall}
      inProgressMessage={`Fetching pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      noResultsMessage={`Unable to fetch pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      resultsMapper={execution => {
        const results = execution.references ?? []
        return results.map(reference =>
          reference.type === 'pull-request'
            ? {
                description: `Pull request #${skillArgs.pullRequestNumber} · ${skillArgs.repo}`,
                leadingIcon: GitPullRequestIcon,
                title: reference.title ?? 'PullRequest',
                url: reference.url,
              }
            : undefined,
        )
      }}
      successButtonText={`Using pull request #${skillArgs.pullRequestNumber} in ${skillArgs.repo}`}
      useSelectReference={useSelectReference}
    />
  )
}

export function GetGitHubDataButton({
  chatManager,
  functionCall,
  skillArgs,
  useSelectReference,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: GitHubAPIArguments
  useSelectReference: boolean
}) {
  let toolName = 'GitHub API'
  const firstReference = functionCall.references?.[0]
  if (firstReference) {
    const referenceType = firstReference.type
    if (referenceType.endsWith('.api')) {
      const refName = referenceType.split('.')[0] // Extract the reference part
      if (refName) {
        toolName = `${refName
          .split('-') // Split the reference name on dashes
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
          .join(' ')} API`
      }
    } else if (firstReference.type === 'api-response') {
      toolName = `${firstReference.resourceType} API`
    }
  }

  const messages = skillArgs.endpointDescription
    ? {
        errorButtonText: `An error occurred when using the GitHub API to ${skillArgs.endpointDescription}`,
        inProgressMessage: `Using the GitHub API to ${skillArgs.endpointDescription}`,
        noResultsMessage: `Unable to use the GitHub API to ${skillArgs.endpointDescription}`,
        successButtonText: `Using the GitHub API to ${skillArgs.endpointDescription}`,
      }
    : {
        errorButtonText: `An error occurred when fetching from ${skillArgs.endpoint}`,
        inProgressMessage: `Fetching endpoint ${skillArgs.endpoint}`,
        noResultsMessage: `Unable to fetch from ${skillArgs.endpoint}`,
        successButtonText: `Using endpoint ${skillArgs.endpoint}`,
      }

  return (
    <ExpandableFunctionButton
      chatManager={chatManager}
      errorTitle="An error occurred when fetching data from the GitHub API"
      toolLink="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom#currently-available-skills"
      toolName={toolName}
      functionCall={functionCall}
      errorButtonText={messages.errorButtonText}
      inProgressMessage={messages.inProgressMessage}
      noResultsMessage={messages.noResultsMessage}
      successButtonText={messages.successButtonText}
      useSelectReference={useSelectReference}
      resultsMapper={execution =>
        execution.references
          ?.filter(ref => ref.type !== 'text')
          .map(reference => getAPIReferenceDisplayData(reference, skillArgs)) ?? []
      }
    />
  )
}

function getAPIReferenceDisplayData(
  reference: CopilotChatReference,
  skillArgs: GitHubAPIArguments,
): SkillExecutionDisplayData {
  switch (reference.type) {
    case 'release.api':
      return {
        description: `Release ${reference.tag_name} · ${skillArgs.repo}`,
        leadingIcon: TagIcon,
        title: reference.name ?? 'Release',
        url: reference.html_url,
      }
    case 'issue.api':
      return {
        description: `#${reference.number} · ${skillArgs.repo}`,
        leadingIcon: IssueOpenedIcon,
        title: reference.title ?? 'Issue',
        url: reference.html_url,
      }
    case 'pull-request.api':
      return {
        description: `#${reference.number} · ${skillArgs.repo}`,
        leadingIcon: GitPullRequestIcon,
        title: reference.title ?? 'Pull request',
        url: reference.html_url,
      }
    case 'repository.api':
      return {
        description: reference.description || '',
        title: reference.name,
        leadingIcon: RepoIcon,
        url: reference.html_url,
      }
    case 'commit.api':
      return {
        description: `${reference.sha} · ${skillArgs.repo}`,
        leadingIcon: GitCommitIcon,
        title: reference.commit.message ?? 'Commit',
        url: reference.html_url,
      }
    case 'topic.api':
      return {
        description: reference.short_description || '',
        leadingIcon: HashIcon,
        title: reference.display_name ?? reference.name,
      }
    case 'api-response':
      switch (reference.resourceType) {
        case 'Repository':
          return {
            description: reference.data.description || '',
            title: reference.data.name,
            leadingIcon: RepoIcon,
            url: reference.data.html_url,
          }
        case 'Issue':
          return {
            description: `#${reference.data.number} · ${skillArgs.repo}`,
            leadingIcon: IssueOpenedIcon,
            title: reference.data.title ?? 'Issue',
            url: reference.data.html_url,
          }
        case 'Release':
          return {
            description: `Release ${reference.data.tag_name} · ${skillArgs.repo}`,
            leadingIcon: TagIcon,
            title: reference.data.name ?? 'Release',
            url: reference.data.html_url,
          }
        case 'PullRequest':
          return {
            description: `#${reference.data.number} · ${skillArgs.repo}`,
            leadingIcon: GitPullRequestIcon,
            title: reference.data.title ?? 'Pull request',
            url: reference.data.html_url,
          }
        case 'Commit':
          return {
            description: `${reference.data.sha} · ${skillArgs.repo}`,
            leadingIcon: GitCommitIcon,
            title: reference.data.commit.message ?? 'Commit',
            url: reference.data.html_url,
          }
        case 'Topic':
          return {
            description: reference.data.short_description || '',
            leadingIcon: HashIcon,
            title: reference.data.display_name ?? reference.data.name,
          }
        default:
          return {
            description: 'API endpoint returned results successfully',
            leadingIcon: InfoIcon,
            title: 'API results',
          }
      }
    default:
      return {
        description: 'API endpoint returned results successfully',
        leadingIcon: InfoIcon,
        title: 'API results',
      }
  }
}

// This will eventually send the customer to the Support Portal if they cannot find the answer they are looking for
const copilotInGithubSupportLink =
  'https://docs.github.com/en/support/contacting-github-support/using-copilot-in-github-support'
export function SupportSearchButton({
  chatManager,
  functionCall,
  skillArgs,
}: {
  chatManager: CopilotChatManager
  functionCall: SkillExecution
  skillArgs: SupportSearchArguments
  useSelectReference: boolean
}) {
  const query = skillArgs.rawUserQuery

  return (
    <ExpandableFunctionButton
      additionalFooterContent={
        <Link href={copilotInGithubSupportLink} rel="nofollow" target="_blank">
          Information on using Copilot in GitHub Support
        </Link>
      }
      chatManager={chatManager}
      errorButtonText={`An error occurred when searching for “${query}”`}
      errorTitle="An error occurred when searching support documents"
      toolLink={copilotInGithubSupportLink}
      toolName="Support Search"
      functionCall={functionCall}
      inProgressMessage={`Searching support documents for “${query}”`}
      noResultsMessage={`No support documents for “${query}” were found`}
      resultsMapper={execution => {
        const results = (execution.references?.[0] as SupportDocumentReference | undefined)?.results ?? []

        return results.map(result => ({
          title: result.title,
          url: result.url,
          description: result.url,
        }))
      }}
      successButtonText={`Using support search results for “${query}”`}
      useSelectReference={false}
    />
  )
}

/**
 * Remove the 'repo:' that's likely at the beginning of the scoping query
 */
function stripRepoQualifier(scopingQuery: string) {
  if (scopingQuery.startsWith('repo:')) {
    return scopingQuery.substring(5)
  } else {
    return scopingQuery
  }
}

function snippetMapper(execution: SkillExecution) {
  const results = execution.references ?? []
  return results.map(reference =>
    reference.type === 'file' || reference.type === 'snippet'
      ? {
          description: referencePath(reference),
          leadingIcon: CodeIcon,
          reference,
          title: referenceName(reference),
          url: reference.url,
        }
      : undefined,
  )
}
