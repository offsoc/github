import type React from 'react'
import styles from './GlowCircleBackground.module.css'
import {AnimationProvider, Box} from '@primer/react-brand'

type CircleColorMap = {
  left: string // primary brand color
  middle: string // secondary brand color
  right: string // Accent 2 brand color
}

type ColorBranding = 'Platform' | 'AI' | 'Security' | undefined

const platformColorMap: CircleColorMap = {
  left: '#000AFF',
  middle: '#F4E162',
  right: '#5F00FF',
}

const aiColorMap: CircleColorMap = {
  left: '#8250DF',
  middle: '#00FF46',
  right: '#000AFF',
}

const securityColorMap: CircleColorMap = {
  left: '#096BDE',
  middle: '#A9E500',
  right: '#000AFF',
}

const brandingMap = {
  Platform: platformColorMap,
  AI: aiColorMap,
  Security: securityColorMap,
}

type GlowCircleBackgroundProps = {
  branding: ColorBranding
}

const GlowCircleBackground: React.FC<GlowCircleBackgroundProps> = ({branding}) => {
  const colorMap = (branding && brandingMap[branding]) ?? platformColorMap

  return (
    <div className={styles.backgroundContainer}>
      <AnimationProvider runOnce visibilityOptions={0}>
        <Box
          className={`${styles.circle} ${styles.circleLeft}`}
          animate="fade-in"
          style={{backgroundColor: colorMap.left}}
        />
        <Box
          className={`${styles.circle} ${styles.circleRight}`}
          animate="fade-in"
          style={{backgroundColor: colorMap.right}}
        />
        <Box animate="fade-in">
          {/* use wrapper box to allow circle to render at 0.8 opacity after animation */}
          <Box className={`${styles.circle} ${styles.circleMiddle}`} style={{backgroundColor: colorMap.middle}} />
        </Box>
      </AnimationProvider>
    </div>
  )
}

export default GlowCircleBackground
