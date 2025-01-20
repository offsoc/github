import type {FC} from 'react'
import type React from 'react'
import type {Rule} from '../types/rules-types'
import {RuleModalState} from '../types/rules-types'
import {Blankslate} from './Blankslate'
import {Box} from '@primer/react'

type BorderBoxProps = {
  name?: React.ReactNode
  rows?: Rule[]
  condensed?: boolean
  showHeader?: boolean
  groupByPattern?: boolean
  renderCreateButton?(): void
  renderRow?(row: Rule): JSX.Element
  renderBlankslate?(): JSX.Element
  children?: React.ReactNode
  className?: string
  headerClassName?: string
}

export const BorderBox: FC<BorderBoxProps> = ({
  name,
  rows,
  condensed,
  showHeader,
  renderCreateButton,
  renderRow,
  renderBlankslate,
  children,
  className,
  headerClassName,
  ...rest
}) => {
  const condensedSx = {
    py: 2,
    px: 3,
  }
  const creatingModalSx = {
    padding: 0,
    border: 0,
    height: 0,
  }

  const showBlankslate =
    rows && (rows?.length === 0 || rows.every(({_modalState}) => _modalState === RuleModalState.CREATING))

  return (
    <div className={`Box ${className || ''}`} {...rest}>
      {!showBlankslate && showHeader ? (
        <Box
          className={`Box-header d-flex flex-justify-between flex-items-center ${headerClassName || ''}`}
          sx={{
            ...(condensed ? condensedSx : {}),
          }}
        >
          <h2 className="Box-title">{name}</h2>
          {renderCreateButton?.() || null}
        </Box>
      ) : null}
      {rows && renderRow ? (
        <>
          <ul>
            {rows.map(row => (
              <Box
                as="li"
                className="Box-row d-flex position-relative"
                sx={{
                  ...(condensed ? condensedSx : {}),
                  ...(row._modalState === RuleModalState.CREATING ? creatingModalSx : {}),
                }}
                key={row.id || row._id}
              >
                <div className="d-flex flex-1 width-fit">{renderRow(row)}</div>
              </Box>
            ))}
          </ul>
          {showBlankslate ? (
            <Blankslate heading={`No rules have been added yet`}>{renderBlankslate?.()}</Blankslate>
          ) : null}
        </>
      ) : (
        children
      )}
    </div>
  )
}
