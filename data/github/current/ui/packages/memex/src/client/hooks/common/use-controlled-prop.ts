import {noop} from '@github-ui/noop'
import {useState} from 'react'

/**
 * Gets a state value that is either controlled by the component or by the consumer.
 * This hook handles situations where a component or hook wants to delegate state ownership
 * to a parent component, only if it provides the value as a prop - otherwise, it should
 * track ownership itself using `React.useState`. Since we can't call hooks conditionally
 * (as a violation of `rules-of-hooks`, this hook will encapsulate the process of always
 * calling `useState` but conditionally returning either the owned state or the delegated value.
 *
 * @param key The key for the single prop to track state for
 * @param initialValue The initial value for the uncontrolled value of the prop
 * @param props The props object which could contain the key
 * @type TAllProps The type the props object
 * @type TSingleProp The type of the individual prop which we would like to track state for
 */
export const useControlledProp = <TAllProps extends object, TSingleProp>(
  key: keyof TAllProps,
  initialValue: TSingleProp,
  props?: TAllProps,
) => {
  const [uncontrolled, setUncontrolled] = useState<TSingleProp>(initialValue)
  if (props && key in props) {
    return [props[key] as unknown as TSingleProp, noop, true] as const
  } else {
    return [uncontrolled, setUncontrolled, false] as const
  }
}
