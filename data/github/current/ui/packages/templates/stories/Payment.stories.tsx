import {Payment as PaymentTemplate} from '../Payment/Payment'
import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/Payment',
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
  render: () => <PaymentTemplate />,
}

export const Wide = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'wide',
    },
  },
  render: () => <PaymentTemplate />,
}

export const Regular = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'regular',
    },
  },
  render: () => <PaymentTemplate />,
}

export const Narrow = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <PaymentTemplate />,
}
