export interface IterationInterval {
  /**
   * Start date of a particular iteration
   *
   * ISO Date string
   */
  startDate: string
  /**
   * The length of the iteration in days
   */
  duration: number
}

export interface NewIteration extends IterationInterval {
  title: string
}

export interface Iteration extends NewIteration {
  id: string
  titleHtml: string
}

export interface IterationValue {
  id: string
}

export interface IterationConfiguration {
  /**
   * Day of the week, 1 indexed starting on Monday with 7 being Sunday
   */
  startDay: number
  /**
   * Number of days to default iteration length to
   */
  duration: number
  iterations: Array<Iteration>
  completedIterations: Array<Iteration>
}
