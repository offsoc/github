import {type Milestone, MilestoneState} from '../api/common-contracts'
import {MilestoneResources} from '../strings'

export function milestoneDueText(milestone: Milestone) {
  if (milestone.state === MilestoneState.Closed) {
    return MilestoneResources.closed
  }

  if (!milestone.dueDate) {
    return MilestoneResources.noDueDate
  }
  // milestone.dueDate is a date string in the format YYYY-MM-DD so we're making it the end of the day local to the user
  const milestoneDueDate = new Date(`${milestone.dueDate}T23:59:59`)
  if (milestoneDueDate < new Date()) {
    // comparing when past due to the start of the due date, to get a minimum of 1 day overdue
    return MilestoneResources.pastDueBy(new Date(`${milestone.dueDate}T00:00:00`))
  }

  return MilestoneResources.dueOn(milestoneDueDate)
}
