import type {ViewType} from '../../../helpers/view-type'
import type {MemexProjectColumnId} from '../../columns/contracts/memex-column'
import type {RoadmapZoomLevel} from '../../view/contracts'
import type {SidePanelUI, TitleFieldUI} from './common'
import type {DraftStats} from './draft'

export * from './common'
export * from './draft'

export const ViewOptionsToolbarUI = 'view options toolbar'
export const ViewOptionsMenuUI = 'view options menu'
export type ViewOptionsUIType = typeof ViewOptionsMenuUI | typeof ViewOptionsToolbarUI

export type FieldGroupUIType = typeof TableHeaderMenuUI | typeof CommandPaletteUI | ViewOptionsUIType

interface StatGroupByApplied {
  key: typeof GroupByStatKey
  groupByEnabled: boolean
  memexProjectColumnId: MemexProjectColumnId
  ui: FieldGroupUIType
  context?: string
}
export const GroupByStatKey = 'memex_project_field_group_by'

interface StatGroupByExpandCollapseToggle {
  key: typeof GroupByCollapseToggleStatKey
  groupTitle: string
  memexProjectColumnId: MemexProjectColumnId
  collapsed: boolean
  numberOfRows: number
}
export const GroupByCollapseToggleStatKey = 'memex_project_field_group_by_collapse_toggle'

export const AggregationSettingsItemsCountHidden = 'aggregation_settings_hide_items_count'
export const AggregationSettingsItemsCountShown = 'aggregation_settings_show_items_count'
export const AggregationSettingsSumApplied = 'aggregation_settings_sum_applied'
export const AggregationSettingsSumRemoved = 'aggregation_settings_sum_removed'

type AggregationSettingsSumStatKeys = typeof AggregationSettingsSumApplied | typeof AggregationSettingsSumRemoved

type AggregationSettingsItemsCountStatKeys =
  | typeof AggregationSettingsItemsCountHidden
  | typeof AggregationSettingsItemsCountShown

interface StatAggregationSettingsSumApplied {
  name: AggregationSettingsSumStatKeys
  memexProjectColumnId: MemexProjectColumnId
  ui: ViewOptionsUIType
  context?: ViewType
}

interface StatAggregationSettingsItemsCountToggled {
  name: AggregationSettingsItemsCountStatKeys
  ui: ViewOptionsUIType
  context?: ViewType
}

export const RoadmapDateFieldsUIPopover = 'roadmap_date_fields_popover'
export const RoadmapDateFieldSelected = 'roadmap_date_field_selected'
export const RoadmapDateFieldsPopoverDismissed = 'roadmap_date_fields_popover_dismissed'

interface StatRoadmapDateFieldSelected {
  name: typeof RoadmapDateFieldSelected
  memexProjectColumnId?: MemexProjectColumnId
  ui: ViewOptionsUIType
  context: string
}

interface StatRoadmapDateFieldsPopoverDismissed {
  name: typeof RoadmapDateFieldsPopoverDismissed
  ui: typeof RoadmapDateFieldsUIPopover
  context: string
}

export interface StatRoadmapSetZoomLevel {
  name: typeof RoadmapZoomLevelSet
  ui: ViewOptionsUIType
  context: RoadmapZoomLevel
}
export const RoadmapZoomLevelSet = 'roadmap_zoom_level_set'

export const RoadmapMarkerShow = 'roadmap_marker_show'
export const RoadmapMarkerHide = 'roadmap_marker_hide'
export interface StatToggleRoadmapMarker {
  name: typeof RoadmapMarkerShow | typeof RoadmapMarkerHide
  ui: ViewOptionsUIType
  memexProjectColumnId: MemexProjectColumnId
}

export type FieldSortUIType = typeof TableHeaderMenuUI | typeof CommandPaletteUI | ViewOptionsUIType
interface FieldSortOrder {
  name: typeof FieldSortDesc | typeof FieldSortAsc
  ui: FieldSortUIType
  context: MemexProjectColumnId
  index: number
}
export const FieldSortAsc = 'field_sort_asc'
export const FieldSortDesc = 'field_sort_desc'

interface StatTitleSaved {
  name: typeof STATE_TITLE_SAVED
  ui: string
  context: string
}

const STATE_TITLE_SAVED = 'rename'

export const TableHeaderMenuUI = 'table header menu'

