import isEqual from 'lodash-es/isEqual'
import {useEffect, useRef, useState} from 'react'
import {RequestState} from '../enums'

type UseMultiRequestCallbacks = {
  onComplete: () => void
}

function useMultiRequest(requestStates: RequestState[], callbacks: UseMultiRequestCallbacks) {
  const statesRef = useRef(requestStates)
  const [requestState, setRequestState] = useState<RequestState>(RequestState.INIT)

  if (!isEqual(requestStates, statesRef.current)) {
    statesRef.current = requestStates
  }

  useEffect(() => {
    if (statesRef.current.includes(RequestState.ERROR)) {
      setRequestState(RequestState.ERROR)
    } else if (statesRef.current.includes(RequestState.LOADING)) {
      setRequestState(RequestState.LOADING)
    } else if (statesRef.current.every(state => state === RequestState.IDLE)) {
      setRequestState(RequestState.IDLE)
      callbacks.onComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statesRef.current])

  return {requestState}
}

export default useMultiRequest
