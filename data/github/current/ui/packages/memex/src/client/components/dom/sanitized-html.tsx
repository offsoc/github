import {Text, type TextProps} from '@primer/react'
import {forwardRef, memo} from 'react'

import {sanitizeTextInputHtmlString} from '../../helpers/sanitize'

type SanitizedHtmlProps = Omit<TextProps, 'children'> & {
  children: string
}

/**
 * A Primer <Text /> element with inbuilt sanitization of the the children
 * to support rendering untrusted input within the application.
 *
 * @param props additional props alongside the `children` text to render
 * @param props.asBdi if true, the text will be wrapped in a <bdi> element
 */
const _SanitizedHtml = forwardRef(({children, ...props}, ref) => {
  // eslint-disable-next-line react/forbid-component-props
  return <Text ref={ref} {...props} dangerouslySetInnerHTML={{__html: sanitizeTextInputHtmlString(children)}} />
}) as ReactPolymorphic.ForwardRefComponent<'span', SanitizedHtmlProps>

_SanitizedHtml.displayName = 'SanitizedHtml'

export const SanitizedHtml = memo(_SanitizedHtml) as ReactPolymorphic.ForwardRefComponent<'span', SanitizedHtmlProps>
