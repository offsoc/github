import {SignIn as SignInTemplate} from '../SignIn/SignIn'
import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/SignIn',
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
  render: () => <SignInTemplate />,
}

export const Wide = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'wide',
    },
  },
  render: () => <SignInTemplate />,
}

export const Regular = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'regular',
    },
  },
  render: () => <SignInTemplate />,
}

export const Narrow = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <SignInTemplate />,
}
