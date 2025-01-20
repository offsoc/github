import type {PropertyDefinition} from '@github-ui/custom-properties-types'
import {Button, Heading} from '@primer/react'
import {createRef, useState} from 'react'

import {DeleteDefinitionDialog} from './DeleteDefinitionDialog'

interface Props {
  definition: PropertyDefinition
}
export function DefinitionDangerZone({definition}: Props) {
  const buttonRef = createRef<HTMLButtonElement>()
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)

  function closeDeleteDialog() {
    setDeleteDialogIsOpen(false)
    buttonRef.current?.focus()
  }

  return (
    <div>
      <Heading as="h2" className="f3 mb-2">
        Additional options
      </Heading>
      <div className="border rounded-2">
        <div className="d-flex flex-items-center p-3">
          <div className="flex-1">
            <Heading as="h3" className="f5">
              Delete property
            </Heading>
            <span>Deletes permanently the property and its values for every repository</span>
          </div>
          <Button variant="danger" ref={buttonRef} onClick={() => setDeleteDialogIsOpen(true)}>
            Delete property
          </Button>
        </div>
      </div>

      {definition && deleteDialogIsOpen && (
        <DeleteDefinitionDialog definition={definition} onCancel={closeDeleteDialog} onDismiss={closeDeleteDialog} />
      )}
    </div>
  )
}
