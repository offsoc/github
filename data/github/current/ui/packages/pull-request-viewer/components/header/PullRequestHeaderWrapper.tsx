import {assertDataPresent} from '@github-ui/assert-data-present'
import type {Subject} from '@github-ui/comment-box/subject'
import {ConversationMarkdownSubjectProvider} from '@github-ui/conversations'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useIsDirty} from '@github-ui/use-is-dirty'
import useIsMounted from '@github-ui/use-is-mounted'
import useSafeState from '@github-ui/use-safe-state'
import {useStateWithAvoidableReRenders} from '@github-ui/use-state-with-avoidable-rerenders'
import {ObservableBox} from '@github-ui/use-sticky-header/ObservableBox'
import {useStickyHeader} from '@github-ui/use-sticky-header/useStickyHeader'
import {Box, Button, FormControl, Heading, Text, TextInput} from '@primer/react'
import {memo, useEffect, useMemo, useRef, useState} from 'react'
import type {PreloadedQuery} from 'react-relay'
import {graphql, useFragment, usePreloadedQuery, useRelayEnvironment, useSubscription} from 'react-relay'

import {PullRequestContextProvider} from '../../contexts/PullRequestContext'
import {usePullRequestAnalytics} from '../../hooks/use-pull-request-analytics'
import commitUpdateTitleAndBaseBranchMutation from '../../mutations/update-title-and-base-branch-mutation'
import type {PullRequestHeaderWrapper_repository$key} from './__generated__/PullRequestHeaderWrapper_repository.graphql'
import type {PullRequestHeaderWrapper_user$key} from './__generated__/PullRequestHeaderWrapper_user.graphql'
import type {PullRequestHeaderWrapperQuery} from './__generated__/PullRequestHeaderWrapperQuery.graphql'
import type {PullRequestHeaderWrapperTitleSubscription} from './__generated__/PullRequestHeaderWrapperTitleSubscription.graphql'
import {AlphaBadgeAndActions} from './AlphaBadgeAndActions'
import HeaderMetadata from './HeaderMetadata'
import {HeaderNavigation} from './HeaderNavigation'
import {HeaderRightSideContent} from './HeaderRightSideContent'
import {TitleText} from './TitleText'

const MaxPRTitleLength = 1024

function isTitleValid(title: string) {
  return title.trim().length > 0 && title.length <= MaxPRTitleLength
}

function invalidTitleErrorMessage(title: string) {
  if (title.trim().length === 0) {
    return "PR title can't be blank"
  } else if (title.length > MaxPRTitleLength) {
    return `PR title can't be longer than ${MaxPRTitleLength} characters`
  }
}

function useTitleSubscription(id: string) {
  const config = useMemo(
    () => ({
      subscription: graphql`
        subscription PullRequestHeaderWrapperTitleSubscription($id: ID!) {
          pullRequestTitleUpdated(id: $id) {
            id
            title
            titleHTML
          }
        }
      `,
      variables: {id},
    }),
    [id],
  )

  useSubscription<PullRequestHeaderWrapperTitleSubscription>(config)
}

// Loads the header content first to improve perceived performance
export const PullRequestHeaderWrapperGraphQLQuery = graphql`
  query PullRequestHeaderWrapperQuery(
    $number: Int!
    $owner: String!
    $repo: String!
    $singleCommitOid: String
    $startOid: String
    $endOid: String
  ) {
    viewer {
      ...PullRequestHeaderWrapper_user
    }
    repository(owner: $owner, name: $repo) {
      ...PullRequestHeaderWrapper_repository
      pullRequest(number: $number) {
        id
      }
    }
  }
`

interface PullRequestHeaderProps {
  repository: PullRequestHeaderWrapper_repository$key
  refListCacheKey: string
  user: PullRequestHeaderWrapper_user$key
}

