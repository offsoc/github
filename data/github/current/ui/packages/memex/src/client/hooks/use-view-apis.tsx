import {useCallback} from 'react'

import {cancelGetAllMemexData} from '../api/memex/api-get-all-memex-data'
import {apiCreateView} from '../api/view/api-create-view'
import {apiDestroyView} from '../api/view/api-destroy-view'
import {apiUpdateView} from '../api/view/api-update-view'
import type {PageView, PageViewCreateRequest, PageViewDeleteRequest, PageViewUpdateRequest} from '../api/view/contracts'
import {useApiRequest} from './use-api-request'

/**
 * Options used to configure a view API function
 */
type UseViewAPIOpts = {
  /** A dispatch to update the current view */
  setCurrentViewNumber: (viewNumber: number) => void

  addView: (views: PageView) => void
  updateView: (views: PageView) => void
  deleteView: (number: number) => void
}
/**
 * Get a function that makes an API request to create new views.
 *
 * @param opts Options to configure the create view API request
 * @returns
 */
export const useCreateView = ({setCurrentViewNumber, addView}: UseViewAPIOpts) => {
  const createViewFn = useCallback(
    async (request: PageViewCreateRequest): Promise<PageView> => {
      cancelGetAllMemexData()
      const createdViewResponse = await apiCreateView(request)

      addView(createdViewResponse.view)
      setCurrentViewNumber(createdViewResponse.view.number)

      return createdViewResponse.view
    },
    [addView, setCurrentViewNumber],
  )

  const createView = useApiRequest({request: createViewFn})
  return createView
}
/**
 * Get a function that updates a view.
 *
 * @param opts Options to configure the update view API request.
 */
export const useUpdateViewWithoutSettingStates = () => {
  const updateViewFn = useCallback(async (request: PageViewUpdateRequest): Promise<PageView> => {
    cancelGetAllMemexData()
    const updatedViewResponse = await apiUpdateView(request)

    return updatedViewResponse.view
  }, [])

  const updateView = useApiRequest({request: updateViewFn})
  return updateView
}
/**
 * Get a function that updates a view.
 *
 * @param opts Options to configure the update view API request.
 */
export const useUpdateView = ({setCurrentViewNumber, updateView}: UseViewAPIOpts) => {
  const updateViewFn = useCallback(
    async (request: PageViewUpdateRequest): Promise<PageView> => {
      cancelGetAllMemexData()

      const {sliceValue, ...view} = request.view
      request.view = view

      const updatedViewResponse = await apiUpdateView(request)

      if (sliceValue) {
        updatedViewResponse.view.sliceValue = sliceValue
      }

      updateView(updatedViewResponse.view)
      setCurrentViewNumber(updatedViewResponse.view.number)

      return updatedViewResponse.view
    },
    [updateView, setCurrentViewNumber],
  )

  const updateViewReq = useApiRequest({request: updateViewFn})
  return updateViewReq
}
/**
 * Get a function that destroys a view via the API.
 *
 * @param opts Options to configure the destroy view request
 */
export const useDestroyView = ({deleteView}: UseViewAPIOpts) => {
  const destroyViewFn = useCallback(
    async (viewToDelete: PageViewDeleteRequest): Promise<void> => {
      cancelGetAllMemexData()

      await apiDestroyView(viewToDelete)
      deleteView(viewToDelete.viewNumber)
    },
    [deleteView],
  )

  const destroyView = useApiRequest({request: destroyViewFn})
  return destroyView
}