export type FieldVisibilityUIType = typeof TableHeaderMenuUI | typeof CommandPaletteUI | ViewOptionsUIType
interface FieldVisibility {
  name: typeof FieldHideName | typeof FieldShowName
  ui: FieldVisibilityUIType
  memexProjectColumnId?: MemexProjectColumnId
}
export const FieldShowName = 'field_show'
export const FieldHideName = 'field_hide'
export const CommandPaletteUI = 'command palette'
export const SearchBarUI = 'search bar'
export const KeyboardShortcut = 'keyboard shortcut'

export interface SwitchLayout {
  name: typeof SwitchLayoutName
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI
  context: ViewType
}
export const SwitchLayoutName = 'layout_switch'
export const DeletedViewToastUI = 'deleted view toast'

interface DeleteField {
  name: typeof DeleteFieldName
  ui: typeof TableHeaderMenuUI
  context?: string
  memexProjectColumnId: MemexProjectColumnId
}
const DeleteFieldName = 'field_delete'

export const SearchStatName = 'search'
interface StatSearch {
  name: typeof SearchStatName
  ui?: string
  context: string
}

export const SearchCancel = 'search_cancel'
interface StatSearchCancel {
  name: typeof SearchCancel
}

interface ItemRename {
  name: typeof ItemRenameName
  ui: ItemRenameUIType
  memexProjectItemId: number
}

export const ItemRenameName = 'item_rename'
type ItemRenameUIType = typeof TitleFieldUI | typeof SidePanelUI
interface ItemDragAndDrop {
  name: typeof ItemDragAndDropName
  memexProjectItemId: number
  memexProjectColumnId: MemexProjectColumnId
  context: string
}

export const ItemDragAndDropName = 'item_drag_and_drop'
export const DragAndDropStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const
export type DragAndDropStatus = ObjectValues<typeof DragAndDropStatus>

export const ViewsRename = 'view_rename'
export const ViewsSave = 'view_save'
export const ViewsDuplicate = 'view_duplicate'
export const ViewsSaveAsNew = 'view_save_as_new'
export const ViewsReset = 'view_reset'
export const ViewsCreate = 'view_create'
export const ViewsDelete = 'view_delete'
export const ViewsOpen = 'view_open'

export interface StatViewsRename {
  name: typeof ViewsRename
  ui: typeof ViewOptionsMenuUI | typeof TabNavigationUI
}
export interface StatViewsSave {
  name: typeof ViewsSave
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof SearchBarUI | typeof KeyboardShortcut
}
export interface StatViewsDuplicate {
  name: typeof ViewsDuplicate
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof DeletedViewToastUI | typeof TabNavigationUI
}
export interface StatViewsSaveAsNew {
  name: typeof ViewsSaveAsNew
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof DeletedViewToastUI | typeof TabNavigationUI
}
export interface StatViewsReset {
  name: typeof ViewsReset
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof SearchBarUI
}

export const TabNavigationUI = 'tab navigation'
export interface StatViewsCreateNew {
  name: typeof ViewsCreate
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof TabNavigationUI
  context: ViewType
}
export interface StatViewsDelete {
  name: typeof ViewsDelete
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI
}
export interface StatViewsOpen {
  name: typeof ViewsOpen
  ui: typeof ViewOptionsMenuUI | typeof CommandPaletteUI | typeof TabNavigationUI
}

export const SettingsOpen = 'settings_open'
export const SettingsOpenField = 'settings_field'
const SettingsOpenMainUI = 'project settings'
export const SettingsOpenColumnHeaderUI = 'column header'
export const SettingsOpenSidebarUI = 'settings sidebar nav'
interface StatsSettingsOpen {
  name: typeof SettingsOpen | typeof SettingsOpenField
  ui: typeof SettingsOpenMainUI | typeof SettingsOpenColumnHeaderUI | typeof SettingsOpenSidebarUI
  context?: string
  memexProjectColumnId?: MemexProjectColumnId
}

export const SettingsFieldReorder = 'settings_field_reorder'
export const SettingsFieldReorderSettingsUI = 'settings'
interface StatsSettingsFieldReorder {
  name: typeof SettingsFieldReorder
  ui: typeof SettingsFieldReorderSettingsUI
  context: string
  memexProjectColumnId: MemexProjectColumnId
}

