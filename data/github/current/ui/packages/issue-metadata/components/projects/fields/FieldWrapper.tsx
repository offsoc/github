import {noop} from '@github-ui/noop'
import {CheckIcon} from '@primer/octicons-react'
import {Box, IconButton, Text} from '@primer/react'
import {forwardRef, useCallback, useEffect, useRef} from 'react'

type FieldWrapperProps = {
  name: string
  placeholder: string | React.ReactNode
  value?: React.ReactNode
  input?: React.ReactNode
  inputRef?: React.RefObject<HTMLInputElement>
  anchorProps?: React.HTMLAttributes<HTMLElement>
  canUpdate?: boolean
  isStatusField?: boolean
  initialShowInput?: boolean
  showInput: boolean
  setShowInput: React.Dispatch<React.SetStateAction<boolean>>
  onCommit?: () => void
}

type MetadataButtonProps = {
  disabled: boolean
  children: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
  anchorProps?: React.HTMLAttributes<HTMLButtonElement>
  isStatusField?: boolean
}

export function MetadataButton({children, onClick, anchorProps, disabled, isStatusField = false}: MetadataButtonProps) {
  const sx = disabled
    ? {paddingLeft: '6px', paddingRight: '6px'}
    : {
        '&:hover': {
          backgroundColor: 'actionListItem.default.hoverBg',
        },
      }

  return (
    <Box
      as={disabled ? undefined : 'button'}
      onClick={disabled ? noop : onClick}
      sx={{
        border: 'none',
        borderRadius: 2,
        backgroundColor: 'transparent',
        textAlign: 'left',
        height: 'auto',
        flexGrow: 1,
        py: isStatusField ? 1 : 'var(--control-medium-paddingBlock)',
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        alignItems: 'center',
        color: 'fg.muted',
        overflow: 'hidden',
        lineHeight: 1.2,
        minHeight: isStatusField ? 'var(--control-small-size)' : 'var(--control-xsmall-size)', // including just in case the py variable is decreased. This will keep the click target reasonable
        ...sx,
      }}
      {...anchorProps}
    >
      <Box sx={{fontSize: 0, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis'}}>{children}</Box>
    </Box>
  )
}

export const FieldWrapper = forwardRef<HTMLLIElement, FieldWrapperProps>(function FieldWrapper(
  {
    name,
    placeholder,
    value,
    input,
    inputRef,
    anchorProps,
    showInput,
    setShowInput,
    canUpdate = true,
    isStatusField = false,
    onCommit = noop,
  },
  ref,
) {
  const localRef = useRef(null)
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!anchorProps && canUpdate) {
        setShowInput(true)
      } else if (anchorProps?.onClick) {
        anchorProps.onClick(e)
      }
    },
    [anchorProps, canUpdate, setShowInput],
  )

  useEffect(() => {
    if (showInput === true && inputRef && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef, showInput])

  return (
    <Box
      ref={ref || localRef}
      as="li"
      sx={{mt: 0, listStyleType: 'none', display: 'flex', alignItems: 'center', gap: 2}}
    >
      <Text
        as="p"
        sx={{
          fontWeight: 500,
          fontSize: 0,
          color: 'fg.muted',
          marginBottom: 0,
          flexBasis: isStatusField ? 'auto' : '40%',
          flexShrink: 0,
          mt: 0,
          lineHeight: 1.3,
          py: 1,
        }}
      >
        {name}
      </Text>
      {showInput ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            mb: 1,
          }}
        >
          {input}
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            sx={{flexShrink: 0}}
            aria-label="Cancel"
            data-testid="commit"
            size="small"
            icon={CheckIcon}
            onClick={() => {
              onCommit()
              setShowInput(false)
            }}
            disabled={!canUpdate}
          />
        </Box>
      ) : (
        <MetadataButton
          isStatusField={isStatusField}
          anchorProps={anchorProps}
          onClick={handleClick}
          disabled={!canUpdate}
        >
          {value ? (
            <Text sx={{color: 'fg.default'}}>{value}</Text>
          ) : (
            <Text sx={{color: 'fg.muted', fontSize: 0}}>{placeholder}</Text>
          )}
        </MetadataButton>
      )}
    </Box>
  )
})
