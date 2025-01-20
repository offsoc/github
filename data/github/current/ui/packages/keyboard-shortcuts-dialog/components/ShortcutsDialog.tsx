import {Box, Button, Spinner, type SxProp} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useState, type PropsWithChildren, useEffect} from 'react'
import {ShortcutsGroupList} from './ShortcutsGroupList'
import strings from '../strings'
import type {ShortcutsGroup} from '../types'
import {getAllRegisteredCommands, type UICommandGroup} from '@github-ui/ui-commands/internal'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {normalizeSequence} from '@github-ui/hotkey'

type APIShortcuts = {
  commands: {
    global: UICommandGroup
    [key: string]: UICommandGroup
  }
}
interface ShortcutsDialogProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  docsUrl: string
}

const LoadingState = () => (
  <Box role="status" sx={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
    <Spinner size="large" />
    <span className="sr-only">{strings.loading}</span>
  </Box>
)

const parseShortcut = (keybinding?: string | string[]) => {
  return Array.isArray(keybinding) ? keybinding.map(kb => normalizeSequence(kb)) : normalizeSequence(keybinding ?? '')
}

const Columns = ({children}: PropsWithChildren) => (
  <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap'}}>{children}</Box>
)

const Column = ({children}: PropsWithChildren & SxProp) => (
  <Box sx={{flex: '250px', display: 'flex', flexDirection: 'column', gap: 2}}>{children}</Box>
)

export const ShortcutsDialog = ({visible, onVisibleChange, docsUrl}: ShortcutsDialogProps) => {
  const [siteWideShortcuts, setSiteWideShortcuts] = useState<ShortcutsGroup>({
    service: {id: 'global', name: 'Global'},
    commands: [],
  })
  const [shortcutGroups, setShortcutGroups] = useState<ShortcutsGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch keyboard shortcuts from the server
  useEffect(() => {
    const uiCommandGroups = getAllRegisteredCommands()
    const fetchShortcuts = async () => {
      setIsLoading(true)
      const metaKeyboardShortcuts = document.querySelector<HTMLMetaElement>('meta[name=github-keyboard-shortcuts]')
      if (!metaKeyboardShortcuts) throw new Error('The "github-keyboard-shortcuts" meta tag must be present')
      const options = {contexts: metaKeyboardShortcuts.content}
      const url = `/site/keyboard_shortcuts?${new URLSearchParams(options).toString()}`
      const resp = await verifiedFetchJSON(url, {method: 'GET'})
      if (resp.ok) {
        const shortcuts: APIShortcuts = await resp.json()
        const {global, ...rest} = shortcuts.commands
        setSiteWideShortcuts({
          service: {
            id: 'global',
            name: strings.siteWideShortcuts,
          },
          commands: [
            ...global.commands,
            ...(uiCommandGroups.find(uiCommandGroup => uiCommandGroup.service.id === 'global')?.commands ?? []),
          ].map(command => {
            return {
              ...command,
              keybinding: parseShortcut(command.keybinding),
            }
          }),
        })

        const transformedGroups = [...Object.values(rest), ...uiCommandGroups].map(group => {
          return {
            ...group,
            commands: group.commands.map(command => {
              return {
                ...command,
                keybinding: parseShortcut(command.keybinding),
              }
            }),
          }
        })

        setShortcutGroups(transformedGroups)
      } else {
        setShortcutGroups(
          uiCommandGroups.map(group => {
            return {
              ...group,
              commands: group.commands.map(command => {
                return {
                  ...command,
                  keybinding: parseShortcut(command.keybinding),
                }
              }),
            }
          }),
        )
      }
      setIsLoading(false)
    }

    if (visible) fetchShortcuts()
  }, [visible])

  if (!visible) return null
  return (
    <Dialog
      title={strings.keyboardShortcuts}
      aria-modal="true"
      width="xlarge"
      height="large"
      onClose={() => onVisibleChange(false)}
      sx={{color: 'fg.default'}}
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <Columns>
          <Column>
            {shortcutGroups.map(group => (
              <ShortcutsGroupList group={group} key={group.service.id} />
            ))}
          </Column>

          <Column>
            <ShortcutsGroupList group={siteWideShortcuts} key={siteWideShortcuts.service.id} />
            <Button as="a" href={docsUrl} sx={{width: '100%'}}>
              View all keyboard shortcuts
            </Button>
          </Column>
        </Columns>
      )}
    </Dialog>
  )
}
