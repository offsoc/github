import {render, screen} from '@testing-library/react'
import {TagSection, TagSectionIdentifier} from '../TagSection'
import type {AppListing} from '../../../types'
import {mockAppListing} from '../../../test-utils/mock-data'

const renderComponent = (identifier: TagSectionIdentifier, listing: AppListing, supportedLanguages: string[]) => {
  render(
    <TagSection
      identifier={identifier}
      listing={listing}
      supportedLanguages={supportedLanguages}
      customers={[{displayLogin: 'org-1', image: 'https://example.com/org-1.png'}]}
    />,
  )
}

describe('TagSection', () => {
  describe('when rendering a category tag section', () => {
    test('renders the section', () => {
      const appListing = mockAppListing()
      renderComponent(TagSectionIdentifier.Category, appListing, [])

      expect(screen.getByTestId('category-section-primary-category')).toHaveTextContent('Primary Category')
      expect(screen.getByTestId('category-section-secondary-category')).toHaveTextContent('Secondary Category')
    })
  })

  describe('when rendering a supported languages tag section', () => {
    test('renders the section with 2 languages', () => {
      const appListing = mockAppListing()
      renderComponent(TagSectionIdentifier.SupportedLanguages, appListing, ['JavaScript', 'TypeScript'])

      expect(screen.getByTestId('supported-languages-section')).toHaveTextContent('JavaScript and TypeScript')
    })

    test('renders the section with 1 language', () => {
      const appListing = mockAppListing()
      renderComponent(TagSectionIdentifier.SupportedLanguages, appListing, ['TypeScript'])

      expect(screen.getByTestId('supported-languages-section')).toHaveTextContent('TypeScript')
    })

    test('renders the section with 3 or more languages', () => {
      const appListing = mockAppListing()
      renderComponent(TagSectionIdentifier.SupportedLanguages, appListing, [
        'TypeScript',
        'JavaScript',
        'Python',
        'Ruby',
      ])

      expect(screen.getByTestId('supported-languages-section')).toHaveTextContent(
        'TypeScript, JavaScript, Python, and Ruby',
      )
    })
  })

  describe('when rendering the developer tag section', () => {
    it.each([
      [
        {
          statusUrl: undefined,
          documentationUrl: undefined,
          pricingUrl: undefined,
          privacyPolicyUrl: undefined,
          tosUrl: undefined,
        },
        {in: ['Support'], notIn: ['Status', 'Documentation', 'Pricing', 'Terms of Service']},
      ],
      [{}, {in: ['Support', 'Status', 'Documentation', 'Pricing', 'Terms of Service'], notIn: []}],
      [
        {statusUrl: undefined, documentationUrl: undefined},
        {in: ['Support', 'Pricing', 'Terms of Service'], notIn: ['Status', 'Documentation']},
      ],
      [
        {pricingUrl: undefined, privacyPolicyUrl: undefined, tosUrl: undefined},
        {in: ['Status', 'Documentation'], notIn: ['Pricing', 'Privacy Policy', 'Terms of Service']},
      ],
    ])("renders the section with '%s'", (appListingProps, {in: inLinks, notIn: notInLinks}) => {
      const appListing = mockAppListing(appListingProps)
      renderComponent(TagSectionIdentifier.FromTheDeveloper, appListing, [])

      for (const linkName of inLinks) {
        expect(screen.getByText(linkName)).toHaveAttribute(
          'href',
          appListing[`${linkName.toLowerCase()}Url` as keyof AppListing],
        )
      }

      for (const linkName of notInLinks) {
        expect(screen.queryByText(linkName)).not.toBeInTheDocument()
      }
    })
  })

  describe('when rendering the customer section', () => {
    test('renders the section', () => {
      const appListing = mockAppListing()
      renderComponent(TagSectionIdentifier.Customers, appListing, [])

      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/org-1.png?size=64')
      expect(screen.getByRole('link')).toHaveAttribute('href', '/org-1')
    })
  })
})
