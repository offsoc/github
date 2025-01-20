import {Text} from '@primer/react'

export default function BinaryFileStats({
  status,
  oldTreeEntrySize,
  newTreeEntrySize,
}: {
  status: string
  oldTreeEntrySize: number | undefined
  newTreeEntrySize: number | undefined
}) {
  if (oldTreeEntrySize === undefined || newTreeEntrySize === undefined) return null

  const binaryDiffSize = newTreeEntrySize - oldTreeEntrySize
  const showDiffSizePercentage = status === 'MODIFIED'
  const negativeChange = binaryDiffSize < 0
  const color = negativeChange ? 'danger.fg' : 'success.fg'
  const marker = negativeChange ? '-' : '+'
  const bytesText = Math.abs(binaryDiffSize) !== 1 ? 'Bytes' : 'Byte'

  const diffSizePercentage = ((newTreeEntrySize / oldTreeEntrySize) * 100).toFixed(2)

  return (
    <>
      <Text sx={{fontFamily: 'Monospace', fontWeight: 'bold', fontSize: 1, pl: 2, color: 'fg.muted'}}>BIN</Text>
      <Text sx={{fontFamily: 'Monospace', fontWeight: 'bold', fontSize: 1, pl: 2, color: `${color}`}}>
        {marker}
        {Math.abs(binaryDiffSize)} {bytesText} {showDiffSizePercentage && `(${diffSizePercentage}%)`}
      </Text>
    </>
  )
}
