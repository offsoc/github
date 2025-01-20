import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {SponsorsSignup} from '../SponsorsSignup'
import {getOrgCreateProps, getOrgUpdateProps, getUserCreateProps, getUserUpdateProps} from '../test-utils/mock-data'

test('Renders the SponsorsSignup in the create context for a user', () => {
  const props = getUserCreateProps()
  render(<SponsorsSignup {...props} />)
  const expectedFormValues = {
    'sponsors_listing[contact_email_id]': '1',
  }
  expect(screen.getByTestId('sponsors-signup-form')).toHaveFormValues(expectedFormValues)
  expect(screen.getByTestId('sponsors-help-docs')).toHaveTextContent('GitHub Sponsors profile')
  expect(screen.getByTestId('sponsors-help-docs').getAttribute('href')).toBe('docs.github.com/sponsors')
})

test('Renders the SponsorsSignup in the update context for a user', () => {
  const props = getUserUpdateProps()
  render(<SponsorsSignup {...props} />)
  const expectedFormValues = {
    'sponsors_listing[contact_email_id]': '1',
    'sponsors_listing[country_of_residence]': 'US',
    'sponsors_listing[billing_country]': 'US',
  }
  expect(screen.getByTestId('sponsors-signup-form')).toHaveFormValues(expectedFormValues)
  expect(screen.getByTestId('sponsors-help-docs')).toHaveTextContent('GitHub Sponsors profile')
  expect(screen.getByTestId('sponsors-help-docs').getAttribute('href')).toBe('docs.github.com/sponsors')
})

test('Renders the SponsorsSignup in the create context for an org', () => {
  const props = getOrgCreateProps()
  render(<SponsorsSignup {...props} />)
  const expectedFormValues = {}
  expect(screen.getByTestId('sponsors-signup-form')).toHaveFormValues(expectedFormValues)
  expect(screen.getByTestId('sponsors-help-docs')).toHaveTextContent('GitHub Sponsors profile')
  expect(screen.getByTestId('sponsors-help-docs').getAttribute('href')).toBe('docs.github.com/sponsors')
})

test('Renders the SponsorsSignup in the update context for an org', () => {
  const props = getOrgUpdateProps()
  render(<SponsorsSignup {...props} />)
  const expectedFormValues = {
    'sponsors_listing[billing_country]': 'US',
  }
  expect(screen.getByTestId('sponsors-signup-form')).toHaveFormValues(expectedFormValues)
  expect(screen.getByTestId('sponsors-help-docs')).toHaveTextContent('GitHub Sponsors profile')
  expect(screen.getByTestId('sponsors-help-docs').getAttribute('href')).toBe('docs.github.com/sponsors')
})
