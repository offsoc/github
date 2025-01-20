import {ContentfulLogoSuite} from '@github-ui/swp-core/components/contentful/ContentfulLogoSuite'
import {isPrimerLogoSuite} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentLogoSuite'
import {isPrimerTestimonial} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTestimonial'
import {Box} from '@primer/react-brand'
import styled from 'styled-components'

import {Testimonial} from './Testimonial'

const StyledLogos = styled.div`
  width: 100%;

  @media (min-width: 1280px) {
    svg {
      max-width: 29%;
    }
  }

  --brand-LogoSuite-logobar-marquee-gap: 3rem;
  svg {
    height: var(--base-size-32);
  }
`

const StyledTestimonial = styled(Box)`
  blockquote span {
    font-weight: var(--base-text-weight-medium);
  }

  figcaption > span:nth-child(2) {
    color: #fff;
  }
`

export const Highlight = ({entry}: {entry: unknown}) => {
  if (isPrimerTestimonial(entry)) {
    return (
      <StyledTestimonial marginBlockStart="spacious" marginBlockEnd="spacious">
        <Testimonial component={entry} />
      </StyledTestimonial>
    )
  }

  if (isPrimerLogoSuite(entry)) {
    return (
      <StyledLogos>
        <ContentfulLogoSuite component={entry} />
      </StyledLogos>
    )
  }

  return null
}
