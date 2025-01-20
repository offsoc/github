////////////////////////////////////////////////////////////////////////////////
// IT IS IMPORTANT NOT TO DIRECTLY IMPORT THIS FILE, or @github/blackbird-parser
// Because the parsing code is kind of large, and search-input-element is on
// every page, we only want to load the parsing code when the user actually uses
// the search input.
// It is ok to use `import type` to get type definitions, because that doesn't
// cause the module to get loaded at runtime.
////////////////////////////////////////////////////////////////////////////////

// this is where we load the parser so it's ok to import it here

import type {
  BaseNode,
  FinalNode,
  Location,
  NodeWithLocation,
  TextNode,
  QualifierNode,
  ContentNode,
  NodeWithOperatorLocations,
} from '@github/blackbird-parser'
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import {
  getCompatibleSearchTypes,
  isContentNode,
  isQualifierCompatible,
  SearchType,
  parse,
  getPossibleQualifierValues,
} from '@github/blackbird-parser'
import {CaretPositionKind, isQualifier, isSavedQualifier, hasChildren} from './common'

// Re-export SearchType
export {SearchType, getPossibleQualifierValues}

const nonBreakingSpace = String.fromCharCode(160)

export function parseString(value: string): FinalNode {
  // we need &nbsp; at the end to make the browser happy but parser doesn't handle nbsp very well
  // TODO: make parser handle nbsp very well
  const regex = new RegExp(nonBreakingSpace, 'g')
  return parse(value.replace(regex, ' '))
}

export function parseSearchInput(value: string): [FinalNode, Array<string | HTMLElement>] {
  const root = parseString(value)
  const highlights = getHighlights(root)
  sortHighlights(highlights)

  const nodes = [] as Array<string | HTMLElement>
  // TODO: would be nice if we could check to see if there have been changes since last run
  // idx is the index of the last character added to elem
  let idx = 0

  for (const hl of highlights) {
    if (idx <= hl.location.start) {
      // add any text before the highlight
      nodes.push(value.substring(idx, hl.location.start).replace(' ', String.fromCharCode(160)))
      idx = hl.location.start

      // now add the highlight
      const span = document.createElement('span')
      span.classList.add(hl.className)
      span.textContent = value.substring(hl.location.start, hl.location.end)
      nodes.push(span)
      idx = hl.location.end
    }
  }
  // add any text after the last highlight
  if (idx < value.length) {
    nodes.push(value.substring(idx).replace(' ', nonBreakingSpace))
  }

  return [root, nodes]
}

export function getCustomScopeNames(ast: BaseNode): string[] {
  const nodes: QualifierNode[] = []
  findCustomScopeNodes(nodes, ast)

  const customScopeNames = nodes.map(node => (node.content as ContentNode).value.toString())

  // Deduplicate custom scope names
  return [...new Set(customScopeNames)]
}

function findCustomScopeNodes(nodes: QualifierNode[], node: BaseNode): void {
  if (isSavedQualifier(node) && isContentNode(node.content)) {
    nodes.push(node)
  }
  if (hasChildren(node)) {
    for (node of node.children) {
      findCustomScopeNodes(nodes, node)
    }
  }
}

/**
 * This function is designed to convert a search query containing saved searches into a form suitable for the legacy
 * search types. It rewrites saved searches into their expanded form (their query value), and also removes the "OR"
 * operator since it is not supported by the legacy search types.
 */
export function getExpandedQuery(
  query: string,
  customScopes: Array<{name: string; query: string}>,
  ast: BaseNode,
): string {
  let expandedQuery = ''

  const customScopeNodes: QualifierNode[] = []

  findCustomScopeNodes(customScopeNodes, ast)

  let index = 0
  for (const node of customScopeNodes) {
    if (isContentNode(node.content)) {
      expandedQuery += query.substring(index, node.location.start)
      const scopeValue = customScopes.find(scope => isContentNode(node.content) && scope.name === node.content.value)
        ?.query
      if (scopeValue) {
        expandedQuery += removeUnsupportedOrOperator(scopeValue)
      }
      index = node.content.location.end
    }
  }
  expandedQuery += query.substring(index)

  return expandedQuery
}

// The OR operator is not supported by legacy search types
function removeUnsupportedOrOperator(query: string): string {
  return query.replaceAll(' OR ', ' ')
}

