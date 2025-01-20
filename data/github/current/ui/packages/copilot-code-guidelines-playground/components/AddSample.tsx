import {useCallback, useRef, useState} from 'react'

import {Button, FormControl, Textarea} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {PlusIcon} from '@primer/octicons-react'

export default function AddSample() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const onDialogClose = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <Button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} leadingVisual={PlusIcon} className="flex-self-start">
        Add sample
      </Button>
      {isOpen && (
        <Dialog
          title="Add sample"
          subtitle="Samples let you run a guideline against example code that Copilot will respond to."
          onClose={onDialogClose}
          footerButtons={[
            {
              buttonType: 'default',
              content: 'Cancel',
              onClick: onDialogClose,
            },
            {
              buttonType: 'primary',
              content: 'Save',
              // TODO: Replace this with a function that saves the sample
              onClick: onDialogClose,
            },
          ]}
        >
          <FormControl>
            <FormControl.Label>Content</FormControl.Label>
            <Textarea block resize="vertical" placeholder="Hello" />
          </FormControl>
        </Dialog>
      )}
    </>
  )
}
