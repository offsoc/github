import {paramCase as kebabCase} from 'change-case'
import type {NodePlopAPI} from 'plop'
import {
  commonActions,
  commonPrompts,
  getDependencyJsonContent,
  getScriptsJsonContent,
  packagePath,
  standardDevDependencies,
  standardPackageActions,
  standardScripts,
  templatePath,
} from './common'

const removeElementSuffix = (value: string) => value.replace(/-element$/g, '')

export function registerCatalystComponentGenerator(plop: NodePlopAPI) {
  plop.setGenerator('Catalyst Component', {
    description: 'Create a Catalyst Component',
    prompts: [
      {
        ...commonPrompts.packageName,
        message: 'Component name:',
        filter: (input: string) => `${removeElementSuffix(kebabCase(input))}-element`,
      },
      commonPrompts.description,
      commonPrompts.service,
    ],
    actions: answers => {
      if (!answers) {
        throw new Error('No answers supplied')
      }

      answers.scriptsJson = getScriptsJsonContent(standardScripts)
      answers.dependenciesJson = getDependencyJsonContent({
        '@github/catalyst': '*',
      })
      answers.devDependenciesJson = getDependencyJsonContent({
        ...standardDevDependencies,
        '@github-ui/browser-tests': '*',
      })

      answers.elementName = removeElementSuffix(answers.packageName)

      const actions = [
        {
          type: 'add',
          path: packagePath('element-entry.ts'),
          templateFile: templatePath('entry.ts.hbs'),
        },
        {
          type: 'add',
          path: packagePath('{{packageName}}.ts'),
          templateFile: templatePath('catalyst.ts.hbs'),
        },
        {
          type: 'add',
          path: packagePath('__browser-tests__/{{packageName}}.test.ts'),
          templateFile: templatePath('browser-test.ts.hbs'),
        },
        ...standardPackageActions,
        commonActions.restartJsAssets,
        () => `Next steps:

- \`npm run test:watch\` - this will start the wtr tests in watch mode
- Commit changes and run \`script/generate-service-files.rb\``,
      ]

      return actions
    },
  })
}
