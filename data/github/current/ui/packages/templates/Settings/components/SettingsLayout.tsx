import {Box, PageLayout} from '@primer/react'
import NavListUser from './NavListUser'
import NavListEnterprise from './NavListEnterprise'
import GlobalNavigation from './GlobalNavigation'
import ContextSwitcher from './ContextSwitcher'

type SettingsPageProps = {
  children?: React.ReactNode
  active?: string
  nav?: 'user' | 'enterprise'
}

const SettingsLayout = ({children, active = '', nav = 'user'}: SettingsPageProps) => {
  return (
    <Box sx={{backgroundColor: 'canvas.default', minHeight: '100vh'}}>
      <GlobalNavigation />
      <PageLayout
        containerWidth="xlarge"
        sx={{
          pr: [0, 5, 5, 5, 5],
          pl: [0, 3, 3, 3, 3],
          maxWidth: 1280,
          backgroundColor: 'canvas.default',
          margin: '0 auto',
          borderColor: ['transparent', 'transparent', 'transparent', 'transparent', 'border.subtle'],
        }}
      >
        <PageLayout.Pane width="large" position="start" sx={{overflow: 'visible', mb: [0, 'inherit']}}>
          <Box sx={{px: 3, py: [0, 2]}}>
            {nav === 'user' && (
              <>
                <ContextSwitcher title="tbenning" subtitle="Personal account" />
                <Box sx={{display: ['none', 'block']}}>
                  <NavListUser active={active} />
                </Box>
              </>
            )}
            {nav === 'enterprise' && (
              <>
                <ContextSwitcher title="Avocado" subtitle="Enterprise account" />
                <Box sx={{display: ['none', 'block']}}>
                  <NavListEnterprise active={active} />
                </Box>
              </>
            )}
          </Box>
        </PageLayout.Pane>
        <PageLayout.Content>
          <SettingsWrapper>{children}</SettingsWrapper>
        </PageLayout.Content>
      </PageLayout>
    </Box>
  )
}

type SettingsWrapperProps = {
  children: React.ReactNode
}

const SettingsWrapper = ({children}: SettingsWrapperProps) => {
  return <Box sx={{py: 1, px: [3, 0, 0, 0, 0], display: 'flex', flexDirection: 'column', gap: 3}}>{children}</Box>
}

export {SettingsLayout, SettingsWrapper}
