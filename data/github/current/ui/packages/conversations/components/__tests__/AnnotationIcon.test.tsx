import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {DiffAnnotationLevels} from '../../types'
import {AnnotationIcon} from '../AnnotationIcon'

describe('Annotation Icon', () => {
  test('it renders the correct label for failure', () => {
    render(<AnnotationIcon annotationLevel={DiffAnnotationLevels.Failure} />)

    expect(screen.getByLabelText('Check failure')).toBeInTheDocument()
  })

  test('it renders the correct label for warning', () => {
    render(<AnnotationIcon annotationLevel={DiffAnnotationLevels.Warning} />)

    expect(screen.getByLabelText('Check warning')).toBeInTheDocument()
  })

  test('it renders the correct label for notice', () => {
    render(<AnnotationIcon annotationLevel={DiffAnnotationLevels.Notice} />)

    expect(screen.getByLabelText('Check notice')).toBeInTheDocument()
  })

  test('it accepts an optional class name', () => {
    render(<AnnotationIcon annotationLevel={DiffAnnotationLevels.Notice} className="avatar-stack" />)

    const icon = screen.getByLabelText('Check notice')
    expect(icon.classList.contains('avatar-stack')).toBe(true)
  })
})
