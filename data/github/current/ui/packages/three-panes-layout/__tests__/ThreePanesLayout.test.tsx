import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ThreePanesLayout, type PaneWithAriaLabel} from '../ThreePanesLayout'
import {Box} from '@primer/react'

test('Renders the ThreePanesLayout', () => {
  const leftPane: PaneWithAriaLabel = {
    element: <Box sx={{height: '300px'}}>Left pane</Box>,
    ariaLabel: 'Left pane',
  }

  const middlePane = <Box sx={{height: '300px'}}>Middle pane</Box>

  const rightPane: PaneWithAriaLabel = {
    element: <Box sx={{height: '300px'}}>Right pane</Box>,
    ariaLabel: 'Right pane',
  }

  render(<ThreePanesLayout leftPane={leftPane} middlePane={middlePane} rightPane={rightPane} />)

  expect(screen.getByText('Left pane', {exact: true})).toBeInTheDocument()
  expect(screen.getByText('Middle pane', {exact: true})).toBeInTheDocument()
  expect(screen.getByText('Right pane', {exact: true})).toBeInTheDocument()
})
