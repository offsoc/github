import {KeyboardKey} from '@github-ui/keyboard-key'
import {Box, Text} from '@primer/react'

type OmnibarPlaceholderProps = {
  /** The placeholder should only be shown when the omnibar does not have focus */
  inputHasFocus: boolean
  /** The current text entered in the omnibar */
  value?: string
  /** The element to render when the omnibar does not have focus */
  unfocusedPlaceholder?: React.ReactNode
  /** The element to render when the omnibar does have focus */
  focusedPlaceholder: React.ReactNode

  /** The id added to the element. Used to pass to aria-describedby elsewhere */
  descriptionId: string
}

/** Default placeholder to use when a single omnibar is present on-screen */
export const DefaultOmnibarPlaceholder: JSX.Element = (
  <>
    You can use <KeyboardKey format="full" keys="Control+Space" /> to add an item
  </>
)

/** Render some placeholder text when the omnibar element is empty */
export const OmnibarPlaceholder: React.FC<OmnibarPlaceholderProps> = ({
  focusedPlaceholder,
  inputHasFocus,
  unfocusedPlaceholder,
  value,
  descriptionId,
}) => {
  if (value !== '') return null
  if (!inputHasFocus && !unfocusedPlaceholder) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px',
      }}
    >
      <Text sx={{fontSize: 1, color: 'fg.muted'}}>
        {!inputHasFocus && <span aria-hidden>{unfocusedPlaceholder}</span>}
        <span id={descriptionId} hidden={!inputHasFocus}>
          {focusedPlaceholder}
        </span>
      </Text>
    </Box>
  )
}