export const SettingsFieldRename = 'settings_field_rename'
const SettingsFieldRenameColumnHeaderUI = 'column header'
export const SettingsFieldCustomTypeRenameUI = 'custom_type_rename_dialog'
export const SettingsFieldRenameSettingsUI = 'settings'
interface StatsSettingsFieldRename {
  name: typeof SettingsFieldRename
  ui:
    | typeof SettingsFieldRenameColumnHeaderUI
    | typeof SettingsFieldRenameSettingsUI
    | typeof SettingsFieldCustomTypeRenameUI
  context: string
  memexProjectColumnId: MemexProjectColumnId
}

export const SettingsFieldDelete = 'settings_field_delete'
export const SettingsFieldDeleteUI = 'settings'
interface StatsSettingsFieldDelete {
  name: typeof SettingsFieldDelete
  ui: typeof SettingsFieldDeleteUI
  context: string
  memexProjectColumnId: MemexProjectColumnId
}

export const SettingsFieldOptionAdd = 'settings_field_add'
export const SettingsFieldOptionDelete = 'settings_field_delete'
export const SettingsFieldOptionOrder = 'settings_field_order'
export const SettingsFieldOptionSave = 'settings_field_save'
export const SettingsFieldOptionMainUI = 'settings'
export const SettingsFieldOptionHeaderUI = 'table header menu'
export interface StatsSettingsFieldOption {
  name:
    | typeof SettingsFieldOptionAdd
    | typeof SettingsFieldOptionDelete
    | typeof SettingsFieldOptionOrder
    | typeof SettingsFieldOptionSave
  ui: typeof SettingsFieldOptionMainUI | typeof SettingsFieldOptionHeaderUI
  context?: string
  memexProjectColumnId?: MemexProjectColumnId
}

export const ItemOrder = 'item_order'
interface StatsItemOrder {
  name: typeof ItemOrder
  context: string
  memexProjectItemId: number
}

export const ItemValueEdit = 'item_value_edit'
interface StatsItemValueEdit {
  name: typeof ItemValueEdit
  memexProjectColumnId: MemexProjectColumnId
  memexProjectItemId: number
}

export const ItemValueAdd = 'item_value_add'
interface StatsItemValueAdd {
  name: typeof ItemValueAdd
  memexProjectColumnId: MemexProjectColumnId
  memexProjectItemId: number
}

export const FieldMove = 'field_move'
export type FieldMoveUIType = typeof TableHeaderMenuUI | ViewOptionsUIType
interface StatsFieldMove {
  name: typeof FieldMove
  context: string
  memexProjectColumnId: MemexProjectColumnId
  ui: FieldMoveUIType
}

const FieldResize = 'field_resize'
interface StatsFieldResize {
  name: typeof FieldResize
  context: string
  memexProjectColumnId: MemexProjectColumnId
}

export const FieldRename = 'field_rename'
interface StatsFieldRename {
  name: typeof FieldRename
  ui: typeof TableHeaderMenuUI
  memexProjectColumnId: MemexProjectColumnId
  context: string
}

export const TableRowActionMenuUI = 'table row action menu'
export const TableRowKeyboardUI = 'table row keyboard shortcut'
export const BoardCardActionMenuUI = 'board card action menu'
export const BoardCardKeyboardUI = 'board card keyboard shortcut'
export const BoardColumnActionMenuUI = 'board column action menu'
export const RoadmapRowActionMenuUI = 'roadmap row action menu'
export const ArchivePageBulkActionMenu = 'archive page bulk action menu'
export const ArchivePageRowActionMenu = 'archive page row action menu'
export const ItemDeleteFromProject = 'item_delete'
export const ItemArchiveFromProject = 'item_archive'

/**
 * `StatsItemActionFromProjectUI` refers to one of
 * two options either `delete` or `archive`
 */
export type StatsItemActionFromProjectUI =
  | typeof TableRowActionMenuUI
  | typeof TableRowKeyboardUI
  | typeof BoardCardActionMenuUI
  | typeof BoardCardKeyboardUI
  | typeof BoardColumnActionMenuUI
  | typeof RoadmapRowActionMenuUI
  | typeof ArchivePageBulkActionMenu
  | typeof ArchivePageRowActionMenu
  | typeof SidePanelUI
export type BoardActionUI = typeof BoardCardKeyboardUI | typeof BoardCardActionMenuUI

