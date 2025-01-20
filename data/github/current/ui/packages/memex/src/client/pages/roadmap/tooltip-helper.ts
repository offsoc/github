import {isRoadmapColumnModel, type ReadonlyRoadmapColumns, type TimeSpan} from '../../helpers/roadmap-helpers'
import {RoadmapResources} from '../../strings'
import {formatDateRangeUtc, formatDateUtc} from './date-utils'

/**
 * Returns the time span text for a pill based on dates and iterations if applicable
 */
export function getTooltipText(timeSpan: TimeSpan, dateFields?: ReadonlyRoadmapColumns) {
  const {start, end, startIteration, endIteration} = timeSpan

  // Include start/end iteration names and [dates] if provided
  if (startIteration && start) {
    if (end) {
      if (endIteration) {
        if (startIteration === endIteration) {
          return `${formatDateRangeUtc(start, end)} [${startIteration.title}]`
        }
        return `${formatDateRangeUtc(start, end)} [${startIteration.title} start - ${endIteration.title} end]`
      }
      if (start.getTime() === end.getTime()) {
        return `${formatDateUtc(start)} [${startIteration.title} start]`
      }
      return `${formatDateRangeUtc(start, end)} [${startIteration.title} start - ${formatDateUtc(end, 'MMM d')}]`
    }
    return `${formatDateUtc(start)} [${startIteration.title} start]`
  }
  if (endIteration && end) {
    if (start) {
      if (start.getTime() === end.getTime()) {
        return `${formatDateUtc(end)} [${endIteration.title} end]`
      }
      return `${formatDateRangeUtc(start, end)} [${formatDateUtc(start, 'MMM d')} - ${endIteration.title} end]`
    }
    return `${formatDateUtc(end)} [${endIteration.title} end]`
  }

  // Include only dates if iterations are not used
  if (start && end && start.getTime() !== end.getTime()) return formatDateRangeUtc(start, end)
  if (start) return formatDateUtc(start)
  if (end) return formatDateUtc(end)

  // If no date fields are configured, then return a tooltip for that
  if (dateFields && !dateFieldsConfigured(dateFields)) return RoadmapResources.noDateFieldsConfiguredTooltip
}

export function dateFieldsConfigured(dateFields: ReadonlyRoadmapColumns) {
  return dateFields.filter(isRoadmapColumnModel).length > 0
}
