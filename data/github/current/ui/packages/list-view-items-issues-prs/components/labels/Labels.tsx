import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box, Token, Tooltip} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'

// Import custom IssueLabelToken until https://github.com/github/primer/issues/2040 is fixed
import type {Labels$key} from './__generated__/Labels.graphql'
import {Label} from './Label'

type Props = {
  labelsKey: Labels$key
  testId?: string
  /**
   * Href getter for the label badge links
   * @param name - name of the label
   * @returns URL to the label
   */
  getLabelHref: (name: string) => string
}
export const LabelsQuery = graphql`
  fragment Labels on Labelable @argumentDefinitions(labelPageSize: {type: "Int"}) {
    labels(first: $labelPageSize, orderBy: {field: NAME, direction: ASC}) {
      nodes {
        ...Label
        name
        id
      }
    }
  }
`

export function Labels({labelsKey, testId, getLabelHref}: Props) {
  const data = useFragment(LabelsQuery, labelsKey)

  const labels = (data.labels?.nodes || []).flatMap(a => a || [])
  const [truncatedLabelCount, setTruncatedLabelCount] = useState(0)
  const lastVisibleLabelIndex = labels.length - truncatedLabelCount - 1

  const labelRef = useRef<HTMLDivElement>(null)

  const recalcuatedTruncatedLabelCount = useCallback(() => {
    if (labelRef?.current) {
      const childLabels = Array.from(labelRef.current.children) as HTMLDivElement[]
      const baseOffset = labelRef.current.offsetTop
      const breakIndex = childLabels.findIndex(item => item.offsetTop > baseOffset)
      setTruncatedLabelCount(breakIndex > 0 ? labels.length - breakIndex : 0)
    }
  }, [labels.length])

  useEffect(() => {
    // recalculate the truncated label count when the window is resized
    const curObserver = new ResizeObserver(() => {
      recalcuatedTruncatedLabelCount()
    })

    if (labelRef?.current) {
      curObserver.observe(labelRef.current)
    }

    return () => {
      curObserver.disconnect()
    }
  }, [recalcuatedTruncatedLabelCount])

  // using this to synchronize the rendering of the labels and the + badge
  useLayoutEffect(() => {
    recalcuatedTruncatedLabelCount()
  }, [labels.length, recalcuatedTruncatedLabelCount])

  const labelsDescription = useMemo(() => {
    return getLabelsDescription(
      labels.map(label => label.name),
      truncatedLabelCount,
    )
  }, [labels, truncatedLabelCount])

  if (labels.length === 0) {
    return null
  }

  return (
    <div className="labels-container">
      {/* eslint-disable-next-line github/a11y-role-supports-aria-props */}
      <Box
        sx={{
          display: 'flex',
          flexShrink: 1,
          alignItems: 'flex-start',
          gap: 1,
          height: '100%',
          position: 'relative',
        }}
        aria-label={labelsDescription}
        data-testid={testId}
      >
        <div className="labels-box" ref={labelRef}>
          {labels.map((label, index) => (
            <Label label={label} hidden={index > lastVisibleLabelIndex} key={label.id} getLabelHref={getLabelHref} />
          ))}
        </div>
        {truncatedLabelCount > 0 && (
          <Tooltip
            align="right"
            direction="sw"
            text={labels.map(label => label.name).join(', ')}
            sx={{display: 'flex'}}
          >
            <Token text={`+${truncatedLabelCount}`} />
          </Tooltip>
        )}
      </Box>
    </div>
  )
}

const getLabelsDescription = (labels: string[], truncatedLabelCount: number) => {
  const description = `Labels: ${labels.slice(0, labels.length - truncatedLabelCount).join(', ')}`

  if (truncatedLabelCount > 0) {
    return `${description}, and ${truncatedLabelCount} more;`
  }
  return `${description};`
}
