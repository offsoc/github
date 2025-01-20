import type {DiffAnnotation} from '@github-ui/conversations'
import {DiffAnnotationLevels} from '@github-ui/conversations'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {useRef} from 'react'
import {createMockEnvironment} from 'relay-test-utils'

import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import {PullRequestMarkersDialogContextProvider} from '../../../contexts/PullRequestMarkersContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {buildDiffAnnotation} from '../../../test-utils/query-data'
import {AnnotationsSidePanel} from '../AnnotationsSidePanel'

function TestComponent({diffAnnotations = []}: {diffAnnotations?: DiffAnnotation[]}) {
  const filteredFiles = diffAnnotations.map(annotation => annotation.pathDigest)

  return (
    <PullRequestsAppWrapper environment={createMockEnvironment()} pullRequestId="PR_kwAEAg">
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="PR_kwAEAg"
        repositoryId="mock"
        state="OPEN"
      >
        <PullRequestMarkersDialogContextProvider
          annotationMap={{}}
          diffAnnotations={diffAnnotations}
          filteredFiles={new Set(filteredFiles)}
          setGlobalMarkerNavigationState={jest.fn()}
          threads={[]}
        >
          <AnnotationsSidePanel isOpen={true} returnFocusRef={useRef(null)} onClose={jest.fn} />
        </PullRequestMarkersDialogContextProvider>
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('renders annotation details for every annotation', () => {
  const warning = buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Warning})
  const notice = buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Notice})
  const failure = buildDiffAnnotation({
    annotationLevel: DiffAnnotationLevels.Failure,
    message: 'Failed due to code conflict <mock annotation failure>',
  })
  render(<TestComponent diffAnnotations={[warning, notice, failure]} />)

  // Assert that all 3 annotation links are rendered
  const viewDetailsLinks = screen.getAllByRole('link', {name: 'View details'})
  expect(viewDetailsLinks).toHaveLength(3)
  expect(viewDetailsLinks.map(link => (link as HTMLLinkElement).href)).toEqual([
    warning.checkRun.detailsUrl,
    notice.checkRun.detailsUrl,
    failure.checkRun.detailsUrl,
  ])

  // Assert unique warning annotation info is rendered
  expect(screen.getByText(warning.message)).toBeInTheDocument()
  expect(screen.getByText('Check warning')).toBeInTheDocument()
  expect(screen.getByText(warning.title!)).toBeInTheDocument()

  // Assert unique notice annotation info is rendered
  expect(screen.getByText(notice.message)).toBeInTheDocument()
  expect(screen.getByText('Check notice')).toBeInTheDocument()
  expect(screen.getByText(notice.title!)).toBeInTheDocument()

  // Assert unique failure annotation info is rendered
  expect(screen.getByText(failure.message)).toBeInTheDocument()
  expect(screen.getByText('Check failure')).toBeInTheDocument()
  expect(screen.getByText(failure.title!)).toBeInTheDocument()

  // Assert that all 3 check run and check suite names are rendered
  // these are not unique as we are not overriding defaults in buildDiffAnnotation
  expect(screen.getAllByText(warning.checkRun.name)).toHaveLength(3)
  expect(screen.getAllByText(warning.checkSuite.name!)).toHaveLength(3)
})

test('only renders filtered annotations matching annotation level', async () => {
  const matched = buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Warning})
  const filtered = buildDiffAnnotation({annotationLevel: DiffAnnotationLevels.Notice})
  const {user} = render(<TestComponent diffAnnotations={[matched, filtered]} />)

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('Check warning')).toBeInTheDocument()
  expect(screen.getByText('Check notice')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'w')

  // Assert that only the warning annotation is being rendered with "w" text filter

  await user.type(filterInput, 'arning')

  // Assert that only the warning annotation is being rendered with "warning" text filter
  expect(screen.getByText('Check warning')).toBeInTheDocument()
  expect(screen.queryByText('Check notice')).not.toBeInTheDocument()

  await user.type(filterInput, '!')

  // Assert that no annotations are being rendered with "warning!" text filter
  expect(screen.queryByText('Check warning')).not.toBeInTheDocument()
  expect(screen.queryByText('Check notice')).not.toBeInTheDocument()
})

test('only renders filtered annotations matching annotation message', async () => {
  const {user} = render(
    <TestComponent
      diffAnnotations={[buildDiffAnnotation({message: 'match'}), buildDiffAnnotation({message: 'matched'})]}
    />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('match')).toBeInTheDocument()
  expect(screen.getByText('matched')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'z')

  // Assert that both annotations are not being rendered as "z" is not text matching "match" or "matched"
  expect(screen.queryByText('match')).not.toBeInTheDocument()
  expect(screen.queryByText('matched')).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText('match')).toBeInTheDocument()
  expect(screen.getByText('matched')).toBeInTheDocument()

  await user.type(filterInput, 'm')

  // Assert that both annotations are being rendered as "m" is matching "match" or "matched"
  expect(screen.getByText('match')).toBeInTheDocument()
  expect(screen.getByText('matched')).toBeInTheDocument()

  await user.type(filterInput, 'atch')

  // Assert that both annotations are being rendered as "match" is matching "match" or "matched"
  expect(screen.getByText('match')).toBeInTheDocument()
  expect(screen.getByText('matched')).toBeInTheDocument()

  await user.type(filterInput, 'e')

  // Assert that only 1 annotation is being rendered as "matche" is only matching on "matched"
  expect(screen.queryByText('match')).not.toBeInTheDocument()
  expect(screen.getByText('matched')).toBeInTheDocument()
})

