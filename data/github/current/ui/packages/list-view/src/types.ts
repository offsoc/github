import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {CSSProperties} from 'react'

export type OptionalKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface DeprecatedSxProp {}

export interface StylableProps {
  className?: string
  style?: CSSProperties
  /** @deprecated This component has moved to CSS Modules and will soon remove `sx` prop styling support. */
  sx?: BetterSystemStyleObject
}

export type PrefixedStylableProps<P extends string> = {
  // sadly there's no way to preserve the deprecation metadata here (https://github.com/microsoft/TypeScript/issues/50715)
  [K in keyof StylableProps as `${P}${Capitalize<K>}`]: StylableProps[K]
}