// This function moves the cursor to a character offset within the element .
// If the position is -1, it goes to the end.
export function moveCaretToPosition(elem: HTMLInputElement, position: number) {
  const target = position === -1 ? elem.value.length : position
  elem.focus()
  elem.setSelectionRange(target, target)
  // TODO: try to scroll the cursor into view (perhaps in styledtextinput)
}

interface Highlight {
  className: string
  location: Location
}

/**
 * Maps node kind to how it should be highlighted
 */
const kindHighlightMap: {[type: string]: {className: string; selector: 'location' | 'operatorLocation'} | undefined} = {
  And: {className: 'pl-en', selector: 'operatorLocation'},
  Not: {className: 'pl-en', selector: 'operatorLocation'},
  Or: {className: 'pl-en', selector: 'operatorLocation'},
  Regex: {className: 'pl-c1', selector: 'location'},
}

export function getHighlights(node: BaseNode): Highlight[] {
  let highlights: Highlight[] | undefined
  if (isQualifier(node) && hasLocation(node.content)) {
    highlights = [{className: 'input-parsed-symbol', location: node.content.location}]
  } else if (isTextNode(node) && (node.value === 'AND' || node.value === 'OR' || node.value === 'NOT')) {
    highlights = [{className: 'pl-en', location: node.location}]
  } else {
    const info = kindHighlightMap[node.kind]
    if (info) {
      if (info.selector === 'location' && hasLocation(node)) {
        highlights = [{className: info.className, location: node.location}]
      }
      if (info.selector === 'operatorLocation' && hasOperatorLocations(node)) {
        highlights = node.operatorLocations.map(location => ({
          className: info.className,
          location,
        }))
      }
    }
  }

  highlights = highlights ?? []
  if (hasChildren(node)) {
    return highlights.concat(node.children.flatMap(getHighlights))
  } else if (isQualifier(node)) {
    return highlights.concat(getHighlights(node.content))
  } else {
    return highlights
  }
}

function sortHighlights(highlights: Highlight[]) {
  highlights.sort((a, b) => a.location.start - b.location.start)
}

function isTextNode(node: BaseNode): node is TextNode {
  return !!(node as TextNode).value
}

function hasLocation(node: BaseNode): node is NodeWithLocation {
  return !!(node as NodeWithLocation).location
}

function hasOperatorLocations(node: BaseNode): node is NodeWithOperatorLocations {
  return !!(node as NodeWithOperatorLocations).operatorLocations
}

export function getCaretPositionKindFromIndex(
  root: FinalNode,
  idx: number,
): {node?: BaseNode; kind: CaretPositionKind} {
  function findMatchingNode(node: BaseNode, index: number): BaseNode | undefined {
    if (hasChildren(node)) {
      for (const child of node.children) {
        const match = findMatchingNode(child, index)
        if (match) {
          return match
        }
      }
    }

    if (hasLocation(node)) {
      const start = node.location.start
      let end = node.location.end

      if (isQualifier(node) && hasLocation(node.content)) {
        end = node.content.location.end
      }

      if (index >= start && index <= end) {
        return node
      }
    }
  }

  const matchedNode = findMatchingNode(root, idx)
  if (!matchedNode) {
    return {kind: CaretPositionKind.Text}
  }

  if (matchedNode.kind === 'Regex') {
    return {kind: CaretPositionKind.Regex}
  }

  if (isQualifier(matchedNode)) {
    if (matchedNode.qualifier === 'Is') {
      return {kind: CaretPositionKind.Is, node: matchedNode}
    } else if (matchedNode.qualifier === 'Language') {
      return {kind: CaretPositionKind.Language, node: matchedNode}
    } else if (matchedNode.qualifier === 'Path') {
      return {kind: CaretPositionKind.Path, node: matchedNode}
    } else if (matchedNode.qualifier === 'Repo') {
      return {kind: CaretPositionKind.Repository, node: matchedNode}
    } else if (matchedNode.qualifier === 'Owner') {
      return {kind: CaretPositionKind.Owner, node: matchedNode}
    } else if (matchedNode.qualifier === 'Org') {
      return {kind: CaretPositionKind.Owner, node: matchedNode}
    } else if (matchedNode.qualifier === 'Saved') {
      return {kind: CaretPositionKind.Saved, node: matchedNode}
    } else {
      return {kind: CaretPositionKind.OtherQualifier, node: matchedNode}
    }
  }

  return {kind: CaretPositionKind.Text, node: matchedNode}
}

