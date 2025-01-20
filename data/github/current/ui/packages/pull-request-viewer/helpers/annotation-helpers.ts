import type {DiffAnnotation, DiffAnnotationLevels} from '@github-ui/conversations'

import type {PullRequestMarkersAnnotations_pullRequest$data} from '../components/__generated__/PullRequestMarkersAnnotations_pullRequest.graphql'
import {notEmpty} from './not-empty'

export type DiffAnnotationsByPathMap = {
  [path: string]: DiffAnnotationsByEndLineMap
}

export type DiffAnnotationsByEndLineMap = {
  [endLineNumber: number]: DiffAnnotation[]
}

/**
 * Transforms annotations data into a flat list of valid annotations (e.g. not null, has checkRun)
 */
export function filterValidAnnotations(
  data: Omit<PullRequestMarkersAnnotations_pullRequest$data, ' $fragmentSpreads' | ' $fragmentType'>,
): DiffAnnotation[] {
  return (data.comparison?.annotations?.edges ?? [])
    .map(edge => edge?.node)
    .reduce((result, annotationNode) => {
      if (notEmpty(annotationNode)) {
        result.push({
          ...annotationNode,
          // CheckAnnotation does not yet implement the node interface
          // Since we aren't mutating annotations, we cast __id to id to navigate through markers without doing additional type checks
          id: annotationNode.__id,
          annotationLevel: (annotationNode.annotationLevel ?? 'WARNING') as DiffAnnotationLevels,
          checkRun: {
            // checkRun! below is safe. Even though CheckAnnotation#checkRun is nullable in the graphql schema, it will
            // never be null here because we're retrieving it via PullRequestComparison#annotations, where we lookup
            // check annotations by check_run_id. See PullRequestMarkersCommentSidesheetQuery.
            detailsUrl: annotationNode.checkRun!.detailsUrl,
            name: annotationNode.checkRun!.name,
          },
          checkSuite: annotationNode.checkRun!.checkSuite,
        } as DiffAnnotation)
      }
      return result
    }, [] as DiffAnnotation[])
}

/**
 * Transforms array of annotations into a map of annotations by path and endline
 */
export function groupAnnotationsByPath(diffAnnotations: DiffAnnotation[]): DiffAnnotationsByPathMap {
  const mappedAnnotations: DiffAnnotationsByPathMap = {}

  diffAnnotations.map(annotation => {
    const annotationPath = annotation.path
    const annotationEndLine = annotation?.location?.end?.line

    if (!!annotationPath && !!annotationEndLine) {
      // Ensure path key exists
      mappedAnnotations[annotationPath] = mappedAnnotations[annotationPath] ?? {}
      // Ensure endLine key exists
      mappedAnnotations[annotationPath][annotationEndLine] = mappedAnnotations[annotationPath][annotationEndLine] ?? []

      // Add annotation to map of annotations by path and endline
      mappedAnnotations[annotationPath][annotationEndLine] = [
        ...mappedAnnotations[annotationPath][annotationEndLine],
        annotation,
      ]
    }
  })
  return mappedAnnotations
}
