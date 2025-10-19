/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

// 「extends」は型のマッチを行うやつ
type TestType<T extends number> = T
const valNum: TestType<number> = 100 // OK
// const valStr: TestType<string> = '1' // NG

// inferは部分的に抜き出すやつ
// こんな関数があったとして
const func = (a: number, b: string, ...c: boolean[]): [string, number] => {
  return [b, a]
}
console.log(func(1, 'test', true, false))
// > [ 'test', 1 ]

// 関数の型はこんな感じで分解出来る
type Func = typeof func
type FuncParameters = Parameters<Func>
type FuncParameters1 = FuncParameters[0]
type FuncParameters2 = FuncParameters[1]
type FuncParameters3 = FuncParameters[2]
type FuncParameters4 = FuncParameters[3]
type FuncReturn = ReturnType<Func>

// 部分的に欲しいんじゃ
// 引数のTypeから引き出したり
type FuncParam2WithInfer1 =
    FuncParameters extends
      [number, (infer U), ...boolean[]]
        ? U
        : never

// 関数の方から引き出したり
type FuncParam2WithInfer2 =
    Func extends
      (a: number, b:(infer U), ...c: boolean[]) => [string, number]
        ? U : never

// そうすると「Parameters」の実装は、きっとこんな感じかな
type MyParameters<Func extends (...x: any[]) => any> =
    Func extends
      (...x: (infer U)) => any ? U : never
type MyPTest = MyParameters<Func>

// そうすると「ReturnType」の実装は、きっとこんな感じかな
type MyReturnType<Func extends (...x: any[]) => any> =
    Func extends
      (...x: any[]) => (infer U) ? U : never
type MyRTest = MyReturnType<Func>

// inferは配列にもつかえるよ
type Head<T extends any[]> = T extends [(infer F), ...any[]] ? F : never
type Tail<T extends any[]> = T extends [...any[], (infer R)] ? R : never

type BaseArray = [string, any, number, boolean]
type HeadTest = Head<BaseArray> // string
type TailTest = Tail<BaseArray> // boolean
