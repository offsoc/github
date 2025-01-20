import type {useNavigate} from '@github-ui/use-navigate'
import type {FlashProps} from '@primer/react'

export type To = Parameters<ReturnType<typeof useNavigate>>[0]

export interface FlashState {
  message: string
  variant: FlashProps['variant']
}
