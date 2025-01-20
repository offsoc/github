import type React from 'react'
import {Box, IconButton, Text, Truncate} from '@primer/react'
import {InfoIcon, PlusCircleIcon, TrashIcon, XCircleIcon} from '@primer/octicons-react'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {Blankslate} from '../../components/Blankslate'
import {BorderBox} from '../../components/BorderBox'
import {RefPill} from '../RefPill'
import {partition} from '../../helpers/utils'

export type IncludeExcludeType = 'include' | 'exclude'

type Target<T> = {
  type: IncludeExcludeType
  prefix?: string
  value: T
  display?: string | string[]
  displayAsLabel?: boolean
  onRemove?(): void
}

interface TargetsTableProps<T> {
  renderTitle: () => JSX.Element
  renderAction?: () => JSX.Element
  onRemove?: (type: IncludeExcludeType, value: T, prefix?: string) => void
  targets: Array<Target<T>>
  headerRowText?: string
  blankslate: {
    heading: string
    description?: React.ReactNode
  }
  readOnly?: boolean
}

export function TargetsTable<T>({
  renderTitle,
  renderAction,
  onRemove,
  targets,
  headerRowText,
  blankslate,
  readOnly,
}: TargetsTableProps<T>) {
  // Group by include / exclude
  const [include, exclude] = partition(targets, item => item.type === 'include')

  return (
    <Box className="settings-next" sx={{position: 'relative'}}>
      <BorderBox>
        <div className="Box-header d-flex flex-row flex-justify-between flex-items-center">
          {renderTitle()}

          {readOnly || !renderAction ? null : renderAction()}
        </div>

        {targets.length === 0 ? (
          <Blankslate heading={blankslate.heading}>{blankslate.description}</Blankslate>
        ) : (
          <ul>
            {headerRowText && (
              <Box
                as="li"
                className="Box-row"
                sx={{display: 'flex', flexDirection: 'row', px: 3, py: 2, alignItems: 'center'}}
              >
                <InfoIcon className="mr-2" />
                <Text sx={{color: 'fg.muted'}}>{headerRowText}</Text>
              </Box>
            )}
            {include.length > 0 && <TargetList readOnly={readOnly} targets={include} onRemove={onRemove} />}
            {exclude.length > 0 && <TargetList readOnly={readOnly} targets={exclude} onRemove={onRemove} />}
          </ul>
        )}
      </BorderBox>
    </Box>
  )
}

interface TargetListProps<T> {
  targets: Array<Target<T>>
  readOnly?: boolean
  onRemove?: (type: IncludeExcludeType, value: T, prefix?: string) => void
}

function TargetList<T>({targets, readOnly, onRemove}: TargetListProps<T>) {
  return (
    <>
      {targets?.map(target => (
        <li key={`${target.prefix}/${target.value}`} className="Box-row d-flex flex-row flex-items-center px-3 py-2">
          <div className="flex-1">
            <Condition target={target} />
          </div>
          {readOnly ? null : (
            <div>
              <IconButton
                type="button"
                aria-label={`Delete ${target.type} of ${target.display || target.value}`}
                size="small"
                variant="invisible"
                onClick={() => {
                  if (target.onRemove) {
                    target.onRemove()
                  }
                  onRemove?.(target.type, target.value, target.prefix)
                }}
                className="ml-2"
                icon={TrashIcon}
              />
            </div>
          )}
        </li>
      ))}
    </>
  )
}

const TRUNCATION_SIZE_MAP = {
  [ScreenSize.small]: 100,
  [ScreenSize.medium]: 150,
  [ScreenSize.large]: 150,
  [ScreenSize.xlarge]: 270,
  [ScreenSize.xxlarge]: 460,
  [ScreenSize.xxxlarge]: 460,
  [ScreenSize.xxxxlarge]: 460,
}

const getMaxWidth = (screenSize: ScreenSize) => {
  return TRUNCATION_SIZE_MAP[screenSize] ?? TRUNCATION_SIZE_MAP[ScreenSize.small]
}

function Condition<T>({target}: {target: Target<T>}) {
  const {screenSize} = useScreenSize()
  const maxWidth = getMaxWidth(screenSize)

  return (
    <div className="d-flex flex-direction-row flex-items-start">
      <div className="d-flex flex-items-center flex-direction-row">
        {target.type === 'include' ? (
          <PlusCircleIcon className="color-fg-success mr-2" />
        ) : (
          <XCircleIcon className="color-fg-danger mr-2" />
        )}

        {target.prefix && (
          <>
            <Truncate title={target.prefix} maxWidth={maxWidth - 2}>
              <Text sx={{overflowX: 'hidden', textOverflow: 'ellipsis'}}>{target.prefix}</Text>
            </Truncate>
            :&nbsp;
          </>
        )}
      </div>
      <div className="flex-wrap d-flex gap-1">
        {Array.isArray(target.display) ? (
          target.display.map(d => (
            <Box key={d} sx={{mr: 1, display: 'inline'}}>
              <RefPill param={d} displayAsLabel={target.displayAsLabel} />
            </Box>
          ))
        ) : (
          <RefPill
            param={target.display || `${target.value}`}
            displayAsLabel={target.displayAsLabel}
            maxWidth={maxWidth}
          />
        )}
      </div>
    </div>
  )
}
