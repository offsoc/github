import type {DefaultSetupPayload} from '../routes/DefaultSetup'

export function getDefaultSetupRoutePayload(): DefaultSetupPayload {
  return {
    securityAnalysisUrl: '',
    querySuitesDocumentationUrl: '',
    taintedDataDocumentationUrl: '',
    customBuildDocumentationUrl: '',
    codeqlLanguagesDocumentationUrl: '',
    defaultBranch: '',
    protectedBranchesUrl: '',
    formUrl: '/form',
    formMethod: 'post',
    isDefaultSetupEnabled: false,
    selectableLanguages: ['javascript', 'python', 'ruby'],
    selectedLanguages: [],
    selectedQuerySuite: '',
    recommendedQuerySuite: '',
    querySuiteOptions: [
      {
        label: 'Default',
        value: 'default',
        description: 'CodeQL high-precision queries.',
      },
      {
        label: 'Extended',
        value: 'extended',
        description: 'Queries from the default suite, plus lower severity and precision queries.',
      },
    ],
    selectedThreatModel: 'remote',
    showThreatModelInput: true,
    hasMacOsRunner: true,
    nextScheduledRunAt: '2024-04-01T16:30:00-08:00',
    isRepoActive: true,
  }
}