export function extractUnsupportedQualifiers(root: BaseNode, type: SearchType): string[] {
  const out: string[] = []
  function __extractInvalid(node: BaseNode) {
    if (isQualifier(node) && !isQualifierCompatible(type, node.qualifier)) {
      const qualifier = node.raw.toLowerCase().substring(0, node.raw.length - 1)
      if (!out.includes(qualifier)) {
        out.push(qualifier)
      }
    } else if (isQualifier(node) && node.qualifier === 'Is') {
      // public, private, issue, pr
      const contentNode = node.content
      if (isContentNode(contentNode)) {
        const value = contentNode.value
        if (type !== SearchType.Issues && value === 'issue') {
          out.push('is:issue')
        } else if (type !== SearchType.PRs && value === 'pr') {
          out.push('is:pr')
        }
      }
    }

    if (hasChildren(node)) {
      for (const child of node.children) {
        __extractInvalid(child)
      }
    }
  }
  __extractInvalid(root)

  return out
}

const enum ConstraintKind {
  Hint,
  Compatible,
  Avoid,
  Match,
}

export function chooseSearchType(ast: BaseNode, loggedIn: boolean): SearchType {
  // Use some heuristics to guess the search type based on the query
  const searchTypePreferences: Record<SearchType, number> = {
    [SearchType.Repositories]: 0.5, // Prefer repos if nothing else
    [SearchType.Code]: 0.2,
    // Slightly prefer issues to PRs (they share many qualifiers)
    [SearchType.Issues]: 0.1,
    [SearchType.PRs]: 0,
    [SearchType.Discussions]: 0,
    [SearchType.Commits]: 0,
    [SearchType.Packages]: 0,
    [SearchType.Topics]: 0,
    [SearchType.Users]: 0,
    [SearchType.Orgs]: 0,
    [SearchType.Wikis]: 0,
    // Don't show marketplace results if ambiguous
    [SearchType.Marketplace]: -0.4,
    [SearchType.Unknown]: -1,
    [SearchType.CodeLegacy]: -1,
  }

  // Deprioritize code search if not logged in.
  if (!loggedIn) {
    searchTypePreferences[SearchType.Code] -= 5
  }

  const constraints: Array<[SearchType[], ConstraintKind]> = []
  extractSearchTypeConstraints(ast, constraints)
  for (const constraint of constraints) {
    const [types, kind] = constraint
    if (kind === ConstraintKind.Hint) {
      for (const type of types) {
        searchTypePreferences[type] += 1
      }
    } else if (kind === ConstraintKind.Match) {
      // if we have an extact type match this should get more than a single point added
      // otherwise for repo/org searches, Code will always win by weight
      for (const type of types) {
        searchTypePreferences[type] += 1.5
      }
    } else if (kind === ConstraintKind.Avoid) {
      for (const type of types) {
        searchTypePreferences[type] -= 1
      }
    } else {
      const typeMap: Record<string, boolean> = {}
      for (const type of types) {
        typeMap[type] = true
      }
      for (const allowedType of Object.keys(searchTypePreferences)) {
        if (!typeMap[allowedType]) {
          delete searchTypePreferences[allowedType as SearchType]
        }
      }
    }
  }

  const preferredTypes: Array<[SearchType, number]> = Object.keys(searchTypePreferences).map(key => [
    key as SearchType,
    searchTypePreferences[key as SearchType],
  ])

  let chosenType = SearchType.Unknown
  if (preferredTypes.length > 0) {
    preferredTypes.sort((a, b) => b[1] - a[1])
    chosenType = preferredTypes[0]![0]
  }

  return chosenType
}

export type SearchTypeURLParameter =
  | ''
  | 'code'
  | 'repositories'
  | 'pullrequests'
  | 'issues'
  | 'discussions'
  | 'commits'
  | 'registrypackages'
  | 'marketplace'
  | 'topics'
  | 'users'
  | 'wikis'
  | 'codelegacy'