export function PullRequestHeader({repository, refListCacheKey, user}: PullRequestHeaderProps) {
  const data = useFragment(
    graphql`
      fragment PullRequestHeaderWrapper_repository on Repository {
        databaseId
        nameWithOwner
        id
        isWritable
        nameWithOwner
        slashCommandsEnabled
        pullRequest(number: $number) {
          headRefOid
          fullDatabaseId
          id
          baseRefName
          number
          author {
            login
          }
          comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
            summary {
              __typename
            }
          }
          state
          isInMergeQueue
          title
          titleHTML
          viewerCanUpdate
          ...HeaderMetadata_pullRequest
          ...HeaderRightSideContent_pullRequest
        }
      }
    `,
    repository,
  )

  const viewerData = useFragment(
    graphql`
      fragment PullRequestHeaderWrapper_user on User {
        ...HeaderRightSideContent_user
      }
    `,
    user,
  )

  const {sendPullRequestAnalyticsEvent} = usePullRequestAnalytics()

  assertDataPresent(data.pullRequest)
  const pullRequest = data.pullRequest
  const authorName = pullRequest.author?.login || ''
  const number = pullRequest.number
  const viewerCanUpdate = data.pullRequest.viewerCanUpdate
  const repositoryIsWritable = data.isWritable
  const viewOnly = !viewerCanUpdate || !repositoryIsWritable
  const nameWithOwner = data.nameWithOwner

  const [{isEditing, confirmSave}, setEditingState] = useState({isEditing: false, confirmSave: false})
  const [title, setTitle] = useState(data.pullRequest.title) // The title being edited
  const [baseBranch, setBaseBranch] = useState(data.pullRequest.baseRefName)
  const [reviewBody, setReviewBody] = useSafeState('')
  const [reviewEvent, setReviewEvent] = useState('COMMENT')

  const [isDirty, changeDirtyData, resetDirtyData] = useIsDirty({
    baseRefName: pullRequest.baseRefName,
    title: pullRequest.title,
  })
  const [isValid, setIsValid] = useStateWithAvoidableReRenders(true)
  const editTitleInputRef = useRef<HTMLInputElement>(null)
  const editTitleButtonRef = useRef<HTMLButtonElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  /*
   * Preserve focus when toggling between display and editing mode.
   * Focus the input after clicking the edit button,
   * Focus the edit button after closing the edit form
   */
  const toggleEditFocus = (editing: boolean) => {
    const editingRef = editing ? editTitleInputRef : editTitleButtonRef
    requestAnimationFrame(() => {
      editingRef.current?.focus()
    })
  }

  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (isEditing) toggleEditFocus(isEditing)
  }, [isEditing])

  const updateEditingState = (values: {isEditing?: boolean; confirmSave?: boolean}) => {
    setEditingState(prevState => ({...prevState, ...values}))
  }

  const cancelEditing = () => {
    updateEditingState({isEditing: false})
    setTitle(pullRequest.title)
    setBaseBranch(pullRequest.baseRefName)
    changeDirtyData({baseRefName: pullRequest.baseRefName, title: pullRequest.title})
    setIsValid(true)
    sendPullRequestAnalyticsEvent('edit_pull_request.cancel', 'HEADER_EDIT_CANCEL_BUTTON')
    toggleEditFocus(false)
  }

  const onTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    changeDirtyData({baseRefName: baseBranch, title: e.target.value})
    setIsValid(isTitleValid(e.target.value))
  }

  const confirmAndSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid || !isDirty) return

    if (baseBranch !== pullRequest.baseRefName) {
      updateEditingState({confirmSave: true})
    } else {
      saveChanges(e)
    }
  }

  const selectNewBaseBranch = (newBaseBranch: string) => {
    setBaseBranch(newBaseBranch)
    changeDirtyData({baseRefName: newBaseBranch, title})
    sendPullRequestAnalyticsEvent('edit_pull_request.select_base_branch', 'HEADER_BASE_BRANCH_BUTTON')
  }

  const saveChanges = (e: React.FormEvent) => {
    if (!isValid || !isDirty) return
    e.preventDefault()
    updateEditingState({isEditing: false, confirmSave: false})
    sendPullRequestAnalyticsEvent('edit_pull_request.save', 'HEADER_EDIT_SAVE_BUTTON')
    const titleChanged = title !== pullRequest.title
    const baseBranchChanged = baseBranch !== pullRequest.baseRefName
    const newBaseBranch = baseBranchChanged ? baseBranch : undefined

    commitUpdateTitleAndBaseBranchMutation({
      environment,
      input: {
        pullRequestId: pullRequest.id,
        newTitle: title,
        newBaseBranch,
        titleChanged,
        baseBranchChanged,
      },
      onError: (error: Error) => {
        if (!isMounted()) return

        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: `Failed to update pull request title: ${error.message}`})

        // undo the change to the base branch original value and re-open the header editor
        resetDirtyData({baseRefName: baseBranch, title})
        updateEditingState({isEditing: true})
      },
      onCompleted: () => {
        resetDirtyData({baseRefName: baseBranch, title})
      },
    })
  }

  // Subscribe to live updates to the PR title.
  const {use_pull_request_subscriptions_enabled} = useFeatureFlags()
  if (use_pull_request_subscriptions_enabled) {
    // Feature flagging for deploy safety only
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTitleSubscription(pullRequest.id)
  }

  useEffect(() => {
    document.title = `${title} by ${authorName} · Pull Request #${number}`
  }, [title, authorName, number])

  const {isSticky, observe, unobserve} = useStickyHeader()
  const {screenSize} = useScreenSize()
  const showStickyHeader = isSticky && screenSize >= ScreenSize.medium
  const hideSummaryInfo = isSticky && screenSize < ScreenSize.xxlarge

  const markdownSubject = useMemo<Subject>(
    () => ({
      repository: {
        databaseId: data.databaseId!,
        nwo: data.nameWithOwner,
        slashCommandsEnabled: data.slashCommandsEnabled,
      },
      type: 'pull_request',
      id: data.pullRequest
        ? {
            databaseId: data.pullRequest.fullDatabaseId as number,
            id: data.pullRequest.id,
          }
        : undefined,
    }),
    [data.databaseId, data.nameWithOwner, data.pullRequest, data.slashCommandsEnabled],
  )

  const onEdit = () => {
    updateEditingState({isEditing: true})
    sendPullRequestAnalyticsEvent('edit_pull_request.open', 'HEADER_EDIT_BUTTON')
  }

  return (
    <PullRequestContextProvider
      headRefOid={data.pullRequest.headRefOid as string}
      isInMergeQueue={data.pullRequest.isInMergeQueue}
      pullRequestId={data.pullRequest.id}
      repositoryId={data.id}
      state={data.pullRequest.state}
    >
      <ConversationMarkdownSubjectProvider value={markdownSubject}>
        <Box
          as="header"
          id="pull-request-view-header"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: 'canvas.default',
            px: 3,
            pt: 3,
            zIndex: 15,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: ['column-reverse', 'column-reverse', 'column-reverse', 'row'],
              alignItems: 'flex-start',
              justifyContent: ['flex-start', 'flex-start', 'flex-start', 'space-between'],
              gap: [2],
            }}
          >
            {isEditing ? (
              <form style={{width: '100%'}} onSubmit={confirmAndSaveChanges}>
                <Box sx={{display: 'flex'}}>
                  <FormControl sx={{display: 'flex', flexGrow: 1}}>
                    <FormControl.Label visuallyHidden>Edit PR Title</FormControl.Label>
                    <TextInput
                      ref={editTitleInputRef}
                      aria-label="Edit PR Title"
                      maxLength={MaxPRTitleLength}
                      sx={{width: '100%'}}
                      validationStatus={!isValid ? 'error' : undefined}
                      value={title}
                      onChange={onTitleInputChange}
                    />
                    {!isValid && (
                      <FormControl.Validation variant="error">{invalidTitleErrorMessage(title)}</FormControl.Validation>
                    )}
                  </FormControl>
                  <Button sx={{mx: 1}} type="submit" variant="primary">
                    Save
                  </Button>
                  <Button onClick={cancelEditing}>Cancel</Button>
                </Box>
              </form>
            ) : (
              <Box sx={{display: 'inline', mb: -1}}>
                <Heading
                  as="h1"
                  sx={{
                    fontSize: 4,
                    fontWeight: 400,
                    display: 'inline',
                  }}
                >
                  <TitleText
                    isSticky={false}
                    title={data.pullRequest.title}
                    titleHTML={data.pullRequest.titleHTML as SafeHTMLString}
                  />
                  <Text
                    sx={{
                      display: 'inline',
                      fontSize: 4,
                      fontWeight: 300,
                      color: 'fg.muted',
                      paddingLeft: 2,
                    }}
                  >
                    #{data.pullRequest.number}
                  </Text>
                </Heading>
              </Box>
            )}
            {!isEditing && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 2,
                  pt: [0, 0, 0, 0, 0, 1],
                  width: ['100%', '100%', '100%', 'auto'],
                }}
              >
                <Box sx={{display: ['flex', 'flex', 'flex', 'none']}}>
                  <AlphaBadgeAndActions pullRequestNumber={number} repoNameWithOwner={nameWithOwner} />
                </Box>
                <HeaderRightSideContent
                  editTitleButtonRef={editTitleButtonRef}
                  hideSummaryInfo={hideSummaryInfo}
                  isSticky={isSticky}
                  pullRequest={data.pullRequest}
                  reviewBody={reviewBody}
                  reviewEvent={reviewEvent}
                  user={viewerData}
                  viewOnly={viewOnly}
                  onEdit={onEdit}
                  onUpdateReviewBody={setReviewBody}
                  onUpdateReviewEvent={setReviewEvent}
                />
              </Box>
            )}
          </Box>
        </Box>
        <ObservableBox
          sx={{visibility: 'hidden', transform: 'translateY(-2px)'}}
          onObserve={observe}
          onUnobserve={unobserve}
        />
        <Box
          id="pull-request-view-header-meta"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'canvas.default',
            position: ['relative', 'sticky'],
            top: 0,
            borderBottom: '1px solid',
            borderColor: isSticky
              ? 'border.muted'
              : ['transparent', 'transparent', 'transparent', 'transparent', 'border.muted'],
            zIndex: 11,
            px: 3,
            pb: [2, 2, 0],
            gap: 2,
          }}
        >
          <HeaderMetadata
            baseBranch={baseBranch}
            confirmSave={confirmSave}
            isEditing={isEditing}
            isSticky={showStickyHeader}
            pullRequest={data.pullRequest}
            refListCacheKey={refListCacheKey}
            saveButtonRef={saveButtonRef}
            saveChanges={saveChanges}
            selectNewBaseBranch={selectNewBaseBranch}
            title={title}
            updateEditingState={updateEditingState}
          />
          {showStickyHeader && (
            <HeaderRightSideContent
              editTitleButtonRef={editTitleButtonRef}
              hideSummaryInfo={hideSummaryInfo}
              isSticky={isSticky}
              pullRequest={data.pullRequest}
              reviewBody={reviewBody}
              reviewEvent={reviewEvent}
              user={viewerData}
              viewOnly={viewOnly}
              onEdit={onEdit}
              onUpdateReviewBody={setReviewBody}
              onUpdateReviewEvent={setReviewEvent}
            />
          )}
        </Box>
        <HeaderNavigation changedFiles={data.pullRequest.comparison?.summary?.length} />
      </ConversationMarkdownSubjectProvider>
    </PullRequestContextProvider>
  )
}

interface PullRequestHeaderWrapperProps extends Pick<PullRequestHeaderProps, 'refListCacheKey'> {
  queryRef: PreloadedQuery<PullRequestHeaderWrapperQuery>
}

/**
 * PullRequestHeaderWrapper loads the preloaded data for the header
 * and changes the title of the page to the relevant pull request.
 * The <Header> component contains most of the content related to the
 * pull request itself (title, author, branch info, status...)
 * It has a "sticky" behavior that triggers when the header reaches the top
 * of the window.
 */
function PullRequestHeaderWrapperInner({queryRef, ...props}: PullRequestHeaderWrapperProps) {
  const data = usePreloadedQuery(PullRequestHeaderWrapperGraphQLQuery, queryRef)

  assertDataPresent(data.repository?.pullRequest)

  return <PullRequestHeader {...props} repository={data.repository} user={data.viewer} />
}
export const PullRequestHeaderWrapper = memo(PullRequestHeaderWrapperInner)
