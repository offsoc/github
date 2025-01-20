import DefaultPage from '../Settings/pages/Default'
import EditProfile from '../Settings/pages/EditProfile'
import DeveloperTokens from '../Settings/pages/DeveloperTokens'
import Accessibility from '../Settings/pages/Accessibility'
import EnterpriseSettings from '../Settings/pages/EnterpriseSettings'
import EnterpriseSaml from '../Settings/pages/EnterpriseSaml'
import CodeSecurity from '../Settings/pages/CodeSecurity'

import {breakpoints} from '../breakpoints'

const meta = {
  title: 'Templates/Settings',
  parameters: {
    viewport: {
      viewports: breakpoints,
    },
  },
}

export default meta

export const Default = {
  name: 'Default',
  parameters: {
    layout: 'responsive',
  },
  render: () => <DefaultPage />,
}
export const DefaultNarrow = {
  name: 'Default / Narrow',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <DefaultPage />,
}
export const EditProfileSetting = {
  name: 'Edit',
  parameters: {
    layout: 'responsive',
  },
  render: () => <EditProfile />,
}
export const EditSettingNarrow = {
  name: 'Edit / Narrow',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'narrow',
    },
  },
  render: () => <EditProfile />,
}

export const DeveloperTokenSettings = {
  name: 'Ex. Developer Tokens',
  parameters: {
    layout: 'responsive',
  },
  render: () => <DeveloperTokens />,
}
export const AccessibilitySettings = {
  name: 'Ex. Accessibility',
  parameters: {
    layout: 'responsive',
  },
  render: () => <Accessibility />,
}
export const EnterpriseSettingsStory = {
  name: 'Ex. Enterprise Security',
  parameters: {
    layout: 'responsive',
  },
  render: () => <EnterpriseSettings />,
}
export const EnterpriseSamlStory = {
  name: 'Ex. Enterprise SAML',
  parameters: {
    layout: 'responsive',
  },
  render: () => <EnterpriseSaml />,
}
export const CodeSecurityStory = {
  name: 'Ex. Code Security',
  parameters: {
    layout: 'responsive',
  },
  render: () => <CodeSecurity />,
}
