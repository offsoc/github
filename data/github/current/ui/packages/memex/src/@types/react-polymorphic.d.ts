/**
 * Adapted from https://github.com/reach/reach-ui/blob/develop/packages/utils/src/polymorphic.ts
 * and https://github.com/radix-ui/primitives/blob/2f139a832ba0cdfd445c937ebf63c2e79e0ef7ed/packages/react/polymorphic/src/polymorphic.ts
 *
 * The provide a collection of utility types under the ReactPolymorphic namespace for typing react components that properly infer
 * additional props from an ElementType passed in an as prop in both ForwardRef and Memo scenarios (neither of which allow for generics as they are typed natively)
 */

declare namespace ReactPolymorphic {
  // eslint-disable-next-line @typescript-eslint/ban-types
  type Merge<P1 = {}, P2 = {}> = Omit<P1, keyof P2> & P2

  /**
   * Infers `OwnProps` if E is a ForwardRefComponent
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  type OwnProps<E> = E extends ForwardRefComponent<any, infer P> ? P : {}

  /**
   * Infers the JSX.IntrinsicElement if E is a ForwardRefComponent
   */
  type IntrinsicElement<E> = E extends ForwardRefComponent<infer I, any> ? I : never

  type NarrowIntrinsic<E> = E extends keyof JSX.IntrinsicElements ? E : never

  type ForwardRefExoticComponent<E, ComponentOwnProps> = React.ForwardRefExoticComponent<
    Merge<E extends React.ElementType ? React.ComponentPropsWithRef<E> : never, ComponentOwnProps & {as?: E}>
  >

  /**
   * Extends original type to ensure built in React types play nice with
   * polymorphic components still e.g. `React.ElementRef` etc.
   */
  interface ForwardRefComponent<
    IntrinsicElementString,
    // eslint-disable-next-line @typescript-eslint/ban-types
    ComponentOwnProps = {},
    /*
     * Extends original type to ensure built in React types play nice with
     * polymorphic components still e.g. `React.ElementRef` etc.
     */
  > extends ForwardRefExoticComponent<IntrinsicElementString, ComponentOwnProps> {
    /*
     * When `as` prop is passed, use this overload. Merges original own props
     * (without DOM props) and the inferred props from `as` element with the own
     * props taking precedence.
     *
     * We explicitly avoid `React.ElementType` and manually narrow the prop types
     * so that events are typed when using JSX.IntrinsicElements.
     */
    <
      As extends
        | keyof JSX.IntrinsicElements
        | React.JSXElementConstructor<any> = NarrowIntrinsic<IntrinsicElementString>,
    >(
      props: As extends keyof JSX.IntrinsicElements // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        ? Merge<JSX.IntrinsicElements[As], OwnProps & {as: As}>
        : As extends React.JSXElementConstructor<infer P> // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          ? Merge<P, OwnProps & {as: As}>
          : never,
    ): React.ReactElement | null
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  interface MemoComponent<IntrinsicElementString, ComponentOwnProps = {}>
    extends React.MemoExoticComponent<ForwardRefComponent<IntrinsicElementString, ComponentOwnProps>> {
    <
      As extends
        | keyof JSX.IntrinsicElements
        | React.JSXElementConstructor<any> = NarrowIntrinsic<IntrinsicElementString>,
    >(
      props: As extends keyof JSX.IntrinsicElements
        ? Merge<JSX.IntrinsicElements[As], ComponentOwnProps & {as: As}>
        : As extends React.JSXElementConstructor<infer P>
          ? Merge<P, ComponentOwnProps & {as: As}>
          : never,
    ): React.ReactElement | null
  }
}
