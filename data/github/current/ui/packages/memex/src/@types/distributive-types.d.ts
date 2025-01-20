/**
 * Types that distribute over unions safely
 */
type DistributiveRequireProperty<T, K extends keyof T> = T extends unknown
  ? DistributiveRequireNonNullableProperty<T, K>
  : never

type DistributiveRequireNonNullableProperty<T, K extends keyof T> = T & {[P in K]-?: NonNullable<T[P]>}
