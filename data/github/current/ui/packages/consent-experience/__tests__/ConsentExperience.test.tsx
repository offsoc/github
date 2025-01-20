import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ConsentExperience} from '../ConsentExperience'
import {getConsentExperienceProps} from '../test-utils/mock-data'

test('Renders the ConsentExperience', () => {
  const props = getConsentExperienceProps()
  render(<ConsentExperience {...props} />)

  expect(screen.getByTestId('consent-experience')).toBeInTheDocument()
})

test('Renders consent inputs, one checkbox and one hidden, to ensure a consent value is always sent', () => {
  const props = getConsentExperienceProps()
  render(<ConsentExperience {...props} />)

  const hiddenConsent = screen.getByTestId('hidden-consent')
  const checkbox = screen.getByRole('checkbox')

  expect(hiddenConsent).toBeInTheDocument()
  expect(hiddenConsent).toHaveAttribute('name', props.fieldName)
  expect(hiddenConsent).toHaveAttribute('value', '0')

  expect(checkbox).toBeInTheDocument()
  expect(checkbox).toHaveAttribute('name', props.fieldName)
  expect(checkbox).toHaveAttribute('value', '1')
})

test('Includes link to GitHub privacy statement', () => {
  const props = getConsentExperienceProps()
  render(<ConsentExperience {...props} />)

  const link = screen.getByRole('link', {name: 'GitHub Privacy Statement'})

  expect(link).toBeInTheDocument()
  expect(link).toHaveAttribute('href', props.privacyStatementHref)
})

test('Ensures the consent checkbox is not required', () => {
  const props = getConsentExperienceProps()
  render(<ConsentExperience {...props} />)

  const checkbox = screen.getByRole('checkbox')
  expect(checkbox).not.toHaveAttribute('required')
})

test('Checkbox is unchecked when country changes', async () => {
  const props = getConsentExperienceProps()
  const {user} = render(
    <>
      <select className="js-country-select">
        <option>Select a country</option>
        <option value="CA">Canada</option>
      </select>

      <ConsentExperience {...props} />
    </>,
  )

  const checkbox = screen.getByRole('checkbox')

  await user.click(checkbox)
  expect(checkbox).toBeChecked()

  await user.selectOptions(screen.getByRole('combobox'), 'CA')

  const checkboxAgain = screen.getByRole('checkbox')
  expect(checkboxAgain).not.toBeChecked()
})

describe('With Canada selected', () => {
  const CanadaCountrySelect = () => {
    return (
      <select className="js-country-select">
        <option>Select a country</option>
        <option value="CA">Canada</option>
      </select>
    )
  }

  test('Shows Canada-specific language', async () => {
    const expectedCopy =
      'Yes, please, I’d like to hear from GitHub and its family of companies via email for personalized communications, targeted advertising, and campaign effectiveness.'

    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <CanadaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'CA')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Canada'}).selected).toBe(true)

    const consentExperience = screen.getByTestId('consent-experience')
    expect(consentExperience).toHaveTextContent(expectedCopy)
  })

  test('Includes links to privacy statement and subscription settings page', async () => {
    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <CanadaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'CA')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Canada'}).selected).toBe(true)

    const privacyStatementLink = screen.getByRole('link', {name: 'GitHub Privacy Statement'})
    const settingsLink = screen.getByRole('link', {name: 'Promotional Communications Manager'})

    expect(privacyStatementLink).toBeInTheDocument()
    expect(privacyStatementLink).toHaveAttribute('href', props.privacyStatementHref)
    expect(settingsLink).toBeInTheDocument()
    expect(settingsLink).toHaveAttribute('href', props.emailSubscriptionSettingsLinkHref)
  })

  test('includes language around phone if `hasPhone` is given', async () => {
    const props = getConsentExperienceProps()

    props.hasPhone = true

    const {user} = render(
      <>
        <CanadaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'CA')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Canada'}).selected).toBe(true)

    const consentExperience = screen.getByTestId('consent-experience')
    expect(consentExperience).toHaveTextContent('email and phone')
  })
})

describe('With China selected', () => {
  const ChinaCountrySelect = () => {
    return (
      <select className="js-country-select">
        <option>Select a country</option>
        <option value="CN">China</option>
      </select>
    )
  }

  it('Includes notice text below the label', async () => {
    const noticeText =
      'Participation requires transferring your personal data to other countries in which GitHub operates, including the United States. By submitting this form, you agree to the transfer of your data outside of China.'

    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <ChinaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'CN')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'China'}).selected).toBe(true)

    const label = screen.getByTestId('label')
    const notice = screen.getByText(noticeText)

    expect(label).not.toContainElement(notice)
  })
})

