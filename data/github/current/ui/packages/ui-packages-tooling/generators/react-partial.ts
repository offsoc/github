import {pascalCase} from 'change-case'
import type {NodePlopAPI} from 'plop'
import {
  commonActions,
  commonPrompts,
  getDependencyJsonContent,
  standardPackageActions,
  standardDevDependencies,
  templatePath,
  standardScripts,
  getScriptsJsonContent,
} from './common'

export function registerReactPartialGenerator(plop: NodePlopAPI) {
  plop.setGenerator('React Partial', {
    description: 'Create a React Partial',
    prompts: [
      {
        ...commonPrompts.packageName,
        message: 'Partial name:',
      },
      commonPrompts.description,
      commonPrompts.service,
      {
        ...commonPrompts.ssr,
        message: 'Is this partial going to be Server Side Rendered?',
      },
    ],
    actions: answers => {
      if (!answers) {
        throw new Error('No answers supplied')
      }

      answers.scriptsJson = getScriptsJsonContent(standardScripts)
      answers.dependenciesJson = getDependencyJsonContent({
        '@github-ui/react-core': '*',
        react: '*',
      })
      answers.devDependenciesJson = getDependencyJsonContent({
        ...standardDevDependencies,
        '@github-ui/ssr-test-utils': '*',
        '@testing-library/react': '*',
      })
      answers.createEntry = true
      answers.componentName = pascalCase(answers.packageName)

      const ssrSkip = () => {
        if (answers.enableSSR) return false

        return 'Skipping since SSR is disabled'
      }

      const actions = [
        commonActions.entry,
        {
          ...commonActions.ssrEntry,
          skip: ssrSkip,
        },
        {
          type: 'addMany',
          destination: '../{{packageName}}',
          base: templatePath('react-partial'),
          templateFiles: templatePath('react-partial/**/*'),
        },
        ...standardPackageActions,
        commonActions.restartJsAssets,
        commonActions.restartAlloyAssets,
        `Next steps:

  - Integrate this app into a Rails view
    - In the Rails controller, add \`include ReactHelper\`
    - In the Rails view, render the partial with the following code:
      <%= render_react_partial name: "${answers.packageName}", props: { exampleMessage: "message from Rails!" }, ssr: ${answers.enableSSR} %>
  - \`npm run jest:watch\` - this will start the jest tests and run only the files which have changed
  - Commit changes and run \`script/generate-service-files.rb\`
        `,
      ]

      return actions
    },
  })
}
