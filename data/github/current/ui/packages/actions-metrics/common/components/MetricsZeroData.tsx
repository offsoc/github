import {Blankslate} from '@primer/react/drafts'

export interface MetricsZeroDataProps {
  heading?: string
  description?: string
  primaryActionText?: string
  primaryActionHref?: string
  secondaryActionText?: string
  secondaryActionHref?: string
  visual?: React.ReactNode
}

export const MetricsZeroData = (props: MetricsZeroDataProps) => {
  return (
    <Blankslate border>
      {props.visual && <Blankslate.Visual>{props.visual}</Blankslate.Visual>}
      {props.heading && <Blankslate.Heading>{props.heading}</Blankslate.Heading>}
      {props.description && <Blankslate.Description>{props.description}</Blankslate.Description>}
      {props.primaryActionText && props.primaryActionHref && (
        <Blankslate.PrimaryAction href={props.primaryActionHref}>{props.primaryActionText}</Blankslate.PrimaryAction>
      )}
      {props.secondaryActionText && props.secondaryActionHref && (
        <Blankslate.SecondaryAction href={props.secondaryActionHref}>
          {props.secondaryActionText}
        </Blankslate.SecondaryAction>
      )}
    </Blankslate>
  )
}
