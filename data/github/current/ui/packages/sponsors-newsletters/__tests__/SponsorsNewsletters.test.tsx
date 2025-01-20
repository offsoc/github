import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SponsorsNewsletters} from '../SponsorsNewsletters'
import {getSponsorsNewslettersProps} from '../test-utils/mock-data'

// Jest does not support scrollIntoView
jest.mock('@primer/behaviors')
jest.setTimeout(15_000)

describe('SponsorsNewsletters', () => {
  it('defaults to all sponsors', async () => {
    const props = getSponsorsNewslettersProps()
    render(<SponsorsNewsletters {...props} />)
    expect(screen.getByRole('button').textContent).toBe('All sponsors (4 sponsors)')
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['1', '2', '3'])
  })

  it('supports no tiers or sponsors', async () => {
    render(<SponsorsNewsletters tiers={{}} />)
    expect(screen.getByRole('button').textContent).toBe('All sponsors (0 sponsors)')
    expect(screen.queryAllByTestId('newsletter-tier-input')).toEqual([])
  })

  it('drops down all options and changes selected on click', async () => {
    const props = getSponsorsNewslettersProps()
    const {user} = render(<SponsorsNewsletters {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    expect(screen.queryAllByRole('option')).toHaveLength(6) // 3 aggregates + 3 tiers
    await user.click(screen.getByRole('option', {name: 'Recurring sponsors (2 sponsors)'}))
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['1', '3'])
  })

  it('supports multiple tier selections', async () => {
    const props = getSponsorsNewslettersProps()
    const getOneTimeAggegateOption = () => screen.getByRole('option', {name: 'One-time sponsors (2 sponsors)'})
    const getRetiredRecurringTierOption = () => screen.getByRole('option', {name: '[retired] $3 a month (1 sponsor)'})
    const getActiveRecurringTierOption = () => screen.getByRole('option', {name: '$1 a month (1 sponsor)'})

    const {user} = render(<SponsorsNewsletters {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    expect(screen.queryAllByRole('option')).toHaveLength(6) // 3 aggregates + 3 tiers
    await user.click(getActiveRecurringTierOption())
    // supports multiple tier selections
    expect(getOneTimeAggegateOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'false')
    expect(getRetiredRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'false')
    expect(getActiveRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button')).toHaveTextContent('$1 a month (1 sponsor)')
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['1'])
    await user.click(getRetiredRecurringTierOption())
    expect(getOneTimeAggegateOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'false')
    expect(getRetiredRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'true')
    expect(getActiveRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button')).toHaveTextContent('$1 a month; $3 a month (2 sponsors)')
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['1', '3'])
    // clears tier selections on aggregate selection
    await user.click(getOneTimeAggegateOption())
    expect(getOneTimeAggegateOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'true')
    expect(getRetiredRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'false')
    expect(getActiveRecurringTierOption() as HTMLOptionElement).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('button')).toHaveTextContent('One-time sponsors (2 sponsors)')
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['2'])
  })

  it('filter options and selects it on click', async () => {
    const props = getSponsorsNewslettersProps()
    const {user} = render(<SponsorsNewsletters {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')

    await user.click(filterBox)
    await user.paste('Recurring')

    expect(screen.queryAllByRole('option')).toHaveLength(1)
    await user.click(screen.getByRole('option'))
    expect(
      (await screen.findAllByTestId('newsletter-tier-input')).map(input => (input as HTMLInputElement).value),
    ).toEqual(['1', '3'])
  })

  it('show no matches if filter cannot find anything', async () => {
    const props = getSponsorsNewslettersProps()
    const {user} = render(<SponsorsNewsletters {...props} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')
    await user.click(filterBox)
    await user.paste('not-here')
    expect(screen.getByRole('option', {name: 'No matches'})).toBeInTheDocument()
  })
})
