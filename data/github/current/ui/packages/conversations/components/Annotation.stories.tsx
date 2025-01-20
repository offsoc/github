import {Box} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import type {DiffAnnotation} from '../types'
import {Annotation} from './Annotation'

const meta: Meta<typeof Annotation> = {
  title: 'Apps/React Shared/Conversations/Annotation',
  component: Annotation,
  decorators: [
    Story => (
      <Box sx={{width: 'clamp(240px, 100vw, 540px)'}}>
        <Story />
      </Box>
    ),
  ],
}

type Story = StoryObj<typeof Annotation>

export const Story = {
  argTypes: {
    annotationLevel: {
      options: ['FAILURE', 'WARNING', 'NOTICE'],
      control: {type: 'select'},
    },
  },
  args: {
    id: 1,
    __id: 1,
    annotationLevel: 'FAILURE',
    location: {start: {line: 1}, end: {line: 1}},
    message: 'my annotation message',
    rawDetails: 'raw Details',
    path: 'file.md',
    title: 'check annotation title',
    checkRun: {
      name: 'check-run-name',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      app: {
        name: 'check-suite-app-name',
        logoUrl: 'http://alambic.github.localhost/avatars/u/2?size=48',
      },
      name: 'check-suite-name',
    },
  },
  render: (args: DiffAnnotation) => <Annotation annotation={args} />,
}

export default meta
