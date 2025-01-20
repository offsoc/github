// Import custom IssueLabelToken until https://github.com/github/primer/issues/1142 is fixed
import {LabelToken} from '@github-ui/label-token'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {Link} from '@primer/react'
import {clsx} from 'clsx'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'
import {Tooltip} from '@primer/react/next'

import type {Label$key} from './__generated__/Label.graphql'

type Props = {
  label: Label$key
  hidden?: boolean
  /**
   * Href getter for the label link
   * @param name Label name
   * @returns href
   */
  getLabelHref: (name: string) => string
}

const labelQuery = graphql`
  fragment Label on Label {
    id
    nameHTML
    color
    name
    description
  }
`

export function Label({label, hidden = false, getLabelHref}: Props) {
  const {nameHTML, color, id, name, description} = useFragment(labelQuery, label)

  return (
    <Tooltip
      text={description ?? ''}
      type="description"
      aria-label={description ?? ''}
      sx={{position: 'absolute', visibility: description ? 'visible' : 'hidden'}}
    >
      {/*
        Remove link from layout and accessibility tree if hidden;
        display:none does not work because of label truncation calculations
      */}
      <Link
        href={getLabelHref(name)}
        className={clsx({'sr-only': hidden})}
        aria-describedby={`${id}-tooltip`}
        sx={{visibility: hidden ? 'hidden' : null}}
      >
        <LabelToken
          interactive
          text={<SafeHTMLText html={nameHTML as SafeHTMLString} />}
          fillColor={`#${color}`}
          key={id}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '20ch',
          }}
        />
        <span className="sr-only" id={`${id}-tooltip`}>
          {description ?? ''}
        </span>
      </Link>
    </Tooltip>
  )
}
