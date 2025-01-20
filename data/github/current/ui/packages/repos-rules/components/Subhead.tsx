import type {FC} from 'react'
import {Label} from '@primer/react'

type SubheadProps = {
  heading: string
  description?: string
  className?: string
  alphaOrBeta?: string
  renderAction?: () => JSX.Element | null
}

export const Subhead: FC<SubheadProps> = ({heading, description, className, alphaOrBeta, renderAction}) => {
  return (
    <div className={`Subhead d-flex flex-justify-between flex-items-center ${className || ''}`}>
      <div className={'d-flex flex-items-center gap-2'}>
        <h1 className="Subhead-heading f2-light">{heading}</h1>
        {alphaOrBeta && (
          <Label variant="success" sx={{mr: 2}}>
            {alphaOrBeta}
          </Label>
        )}
        {description ? <p className="Subhead-description mb-2">{description}</p> : null}
      </div>

      {renderAction && renderAction()}
    </div>
  )
}
