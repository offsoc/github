import {RowLoading} from './RowLoading'

export function RowsLoading({rowCount}: {rowCount: number}): JSX.Element {
  return (
    <>
      {[...Array(rowCount)].map((_, index) => (
        <RowLoading key={index} />
      ))}
    </>
  )
}
