import {FormControl, Checkbox, Box} from '@primer/react'

type TypePrivateProps = {
  disabled?: boolean
  isPrivate: boolean
  setIsPrivate: (value: React.SetStateAction<boolean>) => void
}

export const TypePrivate = ({disabled = false, isPrivate, setIsPrivate}: TypePrivateProps) => (
  <>
    <FormControl disabled={disabled}>
      <Checkbox
        checked={isPrivate}
        data-testid="private-issue-type"
        onChange={() => setIsPrivate(prevIsPrivate => !prevIsPrivate)}
      />
      <FormControl.Label>Private repositories only</FormControl.Label>
    </FormControl>
    <Box as="p" sx={{mt: 1, mb: 3, ml: 4, color: 'fg.subtle', fontSize: 0}}>
      Prevents this issue type from being assigned to issues created in public repositories
    </Box>
  </>
)
