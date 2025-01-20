/* eslint filenames/match-regex: off */
import styled from 'styled-components'

export function UniverseBackground({theme}: {theme?: string}) {
  if (!theme) return null

  // We could have used the Primer Image component, however, this is not displayed on mobile.
  // Using styled components + background image allows us to avoid sending an unused network request on mobile
  const StyledDiv = styled.div`
    @media screen and (min-width: 48rem) {
      background-attachment: fixed;
      background-image: url(${({image}: {image: string}) => image});
      background-position: bottom left;
      background-size: cover;
      grid-column: 1/7;
      /* stylelint-disable-next-line primer/spacing */
      margin-right: calc(var(--brand-Grid-spacing-column-gap) * -1);
    }
  `

  return <StyledDiv image={`/images/modules/site/landing-pages/universe-23-waitlist/${theme}.webp`} />
}
