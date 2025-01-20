/* eslint github/unescaped-html-literal: off --
 * Reason: Content sourced from Contentful is deemed trustworthy, thus the usual concerns over
 * unescaped HTML literals are mitigated in this context.
 */

import {documentToHtmlString, type Options} from '@contentful/rich-text-html-renderer'
import {BLOCKS} from '@contentful/rich-text-types'
import {Prose} from '@primer/react-brand'

import {slugify} from '../../../lib/utils/slugify'
import type {PrimerComponentProse} from '../../../schemas/contentful/contentTypes/primerComponentProse'

type ContentfulProseProps = {
  component: PrimerComponentProse
  enableFullWidth?: boolean
  variant?: 'editorial'
}

export function ContentfulProse({component, enableFullWidth, variant = undefined}: ContentfulProseProps) {
  const captionOption: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, next) => {
        return `<figcaption>${next(node.content)}</figcaption>`
      },
    },
  }

  const options: Options = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: node => {
        const url = `https:${node.data.target.fields.file.url}`
        const altText = node.data.target.fields.description

        return `<img src="${url}" alt="${altText}" />`
      },

      [BLOCKS.EMBEDDED_ENTRY]: node => {
        if (node.data.target.sys.contentType.sys.id === 'primerComponentBlockquote') {
          const {quote, caption} = node.data.target.fields
          // quote and caption are both RichText fields
          const figureQuote = documentToHtmlString(quote)
          const figureCaption = documentToHtmlString(caption, captionOption)

          return `<figure><blockquote>${figureQuote}${figureCaption}</blockquote></figure>`
        }

        if (node.data.target.sys.contentType.sys.id === 'image') {
          const {image, caption} = node.data.target.fields
          const url = `${image.fields.file.url}?w=2400&fm=jpg&fl=progressive`
          const altText = image.fields.description
          const figureCaption = documentToHtmlString(caption, captionOption)

          return `<figure><img src="${url}" alt="${altText}" />${figureCaption}</figure>`
        }

        return ''
      },

      [BLOCKS.HEADING_1]: (node, next) => {
        return `<h1 id="${slugify(next(node.content))}">${next(node.content)}</h1>`
      },

      [BLOCKS.HEADING_2]: (node, next) => {
        return `<h2 id="${slugify(next(node.content))}">${next(node.content)}</h2>`
      },

      [BLOCKS.HEADING_3]: (node, next) => {
        return `<h3 id="${slugify(next(node.content))}">${next(node.content)}</h3>`
      },

      [BLOCKS.HEADING_4]: (node, next) => {
        return `<h4 id="${slugify(next(node.content))}">${next(node.content)}</h4>`
      },

      [BLOCKS.HEADING_5]: (node, next) => {
        return `<h5 id="${slugify(next(node.content))}">${next(node.content)}</h5>`
      },

      [BLOCKS.HEADING_6]: (node, next) => {
        return `<h6 id="${slugify(next(node.content))}">${next(node.content)}</h6>`
      },
    },
  }

  const htmlMarkup = documentToHtmlString(component.fields.text, options)

  return <Prose variant={variant} enableFullWidth={enableFullWidth} html={htmlMarkup} />
}
