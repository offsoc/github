import {useMemo} from 'react'
import useColorModes from '@github-ui/react-core/use-color-modes'

function PlaygroundWaitingListAsset() {
  const colorMode = useColorModes()

  const lightIllustrationPath = '/images/modules/marketplace/models/waitlist-light_1x.png'
  const lightIllustrationPath2x = '/images/modules/marketplace/models/waitlist-light_2x.png'
  const darkIllustrationPath = '/images/modules/marketplace/models/waitlist-dark_1x.png'
  const darkIllustrationPath2x = '/images/modules/marketplace/models/waitlist-dark_2x.png'

  const colorModeIllustration = useMemo(() => {
    switch (colorMode.colorMode) {
      case 'night':
        return darkIllustrationPath
      case 'day':
      default:
        return lightIllustrationPath
    }
  }, [colorMode])

  const colorModeIllustration2x = useMemo(() => {
    switch (colorMode.colorMode) {
      case 'night':
        return darkIllustrationPath2x
      case 'day':
      default:
        return lightIllustrationPath2x
    }
  }, [colorMode])

  return (
    <img
      src={colorModeIllustration}
      srcSet={`${colorModeIllustration} 1x, ${colorModeIllustration2x} 2x`}
      alt="A grid showing different company logos being connected by lines"
      width="100%"
    />
  )
}

export default PlaygroundWaitingListAsset
