import {DiffAnnotationLevels} from '@github-ui/conversations'

import type {PullRequestMarkersAnnotations_pullRequest$data} from '../../components/__generated__/PullRequestMarkersAnnotations_pullRequest.graphql'
import {filterValidAnnotations, groupAnnotationsByPath} from '../annotation-helpers'

/**
 * Stubbed annotation query response that includes:
 *   - 2 valid annotations on changed files (1 failure, 1 warning)
 *   - 1 valid annotation on unchanged file (1 notice)
 */
const queryData: Omit<PullRequestMarkersAnnotations_pullRequest$data, ' $fragmentSpreads' | ' $fragmentType'> = {
  comparison: {
    annotations: {
      edges: [
        {
          node: {
            __id: 'annotation-1',
            annotationLevel: DiffAnnotationLevels.Failure,
            databaseId: 1,
            checkRun: {
              checkSuite: {
                app: {
                  logoUrl: '/identicons/app/app/checks-buddy',
                  name: 'Checks Buddy',
                },
                name: 'Namfix',
              },
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
              name: 'github-all-features',
            },
            location: {
              end: {
                line: 3,
              },
              start: {
                line: 2,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'contributing.md',
            pathDigest: '0b82d9a8fc9c94f7729e7685fca44dd89a479746f7cb14171e6dcdc7beb94387',
            rawDetails: '/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22./lib/readme.md:168',
            title: 'AuthorizationContext#test_object_has_appropriate_scope',
          },
        },
        {
          node: {
            __id: 'annotation-2',
            annotationLevel: DiffAnnotationLevels.Warning,
            databaseId: 2,
            checkRun: {
              checkSuite: {
                app: {
                  logoUrl: '/identicons/app/app/checks-buddy',
                  name: 'Checks Buddy',
                },
                name: 'Namfix',
              },
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
              name: 'github-all-features',
            },
            location: {
              end: {
                line: 1,
              },
              start: {
                line: 1,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'evergreen.md',
            pathDigest: '5f1d74daafd8220ef02fadac02e113f9678fdd6fde0cf506a03bbcb667ad2235',
            rawDetails: null,
            title: 'MemberContext#test_does_not_include_member',
          },
        },
        {
          node: {
            __id: 'annotation-3',
            annotationLevel: DiffAnnotationLevels.Notice,
            databaseId: 3,
            checkRun: {
              checkSuite: {
                app: {
                  name: 'Checks Buddy',
                  logoUrl: '/identicons/app/app/checks-buddy',
                },
                name: 'Namfix',
              },
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/13',
              name: 'github-all-features',
            },
            location: {
              end: {
                line: 4,
              },
              start: {
                line: 1,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'non-diff-annotation-file.md',
            pathDigest: '0ebcfa3266ee62da2424f0c76d3bfcdd38c632aa239f98795f2f574fe929645e',
            rawDetails: null,
            title: 'non-diff-annotation-file.md#L1-L2',
          },
        },
      ],
    },
  },
}

describe('filter annotations', () => {
  test('it returns a flat list of valid annotations', () => {
    const result = filterValidAnnotations(queryData)

    expect(result).toEqual([
      {
        __id: 'annotation-1',
        annotationLevel: 'FAILURE',
        checkRun: {
          detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
          name: 'github-all-features',
        },
        checkSuite: {
          app: {
            logoUrl: '/identicons/app/app/checks-buddy',
            name: 'Checks Buddy',
          },
          name: 'Namfix',
        },
        databaseId: 1,
        id: 'annotation-1',
        location: {
          end: {
            line: 3,
          },
          start: {
            line: 2,
          },
        },
        message: 'This might be problematic in the future because X.',
        path: 'contributing.md',
        pathDigest: '0b82d9a8fc9c94f7729e7685fca44dd89a479746f7cb14171e6dcdc7beb94387',
        rawDetails: '/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22./lib/readme.md:168',
        title: 'AuthorizationContext#test_object_has_appropriate_scope',
      },
      {
        __id: 'annotation-2',
        annotationLevel: 'WARNING',
        checkRun: {
          detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
          name: 'github-all-features',
        },
        checkSuite: {
          app: {
            logoUrl: '/identicons/app/app/checks-buddy',
            name: 'Checks Buddy',
          },
          name: 'Namfix',
        },
        databaseId: 2,
        id: 'annotation-2',
        location: {
          end: {
            line: 1,
          },
          start: {
            line: 1,
          },
        },
        message: 'This might be problematic in the future because X.',
        path: 'evergreen.md',
        pathDigest: '5f1d74daafd8220ef02fadac02e113f9678fdd6fde0cf506a03bbcb667ad2235',
        rawDetails: null,
        title: 'MemberContext#test_does_not_include_member',
      },
      {
        __id: 'annotation-3',
        annotationLevel: DiffAnnotationLevels.Notice,
        checkRun: {
          detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/13',
          name: 'github-all-features',
        },
        checkSuite: {
          app: {
            name: 'Checks Buddy',
            logoUrl: '/identicons/app/app/checks-buddy',
          },
          name: 'Namfix',
        },
        databaseId: 3,
        id: 'annotation-3',
        location: {
          end: {
            line: 4,
          },
          start: {
            line: 1,
          },
        },
        message: 'This might be problematic in the future because X.',
        path: 'non-diff-annotation-file.md',
        pathDigest: '0ebcfa3266ee62da2424f0c76d3bfcdd38c632aa239f98795f2f574fe929645e',
        rawDetails: null,
        title: 'non-diff-annotation-file.md#L1-L2',
      },
    ])
  })
})

describe('group annotations by path', () => {
  test('it returns a map of annotations grouped by path and start line', () => {
    const diffAnnotations = filterValidAnnotations(queryData)
    const result = groupAnnotationsByPath(diffAnnotations)

    expect(result).toEqual({
      'contributing.md': {
        '3': [
          {
            __id: 'annotation-1',
            annotationLevel: 'FAILURE',
            checkRun: {
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
              name: 'github-all-features',
            },
            checkSuite: {
              app: {
                logoUrl: '/identicons/app/app/checks-buddy',
                name: 'Checks Buddy',
              },
              name: 'Namfix',
            },
            databaseId: 1,
            id: 'annotation-1',
            location: {
              end: {
                line: 3,
              },
              start: {
                line: 2,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'contributing.md',
            pathDigest: '0b82d9a8fc9c94f7729e7685fca44dd89a479746f7cb14171e6dcdc7beb94387',
            rawDetails: '/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22./lib/readme.md:168',
            title: 'AuthorizationContext#test_object_has_appropriate_scope',
          },
        ],
      },
      'evergreen.md': {
        '1': [
          {
            __id: 'annotation-2',
            annotationLevel: 'WARNING',
            checkRun: {
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
              name: 'github-all-features',
            },
            checkSuite: {
              app: {
                logoUrl: '/identicons/app/app/checks-buddy',
                name: 'Checks Buddy',
              },
              name: 'Namfix',
            },
            databaseId: 2,
            id: 'annotation-2',
            location: {
              end: {
                line: 1,
              },
              start: {
                line: 1,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'evergreen.md',
            pathDigest: '5f1d74daafd8220ef02fadac02e113f9678fdd6fde0cf506a03bbcb667ad2235',
            rawDetails: null,
            title: 'MemberContext#test_does_not_include_member',
          },
        ],
      },
      'non-diff-annotation-file.md': {
        '4': [
          {
            __id: 'annotation-3',
            annotationLevel: 'NOTICE',
            checkRun: {
              detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/13',
              name: 'github-all-features',
            },
            checkSuite: {
              app: {
                name: 'Checks Buddy',
                logoUrl: '/identicons/app/app/checks-buddy',
              },
              name: 'Namfix',
            },
            databaseId: 3,
            id: 'annotation-3',
            location: {
              end: {
                line: 4,
              },
              start: {
                line: 1,
              },
            },
            message: 'This might be problematic in the future because X.',
            path: 'non-diff-annotation-file.md',
            pathDigest: '0ebcfa3266ee62da2424f0c76d3bfcdd38c632aa239f98795f2f574fe929645e',
            rawDetails: null,
            title: 'non-diff-annotation-file.md#L1-L2',
          },
        ],
      },
    })
  })
})
