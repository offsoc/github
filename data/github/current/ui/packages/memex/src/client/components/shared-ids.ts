// Sometimes a constant id may need to be shared across components
// or pages. We have dependency linting enabled to prevent
// modules from reaching outside of their page boundary into another page,
// or preventing a component from reaching into a page.
// This module is meant to provide a shared space for ids that may be
// used across pages or components.

export const PROJECT_NAME_INPUT_ID = 'settings-project-name'
