/*
  The date returned from the server contains an array per week, where the first item is the timestamp / 1000,
  the second is the number of additions, and the third is the number of deletions.

  [
    number: timestamp / 1000
    number: additions
    number: deletions
  ]
*/
export type AggregateDataPoint = [number, number, number]

/*
  Allows for explicitly fetching a named field
*/
export enum AGGREGATE_KEY {
  TIMESTAMP = 0,
  ADDITIONS = 1,
  DELETIONS = 2,
}

/*
  This is the clientside representation of either additions or deletions, where the timestamp has been
  multiplied by 1000 to be represented by a javascript Date object correctly.

  [
    number: timestamp
    number: value (additions or deletions)
  ]
*/
export type MetricDataPoint = [number, number]

/*
  Highcharts expects a [number, number] as a series, so this is a mapping from the server to this format,
  but allows for fetching fields by name to be explicit.
*/
export enum METRIC_KEY {
  TIMESTAMP = 0,
  VALUE = 1,
}
