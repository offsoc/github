import type {EmailSubscriptionFormProps} from '../types'

export const mockEmailSubscriptionFormPropsFromSettings: EmailSubscriptionFormProps = {
  paramEmail: 'octocat@github.com',
}

export const mockEmailSubscriptionFormPropsFromLinkParams: EmailSubscriptionFormProps = {
  paramCTID: '0',
  paramECID: 'Kl%2BpAxe08FPo%2BQcNulVUGeddPLUsErsvG%2FdwyyqhmnI%3D',
  paramK: 'f345caff-062c-40d4-bc2a-cd26a7dec1f3',
  paramD: '638424180997083895',
  paramPID: '19078',
  paramTID: '00000000-0000-0000-0000-000000000006',
  paramCMID: '0',
  paramMK: '',
}

export const mockCPMParams = {
  CTID: '0',
  ECID: 'Kl%2BpAxe08FPo%2BQcNulVUGeddPLUsErsvG%2FdwyyqhmnI%3D',
  K: 'f345caff-062c-40d4-bc2a-cd26a7dec1f3',
  D: '638424180997083895',
  PID: '19078',
  TID: '00000000-0000-0000-0000-000000000006',
  CMID: '0',
  MK: '',
}

export const mockNotRetriableErrorBody = {done: true, has_error: true, new_link_required: true}

export const mockRetriableErrorBody = {done: true, has_error: true, new_link_required: false}

export const mockEmptyTopicsRespBody = {done: true, data: {topics: []}}

export const mockTopic = {
  id: '00000000-0000-0000-0000-000000000006',
  name: 'GitHub wide',
  description: 'Get news about GitHub',
}

export const mockTopicsByParamsResponse = {
  data: {
    topics: [mockTopic],
  },
}

export const mockTopicsByEmailResponse = {
  data: {
    topics: [mockTopic],
  },
  cpm_params: mockCPMParams,
}
