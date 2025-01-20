import {themeGet} from '@primer/react'

type ColorAccessors =
  | `colors.${'fg' | 'border'}.${'default' | 'muted' | 'subtle' | 'onEmphasis'}`
  | 'colors.canvas.default'
type OverlayShadowAccessors = 'shadows.overlay.shadow'
type ShadowAccessors = `shadows.shadow.${string}`
type SpaceAccessors = `space.${number}`
type Accessors = ColorAccessors | ShadowAccessors | SpaceAccessors | OverlayShadowAccessors
/**
 *
 * Themes from primer are not properly typed, and as a result
 * we can't safely access them directly.
 *
 * This is a Kludge to add some level of type safety
 * when getting values from the theme for use in sx props.
 * It's not perfect, but it's better than nothing.
 *
 * See the definition here - {@link https://primer.style/react/theme-reference}
 *
 * If you're using this and you're getting a type error,
 * you might need to add additional types to the accessors
 *
 * If primer ever properly types the theme, this can be removed
 */
export function themeGetSx(accessor: Accessors) {
  return (theme: FixMeTheme) => {
    const property = themeGet(accessor)({theme})
    assertStringInDev(property, accessor)
    return property
  }
}

/**
 * In development, we want to make sure that the themeGetSx function
 * returns a proper value, which can inform us that the accessor
 * is still valid. Since types can change opaquely from underneath
 * us, this should help catch primer theme changes that require
 * type changes here
 */
function assertStringInDev(value: unknown, accessor: string): asserts value is string {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    if (typeof value !== 'string') {
      throw new Error(`Expected "${accessor}" to be a string. Value was: "${JSON.stringify(value)}"`)
    }
  }
}
