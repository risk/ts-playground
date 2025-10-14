export type Curry<F> = F extends (...args: infer A) => infer R
  ? A extends [infer H, ...infer T]
   ? (arg: H) => Curry<(...args: T) => R>
   : R
  : never