interface StatsItemDeleteFromProject {
  name: typeof ItemDeleteFromProject
  ui: StatsItemActionFromProjectUI
  numberOfRows: number
  context?: string
}

interface StatsItemArchiveFromProject {
  name: typeof ItemArchiveFromProject
  ui: StatsItemActionFromProjectUI
  numberOfRows: number
  context?: string
}

export const ProjectDescriptionAdd = 'description_add'
export const ProjectDescriptionUpdate = 'description_update'
export const ProjectDescriptionShow = 'description_show'
export const ProjectDescriptionSettingsPageUI = 'settings'
export const ProjectDescriptionSidePanelUI = 'side-panel'

export const ProjectLinkChangelog = 'changelog_open'
export const ProjectLinkDocs = 'docs_open'
export const ProjectLinkFeedback = 'feedback_open'
export const ProjectTopMenuUI = 'top_menu'
export const UseThisTemplateUI = 'use_this_template_ui'

type StatsProjectTopMenuUI = typeof ProjectTopMenuUI

interface StatsProjectLinkChangelog {
  name: typeof ProjectLinkChangelog
  ui: StatsProjectTopMenuUI
}

interface StatsProjectLinkDocs {
  name: typeof ProjectLinkDocs
  ui: StatsProjectTopMenuUI
}

interface StatsProjectLinkFeedback {
  name: typeof ProjectLinkFeedback
  ui: StatsProjectTopMenuUI
}

type StatsProjectDescriptionUI = typeof ProjectDescriptionSettingsPageUI | typeof ProjectDescriptionSidePanelUI

interface StatsProjectDescriptionAdd {
  name: typeof ProjectDescriptionAdd
  ui: StatsProjectDescriptionUI
}

interface StatsProjectDescriptionUpdate {
  name: typeof ProjectDescriptionUpdate
  ui: StatsProjectDescriptionUI
}

export const ProjectReadmeAdd = 'readme_add'
export const ProjectReadmeUpdate = 'readme_add'
export const ProjectReadmeSettingsPageUI = 'settings'
const ProjectReadmeSidePanelUI = 'side-panel'

type StatsProjectReadmeUI = typeof ProjectReadmeSettingsPageUI | typeof ProjectReadmeSidePanelUI

interface StatsProjectReadmeAdd {
  name: typeof ProjectReadmeAdd
  ui: StatsProjectReadmeUI
}

interface StatsProjectReadmeUpdate {
  name: typeof ProjectReadmeUpdate
  ui: StatsProjectReadmeUI
}

interface StatsProjectDescriptionShow {
  name: typeof ProjectDescriptionShow
  ui: typeof ProjectDescriptionSidePanelUI
}

export const PathChange = 'path_change'

interface StatsPathChange {
  name: typeof PathChange
  context: string
}

export const WorkflowsOpen = 'workflows_open'

interface StatsWorkflows {
  name: typeof WorkflowsOpen
}

export const InsightsViewOpen = 'insights_view_open'
export const InsightsChartNavigation = 'insights_chart_navigation'
export const InsightsChartCreate = 'insights_chart_create'
export const InsightsChartUpdate = 'insights_chart_update'
export const InsightsChartDelete = 'insights_chart_delete'
export const InsightsChartRename = 'insights_chart_rename'
export const InsightsChartUpdateLocal = 'insights_chart_update_local'
export const InsightsChartDiscardLocal = 'insights_chart_discard_local'
export const InsightsUpsellDialogOpen = 'insights_upsell_dialog_open'
export const InsightsUpsellDialogUpgradeClick = 'insights_upsell_dialog_upgrade_click'

export type InsightsStatsType =
  | typeof InsightsViewOpen
  | typeof InsightsChartNavigation
  | typeof InsightsChartCreate
  | typeof InsightsChartUpdate
  | typeof InsightsChartDelete
  | typeof InsightsChartRename
  | typeof InsightsChartUpdateLocal
  | typeof InsightsChartDiscardLocal
  | typeof InsightsUpsellDialogOpen
  | typeof InsightsUpsellDialogUpgradeClick

interface StatsInsights {
  name: InsightsStatsType
  context?: string
}

export const SlicerPanelUI = 'slice panel'
export type SlicerStatsUIType = typeof SlicerPanelUI
export type SliceByAppliedUIType =
  | typeof SlicerPanelUI
  | typeof TableHeaderMenuUI
  | typeof CommandPaletteUI
  | ViewOptionsUIType

