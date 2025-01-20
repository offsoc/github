import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, Text} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {Suspense, useEffect} from 'react'
import {graphql, type PreloadedQuery, usePreloadedQuery, useQueryLoader} from 'react-relay'

import {LABELS} from '../constants/labels'
import type {EditHistoryDialogQuery} from './__generated__/EditHistoryDialogQuery.graphql'
import {CouldNotFindFallbackError} from './CouldNotFindFallbackError'
import {ActorOperationDetails, EditHistoryDialogHeader} from './EditHistoryDialogHeader'
import {TextDiffViewer} from './TextDiffViewer'

type EditHistoryDialogProps = {
  userContentEditId: string
  onClose: () => void
}

const EditHistoryContentGraphql = graphql`
  query EditHistoryDialogQuery($id: ID!) {
    node(id: $id) {
      ... on UserContentEdit {
        diff
        diffBefore
        deletedAt
        deletedBy {
          login
        }
        ...EditHistoryDialogHeaderFragment
      }
    }
  }
`

export const EditHistoryDialog = ({userContentEditId, onClose}: EditHistoryDialogProps) => {
  return (
    <Dialog
      renderBody={() => <EditContent userContentEditId={userContentEditId} />}
      onClose={onClose}
      title={LABELS.editHistory.viewingEditTitle}
      width="xlarge"
      height="auto"
      sx={{
        width: '100%',
        margin: 4,
        maxWidth: '800px',
        maxHeight: 'clamp(300px, 80vh, 800px)',
      }}
    />
  )
}

const EditContent = ({userContentEditId}: Pick<EditHistoryDialogProps, 'userContentEditId'>) => {
  const [queryRef, loadEditContent] = useQueryLoader<EditHistoryDialogQuery>(EditHistoryContentGraphql)

  useEffect(() => {
    loadEditContent({id: userContentEditId})
  }, [loadEditContent, userContentEditId])

  if (!queryRef) return <EditContentLoading />

  return (
    <Suspense fallback={<EditContentLoading />}>
      <PreloadedQueryBoundary
        onRetry={() => loadEditContent({id: userContentEditId}, {fetchPolicy: 'network-only'})}
        fallback={retry => <CouldNotFindFallbackError retry={retry} />}
      >
        <EditContentInternal queryRef={queryRef} userContentEditId={userContentEditId} />
      </PreloadedQueryBoundary>
    </Suspense>
  )
}

const EditContentInternal = ({
  queryRef,
  userContentEditId,
}: {
  queryRef: PreloadedQuery<EditHistoryDialogQuery>
  userContentEditId: string
}) => {
  const preloadedData = usePreloadedQuery<EditHistoryDialogQuery>(EditHistoryContentGraphql, queryRef)
  const data = preloadedData.node
  if (!data) return <EditContentLoading />

  // This should only be possible to happen on the first creation of an issue body
  const emptyDiff = !data.diffBefore && !data.diff

  return (
    <Box sx={{overflowY: 'auto'}}>
      <EditHistoryDialogHeader queryRef={data} userContentEditId={userContentEditId} />
      <Box sx={{p: 3}}>
        {!data.deletedAt && !emptyDiff && (
          <TextDiffViewer before={data.diffBefore ?? undefined} after={data.diff ?? undefined} />
        )}
        {!data.deletedAt && emptyDiff && (
          <Text sx={{color: 'fg.muted', fontStyle: 'italic'}}>{LABELS.editHistory.emptyEdit}</Text>
        )}
        {data.deletedAt && (
          <ActorOperationDetails
            login={data.deletedBy?.login}
            details={LABELS.editHistory.deletedThisRevision}
            time={data.deletedAt}
            sx={{color: 'fg.muted', fontStyle: 'italic'}}
          />
        )}
      </Box>
    </Box>
  )
}

function EditContentLoading() {
  return (
    <Box sx={{m: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
      <LoadingSkeleton variant="rounded" height="md" width="100%" />
      <LoadingSkeleton variant="rounded" height="md" width="100%" />
    </Box>
  )
}
