import {useState, useMemo, useRef} from 'react'
import {emailSubscriptionNewLinkPath} from '@github-ui/paths'
import {Checkbox, Heading, FormControl} from '@primer/react'
import UncheckedValueCheckbox from './UncheckedValueCheckbox'
import {useTopicSettings} from './hooks/use-topic-settings'
import {useToggleSubmitDisabled} from './hooks/use-toggle-submit-disabled'
import {useToggleUnsubscribeAll} from './hooks/use-toggle-unsubscribe-all'
import type {EmailSubscriptionFormProps, CPMParamsState, TopicsRef} from './types'

export function EmailSubscriptionForm({
  paramEmail,

  paramCTID,
  paramECID,
  paramK,
  paramD,
  paramPID,
  paramTID,
  paramCMID,
  paramMK,
}: EmailSubscriptionFormProps) {
  const topicsRef = useRef<TopicsRef>({})

  const [email, setEmail] = useState(paramEmail)
  const [cpmParams, setCPMParams] = useState<CPMParamsState>({
    CTID: paramCTID,
    ECID: paramECID,
    K: paramK,
    D: paramD,
    PID: paramPID,
    TID: paramTID,
    CMID: paramCMID,
    MK: paramMK,
  })

  const {done, topics, error} = useTopicSettings({
    paramEmail,
    paramCTID,
    paramECID,
    paramK,
    paramD,
    paramPID,
    paramTID,
    paramCMID,
    paramMK,
    setEmail,
    setCPMParams,
  })

  const currentSubscribedIds = useMemo(() => topics.map(t => t.id), [topics])
  const toggleSubmitDisabled = useToggleSubmitDisabled(topicsRef)
  const toggleUnsubscribeAll = useToggleUnsubscribeAll(currentSubscribedIds, toggleSubmitDisabled, topicsRef)

  if (!done) {
    return <div data-testid="emailSubscriptionTopicsLoadingContainer" />
  } else if (error) {
    if (error.retriable) {
      return (
        <div data-testid="emailSubscriptionTopicsContainer">
          <p>We had a problem finding your email subscriptions.</p>
          <p>
            Please refresh the page to try again. If the issue persists,{' '}
            <a href={emailSubscriptionNewLinkPath()}>click here to request a new subscription management link</a>, or
            reach out to <a href="https://support.github.com/">our support</a> for help.
          </p>
        </div>
      )
    } else {
      return (
        <div data-testid="emailSubscriptionTopicsContainer">
          <p>We had a problem finding your email subscriptions.</p>
          <p>
            Please <a href={emailSubscriptionNewLinkPath()}>click here to request a new subscription management link</a>
            . If the issue persists, reach out to <a href="https://support.github.com/">our support</a> for help.
          </p>
        </div>
      )
    }
  } else if (!topics.length) {
    return (
      <div data-testid="emailSubscriptionTopicsContainer">
        <Heading as="h1" className="Subhead-heading">
          Subscription preferences for {email}
        </Heading>
        <hr />
        <p>No subscriptions found</p>
      </div>
    )
  } else {
    return (
      <div data-testid="emailSubscriptionTopicsContainer">
        <Heading as="h1" className="Subhead-heading">
          Subscription preferences for {email}
        </Heading>
        <hr />

        <p>
          {
            "To stop receiving emails for the topics below, uncheck any topics you don't want to receive, then click Save subscription preferences"
          }
        </p>

        <div>
          {topics.map(topic => (
            <div key={topic.id} className="topicInputContainer" ref={ref => (topicsRef.current[topic.id] = ref)}>
              <UncheckedValueCheckbox
                defaultChecked={true}
                name={`topics[${topic.id}]`}
                onChange={toggleSubmitDisabled}
                value="true"
                uncheckedValue="false"
                label={topic.name}
                caption={topic.description}
                className="topicInputCheckbox"
              />
            </div>
          ))}
        </div>

        <div>
          <input type="hidden" name="CTID" value={cpmParams.CTID} />
          <input type="hidden" name="ECID" value={cpmParams.ECID} />
          <input type="hidden" name="K" value={cpmParams.K} />
          <input type="hidden" name="D" value={cpmParams.D} />
          <input type="hidden" name="PID" value={cpmParams.PID} />
          <input type="hidden" name="TID" value={cpmParams.TID} />
          <input type="hidden" name="CMID" value={cpmParams.CMID} />
          <input type="hidden" name="MK" value={cpmParams.MK} />
        </div>

        <hr />
        <FormControl>
          <Checkbox name="unsubscribeAll" onChange={toggleUnsubscribeAll} />
          <FormControl.Label>Unsubscribe from all topics</FormControl.Label>
        </FormControl>
      </div>
    )
  }
}
