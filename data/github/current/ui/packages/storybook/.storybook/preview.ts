import customRules from '@github/axe-github'

import {withAnalyticsProvider} from './decorators/WithAnalyticsProvider'
import {withThemeProvider, primerThemes} from './decorators/WithThemeProvider'
import {withEnabledFeatures} from './decorators/WithEnabledFeatures'
import {withToasts} from './decorators/WithToasts'
import {withAriaLive} from './decorators/WithAriaLive'
import {mockClientEnv} from '@github-ui/client-env/mock'
import {initialize as initializeMSW, mswLoader} from 'msw-storybook-addon'

import '../../../../app/assets/modules/element-registry'
import '../../../../app/assets/modules/github-elements'
import '../../../../app/assets/stylesheets/bundles/primer/index.scss'
import '../../../../app/assets/stylesheets/bundles/global/index.scss'
import '../../../../app/assets/stylesheets/bundles/github/index.scss'
import '../../../../app/assets/stylesheets/bundles/global/a11y-link-underline.scss'
import '../../../../app/assets/stylesheets/bundles/code/index.scss'
import '../../../../app/assets/stylesheets/bundles/primer-primitives/index.scss'
// colors
import '../../../../app/assets/stylesheets/variables/themes/dark_colorblind.scss'
import '../../../../app/assets/stylesheets/variables/themes/dark_dimmed.scss'
import '../../../../app/assets/stylesheets/variables/themes/dark_high_contrast.scss'
import '../../../../app/assets/stylesheets/variables/themes/dark_tritanopia.scss'
import '../../../../app/assets/stylesheets/variables/themes/dark.scss'
import '../../../../app/assets/stylesheets/variables/themes/light_colorblind.scss'
import '../../../../app/assets/stylesheets/variables/themes/light_high_contrast.scss'
import '../../../../app/assets/stylesheets/variables/themes/light_tritanopia.scss'
import '../../../../app/assets/stylesheets/variables/themes/light.scss'
import {WithA11yLinkUnderline} from './decorators/WithA11yLinkUnderline'

// add a request pathname to this regex to filter it out of msw logs
const mswSkipRequests = new RegExp(
  [
    'hot-update', // webpack hot-module-reloading
    '.bundle.js', // webpack bundles
    '/index.json', // storybook metadata
  ].join('|'),
)

initializeMSW({
  onUnhandledRequest(request, print) {
    if (mswSkipRequests.test(new URL(request.url, window.location.origin).pathname)) {
      return
    }
    print.warning()
  },
})
mockClientEnv()

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Switch themes',
    defaultValue: 'light',
    toolbar: {
      icon: 'contrast',
      items: [...primerThemes, {value: 'all', left: '', title: 'All'}],
      showName: true,
      dynamicTitle: true,
    },
  },
}

export const decorators = [withThemeProvider, withToasts, withAriaLive, withAnalyticsProvider, withEnabledFeatures, WithA11yLinkUnderline]

export const parameters = {
  a11y: {
    config: customRules,
  },
  controls: {
    hideNoControlsWarning: true,
    expanded: true,
    sort: 'alpha',
  },
  options: {
    storySort: {
      method: 'alphabetical',
      includeNames: true,
      order: [
        'Introduction',
        'Getting Started',
        'Templates',
        ['README', '*'],
        'Patterns',
        ['*', ['README', '*']],
        'Recipes',
        ['*', ['README', '*']],
        'Utilities',
        ['*', ['README', '*']],
        'Apps',
        ['*', ['README', '*']],
        '*',
      ],
    },
  },
}

export const loaders = [mswLoader]
export const tags = ['autodocs']
