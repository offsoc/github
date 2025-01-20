/**
 * Defines the global `window` interface for the performanceMeasurements module
 */

declare type ComponentRenderCounts = {
  total: number
  groups: {
    [key: string]: {
      total: number
      components: {
        [key: string]: {
          total: number
          ids: {
            [key: string]: number
          }
        }
      }
    }
  }
}

/**
 * A subset of the data made available to the onRender callback of the React
 * Profiler: https://reactjs.org/docs/profiler.html#onrender-callback
 */
declare type ReactProfilerMeasurement = {
  id: string
  phase: 'mount' | 'update' | 'nested-update'
  actualDuration: number
  baseDuration: number
}

interface Window {
  // helpers defined by the performanceMeasurements module
  memexPerformance: {
    getComponentRenders: () => ComponentRenderCounts
    clearComponentRenders: () => void
    addProfilerMeasurement: (datum: ReactProfilerMeasurement) => void
    getProfilerMeasurements: () => Array<ReactProfilerMeasurement>
    clearProfilerMeasurements: () => void
  }
}
