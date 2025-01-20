import type {Palette} from '@github-ui/primer-primitives-deprecated/hooks/use-color-palette'
import {useMemo} from 'react'

interface ChartColorPalette {
  [name: string]: {body: string; border: string}
}

// https://www.figma.com/design/pj3iRnlsfqGpZDofayvhiX/Dashboards%2C-Charts%2C-Data-Viz?node-id=518-133978&t=NGjA7DdarJI2WpbF-4
export default function useChartColorPalette(colorScheme: Palette): ChartColorPalette {
  return useMemo(() => {
    const scale = colorScheme.scale
    const p: ChartColorPalette = {
      blue: {
        body: scale.blue[0],
        border: scale.blue[5],
      },
      green: {
        body: scale.green[0],
        border: scale.green[4],
      },
      orange: {
        body: scale.orange[0],
        border: scale.orange[4],
      },
      pink: {
        body: scale.pink[0],
        border: scale.pink[5],
      },
      gray: {
        body: scale.gray[0],
        border: scale.gray[6],
      },
      yellow: {
        body: scale.yellow[0],
        border: scale.yellow[4],
      },
      red: {
        body: scale.red[0],
        border: scale.red[5],
      },
      purple: {
        body: scale.purple[0],
        border: scale.purple[5],
      },
    }

    const colorMode = document.querySelector('html')?.getAttribute('data-color-mode')
    const preferDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if ((colorMode === 'auto' && preferDarkMode) || colorMode === 'dark') {
      // in dark mode, body/background colors reverse scale
      p.blue!.body = colorScheme.scale.blue[9]
      p.green!.body = colorScheme.scale.green[9]
      p.orange!.body = colorScheme.scale.orange[9]
      p.pink!.body = colorScheme.scale.pink[9]
      p.gray!.body = colorScheme.scale.gray[8]
      p.yellow!.body = colorScheme.scale.yellow[9]
      p.red!.body = colorScheme.scale.red[9]
      p.purple!.body = colorScheme.scale.purple[9]

      // select colors slightly move up/down the scale as needed
      p.green!.border = colorScheme.scale.green[5]
      p.gray!.border = colorScheme.scale.gray[3]
    }

    return p
  }, [colorScheme])
}
