import type {ActionsSurveyProps} from '../ActionsSurvey'

export function getActionsSurveyProps(): ActionsSurveyProps {
  return {
    surveyLink: 'http://github.localhost/test/?actions&id=0',
    surveyOpenCallbackPath: 'http://github.localhost/github/internal-server/actions/survey/open',
    surveyDismissCallbackPath: 'http://github.localhost/github/internal-server/actions/survey/dismiss',
  }
}
