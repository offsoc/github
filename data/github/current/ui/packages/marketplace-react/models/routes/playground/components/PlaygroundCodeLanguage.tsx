import {ActionList, ActionMenu} from '@primer/react'
import {Stack} from '@primer/react/drafts'
import {usePlaygroundManager, usePlaygroundState} from '../../../utils/playground-manager'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {GettingStartedPayload} from './GettingStartedDialog/types'

export function PlaygroundCodeLanguage() {
  const {selectedLanguage, selectedSDK} = usePlaygroundState()
  const manager = usePlaygroundManager()
  const {gettingStarted} = useRoutePayload<GettingStartedPayload>()

  // Code sample for C# is currently not available
  const languages = Object.keys(gettingStarted).filter(language => language !== 'csharp')

  const snippet = gettingStarted[selectedLanguage]

  const handleSelectLanguage = (language: string) => {
    manager.setSelectedLanguage(language, selectedSDK)
  }

  if (!snippet) {
    return null
  }

  return (
    <Stack gap="normal" className="width-fit d-block">
      <ActionMenu>
        <ActionMenu.Button size="small">{snippet.name}</ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single">
            {/* For each language, add an item to the dropdown */}
            {languages.map(language => (
              <ActionList.Item
                key={language}
                selected={language === selectedLanguage}
                onSelect={() => {
                  handleSelectLanguage(language)
                }}
              >
                {gettingStarted[language]?.name}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Stack>
  )
}
