import type {CodespacesSurveyProps} from '../CodespacesSurvey'

export function getCodespacesSurveyProps(): CodespacesSurveyProps {
  return {
    surveyLink: 'https://survey3.medallia.com/?codespaces&id=0',
    surveyOpenCallbackPath: 'http://github.localhost/github/internal-server/codespaces/survey/open',
    surveyDismissCallbackPath: 'http://github.localhost/github/internal-server/codespaces/survey/dismiss',
  }
}
