import type {FC} from 'react'
import {useRef, useState} from 'react'
import type {ButtonProps} from '@primer/react'
import {Button, ButtonGroup, IconButton, ActionMenu, ActionList, Label, Box} from '@primer/react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'

export type ComboButtonAction =
  | {
      text: string
      onClick: () => void
      href?: never
      reloadDocument?: never
    }
  | {
      text: string
      onClick?: () => void
      href: string
      reloadDocument?: boolean
    }

type ComboButtonProps = {
  actions?: ComboButtonAction[]
  ariaLabel: string
}

const ButtonOrLinkButton: FC<ComboButtonAction & Pick<ButtonProps, 'variant'>> = ({text, href, ...props}) => {
  if (href) {
    return (
      <Button type="button" as={Link} to={href} {...props}>
        {text}
      </Button>
    )
  }

  return (
    <Button type="button" {...props}>
      {text}
    </Button>
  )
}

export const ComboButton: FC<ComboButtonProps> = ({actions, ariaLabel}) => {
  const buttonGroupRef = useRef<HTMLDivElement>(null)
  const [isButtonGroupMenuOpen, setButtonGroupMenuOpen] = useState(false)

  if (actions?.length === 1) {
    return <ButtonOrLinkButton {...actions[0]!} />
  }

  if ((actions?.length || 0) > 1) {
    return (
      <>
        <ButtonGroup ref={buttonGroupRef} className="my-2">
          <ButtonOrLinkButton {...actions![0]!} variant="primary" />
          <IconButton
            aria-expanded={isButtonGroupMenuOpen}
            variant="primary"
            icon={TriangleDownIcon}
            onClick={() => setButtonGroupMenuOpen(prev => !prev)}
            aria-label={ariaLabel}
          />
        </ButtonGroup>

        <ActionMenu anchorRef={buttonGroupRef} open={isButtonGroupMenuOpen} onOpenChange={setButtonGroupMenuOpen}>
          <ActionMenu.Overlay>
            <ActionList>
              {actions!.slice(1).map(action => {
                if (action.href) {
                  return (
                    <ActionList.LinkItem {...action} as={Link} key={action.text} to={action.href}>
                      <Box sx={{whiteSpace: 'nowrap', overflow: 'hidden'}}>{action.text}</Box>
                      {action.text === 'New push ruleset' && (
                        <ActionList.TrailingVisual>
                          <Label variant="success">Beta</Label>
                        </ActionList.TrailingVisual>
                      )}
                    </ActionList.LinkItem>
                  )
                }

                return (
                  <ActionList.Item key={action.text} onSelect={action.onClick}>
                    {action.text}
                  </ActionList.Item>
                )
              })}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </>
    )
  }

  return null
}