describe('With South Korea selected', () => {
  const SouthKoreaCountrySelect = () => {
    return (
      <select className="js-country-select">
        <option>Select a country</option>
        <option value="KR">Korea, the Republic of</option>
      </select>
    )
  }

  it('Includes an extra required checkbox', async () => {
    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <SouthKoreaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Korea, the Republic of'}).selected).toBe(true)

    const checkboxes = screen.getAllByRole('checkbox')

    expect(checkboxes.length).toBe(2)
    expect(checkboxes[0]).toHaveAttribute('required')
  })

  it('Includes South Korea specific text', async () => {
    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <SouthKoreaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Korea, the Republic of'}).selected).toBe(true)

    const consentExperience = screen.getByTestId('consent-experience')
    expect(consentExperience).toHaveTextContent(
      'I agree to the collection and use of my personal information (required)*:',
    )
    expect(consentExperience).toHaveTextContent(
      'I agree to receiving marketing information and use of my personal information for marketing purposes (optional):',
    )
  })

  it('Includes the example fields', async () => {
    const props = getConsentExperienceProps()
    props.exampleFields = ['First name', 'Last name', 'Email', 'Phone']

    const {user} = render(
      <>
        <SouthKoreaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Korea, the Republic of'}).selected).toBe(true)

    const consentExperience = screen.getByTestId('consent-experience')
    expect(consentExperience).toHaveTextContent(
      'First name, Last name, Email, Phone, and any other fields visible on this form',
    )
  })

  it('Includes the South Korea notice outside of the label', async () => {
    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <SouthKoreaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Korea, the Republic of'}).selected).toBe(true)

    const label = screen.getByTestId('label')
    const notice = screen.getByText(/You have the right to refuse the collection and use of your personal information/)

    expect(label).not.toContainElement(notice)
  })

  it('Notice includes GitHub privacy link', async () => {
    const props = getConsentExperienceProps()
    const {user} = render(
      <>
        <SouthKoreaCountrySelect />
        <ConsentExperience {...props} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    expect(screen.getByRole<HTMLOptionElement>('option', {name: 'Korea, the Republic of'}).selected).toBe(true)

    const notice = screen.getByText(/You have the right to refuse the collection and use of your personal information/)
    const link = screen.getByRole('link', {name: 'GitHub Privacy Statement'})

    expect(notice).toContainElement(link)
  })
})

describe('Handling validation', () => {
  const SOUTH_KOREA_PRIMARY_CONSENT_LABEL = /I agree to the collection and use of my personal information/

  let spy: jest.Mock

  beforeEach(() => {
    spy = jest.fn()
  })

  it('is valid by default', async () => {
    render(<ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />)

    expect(spy).toHaveBeenLastCalledWith(true)
  })

  it('is remains valid if we change the country', async () => {
    const {user} = render(
      <>
        <select className="js-country-select">
          <option>Select a country</option>
          <option value="US">United States</option>
        </select>

        <ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'US')

    expect(spy).toHaveBeenLastCalledWith(true)
  })

  it('becomes invalid if switching to South Korea', async () => {
    const {user} = render(
      <>
        <select className="js-country-select">
          <option>Select a country</option>
          <option value="KR">South Korea</option>
        </select>

        <ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')

    expect(spy).toHaveBeenLastCalledWith(false)
  })

  it('resets the invalid status if switching back to a different country', async () => {
    const {user} = render(
      <>
        <select className="js-country-select">
          <option>Select a country</option>
          <option value="KR">South Korea</option>
          <option value="US">United States</option>
        </select>

        <ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    await user.selectOptions(screen.getByRole('combobox'), 'US')

    expect(spy).toHaveBeenLastCalledWith(true)
  })

  it('is valid if accepting the primary consent for South Korea', async () => {
    const {user} = render(
      <>
        <select className="js-country-select">
          <option>Select a country</option>
          <option value="KR">South Korea</option>
        </select>

        <ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    await user.click(screen.getByLabelText(SOUTH_KOREA_PRIMARY_CONSENT_LABEL))

    expect(spy).toHaveBeenLastCalledWith(true)
  })

  it('is invalid if deselecting the primary consent for South Korea', async () => {
    const {user} = render(
      <>
        <select className="js-country-select">
          <option>Select a country</option>
          <option value="KR">South Korea</option>
        </select>

        <ConsentExperience onValidationChange={spy} {...getConsentExperienceProps()} />
      </>,
    )

    await user.selectOptions(screen.getByRole('combobox'), 'KR')
    await user.click(screen.getByLabelText(SOUTH_KOREA_PRIMARY_CONSENT_LABEL))
    await user.click(screen.getByLabelText(SOUTH_KOREA_PRIMARY_CONSENT_LABEL))

    expect(spy).toHaveBeenLastCalledWith(false)
  })
})
