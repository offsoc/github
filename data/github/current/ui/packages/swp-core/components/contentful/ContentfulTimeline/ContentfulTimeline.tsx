import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES, MARKS} from '@contentful/rich-text-types'
import {Timeline} from '@primer/react-brand'

import type {PrimerComponentTimeline} from '../../../schemas/contentful/contentTypes/primerComponentTimeline'

export type ContentfulTimelineProps = {
  component: PrimerComponentTimeline
}

export function ContentfulTimeline({component}: ContentfulTimelineProps) {
  const {blocks, hasFullWidth} = component.fields

  return (
    <Timeline fullWidth={hasFullWidth}>
      {blocks.map(timelineBlock => {
        return (
          <Timeline.Item key={timelineBlock.sys.id}>
            {documentToReactComponents(timelineBlock.fields.text, {
              renderMark: {
                [MARKS.BOLD]: children => <em>{children}</em>,
              },
              renderNode: {
                [BLOCKS.PARAGRAPH]: (_, children) => {
                  return <>{children}</>
                },
                [INLINES.HYPERLINK]: (node, children) => {
                  return <a href={node.data.uri}>{children}</a>
                },
              },
            })}
          </Timeline.Item>
        )
      })}
    </Timeline>
  )
}
