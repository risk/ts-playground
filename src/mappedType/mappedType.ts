/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

// 果物(Key)の一覧を作ろう
const fruits = {
  apple: 'apple',
  orange: 'orange',
  peach: 'peach',
} as const
type Fruits = typeof fruits // keysの型

// まずは Record型
const myFruits: Record<keyof Fruits, string> = {
  apple: 'like',
  orange: 'very like',
  peach: '...',
} as const
// 全部満たすことが必要
console.log(myFruits)

// 部分で扱うなら？
const myFruitsPart = {} as Record<keyof Fruits, string>
myFruitsPart.apple = 'うまい'
myFruitsPart.orange = 'とてもうまい'
console.log(myFruitsPart)


// MappedTypeでマッチさせてみよう
const sameMyFruits: {[K in keyof Fruits]: string} = myFruits // 形は同じだから怒られない
console.log(sameMyFruits)
// そもそも Record<> の中身は
//   type Record<K extends keyof any, T> = { [P in K]: T; }
// ただ、このあとは、Kを使うことがあるので、Recordのままだと無理だから、バラして使う

// 本題に入る前に...
// Mapの中で要素ごとの型が違ったらどうなるんだ？
const myFruitsMultiType = {
  apple: 'like',
  orange: 1,
  peach: true,
}
const myFruitsConstMultiType = {
  apple: 'like',
  orange: 1,
  peach: true,
} as const

// const有りと無しで比べてみよう
// constをつけないと、すべてを包含出来る型に
type MyFruitsMultiType = typeof myFruitsMultiType
// constをつけると、それだけを表す型に
type MyFruitsConstMultiType = typeof myFruitsConstMultiType

// つまるところ const は、推論がやりたがる「広げる」をやらせず、型を固定する役割
// （"apple" を string にしようとする推論を止め、「"apple" という型」にしてくれる）


// as const をふまえて、型のそれぞれの項目に対して、新しい定義を与える（ループ)
// まずは試しに、それぞれの型を配列に作り変えてみる
type ArrayMultiType<T> = {
  [K in keyof T]: T[K][]
}
const myFruitsArrayMultiType: ArrayMultiType<MyFruitsMultiType> = {
  apple: ['うまい', 'あまい'],    // OK
  // apple: [true, false],      // NG
  orange: [1, 2, 3],            // OK
  // orange: ['うまい', 'あまい'], // NG
  peach: [true, false]         // OK
  // peach: ['...', '...']     // NG
} as const // 型を包含されたくないから、つけとくよ

// 関数に作り変えてみる(引数も同梱しよう)
// 型を定義してみる
type EatWithArgs<T extends Record<keyof T, any[]>> = {
  [K in keyof T]: {
    eat: (...args: T[K]) => T[K],
    args: T[K]
  }
}
const eatWithArgs: EatWithArgs<typeof myFruitsArrayMultiType> = {
  apple: {
    eat: (arg1, arg2) => {
      console.log(arg1, arg2, 'もぐもぐ')
      return [arg1, arg2]
    },
    args: ['うまい', 'あまい']
  },
  orange: {
    eat: (arg1, arg2, arg3) => {
      console.log(arg1, arg2, arg3, 'うまうま')
      return [1, 2, 3]
    },
    args: [1, 2, 3]
  },
  peach: {
    eat: (arg1, arg2) => {
      console.log(arg1, arg2, 'しゃくっ')
      return [true, false]
    },
    args: [true, false]
  }
} as const // 型を包含されたくないから、つけとくよ

// 上の構造を踏まえて呼んでみる
// 制約で実行できる条件に絞り込んで実行
function eatCaller<
    T extends {[K in keyof T]: {
      eat: (...args: any[]) => any,
      args: any[]
    }}>
    (fTable: T) {
  const keys = Object.keys(fTable) as (keyof T)[]
  const reuslts = keys.map(key => fTable[key].eat(...fTable[key].args))
  console.log(reuslts)
}
eatCaller(eatWithArgs)

// ちなみに
// function eatCallerError<
//     T extends {[K in keyof T]: {
//       eat: (...args: any[]) => number, // ここをnumberにしてみると
//       args: any[]
//     }}>
//     (fTable: T) {
//   const keys = Object.keys(fTable) as (keyof T)[]
//   keys.forEach(key => fTable[key].eat(...fTable[key].args))
// }
// eatCallerError(eatWithArgs) // ここで extends の制約が働いているのが見える