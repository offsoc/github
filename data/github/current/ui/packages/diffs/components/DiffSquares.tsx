import {clsx} from 'clsx'

import styles from './DiffSquares.module.css'

export function DiffSquares({squares}: {squares: Array<'addition' | 'deletion' | 'neutral'>}) {
  return (
    <div className="d-flex">
      {squares.map((diffStatType, i) => (
        <div
          key={i}
          data-testid={`${diffStatType} diffstat`}
          className={clsx(styles.diffSquare, styles[diffStatType])}
        />
      ))}
    </div>
  )
}
