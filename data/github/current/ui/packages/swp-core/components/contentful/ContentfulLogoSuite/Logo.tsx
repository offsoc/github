import Kpmg from './logos/Kpmg'
import Telus from './logos/Telus'
import Duolingo from './logos/Duolingo'
import CoyoteLogistics from './logos/CoyoteLogistics'
import MercadoLibre from './logos/MercadoLibre'
import Elanco from './logos/Elanco'
import Intel from './logos/Intel'
import Fidelity from './logos/Fidelity'
import Philips from './logos/Philips'
import LinkedIn from './logos/LinkedIn'
import Shopify from './logos/Shopify'
import MercedesBenz from './logos/MercedesBenz'

/**
 * Render SVG logo as React component.
 *
 * When adding a new logo:
 * - It's safe to remove the fill property because Logo Suite sets that property via CSS.
 * - Logos must have a <title> tag for accessibility.
 * - If an SVG has className such as `st0` or `st1`, namespace the class to avoid conflicts. e.g. from .sg0 to .company-sg0
 * - If a single logo doesn't look aligned compared to the surrounding logos, consider experimenting with margin (directly on the SVG) to align it.
 * - Pro tip: If you're given a figma file, you can right click on the logo and copy the SVG code directly.
 */
export const LogoSuiteMap: {[key: string]: () => JSX.Element} = {
  'Coyote Logistic': CoyoteLogistics,
  Duolingo,
  Elanco,
  Fidelity,
  Intel,
  KPMG: Kpmg,
  LinkedIn,
  'Mercado Libre': MercadoLibre,
  'Mercedes Benz': MercedesBenz,
  Philips,
  Shopify,
  Telus,
}

export const Logo = ({name}: {name: string}) => {
  const Component = LogoSuiteMap[name]
  if (Component) {
    return <Component />
  }
  return null
}
