import {
  type ActionListItemProps,
  type ActionListLinkItemProps,
  Button,
  type ButtonProps,
  Flash,
  TabNav,
  type TabNavProps,
} from '@primer/react'

import {RefSelectorV1} from './RefSelectorV1'

export interface RefSelectorFooterProps {
  text: string
  onClick?: () => void
  href?: ActionListLinkItemProps['href']
  sx?: ActionListItemProps['sx']
}

export interface RefSelectorProps {
  /**
   * A className to pass to the button that opens the ref selector.
   */
  buttonClassName?: string
  /**
   * A key used to represent the freshness of any given list of refs.
   * In ruby, this can be constructed with `BranchesHelper#ref_list_cache_key`
   */
  cacheKey: string
  /**
   * True if the ref selector should display an option to create a branch.
   */
  canCreate: boolean
  /**
   * The current ref or commit being viewed.
   */
  currentCommitish: string
  /**
   * The default branch for the current repository.
   */
  defaultBranch: string
  /**
   * A function to create an href to which we should navigate when a ref is selected.
   */
  getHref?: (ref: string) => string
  /**
   * If true, the ref selector will not show the "View all branches" option at the bottom.
   */
  hideShowAll?: boolean
  /**
   * The owner of the repo.
   */
  owner: string
  /**
   * The name of the repo (without the owner).
   */
  repo: string
  /**
   * The type of the selected ref: 'branch' or 'tag'.
   * If 'tree', the ref selector will normalize to 'branch' and the display text will be the short SHA of the currentCommitish.
   */
  selectedRefType?: RefType | 'tree'
  /**
   * The types of refs that the ref selector should display.
   * By default, ['branches', 'tags']
   */
  types?: RefType[]
  /**
   * The name of the data-hotkey (e.g: "w")
   */
  hotKey?: string
  /**
   * The ending to put on the id of the ref selector button for SSR so that it doesn't change when rendering on
   * the client.
   */
  idEnding?: string
  /**
   * Optional callback that will be invoked when a ref item is clicked (mouse) or selected (keyboard).
   */
  onSelectItem?: (ref: string, refType: RefType) => void
  /**
   * If true, when a ref item is clicked (mouse) or selected (keyboard), the ref selector is closed.
   */
  closeOnSelect?: boolean
  /**
   * A function that is called if ref creation fails.
   */
  onCreateError?: (errorMessage: string) => void
  /**
   * A function that is called before making a create branch request.
   */
  onBeforeCreate?: (refName: string) => void
  /**
   * A callback that is invoked on ref selector menu state change.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * A callback that is invoked on ref selector menu state change.
   */
  onRefTypeChanged?: (refType: RefType) => void
  /**
   * Props for rendering a managed Action List/Link Item footer
   */
  customFooterItemProps?: RefSelectorFooterProps
  /**
   * Size of the button to render
   * @default 'medium' if not provided
   * Option of 'small', 'medium', or 'large'
   */
  size?: ButtonProps['size']
  /**
   * Optional alignment prop for the view all ref item
   */
  viewAllJustify?: 'center' | 'start'
  /**
   * Optional prop to allow branch name to be > 125px
   * This is useful when the branch picker is in a resizable area ie. page layout pane
   */
  allowResizing?: boolean
  /**
   * Set to true to use the default focus zone for the anchored overlay.
   */
  useFocusZone?: boolean
}

export type RefType = 'branch' | 'tag'
export const defaultTypes: RefType[] = ['branch', 'tag']

/**
 * An action menu that allows the user to switch between branches or tags.
 *
 * TODO: Currently this does not have support for customizing how the items,
 *       zero states, and branch creation action are rendered. The old
 *       <ref-selector> element allowed that by requiring each usage to pass
 *       in templates. The right solution here is probably something like
 *       a set of render props.
 *
 * @remarks
 * This accomplishes something very similar to the <ref-selector> web component.
 * There are a few reasons that working with that component in react is difficult:
 * - React has bugs in how it handles <template> elements, and those bugs are
 *   not likely to be fixed for perf reasons: https://github.com/facebook/react/issues/19932
 *   This can be worked around, but it is very easy to break.
 * - There is no way to attach callbacks to elements that would be rendered
 *   through a template, since those DOM nodes are all going to be copied in
 *   a way that is not managed by React.
 */
export function RefSelector(props: RefSelectorProps) {
  return <RefSelectorV1 {...props} />
}

interface RefTypeTabsProps {
  refType: RefType
  onRefTypeChanged: (refType: RefType) => void
  sx?: TabNavProps['sx']
}

export function RefTypeTabs({refType, onRefTypeChanged, sx}: RefTypeTabsProps) {
  return (
    <TabNav sx={{pl: 2, ...sx}} aria-label="Ref type">
      <TabNav.Link
        as={Button}
        id="branch-button"
        aria-controls="branches"
        selected={refType === 'branch'}
        onClick={() => onRefTypeChanged('branch')}
        sx={{borderBottomRightRadius: 0, borderBottomLeftRadius: 0}}
      >
        Branches
      </TabNav.Link>
      <TabNav.Link
        as={Button}
        id="tag-button"
        aria-controls="tags"
        selected={refType === 'tag'}
        onClick={() => onRefTypeChanged('tag')}
        sx={{borderBottomRightRadius: 0, borderBottomLeftRadius: 0}}
      >
        Tags
      </TabNav.Link>
    </TabNav>
  )
}

export function LoadingFailed({refType}: {refType: RefType}) {
  return <Flash variant="danger">Could not load {refType === 'branch' ? 'branches' : 'tags'}</Flash>
}
