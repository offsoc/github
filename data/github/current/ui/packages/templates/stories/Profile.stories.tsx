import {Profile as ProfileTemplate} from '../Profile/Profile'
import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/Profile',
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
  render: () => <ProfileTemplate />,
}

export const Wide = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'wide',
    },
  },
  render: () => <ProfileTemplate />,
}

export const Regular = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'regular',
    },
  },
  render: () => <ProfileTemplate />,
}

export const Narrow = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <ProfileTemplate />,
}
