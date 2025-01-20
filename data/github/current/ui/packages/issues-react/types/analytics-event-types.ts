export type HyperlistTargetType = FILTER_BAR_ELEMENTS | SEARCH_RESULT_ELEMENTS

type FILTER_BAR_ELEMENTS = 'FILTER_BAR_INPUT' | 'FILTER_BAR_SAVE_BUTTON'
type SEARCH_RESULT_ELEMENTS = 'SEARCH_RESULT_ROW'

export type HyperlistEventType = SEARCH_EVENTS | SEARCH_RESULT_EVENTS

type SEARCH_EVENTS = 'search.execute' | 'search.save'
type SEARCH_RESULT_EVENTS = 'search_results.select_row'
