import type {TemplateResult} from '@github-ui/jtml-shimmed'
import {html} from '@github-ui/jtml-shimmed'
import type {CaretPositionKind} from '../parsing/common'
import type {BaseNode} from '@github/blackbird-parser'
import type {SearchType} from '../parsing/parsing'

export interface CustomScope {
  id: string
  name: string
  query: string
}

export interface SuggestionInputState {
  query: string
  ast?: BaseNode
  selectedNode?: BaseNode
  mode: CaretPositionKind
  customScopes: CustomScope[]
  type: SearchType
}

export interface SuggestionAction {
  navigateTo?: string
  replaceQueryWith?: string
  executeSearch?: string
  moveCaretTo?: number
}

export class Suggestion {
  id: string

  action(_input: SuggestionInputState): SuggestionAction {
    return {}
  }

  constructor(id: string) {
    this.id = id
  }

  render(): TemplateResult {
    return html``
  }
}

export class SuggestionProvider {
  currentSuggestions: Suggestion[] = []
  title = ''

  hasSuggestions(): boolean {
    return this.currentSuggestions.length > 0
  }

  async getSuggestions(state: SuggestionInputState): Promise<Suggestion[]> {
    throw new Error(`can't provide suggestions on base class: ${state.query}`)
  }
}
