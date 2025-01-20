import {clsx} from 'clsx'

import {LineNumber} from './LineNumber'

/**
 * Renders an empty diffline
 */
export function EmptyDiffLine({isLeftColumn}: {isLeftColumn?: boolean}) {
  return (
    <>
      <LineNumber lineType="EMPTY" />
      <td className={clsx('empty-diff-line', {'border-right': isLeftColumn})} colSpan={1} />
    </>
  )
}
