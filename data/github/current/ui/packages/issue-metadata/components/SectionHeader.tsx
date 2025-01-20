import {GearIcon} from '@primer/octicons-react'
import {Box, Text, Heading, type SxProp, Button, type ButtonProps} from '@primer/react'
import {forwardRef} from 'react'

export type StyledHeadingProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
} & SxProp

export type SectionHeaderProps = {
  /**
   * Section heading id
   */
  id?: string
  title: string
  buttonProps?: ButtonProps
  headingProps?: StyledHeadingProps
  readonly?: boolean
} & SxProp

export const SectionHeader = forwardRef<HTMLButtonElement, SectionHeaderProps>(
  (
    {
      id,
      title,
      buttonProps,
      headingProps: {as: Component = 'h3', ...headingProps} = {},
      readonly,
      ...props
    }: SectionHeaderProps,
    ref,
  ) => {
    const containerProps = readonly
      ? {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          pb: '8px',
          ...props.sx,
        }
      : {
          width: '100%',
          position: 'relative',
          ...props.sx,
        }

    return (
      <Box sx={containerProps}>
        <Heading
          id={id}
          as={Component}
          sx={{
            top: 1,
            left: 2,
            fontSize: 0,
            color: 'fg.muted',
            position: readonly ? 'relative' : 'absolute',
            pointerEvents: 'none',
            ...headingProps,
          }}
        >
          {title}
        </Heading>
        {!readonly && (
          <Button
            ref={ref}
            {...buttonProps}
            variant="invisible"
            size="small"
            trailingAction={GearIcon}
            block
            sx={{alignContent: 'start'}}
          >
            <Text className="sr-only" sx={{fontWeight: 600, fontSize: 0, lineHeight: '20px', color: 'fg.muted'}}>
              {`Edit ${title}`}
            </Text>
          </Button>
        )}
      </Box>
    )
  },
)
SectionHeader.displayName = 'SectionHeader'
