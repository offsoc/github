import type {ActionsSecretsVariablesListProps, Item, FormMode, RowData} from '../types'
import {ItemsScope, ListMode} from '../types'

export function getDeleteDialogProps(name: string, mode: ListMode, additionalFormData?: {[key: string]: string}) {
  return {
    url: 'url',
    rowId: name,
    mode,
    setClose: () => {},
    tableDataUpdater: () => {
      return new Array<RowData>()
    },
    additionalFormData,
  }
}

export function getFormDialogProps(
  mode: ListMode,
  name: string,
  value: string,
  formMode: FormMode,
  keyId: string = '1990403164006699757',
  publicKey: string = 'dP7+LxNnA15igINQsIj0bHSPJOcgEmXTjErM+z0+IH0=',
  tableDataUpdater: () => RowData[] = () => {
    return new Array<RowData>()
  },
) {
  return {
    mode,
    name,
    value,
    onClose: () => {},
    tableDataUpdater,
    formMode,
    rowId: 'rowId',
    url: 'url',
    keyId: mode === ListMode.secret ? keyId : undefined,
    publicKey: mode === ListMode.secret ? publicKey : undefined,
  }
}

export function getActionsSecretsListProps(
  scope: ItemsScope,
  useDialog = false,
  isPrivateRepoInFreeOrg = false,
): ActionsSecretsVariablesListProps {
  let secrets: Item[] = []
  let overrides: Item[] = []
  const environmentUrls: {[name: string]: string} = {}

  secrets = [
    {
      name: 'secret1',
      updated_at: new Date(Date.now()),
      scope,
    },
    {
      name: 'secret2',
      // An hour ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60),
      scope,
    },
    {
      name: 'secret3',
      // A day ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
      scope,
    },
  ]

  switch (scope) {
    case ItemsScope.Repository:
      overrides = [
        {
          name: 'secret3',
          updated_at: new Date(Date.now()),
          scope: ItemsScope.Organization,
        },
      ]

      return {
        items: secrets,
        overrides,
        scope,
        crudUrls: {
          editUrls: {
            secret1: '/edit/secret1',
            secret2: '/edit/secret2',
            secret3: '/edit/secret3',
          },
          deleteUrls: {
            secret1: '/delete/secret1',
            secret2: '/delete/secret2',
            secret3: '/delete/secret3',
          },
        },
        tableActionProps: {
          mode: ListMode.secret,
          url: '/new',
          message: 'New repository secret',
          useDialog,
          isEditableInScope: true,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.secret,
        isPrivateRepoInFreeOrg,
      }
    case ItemsScope.Organization:
      overrides = [
        {
          name: 'secret3',
          updated_at: new Date(Date.now()),
          scope: ItemsScope.Repository,
        },
      ]

      return {
        items: secrets,
        overrides,
        scope,
        tableActionProps: {
          mode: ListMode.secret,
          url: 'org/settings/secrets',
          message: 'Manage organization secrets',
          useDialog,
          isEditableInScope: false,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.secret,
        isPrivateRepoInFreeOrg,
      }
    case ItemsScope.Environment:
      environmentUrls['prod'] = 'repo/environments/prod'
      environmentUrls['dev'] = 'repo/environments/dev'
      environmentUrls['test'] = 'repo/environments/test'

      secrets[0]!.environment_url = 'repo/environments/prod'
      secrets[0]!.environment_name = 'prod'
      secrets[1]!.environment_url = 'repo/environments/dev'
      secrets[1]!.environment_name = 'dev'
      secrets[2]!.environment_url = 'repo/environments/test'
      secrets[2]!.environment_name = 'test'

      return {
        items: secrets,
        scope,
        environmentUrls,
        crudUrls: {
          editUrls: {
            'secret1-prod': '/edit/secret1',
            'secret2-dev': '/edit/secret2',
            'secret3-test': '/edit/secret3',
          },
          deleteUrls: {
            'secret1-prod': '/delete/secret1',
            'secret2-dev': '/delete/secret2',
            'secret3-test': '/delete/secret3',
          },
        },
        tableActionProps: {
          mode: ListMode.secret,
          url: 'repo/settings/environments',
          message: 'Manage environment secrets',
          useDialog,
          isEditableInScope: false,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.secret,
        isPrivateRepoInFreeOrg,
      }
    case ItemsScope.CodespaceUser:
      return {
        items: secrets,
        scope,
        crudUrls: {
          editUrls: {
            secret1: '/edit/secret1',
            secret2: '/edit/secret2',
            secret3: '/edit/secret3',
          },
          deleteUrls: {
            secret1: '/delete/secret1',
            secret2: '/delete/secret2',
            secret3: '/delete/secret3',
          },
        },
        tableActionProps: {
          mode: ListMode.secret,
          url: 'settings/codespaces',
          message: 'New secret',
          useDialog,
          isEditableInScope: true,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.secret,
        isPrivateRepoInFreeOrg,
      }
    default:
      return {} as ActionsSecretsVariablesListProps
  }
}

export function getActionsVariablesListProps(
  scope: ItemsScope,
  useDialog = false,
  isPrivateRepoInFreeOrg = false,
): ActionsSecretsVariablesListProps {
  let items: Item[] = []
  let overrides: Item[] = []
  const environmentUrls: {[name: string]: string} = {}

  items = [
    {
      name: 'var1',
      value: Buffer.from('value1').toString('base64'),
      updated_at: new Date(Date.now()),
      scope,
    },
    {
      name: 'var2',
      value: Buffer.from('value2').toString('base64'),
      // An hour ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60),
      scope,
    },
    {
      name: 'var3',
      value: Buffer.from('value3').toString('base64'),
      // A day ago
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
      scope,
    },
  ]

  switch (scope) {
    case ItemsScope.Repository:
      overrides = [
        {
          name: 'var3',
          value: Buffer.from('overridden').toString('base64'),
          updated_at: new Date(Date.now()),
          scope: ItemsScope.Organization,
        },
      ]

      return {
        items,
        overrides,
        scope,
        crudUrls: {
          editUrls: {
            var1: '/edit/var1',
            var2: '/edit/var2',
            var3: '/edit/var3',
          },
          deleteUrls: {
            var1: '/delete/var1',
            var2: '/delete/var2',
            var3: '/delete/var3',
          },
        },
        tableActionProps: {
          mode: ListMode.variable,
          url: '/new',
          message: 'New repository variable',
          useDialog,
          isEditableInScope: true,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.variable,
        isPrivateRepoInFreeOrg,
      }
    case ItemsScope.Organization:
      overrides = [
        {
          name: 'var3',
          updated_at: new Date(Date.now()),
          scope: ItemsScope.Repository,
        },
      ]

      return {
        items,
        overrides,
        scope,
        tableActionProps: {
          mode: ListMode.variable,
          url: 'org/settings/variables',
          message: 'Manage organization variables',
          useDialog,
          isEditableInScope: false,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.variable,
        isPrivateRepoInFreeOrg,
      }
    case ItemsScope.Environment:
      environmentUrls['prod'] = 'repo/environments/prod'
      environmentUrls['dev'] = 'repo/environments/dev'
      environmentUrls['test'] = 'repo/environments/test'

      items[0]!.environment_url = 'repo/environments/prod'
      items[0]!.environment_name = 'prod'
      items[1]!.environment_url = 'repo/environments/dev'
      items[1]!.environment_name = 'dev'
      items[2]!.environment_url = 'repo/environments/test'
      items[2]!.environment_name = 'test'

      return {
        items,
        scope,
        environmentUrls,
        crudUrls: {
          editUrls: {
            var1: '/edit/var1',
            var2: '/edit/var2',
            var3: '/edit/var3',
          },
          deleteUrls: {
            var1: '/delete/var1',
            var2: '/delete/var2',
            var3: '/delete/var3',
          },
        },
        tableActionProps: {
          mode: ListMode.variable,
          url: 'repo/settings/environments',
          message: 'Manage environment variables',
          useDialog,
          isEditableInScope: false,
          tableDataUpdater: () => {
            return new Array<RowData>()
          },
        },
        mode: ListMode.variable,
        isPrivateRepoInFreeOrg,
      }
    default:
      return {} as ActionsSecretsVariablesListProps
  }
}
