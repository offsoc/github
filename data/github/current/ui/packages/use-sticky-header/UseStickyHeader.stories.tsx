import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'
import {ObservableBox} from './ObservableBox'
import {useStickyHeader} from './use-sticky-header'

function UseStickyHeaderDemo() {
  const lines = Array.from({length: 100}, (_, i) => i)
  const {isSticky, stickyStyles, observe, unobserve} = useStickyHeader()

  return (
    <div>
      <ObservableBox
        sx={{position: 'absolute', top: '-1px', height: '1px', visibility: 'hidden'}}
        onObserve={observe}
        onUnobserve={unobserve}
      />
      <Box sx={{...stickyStyles}}>
        Sticky Header <br />
        isSticky: {isSticky.toString()}
      </Box>
      <div>
        <div>Content</div>
        {lines.map(line => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Utilities/UseStickyHeader',
  component: UseStickyHeaderDemo,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof UseStickyHeaderDemo>

export default meta

export const UseStickyHeaderExample = {
  args: {},
  render: () => <UseStickyHeaderDemo />,
}
