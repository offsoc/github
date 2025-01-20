import {ActionList, ActionMenu} from '@primer/react'
import {useExternalAnchor, type ReactPartialAnchorProps} from '@github-ui/react-core/react-partial-anchor'

export interface ReactPartialAnchorExampleProps extends ReactPartialAnchorProps {
  // Additional props sent from Rails on initial render
  message: string
}

export function ReactPartialAnchorExample({message, reactPartialAnchor}: ReactPartialAnchorExampleProps) {
  if (!reactPartialAnchor) {
    throw new Error('ReactPartialAnchorExample must be wrapped in a ReactPartialAnchorElement')
  }

  const {ref, open, setOpen} = useExternalAnchor(reactPartialAnchor)

  return (
    <ActionMenu anchorRef={ref} open={open} onOpenChange={setOpen}>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Item
            onSelect={() => {
              alert(`You clicked ${message}`)
            }}
          >
            From Rails Props: {message}
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
