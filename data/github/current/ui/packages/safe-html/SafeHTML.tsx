import {Box, type BoxProps, Text, type TextProps} from '@primer/react'
import type {ForwardRefComponent as PolymorphicForwardRefComponent} from '@radix-ui/react-polymorphic'
import DOMPurify, {type Config as DOMPurifyConfig} from 'dompurify'
import type React from 'react'
import {forwardRef} from 'react'

type Brand<TBase, TBrand extends string> = TBase & {__brand: TBrand}

/**
 * A string that has specifically been marked as verified.
 *
 * WARNING: A string should only be branded as a `SafeHTMLString` if one of the following applies:
 * - it comes from a trusted source on the server
 * - has known static content, or
 * - has been sanitized by DOMPurify.
 */
export type SafeHTMLString = Brand<string, 'SafeHTMLString'>

interface BaseHTMLProps {
  /**
   * Set the rendered HTML of the component. Use this prop if the source is untrusted. If you know the string can be
   * trusted, or has already been sanitized, use the `html` prop instead to avoid re-sanitizing.
   */
  unverifiedHTML?: string
  /**
   * Optional config passed to DOMPurify when sanitizing `unverifiedHTML`.
   */
  unverifiedHTMLConfig?: DOMPurifyConfig
  /**
   * Set the rendered HTML of the component. To prevent XSS, ensure that the source of this
   * HTML is trusted! If the source is untrusted, use `unverifiedHTML` instead.
   */
  html?: SafeHTMLString
}

interface VerifiedHTMLProps extends BaseHTMLProps {
  unverifiedHTML?: undefined
  html: SafeHTMLString
}

interface UnverifiedHTMLProps extends BaseHTMLProps {
  unverifiedHTML: string
  html?: undefined
}

export type SafeHTMLProps = VerifiedHTMLProps | UnverifiedHTMLProps

type PropsWithHTML<T> = T & SafeHTMLProps

function getSafeHTMLAndProps<T>(propsWithHtml: PropsWithHTML<T>) {
  /**
   * Note we have to explicitly cast props to T because TypeScript
   * is not properly converting Omit<T & VerifiedHTMLProps, 'html'> to T.
   *
   * We include the `as unknown` intermediate step to avoid warnings
   * about insufficient type overlap
   */

  if ('html' in propsWithHtml && propsWithHtml.html !== undefined) {
    const {html, ...props} = propsWithHtml
    return {
      // This is verified html, so we can use it directly
      safeHTML: html,
      props: props as unknown as T,
    }
  }

  const {unverifiedHTML, unverifiedHTMLConfig, ...props} = propsWithHtml
  const config = {
    ...unverifiedHTMLConfig,
    // we want to ensure we are returning a string not a dom node
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  } satisfies DOMPurifyConfig

  return {
    // Run the unverified HTML through DOMPurify to sanitize it
    safeHTML: DOMPurify.sanitize(unverifiedHTML, config),
    props: props as unknown as T,
  }
}

/**
 * `SafeHTMLBox` extends `Box` from `@primer/react` with props for safely
 * rendering HTML strings. Exactly one `html` or `unverifiedHTML` must be
 * supplied.
 *
 * `html` only supports strings that have specifically been marked as verified,
 * which means either they come from a trusted source on the server, they have
 * known static contents, or they have been sanitized by DOMPurify.
 *
 * `unverifiedHTML` supports arbitrary strings; they will be run through
 * DOMPurify before being put in the DOM.
 */
export const SafeHTMLBox = withSafeHTML<BoxProps>(Box) as PolymorphicForwardRefComponent<
  'div' | 'span' | 'pre' | 'table' | 'tbody' | 'tr' | 'td' | 'ul' | 'ol' | 'li',
  PropsWithHTML<BoxProps>
>
SafeHTMLBox.displayName = 'SafeHTMLBox'

/**
 * `SafeHTMLText` extends `Text` from `@primer/react` with props for safely
 * rendering HTML strings. Exactly one `html` or `unverifiedHTML` must be
 * supplied.
 *
 * `html` only supports strings that have specifically been marked as verified,
 * which means either they come from a trusted source on the server, they have
 * known static contents, or they have been sanitized by DOMPurify.
 *
 * `unverifiedHTML` supports arbitrary strings; they will be run through
 * DOMPurify before being put in the DOM.
 */
export const SafeHTMLText = withSafeHTML<TextProps>(Text) as PolymorphicForwardRefComponent<
  'div' | 'span' | 'p' | 'strong' | 'em' | 'pre' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'a',
  PropsWithHTML<TextProps>
>
SafeHTMLText.displayName = 'SafeHTMLText'

/**
 * A higher-order component that extends a basic component by offering
 * `html` and `unverifiedHTML` props that are safe alternatives to `dangerouslySetInnerHTML`.
 */
function withSafeHTML<T>(Component: React.ComponentType<T>) {
  // We give these display names above
  // eslint-disable-next-line react/display-name
  const SafeHTMLComponent = forwardRef<HTMLSpanElement, PropsWithHTML<T>>((propsWithHtml, ref) => {
    const {safeHTML, props} = getSafeHTMLAndProps(propsWithHtml)
    // This is the only place in the codebase where `dangerouslySetInnerHTML` should be allowed
    // eslint-disable-next-line react/forbid-component-props
    return <Component ref={ref} {...props} dangerouslySetInnerHTML={safeHTML ? {__html: safeHTML} : undefined} />
  })

  return SafeHTMLComponent
}

/**
 * `SafeHTMLDiv` extends `div`with props for safely rendering HTML strings.
 * Exactly one `html` or `unverifiedHTML` must be supplied.
 *
 * `html` only supports strings that have specifically been marked as verified,
 * which means either they come from a trusted source on the server, they have
 * known static contents, or they have been sanitized by DOMPurify.
 *
 * `unverifiedHTML` supports arbitrary strings; they will be run through
 * DOMPurify before being put in the DOM.
 */
export const SafeHTMLDiv = forwardRef<
  HTMLDivElement,
  PropsWithHTML<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>
>((propsWithHtml, ref) => {
  const {safeHTML, props} = getSafeHTMLAndProps(propsWithHtml)
  // eslint-disable-next-line react/no-danger
  return <div ref={ref} {...props} dangerouslySetInnerHTML={safeHTML ? {__html: safeHTML} : undefined} />
})
SafeHTMLDiv.displayName = 'SafeHTMLDiv'
