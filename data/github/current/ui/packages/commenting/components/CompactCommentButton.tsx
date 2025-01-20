import {Box} from '@primer/react'

type CompactCommentButtonProps = {
  onClick: () => void
  id?: string
  children: React.ReactNode
}

export const CompactCommentButton = ({onClick, id, children}: CompactCommentButtonProps) => (
  <Box
    as="button"
    type="button"
    id={id}
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'left',
      fontWeight: 400,
      color: 'fg.muted',
      width: '100%',
      backgroundColor: 'canvas.default',
      border: '1px solid',
      borderColor: 'border.default',
      cursor: 'text',
      borderRadius: 2,
      height: 'var(--control-medium-size)',
      lineHeight: 'var(--text-body-lineHeight-medium)',
      px: 2,
    }}
    onClick={onClick}
  >
    {children}
  </Box>
)
