const {injectAxe, checkA11y, configureAxe} = require('axe-playwright')
const {getStoryContext} = require('@storybook/test-runner')
const fs = require('fs')
const path = require('path')

const storyMetadataDirectoryName = 'storybook-stats'
// If MK_REPORT_DIR is set, create the directory if it doesn't exist
const mkReportDir = process.env.MK_REPORT_DIR
if (mkReportDir) {
  fs.mkdir(storyMetadataDirectoryName,
    { recursive: true }, (err) => {
      if (err) {
        // We don't want to fail the test if we can't create the directory
        console.log(err)
      }
    })
}
const storyMetadataDirectoryDoesExist = fs.existsSync(storyMetadataDirectoryName)

module.exports = {
  // Hook that is executed before the test runner starts running tests
  setup() {},
  /* Hook to execute before a story is rendered.
   * The page argument is the Playwright's page object for the story.
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async preVisit(page, context) {
    // Emulating prefers-reduced-motion because animations in interaction tests will wrongly fail color contrast accessibility checks. The default in Storybook interaction tests is to run with prefers-reduced-motion set to `reduce`.
    page.emulateMedia({reducedMotion: 'reduce'})
    await injectAxe(page)

    const configSrc = fs.readFileSync(require.resolve('@github/axe-github/configure-browser'), 'utf8')

    await page.evaluate(configSrc => {
      window.eval(configSrc)
    }, configSrc)

    if (storyMetadataDirectoryDoesExist) {
      const storyContext = await getStoryContext(page, context)
      // Write a json file for the story:
      writeStorybookStats(storyContext)
    }
  },
  /* Hook to execute after a story is rendered.
   * The page argument is the Playwright's page object for the story
   * The context argument is a Storybook object containing the story's id, title, and name.
   */
  async postVisit(page, context) {
    // Get the entire context of a story, including parameters, args, argTypes, etc.
    const storyContext = await getStoryContext(page, context)
    storyContext.parameters.disableThemeDecorator = true

    // Apply story-level a11y rules
    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    })

    await checkA11y(page, '#html-addon-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    },
    false,
    'v2'
    )
  },
  testTimeout: 30_000,
}

/**
 * Because storybook is good at knowing what a story is, where to find it, and how to build it,we are piggy-backing on
 * the storybook test runner to collect stats while running tests. Those stats are written to a file in the
 * storybook-stats directory for later use in metrics.
 */
function writeStorybookStats(storyContext) {
  const id = storyContext.id
  const rules = storyContext.parameters?.a11y?.config?.rules
  const disabledRuleNames = rules.filter(rule => rule.enabled === false).map(rule => rule.id)
  const storyFilename = storyContext.parameters.fileName
  const filename = path.join(storyMetadataDirectoryName, `${storyFilename.replaceAll(/[\.\/]/g, '-')}.json`)

  const existingContents = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : {}

  if (!disabledRuleNames || disabledRuleNames.length === 0) {
    return
  }

  const contents = {
    storyFilename: storyFilename,
    stories: {
      ...existingContents.stories,
      [id]: {disabledRuleNames},
    },
  }

  fs.writeFileSync(filename, JSON.stringify(contents, null, 2))
}