test('only renders filtered annotations matching annotation path', async () => {
  const {user} = render(
    <TestComponent diffAnnotations={[buildDiffAnnotation({path: 'a.tsx'}), buildDiffAnnotation({path: 'b.rb'})]} />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('a.tsx')).toBeInTheDocument()
  expect(screen.getByText('b.rb')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'z.txt')

  // Assert that both annotations are not being rendered as "z.txt" is not text matching "a.tsx" or "b.rb"
  expect(screen.queryByText('a.tsx')).not.toBeInTheDocument()
  expect(screen.queryByText('b.rb')).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText('a.tsx')).toBeInTheDocument()
  expect(screen.getByText('b.rb')).toBeInTheDocument()

  await user.type(filterInput, 'a.ts')

  // Assert that only 1 annotation is being rendered as "a.ts" is only matching on "a.tsx"
  expect(screen.getByText('a.tsx')).toBeInTheDocument()
  expect(screen.queryByText('b.rb')).not.toBeInTheDocument()

  await user.type(filterInput, 'x')

  // Assert that only 1 annotation is being rendered as "a.tsx" is only matching on "a.tsx"
  expect(screen.getByText('a.tsx')).toBeInTheDocument()
  expect(screen.queryByText('b.rb')).not.toBeInTheDocument()

  await user.type(filterInput, '.test')

  // Assert that both annotations are not being rendered as "a.tsx.test" is not text matching "a.tsx" or "b.rb"
  expect(screen.queryByText('a.tsx')).not.toBeInTheDocument()
  expect(screen.queryByText('b.rb')).not.toBeInTheDocument()
})

test('only renders filtered annotations matching annotation title', async () => {
  const {user} = render(
    <TestComponent diffAnnotations={[buildDiffAnnotation({title: 'CTX#1'}), buildDiffAnnotation({title: 'Test#2'})]} />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('CTX#1')).toBeInTheDocument()
  expect(screen.getByText('Test#2')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'Context#Fun')

  // Assert that both annotations are not being rendered as "Context#Fun" is not text matching "CTX#1" or "Test#2"
  expect(screen.queryByText('CTX#1')).not.toBeInTheDocument()
  expect(screen.queryByText('Test#2')).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText('CTX#1')).toBeInTheDocument()
  expect(screen.getByText('Test#2')).toBeInTheDocument()

  await user.type(filterInput, '#')

  // Assert that both annotations are being rendered as "#" is matching on "CTX#1" and "Test#2"
  expect(screen.getByText('CTX#1')).toBeInTheDocument()
  expect(screen.getByText('Test#2')).toBeInTheDocument()

  await user.type(filterInput, '1')

  // Assert that only 1 annotation is being rendered as "#1" is only matching on "CTX#1"
  expect(screen.getByText('CTX#1')).toBeInTheDocument()
  expect(screen.queryByText('Test#2')).not.toBeInTheDocument()

  await user.type(filterInput, '2')

  // Assert that both annotations are not being rendered as "#12" is not text matching "CTX#1" or "Test#2"
  expect(screen.queryByText('CTX#1')).not.toBeInTheDocument()
  expect(screen.queryByText('Test#2')).not.toBeInTheDocument()
})

test('only renders filtered annotations matching annotation check run name', async () => {
  const {user} = render(
    <TestComponent
      diffAnnotations={[
        buildDiffAnnotation({
          checkRun: {
            name: 'eslint-tester',
            detailsUrl: 'eslint-tester/1/job',
          },
        }),
        buildDiffAnnotation({
          checkRun: {
            name: 'jest-tsc',
            detailsUrl: 'jest-tsc/1/job',
          },
        }),
      ]}
    />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('jest-tsc')).toBeInTheDocument()
  expect(screen.getByText('eslint-tester')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'ruby-sorbet')

  // Assert that both annotations are not being rendered as "ruby-sorbet" is not text matching "jest-tsc" or "eslint-tester"
  expect(screen.queryByText('jest-tsc')).not.toBeInTheDocument()
  expect(screen.queryByText('eslint-tester')).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText('jest-tsc')).toBeInTheDocument()
  expect(screen.getByText('eslint-tester')).toBeInTheDocument()

  await user.type(filterInput, 'es')

  // Assert that both annotations are being rendered as "es" is matching on "eslint-tester" and "jest"
  expect(screen.getByText('jest-tsc')).toBeInTheDocument()
  expect(screen.getByText('eslint-tester')).toBeInTheDocument()

  await user.type(filterInput, 't-t')

  // Assert that only 1 annotation is being rendered as "est-t" is only matching on "jest-tsc"
  expect(screen.getByText('jest-tsc')).toBeInTheDocument()
  expect(screen.queryByText('eslint-tester')).not.toBeInTheDocument()

  await user.type(filterInput, 't-tsc!')

  // Assert that both annotations are not being rendered as "est-tsc!" is not text matching on "jest-tsc" or "eslint-tester"
  expect(screen.queryByText('jest-tsc')).not.toBeInTheDocument()
  expect(screen.queryByText('eslint-tester')).not.toBeInTheDocument()
})

