import {useEffect, useState} from 'react'
import {emailSubscriptionTopicsByEmailPath, emailSubscriptionTopicsByParamsPath} from '@github-ui/paths'
import type {TopicSetting, UseTopicSettingsParams, TopicSettingsResponse, EmailSubscriptionTopicsParams} from '../types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export function useTopicSettings({
  paramEmail,
  paramCTID,
  paramECID,
  paramK,
  paramD,
  paramPID,
  paramTID,
  paramCMID,
  paramMK,

  setCPMParams,
  setEmail,
}: UseTopicSettingsParams): TopicSettingsResponse {
  const [isFetchPreferencesFinished, setIsFetchPreferencesFinished] = useState<boolean>(false)
  const [hasErrorRetriable, setHasErrorRetriable] = useState<boolean>(false)
  const [hasErrorNotRetriable, setHasErrorNotRetriable] = useState<boolean>(false)
  const [topics, setTopics] = useState<TopicSetting[]>([])

  let path = ''
  if (paramEmail && paramEmail.length) {
    path = emailSubscriptionTopicsByEmailPath(paramEmail)
  } else if (paramCTID && paramECID && paramK) {
    path = emailSubscriptionTopicsByParamsPath(<EmailSubscriptionTopicsParams>{
      CTID: paramCTID,
      ECID: paramECID,
      K: paramK,
      D: paramD,
      PID: paramPID,
      TID: paramTID,
      CMID: paramCMID,
      MK: paramMK,
    })
  }

  useEffect(() => {
    const fetchTopicSettings = async () => {
      try {
        const response = await verifiedFetchJSON(path, {
          method: 'GET',
          cache: 'no-store',
        })

        const resp = await response.json()

        if (resp.has_error) {
          if (resp.new_link_required) {
            setHasErrorNotRetriable(true)
          } else {
            setHasErrorRetriable(true)
          }
        } else {
          setTopics(resp.data.topics)

          if (paramEmail && paramEmail.length) {
            setCPMParams(resp.cpm_params)
          } else {
            setEmail(resp.email)
          }
        }
        setIsFetchPreferencesFinished(true)
      } catch {
        setHasErrorRetriable(true)
      }
    }

    fetchTopicSettings()
  }, [paramEmail, path, setCPMParams, setEmail])

  useEffect(() => {
    const railsLoader = document.getElementById('js-rails-loading')
    if (isFetchPreferencesFinished && !!railsLoader) {
      railsLoader.style.display = 'none'
    }

    return () => {
      if (railsLoader) {
        railsLoader.style.display = ''
      }
    }
  }, [isFetchPreferencesFinished])

  const topicSettingsResp: TopicSettingsResponse = {
    done: isFetchPreferencesFinished,
    topics,
  }

  if (hasErrorNotRetriable || hasErrorRetriable) {
    topicSettingsResp['error'] = {retriable: hasErrorRetriable}
  }

  return topicSettingsResp
}
