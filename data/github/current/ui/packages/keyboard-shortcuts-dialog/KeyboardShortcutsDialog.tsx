import {useState} from 'react'
import {GlobalCommands} from '@github-ui/ui-commands'
import {ShortcutsDialog} from './components/ShortcutsDialog'
import {isFeatureEnabled} from '@github-ui/feature-flags'

interface KeyboardShortcutsDialog {
  docsUrl: string
}

export function KeyboardShortcutsDialog({docsUrl}: KeyboardShortcutsDialog) {
  const [isVisible, setVisible] = useState(false)

  // Need to return a fragment or react partials get mad about the return type being undefined
  if (!isFeatureEnabled('react_keyboard_shortcuts_dialog')) return <></>

  return (
    <>
      <GlobalCommands commands={{'keyboard-shortcuts-dialog:show-dialog': () => setVisible(true)}} />
      <ShortcutsDialog visible={isVisible} onVisibleChange={setVisible} docsUrl={docsUrl} />
    </>
  )
}
