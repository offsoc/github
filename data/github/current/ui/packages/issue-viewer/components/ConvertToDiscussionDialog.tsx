import {Dialog} from '@primer/react/experimental'
import {useRelayEnvironment, graphql, useFragment, useLazyLoadQuery} from 'react-relay'
import {Suspense, useCallback, useMemo, useState} from 'react'
import {commitConvertIssueToDiscussionMutation} from '../mutations/convert-issue-to-discussion-mutation'
import type {ConvertIssueToDiscussionInput} from '../mutations/__generated__/convertIssueToDiscussionMutation.graphql'
import {BUTTON_LABELS} from '../constants/buttons'
import {LABELS} from '../constants/labels'
import {VALUES} from '../constants/values'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {CheckIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {DiscussionCategoryPickerInternal} from '@github-ui/item-picker/DiscussionCategoryPicker'
import {testIdProps} from '@github-ui/test-id-props'
import {Flash, Box, Octicon, Spinner} from '@primer/react'
import {useNamedColor} from '@github-ui/use-named-color'
import type {ConvertToDiscussionDialogIssuePropertiesFragment$key} from './__generated__/ConvertToDiscussionDialogIssuePropertiesFragment.graphql'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import type {
  ConvertToDiscussionDialogQuery,
  ConvertToDiscussionDialogQuery$data,
} from './__generated__/ConvertToDiscussionDialogQuery.graphql'

export type ConvertToDiscussionDialogProps = {
  issueId: string
  owner: string
  repository: string
  onClose: () => void
}

export const IssuePropertiesFragment = graphql`
  fragment ConvertToDiscussionDialogIssuePropertiesFragment on Issue {
    comments {
      totalCount
    }
    reactions {
      totalCount
    }
    tasklistBlocks {
      totalCount
    }
    assignees {
      totalCount
    }
    projectsV2 {
      totalCount
    }
    projectCards {
      totalCount
    }
    milestone {
      __typename
    }
  }
`

export const ConvertToDiscussionDialog = (props: ConvertToDiscussionDialogProps) => {
  const data = useLazyLoadQuery<ConvertToDiscussionDialogQuery>(
    graphql`
      query ConvertToDiscussionDialogQuery($issueId: ID!, $first: Int!) {
        node(id: $issueId) {
          ... on Issue {
            ...ConvertToDiscussionDialogIssuePropertiesFragment
            repository {
              ...DiscussionCategoryPickerDiscussionCategories
            }
          }
        }
      }
    `,
    {
      first: VALUES.convertToDiscussionCategoriesFirst,
      issueId: props.issueId,
    },
  )

  return <ConvertToDiscussionDialogInternal {...props} data={data} />
}

export type ConvertToDiscussionDialogPropsInternal = ConvertToDiscussionDialogProps & {
  data: ConvertToDiscussionDialogQuery$data
}
export const ConvertToDiscussionDialogInternal = ({data, issueId, onClose}: ConvertToDiscussionDialogPropsInternal) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
  const [isConverting, setIsConverting] = useState(false)
  const [showError, setShowError] = useState(false)
  const environment = useRelayEnvironment()

  const issueProperties = data?.node
  const repository = issueProperties?.repository

  const handleConvertToDiscussion = useCallback(() => {
    if (!selectedCategoryId || isConverting) return
    setIsConverting(true)

    const input: ConvertIssueToDiscussionInput = {
      categoryId: selectedCategoryId,
      issueId,
    }

    commitConvertIssueToDiscussionMutation({
      environment,
      input,
      onError: (e: Error) => {
        reportError(formatError(e.message))
        setShowError(true)
        setIsConverting(false)
      },
      onCompleted: response => {
        if (response.convertIssueToDiscussion?.discussion) {
          const discussion = response.convertIssueToDiscussion?.discussion
          window.location.href = discussion.url
          return
        } else {
          for (const e of response.convertIssueToDiscussion?.errors || []) {
            reportError(formatError(e.message))
          }
          setShowError(true)
          setIsConverting(false)
        }
      },
    })
  }, [environment, isConverting, issueId, selectedCategoryId])

  const colorGreen = useNamedColor('GREEN').accent

  return (
    <Dialog
      title={LABELS.convertToDiscussion.title}
      onClose={onClose}
      footerButtons={[
        {content: BUTTON_LABELS.cancel, onClick: onClose, disabled: isConverting},
        {
          content: (
            <Box sx={{position: 'relative'}}>
              {isConverting && (
                <Spinner
                  size="small"
                  sx={{position: 'absolute', left: '50%', marginLeft: '-8px', marginTop: '2px'}}
                  aria-label="Loading"
                />
              )}
              <Box sx={{visibility: isConverting ? 'hidden' : 'visible'}}>
                {BUTTON_LABELS.acknowledgeAndConvertToDiscussion}
              </Box>
            </Box>
          ),
          buttonType: isConverting ? 'default' : 'danger',
          onClick: handleConvertToDiscussion,
          disabled: !selectedCategoryId || isConverting,
          ...testIdProps('convertButton'),
        },
      ]}
      width="large"
      renderBody={({children}) => {
        return (
          <>
            {showError && (
              <Flash full={true} variant="danger">
                <Octicon
                  icon={StopIcon}
                  sx={{
                    color: colorGreen,
                  }}
                  className="mr-3"
                />
                {LABELS.somethingWentWrong}
              </Flash>
            )}
            <Box sx={{margin: 3}}>{children}</Box>
          </>
        )
      }}
    >
      <Suspense fallback={<DialogLoadingSkeleton />}>
        {issueProperties && <WhatHappens issueProperties={issueProperties} />}
        <Box as="p" sx={{mb: 1}}>
          <strong>{LABELS.convertToDiscussion.selectCategoryTitle}</strong>
        </Box>
        {repository && (
          <DiscussionCategoryPickerInternal onSelect={setSelectedCategoryId} discussionCategoriesData={repository} />
        )}
      </Suspense>
    </Dialog>
  )
}

