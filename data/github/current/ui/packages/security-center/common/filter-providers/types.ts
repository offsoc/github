/**
 * Default filter type configuration for Security Overview filter providers.
 * see: https://ui.githubapp.com/storybook/?path=/docs/recipes-filter-providers-standard--docs#options
 */
export const DEFAULT_FILTER_TYPE_OPTIONS = {
  /**
   * `inclusive` is normal filter operation
   */
  inclusive: true,

  /**
   * `exclusive` appears to make the filter eligible for negation, e.g. being prefixed by the `-` operator
   */
  exclusive: true,

  /**
   * `valueless` makes the filter eligible for the `no:` qualifier.
   * None of our filters support this.
   */
  valueless: false,

  /**
   * `multiKey` is "and" branch operators, e.g. `archived:true archived:false`
   * Our filters don't support this today (though we'd like to).
   */
  multiKey: false,

  /**
   * `multiValue` is "or" branch operators, e.g. `archived:true,false`
   * All of our filters support this.
   */
  multiValue: true,
}

export type CustomProperty = {
  name: string
  type: 'string' | 'single_select' | 'multi_select' | 'true_false'
}
