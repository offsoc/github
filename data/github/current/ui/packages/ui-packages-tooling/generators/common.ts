import {paramCase as kebabCase} from 'change-case'
import type {AddLineToFileConfig} from './actions/add-line-to-file'
import type {RunCommandConfig} from './actions/run-command'
import {listMatchingServices} from './prompts/available-services'

export const requiredPrompt = (value: string) => !!value

export function templatePath(path: string) {
  return `./templates/${path}`
}

export function packagePath(path: string) {
  return `../{{packageName}}/${path}`
}

export const commonPrompts = {
  packageName: {
    type: 'input',
    name: 'packageName',
    message: 'Package name:',
    filter: kebabCase,
    validate: requiredPrompt,
  },
  description: {
    type: 'input',
    name: 'packageDescription',
    message: 'Brief description:',
    validate: requiredPrompt,
  },
  service: {
    type: 'autocomplete',
    name: 'service',
    message: 'Service name for SERVICEOWNERS:',
    source: (_: unknown, input: string) => listMatchingServices(input),
    validate: requiredPrompt,
  },
  ssr: {
    type: 'confirm',
    name: 'enableSSR',
    default: false,
  },
}

export const commonActions = {
  packageJson: {
    type: 'add',
    path: packagePath('package.json'),
    templateFile: templatePath('package.json.hbs'),
  },
  entry: {
    type: 'add',
    path: packagePath('entry.ts'),
    templateFile: templatePath('entry.ts.hbs'),
  },
  ssrEntry: {
    type: 'add',
    path: packagePath('ssr-entry.ts'),
    templateFile: templatePath('ssr-entry.ts.hbs'),
  },
  serviceowners: {
    type: 'addLineToFile',
    line: 'ui/packages/{{packageName}}/ :{{service}}',
    path: '../../../SERVICEOWNERS',
    sectionStart: '# UI packages',
    sectionEnd: '# End of UI packages',
  } satisfies AddLineToFileConfig,
  mainFile: {
    type: 'add',
    path: packagePath('{{packageName}}.ts'),
    templateFile: templatePath('main.ts.hbs'),
  },
  npmInstall: {
    type: 'runCommand',
    cmd: 'npm',
    args: ['install', '--ignore-scripts'],
  } satisfies RunCommandConfig,
  restartJsAssets: {
    type: 'runCommand',
    cmd: 'overmind',
    args: ['restart', 'js-assets'],
    ignoreFailure: true,
  } satisfies RunCommandConfig,
  restartAlloyAssets: {
    type: 'runCommand',
    cmd: 'overmind',
    args: ['restart', 'alloy-assets'],
    ignoreFailure: true,
  } satisfies RunCommandConfig,
  baseTsconfig: {
    type: 'add',
    path: packagePath('tsconfig.json'),
    templateFile: templatePath('tsconfig.json.hbs'),
  },
  jestConfig: {
    type: 'add',
    path: packagePath('jest.config.js'),
    templateFile: templatePath('jest.config.js.hbs'),
  },
}

export const standardPackageActions = [
  commonActions.serviceowners,
  commonActions.packageJson,
  commonActions.baseTsconfig,
  commonActions.npmInstall,
  commonActions.jestConfig,
]

export const standardScripts = {
  lint: 'eslint --cache --max-warnings=0 . --ext .js,.ts,.tsx,.json',
  test: 'jest',
  tsc: 'tsc',
}

export function getScriptsJsonContent(scripts: Record<string, string>) {
  const orderedScripts = Object.keys(scripts)
    .sort()
    .reduce(
      (obj, key) => {
        obj[key] = scripts[key]!
        return obj
      },
      {} as Record<string, string>,
    )

  return JSON.stringify(orderedScripts, null, 4).slice(1, -1).trim()
}

export const standardDevDependencies = {
  '@github-ui/eslintrc': '*',
  '@github-ui/jest': '*',
}

export function getDependencyJsonContent(deps: Record<string, string>) {
  const orderedDeps = Object.keys(deps)
    .sort()
    .reduce(
      (obj, key) => {
        obj[key] = deps[key]!
        return obj
      },
      {} as Record<string, string>,
    )

  return JSON.stringify(orderedDeps, null, 4).slice(1, -1).trim()
}
