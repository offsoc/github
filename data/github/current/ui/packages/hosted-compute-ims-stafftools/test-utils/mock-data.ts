import type {MainPayload} from '../routes/stafftools/Main'
import type {NewCuratedImagePayload} from '../routes/stafftools/NewCuratedImage'
import type {ListImageVersionsPayload} from '../routes/stafftools/ListImageVersions'
import type {NewCuratedPointerPayload} from '../routes/stafftools/NewCuratedPointer'

export function getMainRoutePayload(): MainPayload {
  return {
    imageDefinitionPointers: [],
    imageDefinitions: [],
    imsStafftoolsPath: '',
    newCuratedImagePath: '',
    newCuratedPointerPath: '',
  }
}
export function getNewCuratedImageRoutePayload(): NewCuratedImagePayload {
  return {
    imsStafftoolsPath: '',
  }
}

export function getListImageVersionsRoutePayload(): ListImageVersionsPayload {
  return {
    imageDefinition: {
      id: '1',
      name: '',
      osType: 'Linux',
      architecture: 'x64',
      enabled: true,
      pointsToImageDefinitionId: '0',
      createdAt: '',
      updatedAt: '',
      imageVersionsCount: 0,
    },
    imageVersions: [],
    imsStafftoolsPath: '',
  }
}

export function getNewCuratedPointerRoutePayload(): NewCuratedPointerPayload {
  return {
    imsStafftoolsPath: '',
  }
}
