import {createElement} from 'react'
import styles from './styles.module.css'
import {clsx} from 'clsx'

export interface Attributes {
  [key: string]: string
}

export interface EmojiAttributes {
  tag: string
  raw?: string
  imgPath?: string
  attributes: Attributes
}

export function Emoji(props: EmojiAttributes) {
  const {class: classAttribute} = props.attributes
  const classes = clsx(classAttribute, styles.emojiIcon)
  const attributes = {...props.attributes} as Attributes
  delete attributes.class

  switch (props.tag) {
    case 'g-emoji':
      return createElement(props.tag, {...attributes, class: classes}, props.raw)

    case 'img':
      return <img alt="" src={props.imgPath} {...attributes} className={classes} />
  }

  return <></>
}
