import {Application as ApplicationTemplate} from '../Application/Application'
import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/Application',
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
  render: () => <ApplicationTemplate />,
}

export const Wide = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'wide',
    },
  },
  render: () => <ApplicationTemplate />,
}

export const Regular = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'regular',
    },
  },
  render: () => <ApplicationTemplate />,
}

export const Narrow = {
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <ApplicationTemplate />,
}
