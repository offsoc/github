import {createRequestHandler, type MswResponseResolver} from '.'

export const post_getMarkdownPreview = (responseResolver: MswResponseResolver<{text: string}, string>) => {
  return createRequestHandler('post', 'memex-preview-markdown-api-data', responseResolver, {ignoreJsonBody: true})
}
