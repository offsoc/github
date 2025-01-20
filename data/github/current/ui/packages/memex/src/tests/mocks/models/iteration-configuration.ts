import type {UpdateIterationConfiguration} from '../../../client/api/columns/contracts/api'
import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {omit} from '../../../utils/omit'

/**
 * Merge the existing IterationConfiguration values with changes representing
 * the update to these settings.
 *
 * This handles populating ids for new iterations, setting the `titleHtml` value
 * based on the current `title` field, and allows for the `renderTitle` function
 * to be configured based on what's required.
 *
 * @param existingSettings the existing configuration for a field
 * @param newConfiguration the new configuration to merge with the current
 *                         settings
 * @param renderTitle an optional method to control how the `titleHtml` value is
 *                    rendered - if omitted, this will just assign the `title`
 *                    value
 */
export function generateIterationConfiguration(
  existingSettings: IterationConfiguration,
  newConfiguration: UpdateIterationConfiguration,
  renderTitle?: (input: string) => string,
): IterationConfiguration {
  const existingIterationsCount = newConfiguration.iterations.length + newConfiguration.completedIterations.length

  //we need to add some ids to these options since they won't have them without the backend api
  //and without the ids, we won't be able to set keys on react components that depend on them
  return {
    ...existingSettings,
    ...newConfiguration,
    iterations: newConfiguration.iterations.map((iteration, index) => ({
      ...iteration,
      titleHtml: renderTitle ? renderTitle(iteration.title) : iteration.title,
      id: iteration.id ? iteration.id : `settings_iteration_${index + existingIterationsCount}`,
    })),
    completedIterations: newConfiguration.completedIterations.map((iteration, index) => ({
      ...iteration,
      titleHtml: renderTitle ? renderTitle(iteration.title) : iteration.title,
      id: iteration.id ? iteration.id : `settings_iteration_${index + existingIterationsCount}`,
    })),
  }
}

/**
 * This helper function merges the changes from the component into the current
 * settings, to create a new IterationConfiguration object for the column.
 */
export function mergeIterationChanges(configuration: IterationConfiguration, changes: Partial<IterationConfiguration>) {
  const iterations = changes.iterations || configuration.iterations
  const completedIterations = changes.completedIterations || configuration.completedIterations

  const updates: UpdateIterationConfiguration = {
    duration: configuration.duration,
    startDay: configuration.startDay,
    ...changes,
    // we don't need to send titleHtml as the server will handle this for us
    iterations: iterations.map(i => omit(i, ['titleHtml'])),
    completedIterations: completedIterations.map(i => omit(i, ['titleHtml'])),
  }

  return generateIterationConfiguration(configuration, updates)
}
