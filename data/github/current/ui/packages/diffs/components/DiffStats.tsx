import {Tooltip, type TooltipProps} from '@primer/react'

import {DiffSquares} from './DiffSquares'

const DiffStat = {
  addition: 'addition',
  deletion: 'deletion',
  neutral: 'neutral',
} as const

function buildToolTipLabel({
  linesAdded,
  linesChanged,
  linesDeleted,
}: {
  linesAdded: number
  linesChanged: number
  linesDeleted: number
}): string {
  let labelText = ''
  labelText += `${linesChanged} ${linesChanged === 1 ? 'change' : 'changes'}: `
  labelText += `${linesAdded} ${linesAdded === 1 ? 'addition' : 'additions'} & `
  labelText += `${linesDeleted} ${linesDeleted === 1 ? 'deletion' : 'deletions'}`
  return labelText
}

export function DiffStats({
  linesAdded,
  linesDeleted,
  linesChanged,
  tooltipDirection,
}: {
  linesAdded?: number
  linesDeleted?: number
  linesChanged?: number
  tooltipDirection?: TooltipProps['direction']
}) {
  if (!linesAdded || !linesDeleted || !linesChanged) {
    return null
  }

  const totalSquares = 5
  let squares: Array<(typeof DiffStat)[keyof typeof DiffStat]> = [
    ...Array<typeof DiffStat.neutral>(5).fill(DiffStat.neutral),
  ]

  if (linesChanged > 0) {
    let greenSquares = Math.floor((linesAdded / linesChanged) * totalSquares)
    linesAdded > 0 && (greenSquares = Math.max(1, greenSquares))
    let redSquares = Math.floor((linesDeleted / linesChanged) * totalSquares)
    linesDeleted > 0 && (redSquares = Math.max(1, redSquares))
    const graySquares = totalSquares - greenSquares - redSquares

    squares = [
      ...Array<typeof DiffStat.addition>(greenSquares).fill(DiffStat.addition),
      ...Array<typeof DiffStat.deletion>(redSquares).fill(DiffStat.deletion),
      ...Array<typeof DiffStat.neutral>(graySquares).fill(DiffStat.neutral),
    ]
  }

  return (
    <>
      <span className="f6 text-bold fgColor-success pl-2">+{linesAdded}</span>
      <span className="f6 text-bold fgColor-danger px-1">-{linesDeleted}</span>
      <Tooltip
        aria-label={buildToolTipLabel({linesAdded, linesChanged, linesDeleted})}
        direction={tooltipDirection ?? 'e'}
      >
        <DiffSquares squares={squares} />
      </Tooltip>
    </>
  )
}
