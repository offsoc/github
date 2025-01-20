import {Observer} from './Observer'
import type {IObservableLikeValue} from './observable'

export interface IConditionalChildrenProps {
  /**
   * Whether to apply a not operator to the result of the renderChildren value
   * @default false
   */
  inverse?: boolean

  /**
   * Whether or not to show the children of this component.
   * If Observable, will subscribe and re-render on change notifications.
   */
  renderChildren: IObservableLikeValue<boolean>
}

export function ConditionalChildren(props: IConditionalChildrenProps & Readonly<{children?: React.ReactNode}>) {
  return (
    <Observer renderChildren={props.renderChildren}>
      {(observedProps: {renderChildren: boolean}) => {
        if (observedProps.renderChildren !== !!props.inverse) {
          if (props.children) {
            return props.children
          }
        }
        return null
      }}
    </Observer>
  )
}