export const SliceByApplied = 'slice_by_applied'
export const SliceByRemoved = 'slice_by_removed'
export type SliceByAppliedStatsType = typeof SliceByApplied | typeof SliceByRemoved

interface StatsSliceByApplied {
  name: SliceByAppliedStatsType
  memexProjectColumnId?: MemexProjectColumnId
  ui?: SliceByAppliedUIType
  context?: string
}

export const SliceItemSelected = 'slice_item_selected'
export const SliceItemDeselected = 'slice_item_deselected'
export const SlicerDeselect = 'slicer_deselect'
export const SlicerShowEmpty = 'slicer_show_empty'
export const SlicerHideEmpty = 'slicer_hide_empty'
export type SlicerStatsType =
  | typeof SliceItemSelected
  | typeof SliceItemDeselected
  | typeof SlicerDeselect
  | typeof SlicerShowEmpty
  | typeof SlicerHideEmpty

interface StatsSlicer {
  name: SlicerStatsType
  memexProjectColumnId: MemexProjectColumnId
  ui: SlicerStatsUIType
  context?: string
}

export const SidePanelTableOpen = 'side_panel_table_open'
export const SidePanelBoardOpen = 'side_panel_board_open'
export const SidePanelMetadataRefresh = 'side_panel_metadata_refresh'
export const SidePanelNavigateToItem = 'side_panel_navigate_to_item'
export const SidePanelEditItem = 'side_panel_edit_item'
export const SidePanelUpdateIssueState = 'side_panel_update_issue_state'
export const SidePanelReact = 'side_panel_react'
export const SidePanelPostComment = 'side_panel_post_comment'
export const SidePanelEditComment = 'side_panel_edit_comment'

export type SidePanelStatsType =
  | typeof SidePanelTableOpen
  | typeof SidePanelBoardOpen
  | typeof SidePanelMetadataRefresh
  | typeof SidePanelNavigateToItem
  | typeof SidePanelEditItem
  | typeof SidePanelUpdateIssueState
  | typeof SidePanelReact
  | typeof SidePanelPostComment
  | typeof SidePanelEditComment

interface StatsSidePanel {
  name: SidePanelStatsType
  context?: string
}

export const ItemAddedDoesNotMatchFilter = 'item_added_does_not_match_filter'
type StatItemAddedDoesNotMatchFilter = {
  name: typeof ItemAddedDoesNotMatchFilter
  context?: string
}

// default templates Feature, Backlog, Board, Table
export const TemplatesCreate = 'templates_create'
export const TemplatesCancel = 'templates_cancel'

//custom templates
export const CustomTemplateSelect = 'custom_template_select'

export const CopyProject = 'copy'

export const CopyAsTemplate = 'copy_as_template'

export const CreatedWithTemplateClick = 'created_with_template_click'

interface StatTemplatesCancel {
  name: typeof TemplatesCancel
}
interface StatsTemplatesCreate {
  name: typeof TemplatesCreate
  context: string
  ui: string
}

interface StatCustomTemplateSelect {
  name: typeof CustomTemplateSelect
  context: string
  ui: string
}

interface StatCopyProject {
  name: typeof CopyProject
  ui: string
}

interface StatCopyAsTemplate {
  name: typeof CopyAsTemplate
  ui: string
}

interface StatCreatedWithTemplateClick {
  name: typeof CreatedWithTemplateClick
  ui: typeof ProjectDescriptionSettingsPageUI
  context: string
}

export const BulkAddSidePanelOpen = 'bulk_add_side_panel_open'
export const BulkAddSidePanelRepoSwitched = 'bulk_add_side_panel_repo_switched'
export const BulkAddSidePanelAddItems = 'bulk_add_side_panel_add_items'
export const BulkAddTrackedByItems = 'bulk_add_tracked_by_items'

export const OmnibarDiscoverSuggestionsUI = 'omnibar_discovery_suggestions_ui'
export const OmnibarAddItemSuggestionsUI = 'omnibar_add_item_suggestions_ui'
export const GroupedUI = 'grouped ui'
export type BulkAddTrackedByItemsUIType = typeof GroupedUI | typeof SlicerPanelUI

export type BulkAddSidePanelOpenUIType =
  | typeof OmnibarDiscoverSuggestionsUI
  | typeof OmnibarAddItemSuggestionsUI
  | typeof CommandPaletteUI

