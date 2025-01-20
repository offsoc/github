import {testIdProps} from '@github-ui/test-id-props'
import {PlusCircleIcon} from '@primer/octicons-react'
import {Box, Button, Text} from '@primer/react'

type CreateNewLabelButtonProps = {
  onCreateNewLabel: (labelName: string) => void
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  query: string
}

export const CreateNewLabelButton = ({onCreateNewLabel, setOpen, query}: CreateNewLabelButtonProps) => {
  return (
    <Box
      sx={{
        borderTop: '1px solid',
        borderColor: 'border.default',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button
        leadingVisual={PlusCircleIcon}
        variant="invisible"
        sx={{
          p: 2,
          m: 2,
          width: '100%',
          overflow: 'hidden',
          minWidth: 'auto',
          '[data-component=buttonContent]': {flex: '1 1 auto', justifyContent: 'left'},
        }}
        onClick={() => {
          onCreateNewLabel(query)
          setOpen(false)
        }}
        {...testIdProps('create-new-label-button')}
      >
        <Text sx={{display: 'block', overflow: 'hidden', textOverflow: 'ellipsis'}}>Create new label: {query}</Text>
      </Button>
    </Box>
  )
}
