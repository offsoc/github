import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SponsorsDashboardYourSponsors} from '../SponsorsDashboardYourSponsors'
import {getSponsorsDashboardYourSponsorsProps} from '../test-utils/mock-data'

// Jest does not support scrollIntoView
jest.mock('@primer/behaviors')

// @ts-expect-error overriding window.location in test
delete window.location
window.location = {hash: ''} as Location
const setHrefSpy = jest.fn()
Object.defineProperty(window.location, 'href', {
  set: setHrefSpy,
  get: () => 'test',
})

describe('SponsorsDashboardYourSponsors', () => {
  it('defaults to all sponsors', async () => {
    const props = getSponsorsDashboardYourSponsorsProps()
    render(<SponsorsDashboardYourSponsors {...props} />)
    expect(screen.getByRole('button').textContent).toBe('Filter: All sponsors (4 sponsors)')
  })

  it('supports no tiers or sponsors', async () => {
    render(<SponsorsDashboardYourSponsors tiers={{}} defaultPath="/test" />)
    expect(screen.getByRole('button').textContent).toBe('Filter: All sponsors (0 sponsors)')
  })

  it('drops down all options and redirects on click', async () => {
    const props = getSponsorsDashboardYourSponsorsProps()
    const {user} = render(<SponsorsDashboardYourSponsors {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    expect(screen.queryAllByRole('option')).toHaveLength(4) // all + 3 tiers
    await user.click(screen.getByRole('option', {name: '$2 one time (2 sponsors)'}))
    expect(setHrefSpy).toHaveBeenCalledTimes(1)
    expect(setHrefSpy).toHaveBeenCalledWith('/sponsors/your_sponsors/?tier_id=2')
  })

  it('filters options', async () => {
    const props = getSponsorsDashboardYourSponsorsProps()
    const {user} = render(<SponsorsDashboardYourSponsors {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')

    await user.click(filterBox)
    await user.paste('Recurring')

    expect(screen.queryAllByRole('option')).toHaveLength(1)
  })

  it('show no matches if filter cannot find anything', async () => {
    const props = getSponsorsDashboardYourSponsorsProps()
    const {user} = render(<SponsorsDashboardYourSponsors {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')
    await user.click(filterBox)
    await user.paste('not-here')
    expect(screen.getByRole('option', {name: 'No matches'})).toBeInTheDocument()
  })
})
