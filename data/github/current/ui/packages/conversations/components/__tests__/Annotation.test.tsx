import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {buildAnnotation} from '../../test-utils/query-data'
import {DiffAnnotationLevels} from '../../types'
import {Annotation} from '../Annotation'

describe('Annotation', () => {
  test('renders basic annotation details', () => {
    const annotationTitle = 'my annotation title'
    const checkSuiteName = 'my check suite name'
    const checkRunName = 'my check run name'
    const annotationMessage = 'this is the annotation message'
    const checkSuiteAppName = 'github-lint'

    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Failure,
      message: annotationMessage,
      title: annotationTitle,
      checkRun: {
        name: checkRunName,
        detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
      },
      checkSuite: {
        name: checkSuiteName,
        app: {
          name: checkSuiteAppName,
          logoUrl: 'http://alambic.github.localhost/avatars/u/2',
        },
      },
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check failure')).toBeInTheDocument()
    expect(screen.getByText(annotationTitle)).toBeInTheDocument()
    expect(screen.getByText(checkRunName)).toBeInTheDocument()
    expect(screen.getByText(checkSuiteName)).toBeInTheDocument()
    expect(screen.getByText(annotationMessage)).toBeInTheDocument()
    expect(screen.getByText('View details')).toBeInTheDocument()
    expect(screen.getByTestId('check-suite-app-avatar')).toBeInTheDocument()
  })

  test('renders failure', () => {
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Failure,
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check failure')).toBeInTheDocument()
  })

  test('renders warning', () => {
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Warning,
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check warning')).toBeInTheDocument()
  })

  test('renders notice', () => {
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Notice,
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check notice')).toBeInTheDocument()
  })

  test('handles null check suite app', () => {
    const checkSuiteName = 'my check suite name'
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Notice,
      checkSuite: {
        name: checkSuiteName,
        app: null,
      },
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check notice')).toBeInTheDocument()
    expect(screen.getByTestId('check-suite-app-avatar')).toBeInTheDocument()
  })

  test('handles null or undefined details url', () => {
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Notice,
      checkRun: {
        name: 'my check run name',
        detailsUrl: null,
      },
    })
    render(<Annotation annotation={annotation} />)
    expect(screen.getByText('Check notice')).toBeInTheDocument()
    expect(screen.queryByText('View details')).not.toBeInTheDocument()
  })
})
