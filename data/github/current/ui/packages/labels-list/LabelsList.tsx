import {LabelToken} from '@github-ui/label-token'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {Box, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {ReactNode} from 'react'
import {Tooltip} from '@primer/react/next'

/**
 * This interface is the same as that of @github-ui/item-picker/label's Label
 * but it doesn't seem appropriate to couple this list to the picker
 * in that way
 */
export interface Label {
  readonly id: string
  readonly url: string
  readonly name: string
  readonly nameHTML: string
  readonly color: string
  readonly description: string | null | undefined
}

export type LabelsListProps = {
  labels: Label[]
  testId?: string
  sx?: BetterSystemStyleObject
  /** We display this string when the list of labels is empty, defaults to 'No labels' */
  emptyText?: ReactNode
}

/**
 *
 * A list of label tokens sorted by name.
 * This component is used in the Issues and Pull Requests sidebars.
 * If we find either one needs to diverge too much we should consider
 * making two separate components instead of trying to make this one fit both.
 *
 */
export function LabelsList({labels, testId, sx, emptyText = 'No labels'}: LabelsListProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexShrink: 1,
        gap: 1,
        flexWrap: 'wrap',
        overflow: 'hidden',
        height: '100%',
        justifyContent: 'flex-start',
        px: 2,
        pt: 1,
        pb: 2,
        fontSize: 0,
        ...sx,
      }}
      tabIndex={-1}
      data-testid={testId}
    >
      {labels.length > 0
        ? labels
            .sort((a, b) => (a.name === b.name ? 0 : a.name > b.name ? 1 : -1))
            .map(label => (
              <Tooltip
                text={label.description ?? ''}
                type="description"
                aria-label={label.description ?? ''}
                sx={{position: 'absolute', visibility: label.description ? 'visible' : 'hidden'}}
                key={label.id}
              >
                <Link
                  href={label.url}
                  target="_blank"
                  key={label.id}
                  muted
                  sx={{overflow: 'hidden'}}
                  aria-describedby={`${label.id}-tooltip`}
                >
                  <LabelToken
                    text={<SafeHTMLText html={label.nameHTML as SafeHTMLString} />}
                    fillColor={`#${label.color}`}
                    key={label.id}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      maxWidth: '100%',
                    }}
                  />
                  <span className="sr-only" id={`${label.id}-tooltip`}>
                    {label.description ?? ''}
                  </span>
                </Link>
              </Tooltip>
            ))
        : emptyText}
    </Box>
  )
}
