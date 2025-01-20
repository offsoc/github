import {Text} from '@primer/react'

export function NoData() {
  return (
    <>
      <Text
        as="p"
        sx={{
          color: 'fg.subtle',
          fontSize: 4,
          fontWeight: 'light',
          lineHeight: 'condensed',
        }}
      >
        Data unavailable
      </Text>
    </>
  )
}
