import type {Meta} from '@storybook/react'
import {Link, Box, Text, Octicon, Button, Heading} from '@primer/react'
import {ProductTip, type ProductTipProps} from './ProductTip'
import {CheckIcon, TriangleDownIcon} from '@primer/octicons-react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {PropsWithChildren} from 'react'

const meta = {
  title: 'Recipes/GrowthComponents/ProductTip',
  component: ProductTip,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    showCloseButton: {
      control: 'boolean',
      defaultValue: true,
    },
    closeButtonClick: {control: false},
    primaryButtonProps: {control: false},
    sx: {control: false},
  },
} satisfies Meta<typeof ProductTip>

export default meta

const defaultArgs: Partial<ProductTipProps> = {
  showCloseButton: true,
}

interface PRWrapperProps {
  sx?: BetterSystemStyleObject
}
function PRWrapper({sx, children}: PropsWithChildren<PRWrapperProps>) {
  const mergedSX = {
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 6,
    width: '100%',
    ...sx,
  }
  return <Box sx={mergedSX}>{children}</Box>
}

function PullRequestExample() {
  return (
    <Box sx={{width: '100%'}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: ['column', 'column', 'row', 'row'],
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          p: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            height: '30px',
            width: '30px',
            borderRadius: '50%',
            bg: 'success.emphasis',
          }}
        >
          <Octicon sx={{color: 'canvas.default'}} icon={CheckIcon} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: ['center', 'center', 'flex-start', 'flex-start'],
          }}
        >
          <Heading
            as="h3"
            sx={{
              fontSize: '1rem',
              lineHeight: '1.',
              textAlign: ['center', 'center', 'left', 'left'],
            }}
          >
            This branch has no conflicts with the base branch.
          </Heading>
          <Text
            sx={{
              color: 'fg.muted',
              fontSize: '0.875rem',
              textAlign: ['center', 'center', 'left', 'left'],
              width: '100%',
            }}
          >
            Merging can be performed automatically.
          </Text>
        </Box>
      </Box>

      <Box
        sx={{
          p: 3,
          bg: 'canvas.subtle',
          borderTop: '1px solid',
          borderColor: 'border.default',
          display: 'flex',
          flexDirection: ['column', 'column', 'row', 'row'],
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
        }}
      >
        <Button trailingAction={TriangleDownIcon} variant="primary">
          Merge pull request
        </Button>
        <Text
          sx={{
            fontSize: '0.875rem',
            textAlign: ['center', 'center', 'left', 'left'],
          }}
        >
          You can also open this in{' '}
          <Link inline href="https://github.com" target="_blank">
            GitHub Desktop
          </Link>{' '}
          or{' '}
          <Link inline href="https://github.com" target="_blank">
            view command line instructions.
          </Link>
        </Text>
      </Box>
    </Box>
  )
}

export const Base = {
  args: {
    ...defaultArgs,
  },
  render: (args: ProductTipProps) => (
    <>
      <Text sx={{fontFamily: 'mono'}}>Note: The PR view is only one specific use-case for this component.</Text>
      <PRWrapper sx={{mt: 4}}>
        <PullRequestExample />
        <ProductTip {...args}>
          Write better code with{' '}
          <Link inline href="https://github.com/features/copilot">
            GitHub Copilot
          </Link>
        </ProductTip>
      </PRWrapper>

      <PRWrapper sx={{mt: 4}}>
        <PullRequestExample />
        <ProductTip
          {...args}
          primaryButtonProps={{
            onClick: () => {
              alert('my example tip action')
            },
            children: 'Try GitHub Copilot',
          }}
        >
          Write better code with{' '}
          <Link inline href="https://github.com/features/copilot">
            GitHub Copilot
          </Link>
        </ProductTip>
      </PRWrapper>
    </>
  ),
}
