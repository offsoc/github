import styled from 'styled-components'

export function EnterpriseBackground({branding}: {branding?: string}) {
  const StyledDiv = styled.div`
    @media screen and (min-width: 48rem) {
      background-image: url(${({image}: {image: string}) => image});
      background-position: bottom left;
      background-size: cover;
      grid-column: 1/7;
      /* stylelint-disable-next-line primer/spacing */
      margin-right: calc(var(--brand-Grid-spacing-column-gap) * -1);
      max-height: 100vh;
      position: sticky;
      top: 0;
    }
  `

  let image = '/images/modules/site/landing-pages/contact-sales/platform.webp'
  if (branding === 'AI') {
    image = '/images/modules/site/landing-pages/contact-sales/ai.webp'
  }

  if (branding === 'Security') {
    image = '/images/modules/site/landing-pages/contact-sales/security.webp'
  }

  return <StyledDiv image={image} />
}
