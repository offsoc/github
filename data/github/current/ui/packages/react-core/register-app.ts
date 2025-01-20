import {appRegistryFactory, type AppRegistrationFn} from './react-app-registry'
// Import the web component to get it registered on the window
import './ReactAppElement'

export function registerReactAppFactory(appName: string, factory: AppRegistrationFn) {
  appRegistryFactory.register(appName, factory)
}
