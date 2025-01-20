import {ReactionViewerLoading} from '@github-ui/reaction-viewer/ReactionViewerLoading'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export const CommentLoading = () => {
  const lineCount = 2

  return (
    <div className="d-flex gap-2">
      <div className="flex-1 border overflow-x-auto rounded-2 borderColor-muted color-shadow-small">
        <div className="d-flex flex-column gap-2 m-3">
          <div className="d-flex flex-items-center gap-2">
            <LoadingSkeleton variant="elliptical" height="xl" width="xl" />
            <LoadingSkeleton variant="rounded" height="sm" width="150px" />
          </div>

          {[...Array(lineCount)].map((_, index) => (
            <LoadingSkeleton key={index} variant="rounded" height="sm" width="random" />
          ))}
          <ReactionViewerLoading />
        </div>
      </div>
    </div>
  )
}
