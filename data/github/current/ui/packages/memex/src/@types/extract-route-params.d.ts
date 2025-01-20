/**
 * This is useful for extracting the dynamic path segments from a known (and specific) pathname
 * string, and generating a mapped type of those segments to strings
 *
 * @examples
 * type PathParams = ExtractRouteParams<string>
 * => Record<string, string>
 *
 * type PathParams = ExtractRouteParams<'path-segment'>
 * => {}
 *
 * type PathParams = ExtractRouteParams<'path-segment/:pathParams'>
 * => { pathParams: string }
 *
 * type PathParams = ExtractRouteParams<'path-segment/:pathParams/other-segment'>
 * => { pathParams: string }
 *
 * type PathParams = ExtractRouteParams<'path-segment/:pathParams/other-segment/:otherParams'>
 * => { pathParams: string, otherParams: string }
 *
 * type PathParams = ExtractRouteParams<'path-segment/:pathParams/other-segment/:otherParams/:extraParams'>
 * => { pathParams: string, otherParams: string, extraParams: string }
 *
 * type PathParams = ExtractRouteParams<'path-segment/:pathParams/other-segment/:otherParams/:extraParams/:extraParams2'>
 * => { pathParams: string, otherParams: string, extraParams: string, extraParams2: string }
 */
type ExtractRouteParams<T> =
  /**
   * If the string passed to `ExtractRouteParams` is of type `string` and not
   * a specific string like 'some-value', at compile time, it's impossible to
   * statically analyze the types here, since typescipt can only understand
   * statically analyzable types.
   *
   * string extends T means that T is _at most_ type string
   * or to put it another way, T is a subtype of `string` or `string` itself.
   *
   * In this scenario, the only valid type we can generate is a Record<string, string>
   * since it's impossible to determine what the correct types might be
   *
   * example when this case may get hit:
   *
   * function makePath(...): string {}
   * ExtractRouteParams<ReturnType<typeof makePath>>
   * or, written nicer
   * ExtractRouteParams<string>
   *
   * Since the return type of makePath is `string`, we can't statically analyze the
   * string generated from it.
   *
   * A string literal type can be considered a subtype of the string type. This means that a string literal type is assignable to a plain string, but not vice-versa. So it doesn't trip this case
   * ExtractRouteParams<'some-string-literal'>
   */
  string extends T
    ? Record<string, string>
    : /**
       * When a specific string literal type is passed to `ExtractRouteParams`
       * that matches the pattern `string:string/string`, we can 'assign' each section
       * to a type using the `infer` keyword.
       *
       * We'll ignore the `_Start` section, since we only care about path parameters
       * and return a mapped object type mapping the known path parameters and the result of
       * calling `ExtractRouteParams` on the remaining section of string `Rest`, mapping each
       * of these to `string`
       */
      T extends `${infer _Start}:${infer Param}/${infer Rest}`
      ? {[k in Param | keyof ExtractRouteParams<Rest>]: string | number}
      : /**
         * Similarly to the above case, but a subcase where the string passed to
         * `ExtractRouteParams` does not have a trailing segment, but matches `string:string`
         * we split the string into parts via `infer` and ignore the `_Start` section
         * returning a mapped object type mapping the known path parameter to `string`
         */
        T extends `${infer _Start}:${infer Param}`
        ? {[k in Param]: string | number}
        : /**
           * When the string passed to `ExtractRouteParams` does not match the patterns
           * above, there are no path parameters for that string
           */
          void | undefined | Record<never, never>
