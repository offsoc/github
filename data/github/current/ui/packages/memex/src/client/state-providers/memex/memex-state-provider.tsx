import {createContext, memo, useCallback, useMemo, useState} from 'react'

import type {Memex} from '../../api/memex/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {Resources} from '../../strings'

export type SetProjectContextType = {
  setProject: React.Dispatch<Partial<Memex>>
}

export type ProjectDetailsContextType = {
  /** The title of the project */
  title: string

  /** The rich title of the project */
  titleHtml: string

  /**
   * User-defined text that describes the project.
   *
   * This may contain markdown formatting, which the client will convert and
   * set in the `descriptionHtml` field on the client.
   */
  description: string
  /**
   * A short description for the project, representing the raw version. The html version is visible in the client, while this will be used for editing
   */
  shortDescription: string
  /**
   * A short description for the project rendering HTML, which is visible in the client.
   */
  shortDescriptionHtml: string
  /**
   * The rich description text for the project.
   *
   * This is value is not cached in the backend, and thus relies on the client
   * to generate the value when first viewing the project description panel.
   */
  descriptionHtml: string
  /**
   * The consistency value of the project which is used to determine how well synchronized the project is
   * between the DB and Elasticsearch.
   */
  consistency?: number
  /**
   * The threshold for the project consistency value, which is used to determine how well synchronized the project is
   */
  inconsistencyThreshold?: number
  /**
   * Set the rich description text for the project.
   */
  setDescriptionHtml: React.Dispatch<string>
}

export type ProjectNumberContextType = {
  /**
   * The identifier for the project, to be used when querying for
   * project-specific data on the backend
   */
  projectNumber: number
}

export type ProjectStateContextType = {
  /**
   * Whether the project is visible to users who are not members of the
   * organization
   */
  isPublicProject: boolean
  /**
   * Whether the project has been marked as "closed" on the backend.
   *
   * This does not prevent the user from making changes if they have permissions
   * to the project.
   */
  isClosed: boolean
  /**
   * Whether the organization project has been marked as a "template".
   */
  isTemplate: boolean
}

/** This context contains additional fields related to the project */
export const ProjectDetailsContext = createContext<ProjectDetailsContextType | null>(null)

/** This context handles changes to the project number */
export const ProjectNumberContext = createContext<ProjectNumberContextType | null>(null)

/**
 * This context handles changes to the isPublicProject and isClosed computed
 * fields.
 */
export const ProjectStateContext = createContext<ProjectStateContextType | null>(null)

export const SetProjectContext = createContext<SetProjectContextType | null>(null)

/**
 * This context contains the identifier for template associated with the project. If the project is not a template, this value is undefined.
 */
export const ProjectTemplateIdContext = createContext<number | undefined>(undefined)

export const MemexStateProvider = memo(function MemexStateProvider({children}: {children: React.ReactNode}) {
  const [descriptionHtml, setDescriptionHtml] = useState('')

  const [defaultTitle] = useState(() => {
    const initialMemexCreator = fetchJSONIslandData('memex-creator')

    return getDefaultTitle(initialMemexCreator)
  })

  const [memex, setMemex] = useState<Memex>(() => {
    const initialMemex = fetchJSONIslandData('memex-data')
    const consistencyMetrics = fetchJSONIslandData('memex-consistency-metrics-data') || {}
    return initialMemex
      ? {...initialMemex, ...consistencyMetrics}
      : {
          id: -1,
          number: -1,
          title: defaultTitle,
          titleHtml: defaultTitle,
          public: false,
          closedAt: null,
          isTemplate: false,
        }
  })

  const setProject = useCallback((changes: Partial<Memex>) => {
    setMemex(value => ({...value, ...changes}))
  }, [])

  const projectNumber = memex.number

  const isPublicProject = memex.public === true

  const isClosed = memex.closedAt != null

  const isTemplate = memex.isTemplate === true
  const templateId = memex.templateId

  const title = useMemo(() => memex.title || defaultTitle, [defaultTitle, memex.title])
  const titleHtml = useMemo(() => memex.titleHtml || title, [memex.titleHtml, title])

  const shortDescription = memex.shortDescription || ''
  const shortDescriptionHtml = memex.shortDescriptionHtml || shortDescription

  const description = memex.description || ''

  const consistency = memex.consistency
  const inconsistencyThreshold = memex.inconsistencyThreshold

  const setProjectValue = useMemo(() => {
    return {setProject}
  }, [setProject])

  const projectNumberValue = useMemo(() => {
    return {
      projectNumber,
    }
  }, [projectNumber])

  const projectStateValue = useMemo(() => {
    return {
      isPublicProject,
      isClosed,
      isTemplate,
    }
  }, [isClosed, isPublicProject, isTemplate])

  const contextValue = useMemo(
    () => ({
      title,
      titleHtml,
      consistency,
      description,
      shortDescription,
      shortDescriptionHtml,
      descriptionHtml,
      inconsistencyThreshold,
      setDescriptionHtml,
    }),
    [
      consistency,
      description,
      descriptionHtml,
      inconsistencyThreshold,
      shortDescription,
      shortDescriptionHtml,
      title,
      titleHtml,
    ],
  )

  return (
    <SetProjectContext.Provider value={setProjectValue}>
      <ProjectNumberContext.Provider value={projectNumberValue}>
        <ProjectStateContext.Provider value={projectStateValue}>
          <ProjectDetailsContext.Provider value={contextValue}>
            <ProjectTemplateIdContext.Provider value={templateId}>{children}</ProjectTemplateIdContext.Provider>
          </ProjectDetailsContext.Provider>
        </ProjectStateContext.Provider>
      </ProjectNumberContext.Provider>
    </SetProjectContext.Provider>
  )
})

function getDefaultTitle(memexCreator?: {login: string}) {
  if (memexCreator?.login) {
    return Resources.untitledUserProject(memexCreator.login)
  }
  return Resources.untitledProject
}
