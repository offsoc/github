import {temporaryPermissiveParseHTMLPolicy} from '@github-ui/trusted-types-policies/parse-html'

export function parseHTML(document: Document, html: string): DocumentFragment {
  const template = document.createElement('template')
  template.innerHTML = temporaryPermissiveParseHTMLPolicy.createHTML(html)
  return document.importNode(template.content, true)
}
