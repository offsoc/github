import type {NodePlopAPI} from 'plop'
import {
  commonPrompts,
  getDependencyJsonContent,
  getScriptsJsonContent,
  standardDevDependencies,
  standardPackageActions,
  standardScripts,
  templatePath,
} from './common'

export function registerBuildScriptGenerator(plop: NodePlopAPI) {
  plop.setGenerator('Build script', {
    description: 'Create a script to run in CI or manually',
    prompts: [commonPrompts.packageName, commonPrompts.description, commonPrompts.service],
    actions: answers => {
      if (!answers) {
        throw new Error('No answers supplied')
      }
      answers.scriptsJson = getScriptsJsonContent({
        ...standardScripts,
        start: `node -r @swc-node/register ${answers.packageName}`,
      })
      answers.devDependenciesJson = getDependencyJsonContent({
        ...standardDevDependencies,
        '@swc-node/register': '1.9.1',
      })
      answers.createEntry = true
      answers.devPackage = true

      const actions = [
        {
          type: 'addMany',
          destination: '../{{packageName}}',
          base: templatePath('build-script'),
          templateFiles: templatePath('build-script/**/*'),
          globOptions: {dot: true},
        },
        ...standardPackageActions,
        (data: Record<string, string>) =>
          `Next steps:

  - Run your script with \`npm start -w ui/packages/${data.packageName!}\`
        `,
      ]

      return actions
    },
  })
}
