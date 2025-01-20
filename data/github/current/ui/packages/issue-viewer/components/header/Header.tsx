import {setTitle as setDocumentTitle} from '@github-ui/document-metadata'
import type React from 'react'
import {useEffect, useRef, useState} from 'react'
import {graphql, type PreloadedQuery, useFragment} from 'react-relay'
import {usePreloadedQuery} from 'react-relay/hooks'

import type {Header$key} from './__generated__/Header.graphql'
import type {HeaderQuery} from './__generated__/HeaderQuery.graphql'
import {HeaderEditor} from './HeaderEditor'
import {HeaderViewer} from './HeaderViewer'
import {Box, Flash, IconButton} from '@primer/react'
import {HeaderMetadata} from './HeaderMetadata'
import {ObservableBox} from '@github-ui/use-sticky-header/ObservableBox'
import {useStickyHeader} from '@github-ui/use-sticky-header/useStickyHeader'
import {ContentWrapper} from '../ContentWrapper'
import {XIcon} from '@primer/octicons-react'
import type {OptionConfig} from '../OptionConfig'
import type {HeaderSecondary$key} from './__generated__/HeaderSecondary.graphql'
import type {HeaderParentTitle$key} from './__generated__/HeaderParentTitle.graphql'
import type {TaskListStatusFragment$key} from '../shared/__generated__/TaskListStatusFragment.graphql'
import type {TrackedByFragment$key} from './__generated__/TrackedByFragment.graphql'

export const HeaderGraphqlQuery = graphql`
  query HeaderQuery($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      issue(number: $number) {
        ...Header
      }
    }
  }
`

type HeaderBaseProps = {
  optionConfig: OptionConfig
  metadataPaneTrigger: JSX.Element
  containerRef?: React.RefObject<HTMLDivElement>
  issueSecondary?: HeaderSecondary$key | TaskListStatusFragment$key | HeaderParentTitle$key | TrackedByFragment$key
}

export type HeaderFetchedProps = HeaderBaseProps & {
  issuesQueryRef: PreloadedQuery<HeaderQuery>
}

type HeaderProps = HeaderBaseProps & {
  issue: Header$key
}

export function HeaderFetched({issuesQueryRef, ...rest}: HeaderFetchedProps) {
  const preloadedData = usePreloadedQuery<HeaderQuery>(HeaderGraphqlQuery, issuesQueryRef)
  return preloadedData.repository && preloadedData.repository.issue ? (
    <Header issue={preloadedData.repository.issue} {...rest} />
  ) : null
}

export function Header({issue, issueSecondary, optionConfig, metadataPaneTrigger, containerRef}: HeaderProps) {
  const data = useFragment(
    graphql`
      fragment Header on Issue {
        title
        number
        id
        repository {
          nameWithOwner
          id
        }
        ...HeaderViewer
        ...HeaderMetadata
      }
    `,
    issue,
  )
  const secondaryData = useFragment(
    graphql`
      fragment HeaderSecondary on Issue {
        isTransferInProgress
      }
    `,
    issueSecondary as HeaderSecondary$key,
  )
  // If the secondary data is not available, we default to false
  const isTransferInProgress = secondaryData?.isTransferInProgress ?? false

  const {
    id,
    title: issueTitle,
    number,
    repository: {nameWithOwner},
  } = data

  const [title, setTitle] = useState<string>(issueTitle)
  const titleRef = useRef<HTMLInputElement>(null)
  const [isIssueTitleEditActive, setIsIssueTitleEditActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shouldUpdateDocumentTitle =
    optionConfig.selectedProjectId === undefined && !optionConfig.shouldSkipSetDocumentTitle
  useEffect(() => {
    if (issueTitle && shouldUpdateDocumentTitle) {
      setDocumentTitle(`${title} · Issue #${number} · ${nameWithOwner}`)
    }
  }, [shouldUpdateDocumentTitle, issueTitle, nameWithOwner, number, title])

  useEffect(() => {
    if (isIssueTitleEditActive) return
    setTitle(issueTitle)
  }, [isIssueTitleEditActive, issueTitle, setTitle])

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const oldValue = title
    const newValue = e.target.value
    if (newValue !== null && newValue !== oldValue) {
      setTitle(newValue)
    }
  }

  // Focus on title when user clicks on edit
  useEffect(() => {
    if (isIssueTitleEditActive && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isIssueTitleEditActive])

  const {isSticky, hasRoots, stickyStyles, observe, unobserve} = useStickyHeader()
  const [showTransferWarning, setShowTransferWarning] = useState(isTransferInProgress)

  return (
    <>
      <ContentWrapper sx={optionConfig.innerSx}>
        {showTransferWarning && (
          <Flash
            aria-live="polite"
            sx={{mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
          >
            Issue transfer in progress
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              variant="invisible"
              aria-label="Dismiss issue is in transfer notification"
              icon={XIcon}
              onClick={() => setShowTransferWarning(false)}
            />
          </Flash>
        )}
        {isIssueTitleEditActive || isSubmitting ? (
          <HeaderEditor
            issueId={id}
            title={title}
            titleRef={titleRef}
            onTitleChange={onTitleChange}
            onIssueUpdate={optionConfig.onIssueUpdate}
            cancelIssueTitleEdit={() => {
              setIsSubmitting(false)
              setIsIssueTitleEditActive(false)
            }}
            isDirty={issueTitle !== title}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            emojiSkinTonePreference={optionConfig.commentBoxConfig?.emojiSkinTonePreference}
          />
        ) : (
          <HeaderViewer
            headerViewerKey={data}
            optionConfig={optionConfig}
            setIsIssueTitleEditActive={setIsIssueTitleEditActive}
            metadataPaneTrigger={metadataPaneTrigger}
            containerRef={containerRef}
            parentKey={issueSecondary as HeaderParentTitle$key}
          />
        )}
      </ContentWrapper>
      <HeaderMetadata
        headerMetadataKey={data}
        optionConfig={optionConfig}
        isSticky={hasRoots && isSticky}
        setIsIssueTitleEditActive={setIsIssueTitleEditActive}
        metadataPaneTrigger={metadataPaneTrigger}
        stickyStyles={stickyStyles}
        containerRef={containerRef}
        headerMetadataSecondaryKey={
          issueSecondary as TaskListStatusFragment$key | TrackedByFragment$key | HeaderParentTitle$key
        }
      />
      <ObservableBox
        sx={{top: '-1px', height: '1px', visibility: 'hidden'}}
        onObserve={observe}
        onUnobserve={unobserve}
      />
      <ContentWrapper sx={{mb: 4, ...optionConfig.innerSx}}>
        <Box
          sx={{
            width: '100%',
          }}
        />
      </ContentWrapper>
    </>
  )
}
