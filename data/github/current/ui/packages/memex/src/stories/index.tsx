import '../mocks/dotcom/scripts/environment'
import '../../../../../app/assets/stylesheets/bundles/primer/index.scss'
import '../../../../../app/assets/stylesheets/bundles/global/index.scss'
import '../../../../../app/assets/stylesheets/bundles/github/index.scss'
import '../../../../../app/assets/stylesheets/variables/themes/dark_colorblind.scss'
import '../../../../../app/assets/stylesheets/variables/themes/dark_dimmed.scss'
import '../../../../../app/assets/stylesheets/variables/themes/dark_high_contrast.scss'
import '../../../../../app/assets/stylesheets/variables/themes/dark_tritanopia.scss'
import '../../../../../app/assets/stylesheets/variables/themes/dark.scss'
import '../../../../../app/assets/stylesheets/variables/themes/light_colorblind.scss'
import '../../../../../app/assets/stylesheets/variables/themes/light_high_contrast.scss'
import '../../../../../app/assets/stylesheets/variables/themes/light_tritanopia.scss'
import '../../../../../app/assets/stylesheets/variables/themes/light.scss'
import '../../../../../app/assets/stylesheets/bundles/primer-primitives/index.scss'

import {createRoot, type Root} from 'react-dom/client'
import invariant from 'tiny-invariant'

import {
  FILTER_QUERY_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VIEW_TYPE_PARAM,
} from '../client/platform/url'
import {PROJECT_ROUTE} from '../client/routes'
import type {ServerUrlData} from '../mocks/server/mock-server'
import {getActiveStoryId} from './helpers/get-active-story'
import {logStylesheet} from './helpers/log-stylesheet'
import {renderNavigation} from './navigation'
import {render404} from './render-404'
import {renderIndex} from './render-index'
import {startStory} from './start-story'
import {getStoryFullPathname, initialStory, storiesById} from './story-definitions'

const isRootPath = window.location.pathname === '/' || window.location.pathname === ''
const isStaging = window.location.hostname.endsWith('.drafts.github.io')

/**
 * If we're at the base path, redirect to the first story path
 * if we're not at a projects route, render a 404
 * otherwise start the story
 */
if (isRootPath && !isStaging) {
  history.replaceState(null, '', getStoryFullPathname(initialStory))
}

class ProjectsV2 extends HTMLElement {
  reactRoot: Root | undefined

  async connectedCallback() {
    const root = createRoot(this)
    this.reactRoot = root
    const match = PROJECT_ROUTE.matchFullPathOrChildPaths(window.location.pathname)
    const activeStoryId = getActiveStoryId()

    if (isRootPath && isStaging) {
      renderIndex(root)
      return
    }

    renderNavigation({activeStoryId})

    if (!match) {
      render404(root)
      return
    }

    const viewNumberAsString = match.params['*']?.match(/views\/(\d+)/)?.[1]
    const viewNumber = viewNumberAsString != null ? parseInt(viewNumberAsString, 10) : undefined

    const queryParams = new URLSearchParams(window.location.search)
    const urlData: ServerUrlData = {
      viewNumber,
      queryParams: {
        [FILTER_QUERY_PARAM]: queryParams.get(FILTER_QUERY_PARAM),
        [SORTED_BY_COLUMN_ID_KEY]: queryParams.getAll(SORTED_BY_COLUMN_ID_KEY),
        [SORTED_BY_COLUMN_DIRECTION_KEY]: queryParams.getAll(SORTED_BY_COLUMN_DIRECTION_KEY),
        [HORIZONTAL_GROUPED_BY_COLUMN_KEY]: queryParams.get(HORIZONTAL_GROUPED_BY_COLUMN_KEY),
        [VERTICAL_GROUPED_BY_COLUMN_KEY]: queryParams.get(VERTICAL_GROUPED_BY_COLUMN_KEY),
        [SLICE_BY_COLUMN_ID_KEY]: queryParams.get(SLICE_BY_COLUMN_ID_KEY),
        [SLICE_VALUE_KEY]: queryParams.get(SLICE_VALUE_KEY),
        [VIEW_TYPE_PARAM]: queryParams.get(VIEW_TYPE_PARAM),
      },
    }

    const storyDefinition = storiesById[activeStoryId]
    invariant(storyDefinition, `Could not find story definition for ${activeStoryId}`)
    startStory({storyDefinition, element: this, root, urlData})

    // eslint-disable-next-line valid-typeof
    if (typeof window !== undefined) {
      window.__memex = {
        logStylesheet,
      }
    }
  }

  disconnectedCallback() {
    this.reactRoot?.unmount()
  }
}

function registerProjectsV2Element() {
  if (typeof window === 'undefined') return
  if (!window.customElements.get('projects-v2')) {
    // eslint-disable-next-line custom-elements/tag-name-matches-class
    window.customElements.define('projects-v2', ProjectsV2)
  }
}

declare global {
  interface Window {
    __memex: {
      logStylesheet: typeof logStylesheet
    }
  }
}

registerProjectsV2Element()
