This document is intended to be a collection of small best practices/standards that we are maintaining for code consistency:

- Do not hardcode strings that are shown in the UI, instead add them to the [resources](../common/resources/resources.ts) and use them from there. You can also create a new file under resources and add them there if it makes more sense
- We use camel casing for variable names wherever possible except for all uppercase constants
- we declare constant variables (not functions) declared globally in a file with all uppercase (e.g. `MY_VARIABLE`)
