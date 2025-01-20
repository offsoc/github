import type {Meta} from '@storybook/react'
import {Toasts} from './Toasts'
import {InternalToastsContext} from './ToastContext'

const meta = {
  title: 'Recipes/Toast',
  component: Toasts,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    message: {control: 'text', defaultValue: 'Hello, Storybook!'},
  },
  decorators: [
    Story => (
      <InternalToastsContext.Provider
        value={{
          toasts: [
            {
              type: 'info',
              message: 'Multiple toasts stack on top of each other',
              role: 'status',
            },
            {
              type: 'success',
              message: 'Multiple toasts stack on top of each other',
              role: 'status',
            },
            {
              type: 'error',
              message: 'Multiple toasts stack on top of each other',
              role: 'status',
            },
          ],
          persistedToast: {
            type: 'info',
            message: 'Multiple toasts stack on top of each other',
            role: 'status',
          },
        }}
      >
        <Story />
      </InternalToastsContext.Provider>
    ),
  ],
} satisfies Meta<typeof Toasts>

export default meta

export const ToastsExample = {}
