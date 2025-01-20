import {Annotation} from '@github-ui/conversations/annotation'
import {AlertIcon, FileSymlinkFileIcon, XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Overlay, Text} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {memo, useCallback, useEffect, useRef, useState, useTransition} from 'react'
import {type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'

import {usePullRequestMarkersContext} from '../../contexts/PullRequestMarkersContext'
import usePullRequestPageAppPayload from '../../hooks/use-pull-request-page-app-payload'
import type {PullRequestMarkersCommentSidesheetQuery as PullRequestMarkersCommentSidesheetQueryType} from '../__generated__/PullRequestMarkersCommentSidesheetQuery.graphql'
import {PullRequestMarkersCommentSidesheetQuery} from '../PullRequestMarkers'
import {AnnotationsFilter, useFilteredAnnotations} from './AnnotationsFilter'
import {ZeroState} from './marker-panels/ZeroState'

interface AnnotationsSidePanelProps {
  returnFocusRef: React.RefObject<HTMLButtonElement>
  onClose: () => void
  isOpen: boolean
}

function AnnotationHeader({
  lineNumber,
  path,
  onNavigateToAnnotation,
}: {
  lineNumber: number
  path: string
  onNavigateToAnnotation: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        p: 2,
        backgroundColor: 'canvas.subtle',
        borderRadius: 0,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        borderBottom: '1px solid',
        borderBottomColor: 'border.default',
      }}
    >
      <Box as="h4" sx={{ml: 1, display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0, mr: 2}}>
        <Text
          sx={{
            overflow: 'hidden',
            fontFamily: 'var(--fontStack-monospace)',
            fontWeight: 500,
            fontSize: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            direction: 'rtl',
          }}
        >
          {path}
        </Text>
        <Text sx={{fontSize: 0, color: 'fg.muted', fontWeight: 'normal', ml: 2, whiteSpace: 'nowrap'}}>
          Line {lineNumber}
        </Text>
      </Box>
      <Tooltip direction="se" id="jump-to-annotation" text="Jump to the annotation in the diff" type="label">
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          aria-labelledby="jump-to-annotation"
          icon={FileSymlinkFileIcon}
          unsafeDisableTooltip={true}
          variant="invisible"
          onClick={onNavigateToAnnotation}
        />
      </Tooltip>
    </Box>
  )
}

/**
 *
 * Renders a side panel displaying previews of the pull request's annotations
 */
export const AnnotationsSidePanel = memo(function AnnotationsSidePanel({
  onClose,
  isOpen,
  returnFocusRef,
}: AnnotationsSidePanelProps) {
  const {filteredAnnotations: annotations, setActiveGlobalMarkerId} = usePullRequestMarkersContext()
  const {ghostUser} = usePullRequestPageAppPayload()
  const [filteredText, setFilteredText] = useState('')
  const filteredAnnotationIds = useFilteredAnnotations(annotations, filteredText)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hasAnnotations = annotations.length > 0
  const handleNavigateToAnnotation = useCallback(
    (annotationId: string) => {
      setActiveGlobalMarkerId(annotationId)
      onClose()
    },
    [onClose, setActiveGlobalMarkerId],
  )

  const annotationSummaries = annotations
    .map(annotation => {
      if (!annotation || !filteredAnnotationIds.has(annotation.id)) return null
      return (
        <Box
          key={annotation.id}
          sx={{
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            background: 'canvas.default',
          }}
        >
          <AnnotationHeader
            lineNumber={annotation.location.end.line}
            path={annotation.path}
            onNavigateToAnnotation={() => handleNavigateToAnnotation(annotation.id)}
          />
          <Annotation annotation={annotation} ghostUser={ghostUser} />
        </Box>
      )
    })
    .filter(Boolean)

  return (
    <Overlay
      anchorSide="inside-left"
      aria-label="Annotations list"
      initialFocusRef={closeButtonRef}
      position="fixed"
      returnFocusRef={returnFocusRef}
      right={0}
      role="complementary"
      top={0}
      visibility={isOpen ? 'visible' : 'hidden'}
      width="xlarge"
      sx={{
        p: 3,
        pt: 0,
        height: '100vh',
        maxHeight: '100vh',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        overflowY: 'auto',
      }}
      onClickOutside={onClose}
      onEscape={onClose}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%'}}>
        <Box
          sx={{
            position: 'sticky',
            zIndex: 15,
            width: '100%',
            top: 0,
            backgroundColor: 'canvas.overlay',
            mx: -3,
            pb: 3,
            pt: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Heading as="h3" sx={{fontSize: 2, fontWeight: 600}}>
              Annotations
            </Heading>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              ref={closeButtonRef}
              aria-label="Close annotations panel"
              icon={XIcon}
              unsafeDisableTooltip={true}
              variant="invisible"
              onClick={onClose}
            />
          </Box>
          <AnnotationsFilter
            filteredText={filteredText}
            sx={{mt: 2, width: '100%'}}
            onFilteredTextChange={setFilteredText}
          />
        </Box>
        {annotationSummaries.length > 0 ? (
          <Box sx={{display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', pb: 5, gap: 3}}>
            {annotationSummaries}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              width: '100%',
              height: '100%',
              justifyContent: 'center',
            }}
          >
            <ZeroState
              description="Annotations will show up here as soon as there are some."
              heading={hasAnnotations ? 'No annotations match the current filter' : 'No annotations on changes yet'}
              icon={AlertIcon}
            />
          </Box>
        )}
      </Box>
    </Overlay>
  )
})

interface AnnotationsSidePanelWrapperProps extends AnnotationsSidePanelProps {
  queryReference: PreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>
}

export function AnnotationsSidePanelWrapper({queryReference, ...rest}: AnnotationsSidePanelWrapperProps) {
  usePreloadedQuery<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
    queryReference,
  )

  return <AnnotationsSidePanel {...rest} />
}

interface AnnotationsSidePanelLoaderProps extends AnnotationsSidePanelProps {
  repoName: string
  repoOwner: string
  number: number
}

export function AnnotationsSidePanelLoader({
  repoName: name,
  repoOwner: owner,
  number,
  ...rest
}: AnnotationsSidePanelLoaderProps) {
  const [queryReference, loadQuery] = useQueryLoader<PullRequestMarkersCommentSidesheetQueryType>(
    PullRequestMarkersCommentSidesheetQuery,
  )

  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      loadQuery({owner, repo: name, number}, {fetchPolicy: 'store-or-network'})
    })
  }, [loadQuery, owner, name, number])

  if (!queryReference) return null
  return <AnnotationsSidePanelWrapper {...rest} queryReference={queryReference} />
}
