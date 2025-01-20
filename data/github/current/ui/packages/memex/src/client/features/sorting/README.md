# Sorting

This directory contains the components and helpers for sorting and comparing
project items and their related column values.

## Overview

This directory is organized to reflect the sorting requirements of projects:

- `comparers` - this directory contains the functions for each supported field
  type in Memex
- `primitives` - this directory contains generic sorting functions to enable
  sharing the same logic across different fields
- `resolver.ts` - a helper function for resolving a sorting function from
  the provided `ColumnModel` instance, based on the `dataType`

## Conventions

The sorting conventions defined in this project go back to the original table
layout, and while these assumptions may change in the future it's worth
outlining what these sorting rules implement.

- if no sort order specified, ascending is the default
- items without values are always displayed _after_ items with values, for both
  ascending and descending sort
- redacted items are always shown last when sorting
  - this is because the viewer has no access to the project item, so it is
    given the lowest priority
- single-select field sorting will also use the item `id` to determine order
  when both items have the same value
  - this case may no longer be relevant, need more context on the motivations
    behind this change

## Guide: Sorting for a new field

When adding a new field type to Memex throgh the `MemexColumnDataType` enum,
a sort function will need to be added here to enable various features of the
application to light up.

### Add a comparer

The key part to enabling sorting is to define the rules for sorting on your
new field.

Add a new file named `my-new-custom-field.ts` to the `comparers` directory
and add this template:

```ts
import {CustomColumnModel} from '../../../models/column-model'
import {MemexItemModel} from '../../../models/memex-item-model'

export function compareMyNewCustomField(
  itemA: MemexItemModel,
  itemB: MemexItemModel,
  column: CustomColumnModel,
  desc?: boolean,
) {
  // sort logic goes here
}
```

You probably have a better name here than `MyNewCustom` for the field suffix
but this should be linked to the new `MemexColumnDataType` value from earlier.

If you are adding support for a new system field (instead of user-defined
fields), you should not need to include the column parameter:

```ts
import {CustomColumnModel} from '../../../models/column-model'
import {MemexItemModel} from '../../../models/memex-item-model'

export function compareMyNewSystemField(itemA: MemexItemModel, itemB: MemexItemModel, desc?: boolean) {
  // sort logic goes here
}
```

Inside this sort function you need to do two things:

- find the column values in `itemA` and `itemB` for this new field type,
  including any additional parsing if needed
- compare the two column values to determine the comparison value to return

Depending on the shape of the column values associated with your new field, you
should be able to leverage the existing primitives found in the `primitives`
directory:

- `compare-list-of-values.ts` - a comparer for `string` values
- `compare-number-values.ts` - a comparer for `number` values
- `compare-string-values.ts` - a comparer for arrays of `string` or `number` values

These primitives are recommended here instead of re-implementing these as they
also handle the `desc` parameter, to ensure ascending/descending order is
computed properly.

### Update `resolveSortFunction`

Once your new sorting function has been created, you should update the sort
function in `resolver.ts` to return your sort function.

```diff
diff --git a/src/client/features/sorting/resolver.ts b/src/client/features/sorting/resolver.ts
index 611e08f7a5..736ad8385e 100644
--- a/src/client/features/sorting/resolver.ts
+++ b/src/client/features/sorting/resolver.ts
@@ -62,6 +62,10 @@ export function resolveSortFunction(column: ColumnModel): SortFn<MemexItemModel>
       return (rowA, rowB, desc) => {
         return compareIterationField(rowA, rowB, column, desc)
       }
+    case MemexColumnDataType.MyNewCustomField:
+      return (rowA, rowB, desc) => {
+        return compareMyNewCustomField(rowA, rowB, column, desc)
+      }
     default: {
       assertNever(column)
```

For new system fields where the `ColumnModel` instance is not needed, the
new code is even simpler:

```diff
diff --git a/src/client/features/sorting/resolver.ts b/src/client/features/sorting/resolver.ts
index 611e08f7a5..07a68aa4e4 100644
--- a/src/client/features/sorting/resolver.ts
+++ b/src/client/features/sorting/resolver.ts
@@ -62,6 +62,8 @@ export function resolveSortFunction(column: ColumnModel): SortFn<MemexItemModel>
       return (rowA, rowB, desc) => {
         return compareIterationField(rowA, rowB, column, desc)
       }
+    case MemexColumnDataType.MyNewSystemField:
+      return compareMyNewSystemField
     default: {
       assertNever(column)
```

### Add tests to `src/tests/features/sorting/comparers`

As part of contributing the new sort function, tests to cover the behavior
of this new function should also be included so we can catch regressions and
outline the behaviour.

This scaffolding should help flesh out the tests:

```ts
import {compareMyNewCustomField} from '../../../../client/features/sorting/comparers/my-new-field'
import {MemexItemModel} from '../../../../client/models/memex-item-model'

// TODO: add scaffolding support for new field to customColumnFactory
const myNewColumn = customColumnFactory.myNewField().build({name: 'New Field Name'})

const myNewColumnModel = createColumnModel(myNewColumn) as CustomColumnModel

function sortByMyNewCustomField(items: Array<MemexItemModel>, desc: boolean) {
  // Reverse the result if `desc` to match the react-table implementation
  const invert = desc ? -1 : 1

  return items.sort((left, right) => invert * compareMyNewCustomField(left, right, myNewColumnModel, desc))
}

function columnValue(value: string) {
  // TODO: add helper to column value factory to create a new field value
  // TODO: update method signatures to match column value type needed
  return columnValueFactory.customFieldValue(value, 'New Field Name', [myNewColumn]).build()
}

function createIssue(value?: string) {
  if (value) {
    return createMemexItemModel(issueFactory.withColumnValues([columnValue(value)]).build())
  }

  return createMemexItemModel(issueFactory.build())
}

function createRedactedItem() {
  return createMemexItemModel(redactedItemFactory.build())
}

describe('sortByMyNewCustomField', () => {
  it.todo('sorts items with values into expected order')
  it.todo('puts items without value after other items')
  it.todo('puts redacted items at the end of the array')
})
```

The recommended pattern for these tests is to:

- define the project items and the related column values
- sort the items in ascending and descending order
- assert the order of sorted items matches the expected order

An example test might look like this:

```ts
it('sorts items with values into expected order', () => {
  // TODO: add helpers to create items with column values
  const firstItem = createIssue('another value')
  const secondItem = createIssue('some value')

  const ascending = sortByMyNewCustomField([secondItem, firstItem], false)

  expect(ascending).toMatchObject([firstItem, secondItem])

  const descending = sortByMyNewCustomField([secondItem, firstItem], true)

  expect(descending).toMatchObject([secondItem, firstItem])
})
```
