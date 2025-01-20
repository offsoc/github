import type {DiffAnnotation, NavigationThread} from '@github-ui/conversations'

function isAnnotation(marker: DiffAnnotation | NavigationThread): marker is DiffAnnotation {
  return (marker as DiffAnnotation).location !== undefined
}
// custom sorting method by path
// returns -1 if a comes first
// returns 0 if a and b are the same
// returns 1 if b comes first
function pathCompare(a: NavigationThread | DiffAnnotation, b: NavigationThread | DiffAnnotation) {
  const aParts = a.path.split('/')
  const bParts = b.path.split('/')

  // if a file and a directory live at the same path, the file comes first
  //  example: "foo/zzz" comes before "foo/bar/baz"
  if (aParts.length !== bParts.length) {
    const minPartsLength = Math.min(aParts.length, bParts.length)
    const aTruncatedPath = aParts.slice(0, minPartsLength - 1).join('/')
    const bTruncatedPath = bParts.slice(0, minPartsLength - 1).join('/')
    if (aTruncatedPath === bTruncatedPath) {
      if (aParts.length < bParts.length) {
        return -1
      }
      if (aParts.length > bParts.length) {
        return 1
      }
      return 0
    }
  }
  //  we want capitals to come after lowercase, which
  //  is reversed from normal order
  if (a.path.toLowerCase() === b.path.toLowerCase()) {
    return a.path.localeCompare(b.path)
  } else {
    return a.path.localeCompare(b.path, 'en', {sensitivity: 'base'})
  }
}

// custom sorting method by end line number
// returns -1 if a comes first
// returns 0 if a and b are the same
// returns 1 if b comes first
function positionSorter(markerA: NavigationThread | DiffAnnotation, markerB: NavigationThread | DiffAnnotation) {
  const a = isAnnotation(markerA) ? markerA.location.end.line : markerA.line
  const b = isAnnotation(markerB) ? markerB.location.end.line : markerB.line
  // equal items sort equally
  if (a === b) {
    return 0
  }
  // nulls sort before anything else since it is a file level comment
  if (a === null || a === undefined) {
    return -1
  }
  if (b === null || b === undefined) {
    return 1
  }
  //  sort ascending, lowest sorts first
  return a < b ? -1 : 1
}

export function markerSorter(markersArray: Array<DiffAnnotation | NavigationThread>) {
  return markersArray.sort((a: NavigationThread | DiffAnnotation, b: NavigationThread | DiffAnnotation) => {
    const pathComparison = pathCompare(a, b)
    if (pathComparison === 0) {
      // TODO: expose timestamps on PullRequestThread and Annotation object.
      // add third layer in nested sort if positionSorter === 0 to return most recent object based on createdAt.
      return positionSorter(a, b)
    }
    return pathComparison
  })
}
