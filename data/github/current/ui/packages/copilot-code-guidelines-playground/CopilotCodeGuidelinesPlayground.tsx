import styles from './CopilotCodeGuidelinesPlayground.module.css'

import Header from './components/Header'
import Definition from './components/Definition'
import Sample from './components/Sample'
import AddSample from './components/AddSample'

import {BeakerIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/experimental'
import {Octicon} from '@primer/react'

export interface CopilotCodeGuidelinesPlaygroundProps {
  indexPath: string
}

export function CopilotCodeGuidelinesPlayground({indexPath}: CopilotCodeGuidelinesPlaygroundProps) {
  // TODO: Probably get rid of this and use real samples data
  const samples = [
    {
      hello: 'world',
    },
  ]

  return (
    <>
      <Header indexPath={indexPath} />
      <div className={`mt-3 d-flex gap-3 ${styles.container}`}>
        <Definition />
        {samples.length > 0 ? (
          <div className="d-flex flex-column gap-3 flex-1">
            {samples.map((sample, index) => (
              <Sample key={index} />
            ))}
            {/* TODO: Remove condition here when we allow multiple samples */}
            {false && <AddSample />}
          </div>
        ) : (
          <div className="flex-1 border rounded-2 d-flex flex-column flex-justify-center">
            <Blankslate spacious={true}>
              <Blankslate.Visual>
                <Octicon icon={BeakerIcon} size={24} color="fg.muted" />
              </Blankslate.Visual>
              <Blankslate.Heading>Test your guideline on a sample</Blankslate.Heading>
              <Blankslate.Description>
                Iterate on your guideline to make sure Copilot catches the right things.
              </Blankslate.Description>
              <AddSample />
            </Blankslate>
          </div>
        )}
      </div>
    </>
  )
}
