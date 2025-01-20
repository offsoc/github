import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, IconButton} from '@primer/react'
import {Chart} from 'chart.js'
import cloneDeep from 'lodash-es/cloneDeep'

const containerStyle = {
  ml: 2,
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartRef: React.MutableRefObject<any>
}

function createDownloadElement(name: string, image: string): HTMLAnchorElement {
  const a = document.createElement('a')
  a.href = image
  a.download = `${name}.png`

  return a
}

function UsageActions({chartRef}: Props) {
  function downloadImage() {
    if (!chartRef.current) return

    const chart = chartRef.current

    // Make a hidden clone of the Canvas and Chart so that we can add the title and subtitle into the downloadable image
    const newCanvas = document.createElement('canvas')
    newCanvas.style.display = 'none'
    document.body.appendChild(newCanvas)

    const newChart = new Chart(newCanvas, {
      type: chart.config.type,
      data: chart.config.data,
      // We have to deep clone the original chart options otherwise you get shared references
      // that cause the new Chart to affect the original
      options: cloneDeep(chart.config.options),
    })

    newChart.options.animation = {
      duration: 0,
      // Use the onComplete callback to ensure that the line drawing animation completes before generating an image
      onComplete: () => {
        const downloadLink = createDownloadElement('all-usage-chart', newChart.toBase64Image())
        downloadLink.click()
        newChart.destroy()
      },
    }

    // The title element is being hidden on the Overview page, so we need to make sure it actually exists before
    // attempting to inject it into the copied chart
    const titleElem = document.querySelector('#usage-chart-title') as HTMLElement
    if (titleElem) {
      // Use computed styles to ensure we respect themes
      const titleStyle = getComputedStyle(titleElem)

      newChart.options.responsiveAnimationDuration = 0
      newChart.options.plugins.title = {
        display: true,
        text: titleElem.textContent,
        align: 'start',
        color: titleStyle.color,
        font: {
          size: titleStyle.fontSize,
          weight: titleStyle.fontWeight,
        },
        padding: {
          bottom: 0,
        },
      }
    }

    const subtitleElem = document.querySelector('#usage-chart-subtitle') as HTMLElement
    const subtitleStyle = getComputedStyle(subtitleElem)

    newChart.options.plugins.subtitle = {
      display: true,
      text: subtitleElem.textContent,
      align: 'start',
      color: subtitleStyle.color,
      font: {
        size: subtitleStyle.fontSize,
        weight: subtitleStyle.fontWeight,
      },
      padding: {
        bottom: 16,
      },
    }

    newChart.update()
  }

  return (
    <Box sx={containerStyle}>
      <ActionMenu>
        <ActionMenu.Anchor>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={KebabHorizontalIcon}
            variant="invisible"
            aria-label="Open column options"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay align="end">
          <ActionList selectionVariant="single" showDividers sx={{whiteSpace: 'nowrap'}}>
            <ActionList.Item onSelect={downloadImage}>Download graph as image</ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  )
}

export default UsageActions
