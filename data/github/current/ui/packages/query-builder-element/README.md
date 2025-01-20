# QueryBuilder

The QueryBuilder should be used when a user wants to enter a query that will narrow results or complete a search. Use this component if you want a suggestion to either be appended to the search input or navigate to a new page. This component's suggestion set can change based on the user's input.

## Table of Contents

- [QueryBuilder](#querybuilder)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Implementation](#implementation)
      - [Instructions](#instructions)
    - [Provider types](#provider-types)
    - [Async search providers](#async-search-providers)
    - [Item types](#item-types)
    - [Filtering results](#filtering-results)
    - [Options and arguments](#options-and-arguments)
  - [Accessibility](#accessibility)
    - [Labels](#labels)
    - [Semantics](#semantics)
    - [Group support](#group-support)
    - [Styled input](#styled-input)
    - [Screen reader feedback](#screen-reader-feedback)
  - [Additional Resources](#additional-resources)

## Usage

Using an event system, the QueryBuilder emits a QueryEvent on the document whenever the input value changes. Providers (defined by the consumer of the component) will determine what to do with the new query when the events are emitted. The provider will then send back new results (if desired) to the QueryBuilder.

### Implementation

(Relevant to GitHub staff only): You can see example implementations in the QueryBuilder Lookbook (`github.localhost/lookbook/inspect/primer/experimental/query_builder/default`)

#### Instructions

1. Add the QueryBuilder PVC

Example:

```rb
# app/components/discussions/search_input_component.html.erb
<%= render Primer::Experimental::QueryBuilder.new(
  id: "query-builder-discussions", # Use this ID in the JS (example shown below) to ensure you're attaching the correct providers to this QueryBuilder instance.
  label_text: "Search all discussions",
  form_action_url: '/search'
  ) do |component|
    component.with_leading_visual_icon(icon: :search)
  end
%>
```

2. Create a providers file (using the [QueryBuilder API](ui/packages/query-builder-element/query-builder-api.ts) as reference) that will pass the data to the QueryBuilder component. Icons and descriptions are supported; refer to the API.

Example:

```ts
// app/assets/modules/github/discussions/search-input-providers.ts
import {
  FilterProvider,
  SearchProvider,
  QueryEvent,
  FilterItem
} from '@github-ui/query-builder-element/query-builder-api'
import {QueryBuilderElement} from '@github-ui/query-builder-element'
import {hasMatch, score} from 'fzy.js'
// Providers should be named with what type of data they're providing
class AuthorsProvider extends EventTarget implements FilterProvider {
  priority = 1 // determines the order the group of options should appear, lower numbers appear higher
  name = 'Authors' // name of the group
  singularItemName = 'author' // helps construct a meaningful aria-label - usually the same as `value` but can be more specific (in the event if the `is:` filter, something like `state` or `status` makes more sense). not visible anywhere.
  value = 'author' // visible name of the filter
  description = 'optional' // use this sparingly; this is added to the screen reader announcement, so refrain from using words like `filter` or being overly verbose. The screen reader announcement will already tell the user that an item is a filter, plus the header is "suggested filters" so it's clear what the filter will do

  handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)

    // The show event is required to show the filter. This can be changed to conditionally show/hide filters based on a user's input. For example, if a user types `pr:`, we may want to hide the `issue:` filter from appearing afterwards since it won't make a valid query. Make sure that this is before any data calls so that the filter shows immediately in the list.
    if (lastElement?.type !== 'filter') {
      this.dispatchEvent(new Event('show'))
    }

    this.author('lindseywild', lastElement.value)
    this.author('anotherauthor', lastElement.value)
    this.author('coolperson', lastElement.value)
  }

  // This can be anything; purely an example to show how you can fuzzy match results
  author(value: string, query: string) {
    if (query && !hasMatch(query, value)) return
    let priority = 1 // priority of the item within the group, lower numbers appear higher
    if (query) priority -= score(query, value)
    this.dispatchEvent(new FilterItem({filter: 'author', value, priority})) // creates a new filter item
  }
}

// instantiates the provider
document.addEventListener('query-builder:request-provider', (event: Event) => {
  // Ensure you're attaching the providers to the correct QueryBuilder.
  const targetId = 'query-builder-discussions'
  const target: QueryBuilderElement | null = event.target as QueryBuilderElement
  if (!target || target.id !== targetId) return

  new AuthorsProvider(event.target as QueryBuilderElement)
})
```

3. Include the provider file where ever you are defining the logic for the file

Example:

```ts
// app/assets/modules/github/discussions/search-input.ts
import './search-input-providers'
... other relevant code for the component
```

### Provider types

There are two types of Providers: SearchProvider and FilterProvider.

1. FilterProvider - use this for implementing Filters and FilterItems (see the next section for item type specifics)
2. SearchProvider - use this to implement SearchItems

### Async search providers

If you're asynchronously fetching data in a `SearchProvider`, you should send the `FetchDataEvent` before awaiting any data. This will buffer the last set of
suggestions until the `FetchDataEvent` promise resolves, preventing jittery removal/re-rendering of suggestions during fetching.

### Item types

There are three types of items that can be displayed (see the full [QueryBuilder API](ui/packages/query-builder-element/query-builder-api.ts) for more info). When an item is selected, it will either take the user somewhere (such as a search result or repository) or append the selection to the input.

1. Filter - represents a parametric qualifier that can be used to refine the scope of a search. (i.e. `repo:` or `author:`). Each Filter will show the text `Autocomplete` after the items label to help indicate what the list item will do when a user selects it. Filters are added automatically when the provider is attached; there is no separate event for this.
2. FilterItem - represents a value that can be used in a filter. (i.e. `repo:accessibility` where `repo:` is the filter and `accessibility` is the filter value). Each FilterItem will show the text `Autocomplete` after the items label to help indicate what the list item will do when a user selects it.

3. SearchItem - represents a result that appears in the results list, and has an action for a user to enact on. SearchItems can have different scopes:

- Organization level
- Repository level
- GitHub level
- Command
- Not specified

FilterItems and SearchItems include actions, which include:

1. `URLAction`, which causes navigation to a specified URL
2. `QueryAction`, which executes the specified query
3. `RewriteQueryAction`, which modifies the user's query and repositions the caret
4. `CommandAction`, which emits a CustomEvent with the specified `commandName` on the QueryBuilder, which listeners can track and react to.

The specified scope (and action) will determine the action text that appears after the label of each list item. For example, an organization level scope will show "Search in this organization" whereas a generic scope will show "Jump to".

Note: if using a `CommandAction`, the trailing action ('Run command') will be displayed, irrespective of the selected scope.

Note: the trailing action (ex. 'Autocomplete' and 'Jump to') will only be displayed if a SearchItem provider has been added to the QueryBuilder. If all items are of type Filter or FilterItems the component will not show the trailing text.

### Filtering results

Filtering results is up to the provider/user of the component. The QueryBuilder doesn't handle any results filtering because the provider may want to filter in different ways. For example, a provider may want to only show exact consecutive match results for a query, while another provider may want to show results in a fuzzy matching fashion. There are some examples of how to do this in the mock providers.

(Relevant to GitHub staff only): We recommend using [`fzy.js`](https://github.com/github/github/blob/master/node_modules/fzy.js/index.js), for consistent fuzzy filtering which is already used across the dotcom codebase. This can be used to score each entry in priority of most to least relevant.

The QueryBuilder will only show the top 5 results from a given provider, to cut down on too much noise from each individual provider. Results (SearchItems, Filters, FilterItems) are all scored using a priority key, which is an integer. Each provider is grouped so the priority key is local to the provider, to score how they see fit. Lower numbers appear higher up in the results list.

### Options and arguments

There are several options for the ViewComponent (Relevant to GitHub staff only: [QueryBuilder Variations](test/components/previews/primer/experimental/query_builder_preview.rb)):

| Name                  | Type      | Default | Description                                                                                                                        |
| --------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `form_action_url`     | `String`  | ''      | URL path the form should submit to when Enter is pressed.                                                                          |
| `visually_hide_label` | `Boolean` | `false` | Controls if the label is visible. If `true`, screen reader only text will be added. See accessibility section below for more info. |
| `show_clear_button`   | `Boolean` | `true`  | Controls if there is a "Clear" button.                                                                                             |
| `persist_list`        | `Boolean` | `false` | Determines if the listbox (search results container) should remain open when the input loses focus.                                |
| `use_overlay`         | `Boolean` | `true`  | If set to `false`, an overlay will not be rendered when the QueryBuilder is expanded.                                              |

List items can have an icon and description, see the [QueryBuilder API](ui/packages/query-builder-element/query-builder-api.ts) for reference of how to add these.

## Accessibility

The QueryBuilder is [MAS grade C (GitHub staff only)](https://github.com/github/accessibility/blob/main/docs/measuring-ourselves/microsoft-accessibility-standards.md#grade-c) and [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) compliant.

### Labels

Always set an accessible label to help the user interact with the component.

`label_text` is required and visible by default.
If you must hide the label, set `visually_hide_label` to true. However, please note that a visible label should almost always be used unless there is compelling reason not to. A placeholder is not a label.

### Semantics

The [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) is the underlying pattern for this component.

### Group support

Groups are fully supported in an accessible way. `role="group"` is not widely supported inside of listbox for all assistive technologies, so our approach conveys the intent of grouped items to each user, but in different ways.

For sighted users, there is a visual header for each group of items. The header is not focusable, and it has `role="presentation"` so that it's hidden from screen reader users because this information is presented in a different way to them. The wrapping `<ul>` and `<li>` elements are also given `role="presentation"` since a listbox is traditionally a list of `<li>` items inside of one parent `<ul>`.

For screen reader users, the grouped options are denoted by an `aria-label` with the content of each list item and the addition of the _type_ of list item. It also describes what will happen when that list item is chosen if it will take a user to a different page. An example `aria-label` for a list item with the value `github/memex` that takes you to the memex repo when chosen is "github/memex, jump to this repository." In this example, adding "repository" to the `aria-label` gives the context that the item is part of the "Repository" group, but in a different way than sighted users. We chose to add the item type at the end of the `aria-label` so that screen reader users hear the name of the item first and can navigate through the suggestions quicker.

### Styled input

Natively, `<input>` elements do not allow specific styling for individual characters unless you use something like `contenteditable`, which is not an accessible pattern. To achieve the desired styling, we have a styled input element (a `<div aria-hidden="true">` with `<span>` elements inside) that is _behind_ the real `<input>` that a user interacts with. It is perfectly lined up so all of the keyboard functionality works as expected, but we get the added visual styling of individual filter expressions within the input. We have `color: transparent` on the actual input text, so sighted users will notice no difference.

While the styled input adds context for sighted users, we did explore an alternative for screen reader users. After [some research and a proof of concept (GitHub staff only)](https://github.com/github/accessibility/issues/1414#issuecomment-1191691577), it was decided that we shouldn't treat the filter expressions differently for screen reader users. Specifically, the screen reader feedback may be more annoying than helpful. It'd also be a large effort to accurately detect and manage the cursor position for all types of assistive technology and internationalization.

### Screen reader feedback

By default, there is no indication to a screen reader user how many results are displayed or when the input is successfully cleared.

To fix this, we added an `aria-live` region that updates whenever the results change or the input is cleared. A screen reader will receive feedback when they press the "Clear" button that the input has been cleared, focus is restored to the input, and how many results are currently visible.

While testing the `aria-live` updates, we noticed something interesting; if the same number of results is displayed as a user continues typing, the `aria-live` region will not update. For example, if a user types "zzz" and there are 0 results, and then they add an additional "z" to their query (still 0 results), the screen reader will not re-read `0 results.` since the `aria-live` API did not detect a change in the text. To fix this we are adding and removing a `&nbsp;` character if the previous `aria-live` message is the same as the new `aria-live` message. The `&nbsp;` will  cause the `aria-live` API to detect a change and the screen reader will re-read the text without an audible indication that a space was added.

## Additional Resources

- [Blackbird Design Coaching Recommendations](https://github.com/github/accessibility/blob/main/docs/coaching-recommendations/Blackbird/Blackbird%20search%20base%20functionality.md) (GitHub staff only)
