import {temporaryPermissiveJtmlPolicy} from '@github-ui/trusted-types-policies/jtml'
// eslint-disable-next-line no-restricted-imports
import {TemplateResult} from '@github/jtml'

// eslint-disable-next-line no-restricted-imports
export {html, unsafeHTML, render} from '@github/jtml'

TemplateResult.setCSPTrustedTypesPolicy(temporaryPermissiveJtmlPolicy)
export {TemplateResult}
