import {Text} from '@primer/react'

export default function HeaderState({checksHeaderState}: {checksHeaderState: string}): JSX.Element {
  switch (checksHeaderState) {
    case 'SUCCEEDED':
      return <Text sx={{fontWeight: 'bold', fontSize: 2}}>All checks have passed</Text>
    case 'FAILED':
      return (
        <Text sx={{color: 'var(--fgColor-danger, var(--color-danger-fg))', fontWeight: 'bold', fontSize: 2}}>
          All checks have failed
        </Text>
      )
    case 'PENDING':
      return (
        <Text
          sx={{
            color: 'var(--fgColor-attention, var(--color-attention-fg))',
            fontWeight: 'bold',
            fontSize: 2,
          }}
        >
          Some checks haven’t completed yet
        </Text>
      )
    default:
      return (
        <Text sx={{color: 'var(--fgColor-danger, var(--color-danger-fg))', fontWeight: 'bold', fontSize: 2}}>
          Some checks were not successful
        </Text>
      )
  }
}
