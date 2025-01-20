import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, useResponsiveValue} from '@primer/react'
import {Stack} from '@primer/react/drafts'
import {usePlaygroundManager, usePlaygroundState} from '../../../utils/playground-manager'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {GettingStartedPayload} from './GettingStartedDialog/types'

export function PlaygroundCodeSDK() {
  const {selectedSDK, selectedLanguage} = usePlaygroundState()
  const manager = usePlaygroundManager()
  const {gettingStarted} = useRoutePayload<GettingStartedPayload>()
  const isMobile = useResponsiveValue({narrow: true}, false)
  const snippet = gettingStarted[selectedLanguage]

  if (!snippet) return null

  const sdks = Object.keys(snippet.sdks)

  if (!sdks.length) return null

  const currentSDK = sdks.includes(selectedSDK)
    ? {[selectedSDK]: snippet.sdks[selectedSDK]}
    : {[Object.keys(snippet.sdks)[0] as string]: Object.values(snippet.sdks)[0]} || null

  if (!currentSDK) return null

  const handleSelectedSDK = (sdk: string) => {
    manager.setSelectedSDK(sdk)
  }
  const currentSDKName = Object.keys(currentSDK)[0]

  if (!currentSDKName) return null

  return (
    <Stack gap="normal" className="width-fit d-block">
      <ActionMenu>
        {isMobile ? (
          <ActionMenu.Anchor>
            <IconButton
              icon={KebabHorizontalIcon}
              size="small"
              aria-label="Open SDK options"
              sx={{color: 'fg.muted'}}
            />
          </ActionMenu.Anchor>
        ) : (
          <ActionMenu.Button size="small">{currentSDK[currentSDKName]?.name}</ActionMenu.Button>
        )}
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single">
            {sdks.map(sdk => (
              <ActionList.Item
                key={sdk}
                selected={sdk === currentSDKName}
                onSelect={() => {
                  handleSelectedSDK(sdk)
                }}
              >
                {snippet.sdks[sdk]?.name}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Stack>
  )
}
