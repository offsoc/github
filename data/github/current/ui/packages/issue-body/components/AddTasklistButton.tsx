import {PlusIcon} from '@primer/octicons-react'
import {Box, Button, Spinner} from '@primer/react'
import {type DOMAttributes, type RefObject, useState} from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomElement<T> = Partial<T & DOMAttributes<T> & {children: any}>

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'tasklist-block-add-tasklist': CustomElement<{
        keys: string
      }>
    }
  }
}

type AddTasklistButtonProps = {
  bodyRef: RefObject<HTMLElement>
}

export const AddTasklistButton = ({bodyRef}: AddTasklistButtonProps) => {
  const [addTasklistIsLoading, setAddTasklistIsLoading] = useState(false)

  const addTasklistSection = async () => {
    const body = bodyRef.current?.querySelector('.markdown-body')
    if (!body) return

    setAddTasklistIsLoading(true)
    try {
      await new Promise<void>((resolve, reject) => {
        const ignored = body.dispatchEvent(
          new CustomEvent('tracking-block:add-tasklist', {
            bubbles: true,
            cancelable: true,
            detail: {resolve, reject},
          }),
        )

        // If the event was not ignored, we know that the event was handled.
        if (ignored) resolve()
      })
    } finally {
      setAddTasklistIsLoading(false)
    }
  }

  return (
    <tasklist-block-add-tasklist>
      <Box sx={{position: 'relative'}}>
        {addTasklistIsLoading ? (
          <Button
            size="small"
            sx={{
              borderRadius: 20,
              px: 2,
              boxShadow: 'none',
              marginRight: 2,
              display: 'flex',
              alignItems: 'center',
            }}
            disabled
          >
            <Box sx={{alignItems: 'center', display: 'flex'}}>
              <Spinner
                size="small"
                sx={{
                  marginRight: 1,
                }}
              />
              Adding tasklist...
            </Box>
          </Button>
        ) : (
          <Button
            size="small"
            sx={{
              borderRadius: 20,
              px: 2,
              boxShadow: 'none',
              marginRight: 2,
            }}
            className="js-add-tasklist-button"
            leadingVisual={PlusIcon}
            onClick={addTasklistSection}
          >
            Add tasklist
          </Button>
        )}
      </Box>
    </tasklist-block-add-tasklist>
  )
}
