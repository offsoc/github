import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SponsorsMeetTheTeamList} from '../SponsorsMeetTheTeamList'
import {getSponsorsMeetTheTeamListProps} from '../test-utils/mock-data'

test('Renders the SponsorsMeetTheTeamList', () => {
  const props = getSponsorsMeetTheTeamListProps()
  render(<SponsorsMeetTheTeamList {...props} />)

  const {featuredItems} = props
  for (const item of featuredItems) {
    expect(screen.getByTestId(`sponsors-featured-user-${item.title}`)).toBeInTheDocument()
  }
})
