import {useCallback, useState} from 'react'
import type {Screenshot} from '../types'

type Props = {
  screenshots: Screenshot[]
}

export default function Screenshots({screenshots}: Props) {
  const [activeScreenshotId, setActiveScreenshotId] = useState(screenshots[0]?.id)

  return (
    <>
      {screenshots.length > 0 && (
        <>
          <div className="ScreenshotCarousel" data-testid="screenshot-carousel">
            {screenshots.map(screenshot => (
              <div
                key={screenshot.id}
                role="tabpanel"
                className={`ScreenshotCarousel-screenshot anim-fade-in`}
                hidden={activeScreenshotId !== screenshot.id}
                data-testid={`screenshot-container-${screenshot.id}`}
              >
                <img
                  src={screenshot.src}
                  width={670}
                  alt={screenshot.alt_text}
                  className="img-responsive"
                  data-testid={`screenshot-${screenshot.id}`}
                />
                {screenshot.caption && <div className="pt-2">{screenshot.caption}</div>}
              </div>
            ))}
            {screenshots.length > 1 && (
              <div role="tablist" className="ScreenshotCarousel-nav">
                {screenshots.map(screenshot => (
                  <ScreenshotThumbnail
                    key={screenshot.id}
                    screenshot={screenshot}
                    activeScreenshotId={activeScreenshotId}
                    setActiveScreenshotId={setActiveScreenshotId}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

type ScreenshotThumbnailProps = {
  screenshot: Screenshot
  activeScreenshotId?: number
  setActiveScreenshotId: (id: number) => void
}

const ScreenshotThumbnail = (props: ScreenshotThumbnailProps) => {
  const {screenshot, activeScreenshotId, setActiveScreenshotId} = props

  const handleClick = useCallback(() => {
    setActiveScreenshotId(screenshot.id)
  }, [screenshot.id, setActiveScreenshotId])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'Enter') {
        setActiveScreenshotId(screenshot.id)
      }
    },
    [screenshot.id, setActiveScreenshotId],
  )

  return (
    <div
      key={screenshot.id}
      className="ScreenshotCarousel-navitem"
      role="tab"
      tabIndex={0}
      aria-selected={activeScreenshotId === screenshot.id}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      data-testid={`screenshot-thumbnail-${screenshot.id}`}
    >
      <img src={screenshot.src} width={670} alt={screenshot.alt_text} className="img-responsive" />
    </div>
  )
}