function formatError(message: string) {
  return new Error(LABELS.convertToDiscussion.error(message))
}

const DialogLoadingSkeleton = () => (
  <>
    <LoadingSkeleton height="sm" variant="rounded" width="80%" sx={{mb: 4, mt: 1}} />
    <Box sx={{ml: 3, mb: 3}}>
      <LoadingSkeleton height="sm" variant="rounded" width="50%" sx={{mb: 2}} />
      <LoadingSkeleton height="sm" variant="rounded" width="90%" sx={{mb: 2}} />
      <LoadingSkeleton height="sm" variant="rounded" width="87%" sx={{mb: 2}} />
    </Box>
    <LoadingSkeleton height="dm" variant="rounded" width="50%" sx={{mb: 2}} />
    <LoadingSkeleton height="dm" variant="rounded" width="100%" sx={{mb: 2}} />
  </>
)

type WhatHappensProps = {
  issueProperties: ConvertToDiscussionDialogIssuePropertiesFragment$key
}
const WhatHappens = ({issueProperties}: WhatHappensProps) => {
  const issue = useFragment(IssuePropertiesFragment, issueProperties)
  const {comments, reactions, tasklistBlocks, assignees, projectsV2, projectCards, milestone} = issue

  const affirmations = useMemo(() => {
    const results = [
      LABELS.convertToDiscussion.affirmations.closedAndLocked,
      LABELS.convertToDiscussion.affirmations.same,
    ]

    if (comments.totalCount > 0 || reactions.totalCount > 0) {
      results.push(LABELS.convertToDiscussion.affirmations.commentsAndReactions)
    }

    return results
  }, [comments, reactions])

  const warnings = useMemo(() => {
    const results = []

    if ((tasklistBlocks?.totalCount || 0) > 0) {
      results.push(LABELS.convertToDiscussion.warnings.taskListBlocks)
    }

    if (assignees.totalCount > 0) {
      results.push(LABELS.convertToDiscussion.warnings.assignees)
    }

    if (projectsV2.totalCount > 0 || projectCards.totalCount > 0) {
      results.push(LABELS.convertToDiscussion.warnings.projects)
    }

    if (milestone) {
      results.push(LABELS.convertToDiscussion.warnings.milestone)
    }

    return results
  }, [tasklistBlocks, assignees, projectsV2, projectCards, milestone])

  return (
    <>
      <p className="mb-3">{LABELS.convertToDiscussion.whatHappens}</p>

      <ul className="list-style-none ml-3 mb-3">
        {affirmations.map((text, index) => (
          <Result key={index} success={true} text={text} />
        ))}
        {warnings.map((text, index) => (
          <Result key={index} success={false} text={text} />
        ))}
      </ul>
    </>
  )
}

type ResultProps = {
  success: boolean
  text: string
}
const Result = ({success, text}: ResultProps) => {
  const colorGreen = useNamedColor('GREEN').accent
  const colorRed = useNamedColor('RED').accent

  return (
    <li className="mb-1">
      <Octicon
        icon={success ? CheckIcon : XIcon}
        sx={{
          color: success ? colorGreen : colorRed,
        }}
        className="mr-1"
      />
      {text}
    </li>
  )
}
