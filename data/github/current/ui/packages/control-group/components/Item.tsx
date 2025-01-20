import {Box} from '@primer/react'
import {useSlots} from '@primer/react/drafts'
import styled from 'styled-components'
import Title from './Title'
import Description from './Description'
import {Button, InlineEdit, ToggleSwitch, Custom} from './Controls'
import {getPaddingInlineStart} from './utils'

export type ControlGroupItemProps = {
  children: React.ReactNode
  nestedLevel?: 0 | 1 | 2
  disabled?: boolean
}

const slotConfig = {
  title: Title,
  description: Description,
  custom: Custom,
  toggle: ToggleSwitch,
  button: Button,
  inlineEdit: InlineEdit,
}

const StyledItemBox = styled(Box)`
  container-name: controlbox;
  container-type: inline-size;
`

const ItemContainerQuery = `
  @container (max-width: 500px) {
    ${StyledItemBox} .controlBoxContainer {
      column-gap: 0;
      row-gap: 2px;
      align-items: center;
    }
    ${StyledItemBox} .inlineControl {
      grid-row: 1;
      grid-column: 2 / 3;
      align-self: start;
    }
    ${StyledItemBox} .blockControl {
      grid-column: 1 / 3;
      grid-row: auto;
      margin-top: 8px;
    }
    ${StyledItemBox} .titleBox {
      grid-column: 1 / 2;
    }
    ${StyledItemBox} .descriptionBox {
      grid-column: 1 / 3;
    }
    ${StyledItemBox} .inlineEdit {
      justify-content: space-between;
    }
  }
`

const Item = ({children, nestedLevel = 0, disabled = false}: ControlGroupItemProps) => {
  const [slots] = useSlots(children, slotConfig)
  const {title, description, custom, toggle, button, inlineEdit} = slots

  const paddingInlineStart = getPaddingInlineStart(nestedLevel)

  return (
    <>
      <StyledItemBox sx={{pl: paddingInlineStart, pr: 'var(--base-size-12)', bg: disabled ? 'canvas.inset' : ''}}>
        {/*
          This is a workaround so we can use `@container` without upgrading `styled-components` to 6.x
          We skip rendering the workaround in the test environment because our version of `jest-styled-components`
          won't be able to parse `@container`.
        */}
        {process.env.NODE_ENV !== 'test' && <style type="text/css">{ItemContainerQuery}</style>}
        <Box
          className={`controlBoxContainer`}
          sx={{
            py: 'var(--base-size-12)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            columnGap: 4,
            justifyContent: 'space-between',
            alignItems: description ? 'flex-start' : 'center',
          }}
        >
          {title && (
            <Box className="titleBox" sx={{gridRow: 1, gridColumn: '1 / 3'}}>
              {title}
            </Box>
          )}
          {description && (
            <Box
              className="descriptionBox"
              sx={{
                gridRow: 2,
                gridColumn: '1 / 3',
              }}
            >
              {description}
            </Box>
          )}

          {/* Render for vertically aligned layout */}
          {(button || inlineEdit || custom || toggle) && (
            <Box
              className={`${toggle ? 'inlineControl' : 'blockControl'}`}
              sx={{
                gridRow: description && '1 / 3',
                gridColumn: 3,
                marginTop: 0,
              }}
            >
              {/* Was having typescript errors so solved it by wrapping this in a fragment */}
              <>{button || inlineEdit || custom || toggle}</>
            </Box>
          )}
        </Box>
      </StyledItemBox>
    </>
  )
}

export default Item
