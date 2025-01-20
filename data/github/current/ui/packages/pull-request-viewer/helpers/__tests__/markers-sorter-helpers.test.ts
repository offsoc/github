import type {DiffAnnotation, NavigationThread} from '@github-ui/conversations'
import {DiffAnnotationLevels} from '@github-ui/conversations'

import {markerSorter} from '../markers-sorter-helpers'

const diffAnnotations: DiffAnnotation[] = [
  {
    id: '1z',
    __id: '1z',
    annotationLevel: DiffAnnotationLevels.Warning,
    databaseId: 456,
    location: {
      start: {
        line: 4,
      },
      end: {
        line: 5,
      },
    },
    message: 'message',
    rawDetails: 'raw details',
    path: 'a-file-path',
    pathDigest: 'mock-path-digest',
    title: 'annotation-title',
    checkRun: {
      name: 'check-run-name',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      app: {
        name: 'github-app',
        logoUrl: 'http://alambic.github.localhost/avatars/u/2',
      },
      name: 'check-suite-name',
    },
  },
  {
    id: '1a',
    __id: '1a',
    annotationLevel: DiffAnnotationLevels.Warning,
    databaseId: 13,
    location: {
      start: {
        line: 4,
      },
      end: {
        line: 5,
      },
    },
    message: 'message',
    rawDetails: 'raw details',
    path: 'b-file-path',
    pathDigest: 'mock-path-digest',
    title: 'annotation-title',
    checkRun: {
      name: 'check-run-name',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      app: {
        name: 'github-app',
        logoUrl: 'http://alambic.github.localhost/avatars/u/2',
      },
      name: 'check-suite-name',
    },
  },
  {
    id: '1b',
    __id: '1b',
    annotationLevel: DiffAnnotationLevels.Warning,
    databaseId: 12,
    location: {
      start: {
        line: 4,
      },
      end: {
        line: 5,
      },
    },
    message: 'message',
    rawDetails: 'raw details',
    path: 'A-file-path',
    pathDigest: 'mock-path-digest',
    title: 'annotation-title',
    checkRun: {
      name: 'check-run-name',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      app: {
        name: 'github-app',
        logoUrl: 'http://alambic.github.localhost/avatars/u/2',
      },
      name: 'check-suite-name',
    },
  },
  {
    id: '1c',
    __id: '1c',
    annotationLevel: DiffAnnotationLevels.Warning,
    databaseId: 123,
    location: {
      start: {
        line: 4,
      },
      end: {
        line: 8,
      },
    },
    message: 'message',
    rawDetails: 'raw details',
    path: 'a-file-path',
    pathDigest: 'mock-path-digest',
    title: 'annotation-title',
    checkRun: {
      name: 'check-run-name',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      app: {
        name: 'github-app',
        logoUrl: 'http://alambic.github.localhost/avatars/u/2',
      },
      name: 'check-suite-name',
    },
  },
]

const threads: NavigationThread[] = [
  {
    id: '2a',
    pathDigest: '2a',
    isResolved: false,
    firstReviewCommentId: 1,
    line: 1,
    path: 'a-file-path',
  },
  {
    id: '2b',
    pathDigest: '2b',
    isResolved: false,
    firstReviewCommentId: 1,
    line: 8,
    path: 'a-file-path',
  },
  {
    id: '2c',
    pathDigest: '2c',
    isResolved: false,
    firstReviewCommentId: 1,
    line: 1,
    path: 'b-file-path',
  },
  {
    id: '2c',
    pathDigest: '2c',
    isResolved: false,
    firstReviewCommentId: 1,
    line: null,
    path: 'a-file-path',
  },
  {
    id: '2c',
    pathDigest: '2c',
    isResolved: false,
    firstReviewCommentId: 1,
    line: 1,
    path: 'c-folder/a-folder/c-file-path',
  },
  {
    id: '2c',
    pathDigest: '2c',
    isResolved: false,
    firstReviewCommentId: 1,
    line: 1,
    path: 'c-folder/z-file-path',
  },
]

