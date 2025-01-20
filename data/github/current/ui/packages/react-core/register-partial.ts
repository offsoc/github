import {partialRegistry, type PartialRegistration} from './react-partial-registry'
// Import the web component to get it registered on the window
import './ReactPartialElement'

// NOTE: if the signature of this method changes, also update the react-partial-name ESLint rule
// /workspaces/github/ui/packages/eslint-plugin-github-monorepo/rules/react-partial-name.js
export function registerReactPartial(name: string, registration: PartialRegistration) {
  partialRegistry.register(name, registration)
}
