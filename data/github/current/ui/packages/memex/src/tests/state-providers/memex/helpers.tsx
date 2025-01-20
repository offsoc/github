import {
  MemexStateProvider,
  type ProjectDetailsContextType,
  type ProjectNumberContextType,
  type ProjectStateContextType,
  type SetProjectContextType,
} from '../../../client/state-providers/memex/memex-state-provider'
import {createWrapperWithContexts} from '../../wrapper-utils'

export function stubSetProject() {
  return jest.fn<ReturnType<SetProjectContextType['setProject']>, Parameters<SetProjectContextType['setProject']>>()
}

export function createOptionsWithProvider() {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <MemexStateProvider>{children}</MemexStateProvider>
  )

  return {wrapper}
}

export function existingProjectOptions(
  additionalData?: Partial<ProjectDetailsContextType>,
  setProjectData?: Partial<SetProjectContextType>,
) {
  return {
    wrapper: createWrapperWithContexts({
      SetProject: setProjectContext(setProjectData),
      ProjectNumber: existingProject(),
      ProjectDetails: defaultProjectDetails(additionalData),
      ProjectState: projectStateContext(),
    }),
  }
}

export function projectStateContext(): ProjectStateContextType {
  return {
    isPublicProject: false,
    isClosed: false,
    isTemplate: false,
  }
}

export function setProjectContext(setProjectData?: Partial<SetProjectContextType>): SetProjectContextType {
  return {
    setProject: jest.fn(),
    ...setProjectData,
  }
}

/** Create a ProjectNumberContext value representing a created project */
export function existingProject(): ProjectNumberContextType {
  return projectWithNumber(1)
}

/** Create a ProjectNumberContext value based on a specific id */
function projectWithNumber(projectNumber: number): ProjectNumberContextType {
  return {
    projectNumber,
  }
}

/**
 * Create a `ProjectDetailsContextType` based on a default project, and optionally
 * override the default data of the context to simplify testing.
 *
 * @param additionalData optional data related to the project
 */
export function defaultProjectDetails(additionalData?: Partial<ProjectDetailsContextType>): ProjectDetailsContextType {
  return {
    title: "My Team's Memex",
    titleHtml: "My Team's Memex",
    description: '',
    shortDescription: '',
    shortDescriptionHtml: '',
    descriptionHtml: '',
    setDescriptionHtml: jest.fn(),
    ...additionalData,
  }
}
