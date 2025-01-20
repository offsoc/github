import {useState, type FC, useRef} from 'react'
import {Box, Button, FormControl, IconButton, Text, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {PlusIcon, TrashIcon} from '@primer/octicons-react'
import {Blankslate} from '../Blankslate'
import {BorderBox} from '../BorderBox'

type RestrictHelperProps = {
  value: string[]
  onValueChange?: (value: string[]) => void
  readOnly?: boolean
  boxName: string
  buttonName: string
  subtitle: string
  label: string
  examples: string
  blankslate: string
  validationError?: (input: string) => string
  prefix?: string
}

export function RestrictHelper({
  value,
  onValueChange,
  readOnly,
  boxName,
  buttonName,
  subtitle,
  label,
  examples,
  blankslate,
  validationError = () => '',
  prefix,
}: RestrictHelperProps) {
  const [showDialog, setShowDialog] = useState(false)
  const restrictedList = value || []

  return (
    <>
      <BorderBox
        name={boxName}
        showHeader
        data-testid="bypass-panel"
        renderCreateButton={() => {
          if (!readOnly) {
            return (
              <div className="d-flex flex-items-center">
                <Button
                  aria-label={buttonName}
                  onClick={async () => {
                    setShowDialog(!showDialog)
                  }}
                >
                  <PlusIcon /> {buttonName}
                </Button>
              </div>
            )
          } else {
            return null
          }
        }}
      >
        {restrictedList.length > 0 ? (
          <ul>
            {[...new Set(restrictedList)].map(restricted => (
              <li key={restricted} className="Box-row d-flex flex-row flex-items-center px-3 py-2">
                <div className="flex-1">
                  <Box sx={{mr: 1, display: 'inline'}}>
                    <Box
                      as="span"
                      sx={{
                        alignItems: 'center',
                        display: 'inline-flex',
                        backgroundColor: 'neutral.subtle',
                        borderRadius: 2,
                        paddingX: 2,
                      }}
                    >
                      <Text sx={{fontWeight: 'light', fontFamily: 'mono'}}>{restricted}</Text>
                    </Box>
                  </Box>
                </div>
                {readOnly ? null : (
                  <div>
                    <IconButton
                      type="button"
                      aria-label={`Delete ${restricted}`}
                      size="small"
                      variant="invisible"
                      onClick={() =>
                        !readOnly &&
                        onValueChange?.(restrictedList.filter(restrictedToDelete => restrictedToDelete !== restricted))
                      }
                      className="ml-2"
                      icon={TrashIcon}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Blankslate heading={blankslate} />
        )}
      </BorderBox>
      {!readOnly && showDialog && (
        <RestrictHelperDialog
          onAdd={fileExtension => {
            onValueChange?.(restrictedList.concat(fileExtension))
            setShowDialog(false)
          }}
          onClose={() => setShowDialog(false)}
          buttonName={buttonName}
          subtitle={subtitle}
          label={label}
          examples={examples}
          validationError={validationError}
          prefix={prefix}
          restrictedList={restrictedList}
        />
      )}
    </>
  )
}

type RestrictHelperDialogProps = {
  onAdd: (target: string) => void
  onClose: () => void
  buttonName: string
  subtitle: string
  label: string
  examples: string
  validationError: (input: string) => string
  prefix?: string
  restrictedList: string[]
}

const RestrictHelperDialog: FC<RestrictHelperDialogProps> = ({
  onAdd,
  onClose,
  buttonName,
  subtitle,
  label,
  examples,
  validationError,
  prefix,
  restrictedList,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')

  const validateInput = (input: string) => {
    const trimmedParam = input.trim()
    if (trimmedParam === '') {
      const cannotBeEmpty = `${label} cannot be empty`
      setError(cannotBeEmpty)
      return cannotBeEmpty
    } else if (validationError(input)) {
      setError(validationError(input))
      return validationError(input)
    } else if (restrictedList.includes(`${prefix ? prefix : ''}${trimmedParam}`)) {
      const cannotBeDuplicates = `${label} has already been added`
      setError(cannotBeDuplicates)
      return cannotBeDuplicates
    }

    setError('')
    return ''
  }

  const onSave = async () => {
    const trimmedParam = inputRef.current!.value.trim()
    const errorOnSave = validateInput(trimmedParam)
    if (errorOnSave) {
      return
    }

    onAdd(`${prefix ? prefix : ''}${trimmedParam}`)
    inputRef.current!.value = ''
  }

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    onSave()
  }

  return (
    <Dialog
      aria-label={buttonName}
      title={buttonName}
      subtitle={<span className="text-normal text-small color-fg-muted">{subtitle}</span>}
      footerButtons={[
        {content: 'Cancel', buttonType: 'normal', onClick: onClose},
        {content: buttonName, onClick: onSave, buttonType: 'primary'},
      ]}
      onClose={onClose}
      width="medium"
    >
      <FormControl sx={{flex: 1, mr: 2}}>
        <FormControl.Label>
          <span className="text-bold">{label}</span>
        </FormControl.Label>
        <TextInput
          ref={inputRef}
          className="width-full"
          onKeyPress={onKeyPress}
          onBlur={e => validateInput(e.target.value)}
          onChange={() => {
            {
              error && setError('')
            }
          }}
          leadingVisual={prefix}
        />
        <FormControl.Caption>{examples}</FormControl.Caption>
        {error && <FormControl.Validation variant="error">{error}</FormControl.Validation>}
      </FormControl>
    </Dialog>
  )
}
