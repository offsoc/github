import {render, screen} from '@testing-library/react'

import {TracksToken} from '../../../client/components/fields/tracks/tracks-token'

describe('TracksToken', () => {
  it('renders completed / total', () => {
    render(<TracksToken progress={{percent: 55, completed: 110, total: 200}} />)
    const progress = screen.getByText('110 of 200')
    expect(progress).toBeInTheDocument()
  })
})
