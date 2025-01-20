import {useEffect} from 'react'

import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'

const emptyComponentRenderCounts = (): ComponentRenderCounts => ({
  total: 0,
  groups: {},
})

let componentRenders = emptyComponentRenderCounts()
let reactProfilerMeasurements: Array<ReactProfilerMeasurement> = []

if (process.env.ENABLE_PROFILING) {
  window.memexPerformance = {
    getComponentRenders(): ComponentRenderCounts {
      return componentRenders
    },
    clearComponentRenders() {
      componentRenders = emptyComponentRenderCounts()
    },
    getProfilerMeasurements() {
      return reactProfilerMeasurements
    },
    addProfilerMeasurement(datum: ReactProfilerMeasurement) {
      reactProfilerMeasurements.push(datum)
    },
    clearProfilerMeasurements() {
      reactProfilerMeasurements = []
    },
  }
}

export const recordMeasurement: React.ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration) => {
  if (!process.env.ENABLE_PROFILING) {
    // bail out if this was not set when building the package
    // this should turn the operation into a no-op
    return
  }

  window.memexPerformance.addProfilerMeasurement({
    id,
    phase,
    actualDuration,
    baseDuration,
  })
}

/**
 * Record the rendering of a component so that excessive re-renders can be
 * tested for.
 *
 * @param group     - to group components, e.g. "CellRenderer"
 * @param component - component classname, e.g. "TitleRenderer"
 * @param id        - unique id for an instance, e.g. memexItem.id
 */
const recordComponent = (group: string, component: string, id: string | number) => {
  if (process.env.APP_ENV === 'production') return

  if (group === 'total' || component === 'total' || id === 'total') {
    throw new Error('component identifiers cannot be "total"')
  }

  id = id.toString()

  componentRenders.total ??= 0
  componentRenders.total += 1

  componentRenders.groups[group] ??= {total: 0, components: {}}
  not_typesafe_nonNullAssertion(componentRenders.groups[group]).total += 1

  not_typesafe_nonNullAssertion(componentRenders.groups[group]).components[component] ??= {total: 0, ids: {}}
  not_typesafe_nonNullAssertion(
    not_typesafe_nonNullAssertion(componentRenders.groups[group]).components[component],
  ).total += 1

  not_typesafe_nonNullAssertion(
    not_typesafe_nonNullAssertion(componentRenders.groups[group]).components[component],
  ).ids[id] ??= 0
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  not_typesafe_nonNullAssertion(
    not_typesafe_nonNullAssertion(componentRenders.groups[group]).components[component],
  ).ids[id]! += 1
}

/**
 * Recorded in an effect to ensure that
 * a single render is tracked no matter how
 * many times a render might be interrupted or
 * StrictMode double rendering is on in dev
 */
export const useRecordComponent = (group: string, component: string, id: string | number) => {
  useEffect(() => {
    recordComponent(group, component, id)
  })
}

export const useRecordCellRenderer = useRecordComponent.bind(null, 'CellRenderer')

export const useRecordCellEditor = useRecordComponent.bind(null, 'CellEditor')
