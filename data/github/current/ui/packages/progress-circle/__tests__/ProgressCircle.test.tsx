import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ProgressCircle} from '../ProgressCircle'

test('Renders the ProgressCircle', () => {
  render(<ProgressCircle percentCompleted={50} />)
  expect(screen.getByRole('presentation', {hidden: true})).toBeInTheDocument()
})
