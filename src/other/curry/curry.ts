// type Curry<F> = F extends (...args: infer A) => infer R
//   ? A extends [infer H, ...infer T]
//    ? (arg: H) => Curry<(...args: T) => R>
//    : R
//   : never

// type addType = (a: number, b: number, c: number) => number

// type curriedAdd = Curry<addType>

// const add: curriedAdd = (a) => {
//   return (b) => {
//     const bb = b * 10
//     return (c) => {
//       const cc = c * 100
//       return a + bb + cc
//     }
//   } 
// }

// console.log(add(1)(2)(3))

// const add2 = add(1)(2)
// console.log(add2(4))
// console.log(add2(5))

// type PartialApply<F, Args extends any[]> =
//   F extends (...a: infer A) => infer R
//     ? A extends [...Args, ...infer Rest]
//       ? (...a: Rest) => R
//       : never
//     : never

// type PartialApplyType = PartialApply<addType, [a: number, b: number]>

// const partialApply: PartialApplyType = (c) => {
//   return 1 + 2 + c
// }

// console.log(partialApply(3)) 

type Curry<F> = F extends (...args: infer A) => infer R
  ? A extends [infer H, ...infer T]
   ? (arg: H) => Curry<(...args: T) => R>
   : R
  : never

type PartialApply<F, Args extends any[]> =
  F extends (...a: infer A) => infer R
    ? A extends [...Args, ...infer Rest]
      ? (...a: Rest) => R
      : never
    : never

class PowerCalculator {

  cal: PartialApply<typeof PowerCalculator.prototype.power, [number]>

  constructor(private index: number) {
    this.cal = (data: number) => this.power(this.index, data)
  }

  private power(i: number, data: number) {
    return Math.pow(i, data)
  }
}

const power = new PowerCalculator(2)
console.log(power.cal(3))