test('only renders filtered annotations matching annotation check suite app name', async () => {
  const {user} = render(
    <TestComponent
      diffAnnotations={[
        buildDiffAnnotation({
          checkSuite: {
            name: 'env-production',
            app: {
              name: 'prod-ocotobot',
              logoUrl: 'http://alambic.github.localhost/avatars/u/3',
            },
          },
        }),
        buildDiffAnnotation({
          checkSuite: {
            name: 'env-development',
            app: {
              name: 'development-ocotobot',
              logoUrl: 'http://alambic.github.localhost/avatars/u/3',
            },
          },
        }),
      ]}
    />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText('env-production')).toBeInTheDocument()
  expect(screen.getByText('env-development')).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'env-t')

  // Assert that both annotations are not being rendered as "env-t" is not text matching "env-production" or "env-development"
  expect(screen.queryByText('env-production')).not.toBeInTheDocument()
  expect(screen.queryByText('env-development')).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText('env-production')).toBeInTheDocument()
  expect(screen.getByText('env-development')).toBeInTheDocument()

  await user.type(filterInput, 'env-')

  // Assert that both annotations are being rendered as "env-" is matching on "env-development" and "jest"
  expect(screen.getByText('env-production')).toBeInTheDocument()
  expect(screen.getByText('env-development')).toBeInTheDocument()

  await user.type(filterInput, 'p')

  // Assert that only 1 annotation is being rendered as "est-p" is only matching on "env-production"
  expect(screen.getByText('env-production')).toBeInTheDocument()
  expect(screen.queryByText('env-development')).not.toBeInTheDocument()

  await user.type(filterInput, 'roduction!')

  // Assert that both annotations are not being rendered as "env-production!" is not text matching on "env-production" or "env-development"
  expect(screen.queryByText('env-production')).not.toBeInTheDocument()
  expect(screen.queryByText('env-development')).not.toBeInTheDocument()
})

test('only renders filtered annotations matching annotation check suite name', async () => {
  const prodCheckSuite = 'env-production'
  const devCheckSuite = 'env-development'

  const {user} = render(
    <TestComponent
      diffAnnotations={[
        buildDiffAnnotation({
          checkSuite: {
            name: 'env-production',
            app: {
              name: 'octobot-prod',
              logoUrl: 'http://alambic.github.localhost/avatars/u/3',
            },
          },
        }),
        buildDiffAnnotation({
          checkSuite: {
            name: 'env-development',
            app: {
              name: 'octobot-dev',
              logoUrl: 'http://alambic.github.localhost/avatars/u/3',
            },
          },
        }),
      ]}
    />,
  )

  // Assert that both annotations are being rendered before user filters
  expect(screen.getByText(prodCheckSuite)).toBeInTheDocument()
  expect(screen.getByText(devCheckSuite)).toBeInTheDocument()

  const filterInput = screen.getByPlaceholderText('Filter annotations…')
  await user.type(filterInput, 'octobot-t')

  // Assert that both annotations are not being rendered as "env-t" is not text matching "octobot-dev" or "octobot-prod"
  expect(screen.queryByText(prodCheckSuite)).not.toBeInTheDocument()
  expect(screen.queryByText(devCheckSuite)).not.toBeInTheDocument()

  await user.clear(filterInput)

  // Assert that both annotations are being rendered because filter input is cleared
  expect(screen.getByText(prodCheckSuite)).toBeInTheDocument()
  expect(screen.getByText(devCheckSuite)).toBeInTheDocument()

  await user.type(filterInput, 'octobot-')

  // Assert that both annotations are being rendered as "env-" is matching on "octobot-prod" and "jest"
  expect(screen.getByText(prodCheckSuite)).toBeInTheDocument()
  expect(screen.getByText(devCheckSuite)).toBeInTheDocument()

  await user.type(filterInput, 'p')

  // Assert that only 1 annotation is being rendered as "est-p" is only matching on "octobot-dev"
  expect(screen.getByText(prodCheckSuite)).toBeInTheDocument()
  expect(screen.queryByText(devCheckSuite)).not.toBeInTheDocument()

  await user.type(filterInput, 'rod!')

  // Assert that both annotations are not being rendered as "octobot-prod!" is not text matching on "octobot-dev" or "octobot-prod"
  expect(screen.queryByText(prodCheckSuite)).not.toBeInTheDocument()
  expect(screen.queryByText(devCheckSuite)).not.toBeInTheDocument()
})
