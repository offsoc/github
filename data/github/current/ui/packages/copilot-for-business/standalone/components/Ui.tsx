import {Text} from '@primer/react'

export function StatusText(props: React.PropsWithChildren<object>) {
  return (
    <Text as="span" className="flex-shrink-0 pr-3" sx={{textAlign: 'center', color: 'fg.muted', fontSize: 12}}>
      {props.children}
    </Text>
  )
}
