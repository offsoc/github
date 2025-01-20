import {camelCase} from 'change-case'
import type {NodePlopAPI} from 'plop'
import type {OpenFileConfig} from './actions/open-file'
import {
  commonPrompts,
  getDependencyJsonContent,
  packagePath,
  standardPackageActions,
  standardDevDependencies,
  templatePath,
} from './common'
import {nextSteps} from './actions/next-steps'

export function registerReactHookGenerator(plop: NodePlopAPI) {
  plop.setGenerator('React Hook', {
    description: 'Create a React hook',
    prompts: [
      {
        ...commonPrompts.packageName,
        message: 'Hook name:',
      },
      commonPrompts.description,
      commonPrompts.service,
    ],
    actions: answers => {
      if (!answers) {
        throw new Error('No answers supplied')
      }

      answers.dependenciesJson = getDependencyJsonContent({
        '@github-ui/react-core': '*',
        react: '*',
      })
      answers.devDependenciesJson = getDependencyJsonContent({
        ...standardDevDependencies,
        '@testing-library/react': '*',
      })
      answers.hookName = camelCase(answers.packageName)
      answers.mainFileName = `${answers.packageName}.ts`

      const actions = [
        {
          type: 'addMany',
          destination: '../{{packageName}}',
          base: templatePath('react-hook'),
          templateFiles: templatePath('react-hook/**/*'),
        },
        {
          type: 'openFile',
          path: packagePath('{{mainFileName}}'),
        } satisfies OpenFileConfig,
        ...standardPackageActions,
        nextSteps,
      ]

      return actions
    },
  })
}
