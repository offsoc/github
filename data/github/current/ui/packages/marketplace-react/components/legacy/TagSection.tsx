import {GitHubAvatar} from '@github-ui/github-avatar'
import type {AppListing, FeaturedCustomer} from '../../types'
import {assertNever} from '../../utilities/assert-never'
import {joinWords} from '../../utilities/join-words'
import {Link} from '@primer/react'
import {orgHovercardPath} from '@github-ui/paths'

export enum TagSectionIdentifier {
  Category = 'Category',
  SupportedLanguages = 'Supported languages',
  FromTheDeveloper = 'From the developer',
  Customers = 'Customers',
}

export function TagSection({
  identifier,
  listing,
  supportedLanguages,
  customers,
}: {
  identifier: TagSectionIdentifier
  listing: AppListing
  supportedLanguages: string[]
  customers: FeaturedCustomer[]
}) {
  const CategorySectionContent = () => {
    return (
      <>
        {listing.primaryCategory && (
          <a
            href={`/marketplace?type=apps&category=${listing.primaryCategory}`}
            className="m-0 topic-tag topic-tag-large topic-tag-link f6"
            data-testid="category-section-primary-category"
          >
            {listing.primaryCategory}
          </a>
        )}
        {listing.secondaryCategory && (
          <a
            href={`/marketplace?type=apps&category=${listing.secondaryCategory}`}
            className="m-0 topic-tag topic-tag-large topic-tag-link f6"
            data-testid="category-section-secondary-category"
          >
            {listing.secondaryCategory}
          </a>
        )}
      </>
    )
  }

  const SupportedLanguagesSectionContent = () => {
    const joinedLanguages = joinWords(supportedLanguages)
    return <p data-testid="supported-languages-section">{joinedLanguages}</p>
  }

  const FromTheDeveloperSectionContent = () => {
    return (
      <>
        {listing.supportUrl && <a href={listing.supportUrl}>Support</a>}
        {listing.statusUrl && <a href={listing.statusUrl}>Status</a>}
        {listing.documentationUrl && <a href={listing.documentationUrl}>Documentation</a>}
        {listing.pricingUrl && <a href={listing.pricingUrl}>Pricing</a>}
        {listing.privacyPolicyUrl && <a href={listing.privacyPolicyUrl}>Privacy Policy</a>}
        {listing.tosUrl && <a href={listing.tosUrl}>Terms of Service</a>}
      </>
    )
  }

  const CustomersSectionContent = () => {
    return (
      <>
        {customers.map(customer => (
          <Link
            key={customer.displayLogin}
            href={`/${customer.displayLogin}`}
            data-hovercard-type="organization"
            data-hovercard-url={orgHovercardPath({owner: customer.displayLogin})}
          >
            <GitHubAvatar square sx={{mr: 1, mb: 1}} size={32} src={customer.image || ''} alt={customer.displayLogin} />
          </Link>
        ))}
      </>
    )
  }

  const content = (() => {
    switch (identifier) {
      case TagSectionIdentifier.Category:
        return CategorySectionContent()
      case TagSectionIdentifier.SupportedLanguages:
        return SupportedLanguagesSectionContent()
      case TagSectionIdentifier.FromTheDeveloper:
        return FromTheDeveloperSectionContent()
      case TagSectionIdentifier.Customers:
        return CustomersSectionContent()
      default:
        assertNever(identifier)
    }
  })()

  return (
    <div>
      <h3 className="mt-4 f5 fgColor-muted lh-condensed-ultra">{identifier}</h3>
      {identifier === TagSectionIdentifier.FromTheDeveloper ? (
        <div className="mt-2 d-flex flex-column flex-items-start gap-1">{content}</div>
      ) : (
        <div className="mt-2 d-flex flex-wrap gap-1">{content}</div>
      )}
    </div>
  )
}