test('it returns a sorted array of annotations and threads, grouped by path, then line position in path', () => {
  const result = markerSorter([...diffAnnotations, ...threads])
  expect(result).toEqual([
    {
      id: '2c',
      pathDigest: '2c',
      isResolved: false,
      firstReviewCommentId: 1,
      line: null,
      path: 'a-file-path',
    },
    {
      id: '2a',
      pathDigest: '2a',
      isResolved: false,
      firstReviewCommentId: 1,
      line: 1,
      path: 'a-file-path',
    },
    {
      id: '1z',
      __id: '1z',
      annotationLevel: DiffAnnotationLevels.Warning,
      databaseId: 456,
      location: {
        start: {
          line: 4,
        },
        end: {
          line: 5,
        },
      },
      message: 'message',
      rawDetails: 'raw details',
      path: 'a-file-path',
      pathDigest: 'mock-path-digest',
      title: 'annotation-title',
      checkRun: {
        name: 'check-run-name',
        detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
      },
      checkSuite: {
        app: {
          name: 'github-app',
          logoUrl: 'http://alambic.github.localhost/avatars/u/2',
        },
        name: 'check-suite-name',
      },
    },
    {
      id: '1c',
      __id: '1c',
      annotationLevel: DiffAnnotationLevels.Warning,
      databaseId: 123,
      location: {
        start: {
          line: 4,
        },
        end: {
          line: 8,
        },
      },
      message: 'message',
      rawDetails: 'raw details',
      path: 'a-file-path',
      pathDigest: 'mock-path-digest',
      title: 'annotation-title',
      checkRun: {
        name: 'check-run-name',
        detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
      },
      checkSuite: {
        app: {
          name: 'github-app',
          logoUrl: 'http://alambic.github.localhost/avatars/u/2',
        },
        name: 'check-suite-name',
      },
    },
    {
      id: '2b',
      pathDigest: '2b',
      isResolved: false,
      firstReviewCommentId: 1,
      line: 8,
      path: 'a-file-path',
    },
    {
      id: '1b',
      __id: '1b',
      annotationLevel: DiffAnnotationLevels.Warning,
      databaseId: 12,
      location: {
        start: {
          line: 4,
        },
        end: {
          line: 5,
        },
      },
      message: 'message',
      rawDetails: 'raw details',
      path: 'A-file-path',
      pathDigest: 'mock-path-digest',
      title: 'annotation-title',
      checkRun: {
        name: 'check-run-name',
        detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
      },
      checkSuite: {
        app: {
          name: 'github-app',
          logoUrl: 'http://alambic.github.localhost/avatars/u/2',
        },
        name: 'check-suite-name',
      },
    },
    {
      id: '2c',
      pathDigest: '2c',
      isResolved: false,
      firstReviewCommentId: 1,
      line: 1,
      path: 'b-file-path',
    },
    {
      id: '1a',
      __id: '1a',
      annotationLevel: DiffAnnotationLevels.Warning,
      databaseId: 13,
      location: {
        start: {
          line: 4,
        },
        end: {
          line: 5,
        },
      },
      message: 'message',
      rawDetails: 'raw details',
      path: 'b-file-path',
      pathDigest: 'mock-path-digest',
      title: 'annotation-title',
      checkRun: {
        name: 'check-run-name',
        detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
      },
      checkSuite: {
        app: {
          name: 'github-app',
          logoUrl: 'http://alambic.github.localhost/avatars/u/2',
        },
        name: 'check-suite-name',
      },
    },
    {
      id: '2c',
      pathDigest: '2c',
      isResolved: false,
      firstReviewCommentId: 1,
      line: 1,
      path: 'c-folder/z-file-path',
    },
    {
      id: '2c',
      pathDigest: '2c',
      isResolved: false,
      firstReviewCommentId: 1,
      line: 1,
      path: 'c-folder/a-folder/c-file-path',
    },
  ])
})
