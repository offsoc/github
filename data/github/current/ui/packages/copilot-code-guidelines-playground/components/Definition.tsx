import {useState} from 'react'
import {FormControl, TextInput, Textarea, IconButton} from '@primer/react'
import {UndoIcon} from '@primer/octicons-react'

export default function Definition() {
  const maxDescriptionLength = 500
  const [description, setDescription] = useState('')

  const characterCount = () => {
    return (
      <>
        <span className="text-tabular-nums">{description.length}</span> / {maxDescriptionLength} characters
      </>
    )
  }

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }

  return (
    <div className="d-flex flex-column border rounded-2 overflow-hidden">
      <div className="d-flex flex-items-center flex-justify-between gap-2 bgColor-muted border-bottom py-2 pl-3 pr-2">
        <h3 className="f4">Definition</h3>
        <IconButton icon={UndoIcon} aria-label="Undo all changes" size="small" variant="invisible" disabled={true} />
      </div>
      <div className="d-flex flex-column flex-1 gap-3 p-3 overflow-y-auto">
        <FormControl>
          <FormControl.Label required>Name</FormControl.Label>
          <TextInput block />
        </FormControl>

        <FormControl>
          <FormControl.Label required>Description</FormControl.Label>
          {description.length > maxDescriptionLength ? (
            <FormControl.Validation variant="error">{characterCount()}</FormControl.Validation>
          ) : (
            <FormControl.Caption>{characterCount()}</FormControl.Caption>
          )}
          <Textarea block resize="vertical" value={description} onChange={handleDescriptionChange} />
        </FormControl>

        <FormControl>
          <FormControl.Label>Examples of violations</FormControl.Label>
          <Textarea block resize="vertical" />
        </FormControl>
      </div>
    </div>
  )
}
