import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkGithubIcon} from '@primer/octicons-react'
import {BaseStyles, Header, Octicon, theme, ThemeProvider} from '@primer/react'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import invariant from 'tiny-invariant'

import {useColorSchemeFromDocumentElement} from '../../client/hooks/use-color-scheme-from-document-element'
import {appStoryDefinitions, integrationTestStoryDefinitions} from '../story-definitions'
import {CommandPaletteWarning} from './command-palette-warning'
import {EnabledFeaturesPicker} from './enabled-features-picker'
import {NavItem} from './nav-item'
import {SocketEmitButton} from './socket-emit-button'
import {ThemePicker} from './theme-picker'
import {ViewerRolePicker} from './viewer-role-picker'

export function renderNavigation({activeStoryId}: {activeStoryId?: string}) {
  const element = document.getElementById('nav-root')
  invariant(element, 'Could not find nav root element')
  createRoot(element).render(
    <StrictMode>
      <Navigation activeStoryId={activeStoryId} />
    </StrictMode>,
  )
}

const opts = Object.keys(theme.colorSchemes)

function Navigation({activeStoryId}: {activeStoryId?: string}) {
  const docTheme = useColorSchemeFromDocumentElement()

  return (
    <ThemeProvider
      theme={theme}
      colorMode={ensureValueOrDefault(docTheme.mode, ['auto', 'light', 'dark'])}
      dayScheme={ensureValueOrDefault(docTheme.light, opts)}
      nightScheme={ensureValueOrDefault(docTheme.dark, opts)}
    >
      <BaseStyles display="flex" style={{height: '100%', alignItems: 'center'}}>
        <div
          data-testid="js-global-screen-reader-notice"
          id="js-global-screen-reader-notice"
          className="sr-only"
          aria-live="polite"
        />
        <div
          data-testid="js-global-screen-reader-notice-assertive"
          id="js-global-screen-reader-notice-assertive"
          className="sr-only"
          aria-live="assertive"
        />
        <Header sx={{width: '100%', zIndex: 1, overflow: 'auto'}}>
          <Header.Item>
            <Header.Link href="#">
              <Octicon icon={MarkGithubIcon} size={32} sx={{mr: 2}} />
              <span>GitHub</span>
            </Header.Link>
          </Header.Item>
          <Header.Item>
            <NavItem storyGroup="App" stories={appStoryDefinitions} activeStoryId={activeStoryId} />
          </Header.Item>
          <Header.Item full>
            <NavItem
              storyGroup="Integration Tests"
              stories={integrationTestStoryDefinitions}
              activeStoryId={activeStoryId}
            />
          </Header.Item>
          <Header.Item>
            <ThemePicker opts={opts} />
          </Header.Item>
          <Header.Item>
            <ViewerRolePicker activeStoryId={activeStoryId} />
          </Header.Item>
          <Header.Item>
            <EnabledFeaturesPicker />
          </Header.Item>
          <Header.Item>
            <SocketEmitButton />
          </Header.Item>
          <Header.Item>
            <GitHubAvatar src="https://github.com/octocat.png" size={20} square alt="@octocat" />
          </Header.Item>
        </Header>
      </BaseStyles>
      <CommandPaletteWarning />
    </ThemeProvider>
  )
}

function ensureValueOrDefault<T>(value: string | undefined, validOptions: ReadonlyArray<T>): T {
  if (new Set(validOptions).has(value as T)) {
    return value as T
  }
  const defaultValidOption = validOptions[0]
  invariant(defaultValidOption, 'At least one valid option must be supplied')
  return defaultValidOption
}
