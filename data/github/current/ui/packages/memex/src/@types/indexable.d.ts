/**
 * [`@typescript-eslint/ban-types`](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md) reports an error when you use `{}` and recommends `Record<string, unknown>` instead (by default).
 *
 * While that’s an appropriate replacement in some instances, it prevents the use of `interface`, because
 * an implicit index signature is not inferred for `interface` (unlike `type`)[^1]. Since it’s common to use 'type' and
 * 'interface' interchangeably, `Record<string, unknown>` is a suprisingly disruptive replacement.
 *
 * [^1]: Details: https://github.com/microsoft/TypeScript/issues/15300#issuecomment-332366024
 *
 * To give a specific example:
 * Suppose you want to remove `{}` in the following code—
 *
 * ```ts
 * import * as React from "react";
 *
 * const Button = <P extends {}>(props: P) => <button {...props} />
 *
 * type SubmitButton1Props = { type: "submit" };
 * const SubmitButton1 = (props: SubmitButton1Props) => Button(props);
 *
 * interface SubmitButton2Props { type: "submit" };
 * const SubmitButton2 = (props: SubmitButton2Props) => Button(props);
 * ```
 *
 * —if you use `Record<string, unknown>` (leaving other code as-is)—
 *
 * ```ts
 * const Button = <P extends Record<string, unknown>>(props: P) => <button {...props} />
 * ```
 *
 * —then you’ll get the following error—
 *
 * ```ts
 * const SubmitButton2 = (props: SubmitButton2Props) => Button(props);
 *                                                          // ~~~~~
 * ```
 *
 * > Argument of type '`SubmitButton2Props`' is not assignable to parameter of type '`Record<string, unknown>`'.
 * >   Index signature is missing in type '`SubmitButton2Props`'. (2345)
 *
 * —instead, replace `{}` with `Indexable<P>`—
 *
 * ```ts
 * const Button = <P extends Indexable<P>>(props: P) => <button {...props} />
 * ```
 *
 * —voila, no error!
 */
type Indexable<T extends {[key in keyof T]: unknown}> = {
  [K in keyof T]: T[K]
}
