import {defineConfig, type ReporterDescription} from '@playwright/test'

// Process Configuration
const headless = process.env['DEBUG_TESTS'] ? false : true
const slowMo = process.env['DEBUG_SLOMO_SPEED'] != null ? parseInt(process.env['DEBUG_SLOMO_SPEED'], 10) : 50

const locale = process.env['BROWSER_LOCALE'] ?? 'en-US'
const repeatTests = process.env['REPEAT_TESTS'] === 'true'

// when testing on CI, also generate the JSON report of the test results
const reporter: Array<ReporterDescription> | undefined = process.env.CI
  ? [
      ['dot'],
      ['github'],
      ['json', {outputFile: './artifacts/results.json'}],
      ['junit', {embedAnnotationsAsProperties: true, outputFile: './artifacts/results.xml'}],
    ]
  : undefined

const isContinuousIntegration = !!process.env.CI

const getRetries = () => {
  if (!isContinuousIntegration) {
    return 1
  }

  // If repeating focused flaky tests, skip retries
  return repeatTests ? 0 : 3
}

export default defineConfig({
  forbidOnly: isContinuousIntegration && !repeatTests,
  fullyParallel: true,
  repeatEach: repeatTests ? 50 : undefined,
  retries: getRetries(),
  testMatch: /(-|\.|)(spec)\.ts$/,
  outputDir: 'artifacts',
  testDir: './',
  timeout: 30000,

  reporter,

  workers: '50%',

  use: {
    // Browser options
    headless,

    launchOptions: {
      slowMo,
    },

    // Context options
    viewport: {width: 1400, height: 1080},
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: 'only-on-failure',
    video: 'retry-with-video',

    contextOptions: {
      locale,
    },
  },

  projects: [
    {name: 'chromium', use: {browserName: 'chromium'}},
    {name: 'firefox', use: {browserName: 'firefox'}},
    {name: 'webkit', use: {browserName: 'webkit'}},
  ],
})
