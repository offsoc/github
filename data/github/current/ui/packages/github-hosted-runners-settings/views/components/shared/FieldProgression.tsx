import {useCallback, useState} from 'react'
import FieldProgressionField, {type FieldProgressionFieldProps} from './FieldProgressionField'

type Props = {
  fields: FieldProgressionFieldProps[]
}

export default function FieldProgression({fields}: Props) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)

  const handleSave = useCallback(
    (fieldIndex: number) => {
      // reset subsequent fields
      for (const field of fields.slice(fieldIndex + 1)) {
        field.editComponent.props.setValue(null)
      }
      // move to the next field if there is one, else be done
      setCurrentFieldIndex(fieldIndex + 1)
    },
    [fields],
  )

  const setActive = useCallback((fieldIndex: number) => {
    setCurrentFieldIndex(fieldIndex)
  }, [])

  const fieldProgressionFieldsWithIndexesAdded = fields.map((field, index) => {
    const isActive = index === currentFieldIndex
    return (
      <FieldProgressionField
        {...field}
        index={index}
        key={index}
        isActive={isActive}
        onEditClick={() => setActive(index)}
        onSave={() => handleSave(index)}
      />
    )
  })

  return <>{fieldProgressionFieldsWithIndexesAdded}</>
}
