import type {ModelPacksPayload} from '../routes/ModelPacks'

export function getModelPacksRoutePayload(): ModelPacksPayload {
  return {
    orgSecurityAnalysisUrl: '',
    formUrl: '/form',
    formMethod: 'put',
    existingModelPacks: 'my/new@1.2.3',
    defaultSetupUrl: 'code-security/configuring-default-setup-for-code-scanning',
    codeqlPackPublishUrl: 'code-security/publishing-and-using-codeql-packsrunning-codeql-pack-publish',
    aboutCodeqlPacksUrl: 'code-security/creating-and-working-with-codeql-packsabout-codeql-packs-and-the-codeql-cli',
  }
}
