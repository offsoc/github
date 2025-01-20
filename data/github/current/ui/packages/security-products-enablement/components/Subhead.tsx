import type React from 'react'

interface SubheadProps {
  children: React.ReactNode
  description?: string
}

const Subhead: React.FC<SubheadProps> = ({children, description}) => {
  return (
    <>
      <div className={'Subhead'}>
        <h2 className="Subhead-heading">{children}</h2>
      </div>
      {description && (
        <div data-testid="subhead-description" className="Subhead-description mb-3">
          {description}
        </div>
      )}
    </>
  )
}

export default Subhead
