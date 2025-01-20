import {Image} from '@primer/react-brand'
import type {BackgroundImage} from '../../../schemas/contentful/contentTypes/backgroundImage'
import {useResizeObserver} from './hooks/use-resize-observer'
import {getImageSources} from '../../../lib/utils/images'
import styles from './ContentfulBackgroundImage.module.css'

export type ContentfulBackgroundImageProps = React.PropsWithChildren<{
  component?: BackgroundImage
  expand?: boolean
}>

const ContentfulBackgroundImage = ({component, children, expand = true}: ContentfulBackgroundImageProps) => {
  /**
   * Set CSS width variables based on the current viewport width.
   * Just using 100vw forces a scrollbar in many browsers.
   */
  useResizeObserver((windowEntry: ResizeObserverEntry) => {
    if (windowEntry.contentBoxSize[0] && component) {
      const vw = windowEntry.contentBoxSize[0].inlineSize
      document.documentElement.style.setProperty('--contentful-bg-full', `${vw}px`)
      document.documentElement.style.setProperty('--contentful-bg-half', `${vw / 2}px`)
    }
  })

  if (!component) {
    return <>{children}</>
  }

  const {image, focus, colorMode} = component.fields
  const data = colorMode === 'dark' || colorMode === 'light' ? {'data-color-mode': colorMode} : {}
  const containerClass = `${styles.imageContainer} ${expand ? '' : styles.expandFalse}`
  // 2400px is a common fallback size for background images
  // It considers performance by setting a reasonable size limit, while being large enough to look good on desktop.
  return (
    <div className="position-relative">
      <div
        className={containerClass}
        style={{'--focus-position': focus || 'center'} as React.CSSProperties}
        data-testid="contentful-bg-image-container"
      >
        <Image
          alt=""
          role="presentation"
          as="picture"
          src={`${image.fields.file.url}?w=2400&fm=jpg&fl=progressive`}
          sources={getImageSources(image.fields.file.url)}
        />
      </div>

      <div
        {...data}
        style={{backgroundColor: 'transparent'}}
        className="position-relative"
        data-testid="contentful-bg-content"
      >
        {children}
      </div>
    </div>
  )
}

export {ContentfulBackgroundImage}
