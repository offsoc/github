import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import type {TypeFilter} from '../../types/repos-list-types'
import {Sidebar, SidebarCollapsedButton} from '../Sidebar'

const sampleTypes: TypeFilter[] = [
  {id: 'all', text: 'All'},
  {id: 'public', text: 'Public'},
  {id: 'private', text: 'Private'},
]

describe('repos-list Sidebar', () => {
  it('renders collapsed button', async () => {
    const queryChangedMock = jest.fn()
    const {user} = render(
      <SidebarCollapsedButton listTitle="Green" types={sampleTypes} type="" onQueryChanged={queryChangedMock} />,
    )

    const button = screen.getByRole('button', {name: 'Green repositories'})
    expect(button).toBeInTheDocument()

    user.click(screen.getByRole('button'))

    const publicOption = await screen.findByRole('link', {name: 'Public'})
    expect(publicOption).toBeInTheDocument()
    user.click(publicOption)

    await waitFor(() => expect(queryChangedMock).toHaveBeenCalledWith('visibility:public archived:false'))
  })

  it('renders sidebar', async () => {
    const queryChangedMock = jest.fn()
    const {user} = render(<Sidebar types={sampleTypes} type="" onQueryChanged={queryChangedMock} />)

    const publicOption = screen.getByRole('link', {name: 'Public'})
    expect(publicOption).toBeInTheDocument()
    user.click(publicOption)

    await waitFor(() => expect(queryChangedMock).toHaveBeenCalledWith('visibility:public archived:false'))
  })
})
