import {Box, TextInput, type TextInputProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react'

const sizerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  overflow: 'scroll',
  whiteSpace: 'pre',
}

/**
 * Copies styles to a list of elements.
 *
 * @param styles
 * @param nodes
 */
const copyStylesToNodes = (styles: HTMLElement['style'], nodes: ReadonlyArray<HTMLElement | null>) => {
  for (const node of nodes) {
    if (node) {
      node.style.font = styles.font
      node.style.fontSize = styles.fontSize
      node.style.fontFamily = styles.fontFamily
      node.style.fontWeight = styles.fontWeight
      node.style.fontStyle = styles.fontStyle
      node.style.letterSpacing = styles.letterSpacing
      node.style.textTransform = styles.textTransform
    }
  }
}

function getSizerValue(...values: ReadonlyArray<string | number | ReadonlyArray<string> | undefined>) {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value.toString()
    }
  }
  return ''
}

type AutosizeTextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement> & {
    /** a minWidth for the input */
    minWidth?: number
    containerSx?: BetterSystemStyleObject
  } & TextInputProps,
  'style'
>

/**
 * An input field that automatically sizes to fit its value contents.
 */
export const AutosizeTextInput = forwardRef(
  function AutosizeTextInput({minWidth = 1, as: As = TextInput, containerSx, ...props}, forwardedRef) {
    const inputRef = useRef<HTMLInputElement>(null)
    const sizerRef = useRef<HTMLDivElement>(null)
    const placeholderRef = useRef<HTMLDivElement>(null)

    /** delegate the internal ref to the forwarded one if there is one */
    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(forwardedRef, () => inputRef.current)

    /** Dynamically compute the width for the input */
    const resizeInput = useCallback(() => {
      // Querying the input-styles in a rAF ensures that the font is correctly reported.
      // See - https://github.com/github/memex/issues/4332
      requestAnimationFrame(() => {
        const {current: currentSizer} = sizerRef
        const {current: placeholderSizer} = placeholderRef
        if (!currentSizer) {
          return
        }

        const inputStyles = inputRef.current && window.getComputedStyle(inputRef.current)
        if (inputStyles) {
          copyStylesToNodes(inputStyles, [currentSizer, placeholderSizer])
        }

        const currentSizerScrollWidth = currentSizer.scrollWidth
        const placeholderSizerScrollWidth = placeholderSizer?.scrollWidth ?? 0

        const newInputWidth = Math.max(
          currentSizerScrollWidth + 2,
          inputRef.current?.value === '' ? placeholderSizerScrollWidth + 2 : 0,
          minWidth,
        )
        if (inputRef.current) {
          inputRef.current.style.width = `${newInputWidth}px`
        }
      })
    }, [minWidth])

    useEffect(() => {
      resizeInput()
    })

    const componentProps: React.InputHTMLAttributes<HTMLInputElement> & {
      ref: React.Ref<HTMLInputElement>
    } & TextInputProps = {
      ...props,

      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        resizeInput()
        props.onChange?.(e)
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        resizeInput()
        props.onBlur?.(e)
      },

      ref: inputRef,
    }

    return (
      <Box sx={containerSx}>
        <Box sx={sizerStyle} ref={sizerRef} aria-hidden="true">
          {getSizerValue(props.defaultValue, props.value)}
        </Box>
        {props.placeholder ? (
          <Box sx={sizerStyle} ref={placeholderRef} aria-hidden="true">
            {props.placeholder}
          </Box>
        ) : null}
        <As {...componentProps} />
      </Box>
    )
  },
  /**
   * Casting types here because `forwardRef` is not able to be
   * typed in a generic way, and the polymorphic `as` needs a generic
   * to be able to pass through props to the underlying component.
   */
) as ReactPolymorphic.ForwardRefComponent<'input', AutosizeTextInputProps>