export function mapSearchTypeToURLParam(type: SearchType): SearchTypeURLParameter {
  // Map the chosen type to a URL param value
  return ({
    [SearchType.Unknown]: '',
    [SearchType.Code]: 'code',
    [SearchType.Repositories]: 'repositories',
    [SearchType.PRs]: 'pullrequests',
    [SearchType.Issues]: 'issues',
    [SearchType.Discussions]: 'discussions',
    [SearchType.Commits]: 'commits',
    [SearchType.Packages]: 'registrypackages',
    [SearchType.Marketplace]: 'marketplace',
    [SearchType.Topics]: 'topics',
    [SearchType.Users]: 'users',
    [SearchType.Orgs]: 'users',
    [SearchType.Wikis]: 'wikis',
    [SearchType.CodeLegacy]: 'codelegacy',
  }[type] || '') as SearchTypeURLParameter
}

export function searchTypeAsPlural(type: SearchType): string {
  return (
    {
      [SearchType.Unknown]: '',
      [SearchType.Code]: 'code',
      [SearchType.Repositories]: 'repositories',
      [SearchType.PRs]: 'pull requests',
      [SearchType.Issues]: 'issues',
      [SearchType.Discussions]: 'discussions',
      [SearchType.Commits]: 'commits',
      [SearchType.Packages]: 'packages',
      [SearchType.Marketplace]: 'the marketplace',
      [SearchType.Topics]: 'topics',
      [SearchType.Users]: 'users',
      [SearchType.Orgs]: 'users',
      [SearchType.Wikis]: 'wikis',
      [SearchType.CodeLegacy]: 'code',
    }[type] || ''
  )
}

export function mapURLParamToSearchType(type: SearchTypeURLParameter): SearchType {
  return (
    {
      '': SearchType.Unknown,
      code: SearchType.Code,
      repositories: SearchType.Repositories,
      pullrequests: SearchType.PRs,
      issues: SearchType.Issues,
      discussions: SearchType.Discussions,
      commits: SearchType.Commits,
      registrypackages: SearchType.Packages,
      marketplace: SearchType.Marketplace,
      topics: SearchType.Topics,
      users: SearchType.Users,
      orgs: SearchType.Orgs,
      wikis: SearchType.Wikis,
      codelegacy: SearchType.CodeLegacy,
    }[type] || SearchType.Unknown
  )
}

function extractSearchTypeConstraints(node: BaseNode, out: Array<[SearchType[], ConstraintKind]>) {
  if (isQualifier(node)) {
    if (node.qualifier === 'Repo') {
      out.push([[SearchType.Repositories], ConstraintKind.Avoid])
    }

    if (node.qualifier === 'Repo' || node.qualifier === 'Org') {
      out.push([[SearchType.Code], ConstraintKind.Hint])
    }

    if (node.qualifier === 'Saved') {
      out.push([[SearchType.Code], ConstraintKind.Compatible])
    }

    if (isContentNode(node.content)) {
      // Only code search supports regex queries
      if (node.content.kind === 'Regex') {
        out.push([[SearchType.Code], ConstraintKind.Compatible])
      }

      const value = node.content.value.toString().toLowerCase()
      if (node.qualifier === 'Is') {
        if (value === 'pr') {
          out.push([[SearchType.PRs], ConstraintKind.Compatible])
        } else if (value === 'issue') {
          out.push([[SearchType.Issues], ConstraintKind.Compatible])
        } else if (value === 'sponsorable') {
          out.push([[SearchType.Users, SearchType.Repositories], ConstraintKind.Compatible])
        }
      } else if (node.qualifier === 'Type') {
        const typeMap = new Map([
          ['commit', SearchType.Commits],
          ['discussion', SearchType.Discussions],
          ['issue', SearchType.Issues],
          ['marketplace', SearchType.Marketplace],
          ['org', SearchType.Orgs],
          ['package', SearchType.Packages],
          ['pr', SearchType.PRs],
          ['topic', SearchType.Topics],
          ['user', SearchType.Users],
          ['wiki', SearchType.Wikis],
        ])
        if (typeMap.has(value)) {
          out.push([[typeMap.get(value)!], ConstraintKind.Match])
        }
      }
    }

    const compatibleSearchTypes = getCompatibleSearchTypes(node.qualifier)
    if (compatibleSearchTypes.length > 0) {
      out.push([compatibleSearchTypes, ConstraintKind.Compatible])
    }
  } else if (node.kind === 'Regex') {
    out.push([[SearchType.Code], ConstraintKind.Compatible])
  }

  if (hasChildren(node)) {
    for (const child of node.children) {
      extractSearchTypeConstraints(child, out)
    }
  }
}
