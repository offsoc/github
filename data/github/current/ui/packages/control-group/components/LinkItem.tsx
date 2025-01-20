import {ChevronRightIcon} from '@primer/octicons-react'
import {Box, Link} from '@primer/react'
import {useSlots} from '@primer/react/drafts'
import Title from './Title'
import Description from './Description'
import styled from 'styled-components'
import {getPaddingInlineStart} from './utils'

const slotConfig = {
  title: Title,
  description: Description,
}

export type ControlGroupLinkProps = {
  href: string
  children: React.ReactNode
  leadingIcon?: React.ReactNode
  nestedLevel?: 0 | 1 | 2
  value?: string
}

// Using inclusive component styles for the link as per:
// https://inclusive-components.design/cards/
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  :hover {
    text-decoration: none;
  }
  ::after {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    content: '';
  }
  :focus {
    text-decoration: underline;
  }
`

const StyledLinkItem = styled(Box)`
  container-name: controlbox;
  container-type: inline-size;
  :focus {
    text-decoration: underline;
  }
  :focus-within {
    outline: 5px auto Highlight;
    outline: 5px auto -webkit-focus-ring-color;
  }
  /* Fallback so that browsers that don't have focus-within will still see focus style */
  :focus-within a:focus {
    text-decoration: none;
  }
`

const LinkItemContainerQuery = `
  @container (max-width: 500px) {
    ${StyledLinkItem} .descriptionBox {
      margin-top: 2px;
    }
  }
`

const LinkItem = ({children, leadingIcon = null, href, value, nestedLevel = 0}: ControlGroupLinkProps) => {
  const [slots] = useSlots(children, slotConfig)
  const {title, description} = slots

  // Nested items are indented
  const paddingInlineStart = getPaddingInlineStart(nestedLevel)

  return (
    <StyledLinkItem
      sx={{
        pl: paddingInlineStart,
        pr: 'var(--base-size-12)',
        position: 'relative',
        '&:hover': {
          bg: 'var(--control-transparent-bgColor-hover, var(--color-action-list-item-default-hover-bg))',
          cursor: 'pointer',
        },
        '&:hover > *, :hover + * > *': {
          borderColor: 'transparent',
        },
      }}
    >
      {/*
          This is a workaround so we can use `@container` without upgrading `styled-components` to 6.x
          We skip rendering the workaround in the test environment because our version of `jest-styled-components`
          won't be able to parse `@container`.
        */}
      {process.env.NODE_ENV !== 'test' && <style type="text/css">{LinkItemContainerQuery}</style>}
      <Box
        sx={{
          py: 'var(--base-size-12)',
          px: 'var(--link-item-padding)',
          mx: 'var(--link-item-margin)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 'var(--base-size-12)'}}>
          {leadingIcon && (
            <Box
              sx={{
                display: 'flex',
                border: '1px solid',
                borderColor: 'border.muted',
                borderRadius: 2,
                boxShadow: 'shadow.small',
                p: '10px',
                color: 'fg.muted',
                backgroundColor: 'canvas.default',
              }}
            >
              {leadingIcon}
            </Box>
          )}
          <div>
            <StyledLink href={href}>{title}</StyledLink>
            <Box className="descriptionBox" sx={{lineHeight: 'var(--text-caption-lineHeight)'}}>
              {description}
            </Box>
          </div>
        </Box>
        <Box sx={{color: 'fg.muted', display: 'flex', alignItems: 'center', gap: 1}}>
          {value && <span>{value}</span>}
          <ChevronRightIcon />
        </Box>
      </Box>
    </StyledLinkItem>
  )
}

export default LinkItem