interface StatBulkAddSidePanelOpen {
  name: typeof BulkAddSidePanelOpen
  ui?: BulkAddSidePanelOpenUIType
}
interface StatBulkAddSidePanelRepoSwitched {
  name: typeof BulkAddSidePanelRepoSwitched
  context: string
}

interface StatBulkAddSidePanelAddItems {
  name: typeof BulkAddSidePanelAddItems
  context: string
}
interface StatBulkAddTrackedByItems {
  name: typeof BulkAddTrackedByItems
  context: string
  ui: BulkAddTrackedByItemsUIType
}

export const BoardColumnMenuHide = 'board_column_menu_hide'
export const BoardColumnPlusHide = 'board_column_plus_hide'
export const BoardColumnPlusShow = 'board_column_plus_show'

type BoardColumnVisibilityType = typeof BoardColumnMenuHide | typeof BoardColumnPlusHide | typeof BoardColumnPlusShow

interface StatBoardColumnVisibility {
  name: BoardColumnVisibilityType
  context: string
}

export const GroupHide = 'group_hide'
interface StatGroupVisibility {
  name: typeof GroupHide
  context: string
}

export const SettingsDataLossSingleSelectWarning = 'settings_data_loss_single_select_warning'
export const SettingsDataLossIterationWarning = 'settings_data_loss_iteration_warning'
export const SettingsDataLossSingleSelectSave = 'settings_data_loss_single_select_save'
export const SettingsDataLossIterationSave = 'settings_data_loss_iteration_save'
export const SettingsDataLossSingleSelectCancel = 'settings_data_loss_single_select_cancel'
export const SettingsDataLossIterationCancel = 'settings_data_loss_iteration_cancel'

type SettingsDataLossType =
  | typeof SettingsDataLossSingleSelectWarning
  | typeof SettingsDataLossIterationWarning
  | typeof SettingsDataLossSingleSelectSave
  | typeof SettingsDataLossIterationSave
  | typeof SettingsDataLossSingleSelectCancel
  | typeof SettingsDataLossIterationCancel

interface StatSettingsDataLoss {
  name: SettingsDataLossType
  context: string
}

export const ProjectSettingsSaveSuccess = 'project_settings_save_success'
export const ProjectSettingsSaveError = 'project_settings_save_error'

type ProjectSettingsType = typeof ProjectSettingsSaveSuccess | typeof ProjectSettingsSaveError

interface StatProjectSettings {
  name: ProjectSettingsType
  context: string
}

const ExistingColumnFound = 'existing_column_found'

/**
 * Event for identifying problem column creation events where the
 * column is already present in client-side state after making the
 * server-side call.
 *
 * These should not happen.
 *
 * Enabling this as an experiment to see if this happens at all in the wild
 * after removing the "blank slate" state for a project.
 */
interface StatExistingColumnFound {
  name: typeof ExistingColumnFound
  id: MemexProjectColumnId
}

export const UserSettingsEdit = 'user_settings_edit'
interface StatUserSettingsEdit {
  name: typeof UserSettingsEdit
  context: string
}

export const BulkColumnValueUpdate = 'bulk_column_value_update'
export type BulkColumnValueUpdateUi = 'shortcut' | 'context_menu'

interface StatBulkColumnValueUpdate {
  name: typeof BulkColumnValueUpdate
  memexProjectColumnId: MemexProjectColumnId
  context: number
  ui: BulkColumnValueUpdateUi
}

export const Undo = 'undo'
export type UndoUi = 'toolbar_button' | 'keyboard_shortcut' | 'bulk_action_toast' | 'command_palette_command'

interface StatUndo {
  name: typeof Undo
  ui: UndoUi
  /** Description of the action that was undone. */
  context: string
}

export const SidePanelPin = 'side_panel_pin'

/** when the side panel is pinned or unpinned */
interface StatSidePanelPin {
  name: typeof SidePanelPin
  context: 'pin' | 'unpin'
}

export const RegionFocus = 'region_focus'

/** When the user uses cmd/ctrl+f6 to shift focus across regions */
interface StatRegionFocusJump {
  name: typeof RegionFocus
  context: 'target: main' | 'target: side panel'
}

