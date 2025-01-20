import {pascalCase} from 'change-case'
import type {NodePlopAPI} from 'plop'
import type {OpenFileConfig} from './actions/open-file'
import {
  commonPrompts,
  getDependencyJsonContent,
  packagePath,
  standardPackageActions,
  standardDevDependencies,
  templatePath,
  getScriptsJsonContent,
  standardScripts,
} from './common'
import {nextSteps} from './actions/next-steps'

export function registerReactComponentGenerator(plop: NodePlopAPI) {
  plop.setGenerator('React Component', {
    description: 'Create a React Component',
    prompts: [
      {
        ...commonPrompts.packageName,

        message: 'Component name:',
      },
      commonPrompts.description,
      commonPrompts.service,
      {
        type: 'input',
        name: 'trackingIssue',
        message: 'Tracking issue URL:',
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
        '@storybook/react': '*',
        '@testing-library/react': '*',
      })
      answers.componentName = pascalCase(answers.packageName)
      answers.mainFileName = `${answers.componentName}.tsx`
      answers.reactComponent = true

      const actions = [
        {
          type: 'addMany',
          destination: '../{{packageName}}',
          base: templatePath('react-component'),
          templateFiles: templatePath('react-component/**/*'),
        },
        {
          type: 'openFile',
          path: packagePath('{{componentName}}.tsx'),
        } satisfies OpenFileConfig,
        ...standardPackageActions,
        nextSteps,
      ]

      return actions
    },
  })
}
