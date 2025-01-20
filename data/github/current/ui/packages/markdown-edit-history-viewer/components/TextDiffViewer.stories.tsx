import {Box, Textarea} from '@primer/react'
import type {Meta} from '@storybook/react'
import {useState} from 'react'

import {TextDiffViewer} from './TextDiffViewer'

type WrappedDiffViewerWithInputsProps = {
  initialBefore: string
  initialAfter: string
}

const WrappedDiffViewerWithInputs = ({initialBefore, initialAfter}: WrappedDiffViewerWithInputsProps) => {
  const [before, setBefore] = useState(initialBefore)
  const [after, setAfter] = useState(initialAfter)

  return (
    <Box sx={{flexDirection: 'column', gap: 2, display: 'flex'}}>
      <>
        <Box as="label" sx={{display: 'block'}}>
          Previous text:
        </Box>
        <Textarea
          aria-label="Text for before comparison"
          value={before}
          onChange={e => setBefore(e.target.value)}
          sx={{width: '400px'}}
        />
      </>
      <>
        <Box as="label" sx={{display: 'block'}}>
          Current text:
        </Box>
        <Textarea
          aria-label="Text for after comparison"
          value={after}
          onChange={e => setAfter(e.target.value)}
          sx={{width: '400px'}}
        />
      </>
      <>
        <Box as="label" sx={{display: 'block'}}>
          Difference:
        </Box>
        <TextDiffViewer before={before} after={after} />
      </>
    </Box>
  )
}

const meta = {
  title: 'MarkdownEditHistoryViewer',
  component: WrappedDiffViewerWithInputs,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof WrappedDiffViewerWithInputs>

export default meta

const initialBefore = `Hello all

this is a great test strang!`

const initialAfter = `Hello all

this is a great test string!`

export const TextDiffViewerExample = {
  args: {},
  render: () => <WrappedDiffViewerWithInputs initialBefore={initialBefore} initialAfter={initialAfter} />,
}
