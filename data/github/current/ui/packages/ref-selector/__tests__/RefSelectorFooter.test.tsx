import {render as coreRender} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {RefSelectorFooter} from '../RefSelectorFooter'

describe('RefSelectorFooter', () => {
  test('Can render a link item', async () => {
    coreRender(<RefSelectorFooter text={'Custom footer item'} />)

    expect(screen.getByRole('button', {name: 'Custom footer item'})).toBeInTheDocument()
  })

  test('Can render a button item', async () => {
    coreRender(<RefSelectorFooter text={'Custom footer item'} href="/pulls" />)

    expect(screen.getByRole('link', {name: 'Custom footer item'})).toBeInTheDocument()
  })

  test('Clicking item fires the onClick event', async () => {
    const onClick = jest.fn()

    coreRender(<RefSelectorFooter text={'Custom footer item'} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