export const CardMove = 'card_move'
export const CardMoveUI = {
  KeyboardShortcut: 'keyboard_shortcut',
  MouseMove: 'mouse_move',
  ContextMenu: 'context_menu',
} as const
export type CardMoveUIType = (typeof CardMoveUI)[keyof typeof CardMoveUI]

interface StatCardMove {
  name: typeof CardMove
  ui: CardMoveUIType
  context: string
}

export const AddTasklistButtonClick = 'add_tasklist_button_click'

interface StatAddTasklistButtonClick {
  name: typeof AddTasklistButtonClick
}

export const StatusUpdateCreate = 'status_update_create'
export const StatusUpdateUpdate = 'status_update_update'
export const StatusUpdateDestroy = 'status_update_destroy'
export const StatusUpdateOpenCurrent = 'status_update_open_current'

export type StatusUpdateType =
  | typeof StatusUpdateCreate
  | typeof StatusUpdateUpdate
  | typeof StatusUpdateDestroy
  | typeof StatusUpdateOpenCurrent

interface StatStatusUpdate {
  name: StatusUpdateType
  context: string
}

export const DismissedUserNotice = 'dismissed_user_notice'
interface StatsDismissedUserNotice {
  name: typeof DismissedUserNotice
  context: string
}

type StatPayload =
  | StatGroupByApplied
  | StatGroupByExpandCollapseToggle
  | StatAggregationSettingsItemsCountToggled
  | StatAggregationSettingsSumApplied
  | StatRoadmapDateFieldSelected
  | StatRoadmapDateFieldsPopoverDismissed
  | StatToggleRoadmapMarker
  | StatRoadmapSetZoomLevel
  | FieldSortOrder
  | StatTitleSaved
  | FieldVisibility
  | SwitchLayout
  | DeleteField
  | DraftStats
  | StatSearch
  | ItemRename
  | ItemDragAndDrop
  | StatItemAddedDoesNotMatchFilter
  | StatViewsRename
  | StatViewsSave
  | StatViewsDuplicate
  | StatViewsReset
  | StatViewsCreateNew
  | StatViewsDelete
  | StatViewsOpen
  | StatViewsSaveAsNew
  | StatSearchCancel
  | StatsSettingsOpen
  | StatsSettingsFieldReorder
  | StatsSettingsFieldDelete
  | StatsSettingsFieldRename
  | StatsSettingsFieldOption
  | StatsSidePanel
  | StatsInsights
  | StatsSliceByApplied
  | StatsSlicer
  | StatsItemOrder
  | StatsItemValueEdit
  | StatsItemValueAdd
  | StatsFieldMove
  | StatsFieldResize
  | StatsFieldRename
  | StatsItemDeleteFromProject
  | StatsItemArchiveFromProject
  | StatsProjectDescriptionAdd
  | StatsProjectDescriptionUpdate
  | StatsProjectDescriptionShow
  | StatsProjectReadmeAdd
  | StatsProjectReadmeUpdate
  | StatsProjectLinkChangelog
  | StatsProjectLinkDocs
  | StatsProjectLinkFeedback
  | StatsPathChange
  | StatsWorkflows
  | StatTemplatesCancel
  | StatsTemplatesCreate
  | StatCustomTemplateSelect
  | StatCopyProject
  | StatCopyAsTemplate
  | StatCreatedWithTemplateClick
  | StatBulkAddSidePanelOpen
  | StatBulkAddSidePanelRepoSwitched
  | StatBulkAddSidePanelAddItems
  | StatBulkAddTrackedByItems
  | StatExistingColumnFound
  | StatBoardColumnVisibility
  | StatGroupVisibility
  | StatSettingsDataLoss
  | StatUserSettingsEdit
  | StatBulkColumnValueUpdate
  | StatUndo
  | StatSidePanelPin
  | StatRegionFocusJump
  | StatCardMove
  | StatAddTasklistButtonClick
  | StatStatusUpdate
  | StatsDismissedUserNotice
  | StatProjectSettings

export type PostStatsRequest = {
  payload: StatPayload & {
    /**
     * An optional view number parameter that can be used to
     * replaces the default read of the current context.
     *
     * This is required for methods defined _outside_ of the
     * ViewContext as well as for `isNew` memexes
     *
     * @todo update postStats to pull from a context we can update from further down the stack to
     * provide defaults back up the tree
     */
    memexProjectViewNumber?: number
  }
}

export type PostStatsResponse = {success: boolean}
