import {CheckIcon, StopIcon} from '@primer/octicons-react'
import {Animate, AnimationProvider, Stack} from '@primer/react-brand'

type FlashProps = {
  variant: 'success' | 'error'
  children: React.ReactNode
}

export function Flash({children, variant}: FlashProps) {
  return (
    <AnimationProvider runOnce>
      <Animate animate="fade-in">
        <Stack
          direction="horizontal"
          justifyContent="flex-start"
          gap={16}
          style={{
            alignItems: 'baseline',
            border:
              variant === 'success'
                ? '1px solid var(--brand-color-success-fg)'
                : '1px solid var(--brand-color-error-fg)',
            borderRadius: 'var(--brand-borderRadius-medium)',
            background: variant === 'success' ? 'var(--base-color-scale-green-0)' : 'var(--base-color-scale-red-0)',
          }}
        >
          <div
            style={{
              color: variant === 'success' ? 'var(--brand-color-success-fg)' : 'var(--brand-color-error-fg)',
              height: 16,
              width: 16,
            }}
          >
            {variant === 'success' ? <CheckIcon size={16} /> : <StopIcon size={16} />}
          </div>

          <div>{children}</div>
        </Stack>
      </Animate>
    </AnimationProvider>
  )
}
