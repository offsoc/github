import type {devices} from '@playwright/test'

export type BrowserName = (typeof devices)['defaultBrowserType']['defaultBrowserType']
