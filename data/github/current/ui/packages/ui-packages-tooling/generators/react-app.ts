import {pascalCase, snakeCase} from 'change-case'
import type {NodePlopAPI} from 'plop'
import {
  commonActions,
  commonPrompts,
  getDependencyJsonContent,
  getScriptsJsonContent,
  packagePath,
  requiredPrompt,
  standardDevDependencies,
  standardPackageActions,
  standardScripts,
  templatePath,
} from './common'

export function registerReactAppGenerator(plop: NodePlopAPI) {
  plop.setGenerator('React App', {
    description: 'Create a React App',
    prompts: [
      {
        ...commonPrompts.packageName,
        message: 'App name:',
      },
      commonPrompts.description,
      commonPrompts.service,
      {
        type: 'input',
        name: 'routePath',
        message: 'Initial route path (e.g. /pulls/:pr_number/top-comments):',
        validate: requiredPrompt,
      },
      {
        type: 'input',
        name: 'routeComponent',
        message: 'Initial route name (e.g. TopComments):',
        validate: requiredPrompt,
        filter: pascalCase,
      },
      {
        ...commonPrompts.ssr,
        message: 'Is this app going to be Server Side Rendered?',
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
          type: 'add',
          path: packagePath('{{packageName}}.ts'),
          templateFile: templatePath('react-app/main.ts.hbs'),
        },
        {
          type: 'add',
          path: packagePath('App.tsx'),
          templateFile: templatePath('react-app/App.tsx.hbs'),
        },
        {
          type: 'add',
          path: packagePath('routes/{{routeComponent}}.tsx'),
          templateFile: templatePath('react-app/routes/Route.tsx.hbs'),
        },
        {
          type: 'add',
          path: packagePath('test-utils/mock-data.ts'),
          templateFile: templatePath('react-app/test-utils/mock-data.ts.hbs'),
        },
        {
          type: 'add',
          path: packagePath('__tests__/{{routeComponent}}.test.tsx'),
          templateFile: templatePath('react-app/__tests__/Route.test.tsx.hbs'),
        },
        {
          type: 'add',
          path: packagePath('__tests__/{{routeComponent}}SSR.test.tsx'),
          templateFile: templatePath('react-app/__tests__/RouteSSR.test.tsx.hbs'),
        },
        ...standardPackageActions,
        commonActions.restartJsAssets,
        commonActions.restartAlloyAssets,
        (data: Record<string, string>) =>
          `Next steps:

  - Integrate this app into a Rails controller
    - Find or create the matching controller (./app/controllers/${snakeCase(data.packageName!)}_controller.rb)
    - Add \`include ReactHelper\`
    - In the desired controller action, add the following code:
        render_react_app(
          payload: { someField: "A message from Rails!" },
          title: "${data.routeComponent}",
          ssr: ${answers.enableSSR}
        )
  - Visit http://github.localhost${data.routePath}
  - \`npm run jest:watch\` - this will start the jest tests and run only the files which have changed
  - Commit changes and run \`script/generate-service-files.rb\`
        `,
      ]

      return actions
    },
  })
}
