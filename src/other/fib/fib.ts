

// const calcFib = (prev: number, cur: number) => () => prev + cur
// const makeSequence = (first: number, second: number, recursive: () => number ) => {
//   return (count : number) : number => {
//     if (count === 1) {
//       return first
//     }
//     const next = recursive()
//     return makeSequence(second, next, calcFib(second, next))(count - 1)
//   }
// }

// const makefib = makeSequence(1, 1, calcFib(1, 1))
// const fib = makefib(10)
// console.log('result', fib)



// function* fibGenerator(first = 1, second = 1): Generator<number> {
//   let prev = first
//   let cur = second
//   while (true) {
//     yield prev
//     ;[prev, cur] = [cur, prev + cur]
//   }
// }

// // n番目のフィボナッチ数を取得する関数
// const getFib = (n: number) => {
//   const gen = fibGenerator()
//   let result = 0
//   for (let i = 0; i < n; i++) {
//     const next = gen.next()
//     if (next.done) break
//     result = next.value
//   }
//   return result
// }

// // 実行
// console.log('result', getFib(10)) // 55


// 再帰関数の型定義
type RecursiveFunc<T> = (self: RecursiveFunc<T>) => (n: number) => T

// カリー化されたフィボナッチ生成器
const fib: RecursiveFunc<number> = (recurse) => (n) =>
  n <= 1 ? n : recurse(recurse)(n - 1) + recurse(recurse)(n - 2)

// 再帰を自己注入して実体化
const makeFib = (fn: RecursiveFunc<number>) => fn(fn)

const fibn = makeFib(fib)

console.log(fibn(10)) // 55