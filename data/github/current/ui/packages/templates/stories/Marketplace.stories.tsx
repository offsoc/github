import {Marketplace as MarketplaceTemplate} from '../Marketplace/Marketplace'
import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/Marketplace',
  parameters: {
    viewport: {
      viewports: breakpoints,
    },
  },
}

export default meta

export const Responsive = {
  parameters: {
    layout: 'responsive',
  },
  render: () => <MarketplaceTemplate />,
}

export const Wide = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'wide',
    },
  },
  render: () => <MarketplaceTemplate />,
}

export const Regular = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'regular',
    },
  },
  render: () => <MarketplaceTemplate />,
}

export const Narrow = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <MarketplaceTemplate />,
}
