import type {Meta} from '@storybook/react'
import {SplashDialogImage, SplashDialogBody} from './SplashDialog'
import {Button, Dialog, Box, Text, Heading} from '@primer/react'

const meta = {
  title: 'Recipes/GrowthComponents/SplashDialog',
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    darkImagePath: {control: false},
    lightImagePath: {control: false},
  },
} satisfies Meta<typeof SplashDialogImage>

export default meta

export const Example = {
  render: () => (
    <>
      <Dialog isOpen={true} aria-label="Splash dialog">
        <SplashDialogImage
          darkImagePath="https://github.com/images/modules/growth/member_feature_requests/dark.png"
          lightImagePath="https://github.com/images/modules/growth/member_feature_requests/light.png"
        />
        <SplashDialogBody>
          <Heading as="h2" sx={{fontSize: '24px'}}>
            Title
          </Heading>
          <Text sx={{color: 'fg.muted'}}>
            Subtext goes here! This SplashDialogBody component accepts any ReactNodes as children.
          </Text>
          <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
            <Button variant="invisible" sx={{mr: 1}}>
              Cancel
            </Button>
            <Button>Action</Button>
          </Box>
        </SplashDialogBody>
      </Dialog>
    </>
  ),
}
