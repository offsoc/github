import type {Meta} from '@storybook/react'
import {useRef} from 'react'
import {type PortalTooltipProps, usePortalTooltip} from './hooks/UsePortalTooltip'

const PortalTooltip = (props: PortalTooltipProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [controlledProps, portalTooltip] = usePortalTooltip({
    ...props,
    contentRef: ref,
  })

  return (
    <>
      <div id="__primerPortalRoot__" />
      <div
        style={{
          height: '100px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          isolation: 'isolate',
          flexDirection: 'column',
        }}
      >
        <span style={{zIndex: 100, position: 'relative'}}>Content with a higher z-index</span>
        <span ref={ref} {...controlledProps}>
          Hover me!
        </span>
        {portalTooltip}
      </div>
    </>
  )
}
const meta: Meta<typeof PortalTooltip> = {
  title: 'Recipes/PortalTooltip/PortalTooltip',
  component: PortalTooltip,
  argTypes: {
    direction: {
      control: 'select',
      options: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
    },
    anchorSide: {
      control: 'select',
      options: [
        'outside-top',
        'outside-right',
        'outside-bottom',
        'outside-left',
        'inside-top',
        'inside-right',
        'inside-bottom',
        'inside-left',
      ],
    },
    'aria-label': {
      type: {name: 'string', required: true},
    },
  },
}

export default meta

export const base = {
  args: {
    direction: 'n',
    'aria-label': "I'm a fancy portal tooltip that overlays higher z-indexed content",
  },
}
