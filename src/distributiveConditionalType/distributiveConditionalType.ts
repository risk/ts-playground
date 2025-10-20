/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

// TypeScriptのDistributive Conditional Types（分配条件型）の挙動を検証するサンプル集です。

type unionType = string | number

// 基礎
type DCT1<T> = T extends string ? 'string' : 'not string'
type UseStringDCT1 = DCT1<string> // → 'string'
type UseNumberDCT1 = DCT1<number> // → 'not string'
type UseUnionDCT1 = DCT1<unionType> // → 'string' | 'not string'
// T が string なら 'string'
// T が string でないなら 'not string'
// 要するに、Unionを評価する場合に、それぞれを評価して再結合してくれる

// Unionの場合、それぞれの型ごとに検証して再結合する動きになる
type DCT2<T> = T extends any ? { type: T } : never
type Result = DCT2<string | number>
// → { type: string } | { type: number }

// 分配されるの嫌だったら [] でくくろう
type DCT3_1<T> = [T] extends [string | number] ? 'string or number' : 'unmatched'
type UseDCT3_1 = DCT3_1<unionType> // → 'string or number'
type UseWithBoleanDCT2_1 = DCT3_1<unionType | boolean> // → 'unmatched'
type UseWithNeverDCT2_1 = DCT3_1<unionType | never> // → 'string or number'

// もしマッチする側の[]を外すと、Union型での一致が取れない
type DCT3_2<T> = [T] extends string | number ? 'string or number' : 'unmatched'
type UseDCT3_2 = DCT3_2<unionType> // → 'unmatched'

// ちょっとだけまとめ
// 分配条件型（DCT）は「T extends ～」で T が union のとき自動的に forEach 展開される
// 逆に「[T] extends ～」にすると forEach しない（＝非分配型になる）
type DCT_FOREACH<T> = T extends any ? { v : T} : never
type DCT_UNION<T> = [T] extends any ? { v : T} : never
type DCT_F = DCT_FOREACH<string | number> // { v: string } | { v: number }
type DCT_U = DCT_UNION<string | number> // { v: string | number }
// DCT_FOREACH は「T extends ～」がそのまま評価されるため、T が union の場合は分配される
// 一方、DCT_UNION のように [T] でくくると「1つのT」として扱われ、分配されない

// 応用
// Extract と Exclude の再現
// Extractは、Uに指定された型だけを残す仕組み
type MyExtract<T, U> = T extends U ? T : never

// 本物
type Result1 = Extract<string | number | boolean, string | number>
// 手作り
type MyResult1 = MyExtract<string | number | boolean, string | number>
// どちらも結果は、string | number

// Excludeは、Uに指定された型を除外する仕組み
type MyExclude<T, U> = T extends U ? never : T
// 本物
type Result2 = Exclude<string | number | boolean, string | number>
// 手作り
type MyResult2 = MyExclude<string | number | boolean, string | number>
// どちらも結果は、boolean

// ちなみに「never」は、Unionに含まれた時点で消滅します。
type HasNever = string | never | number | never | boolean
// → string | number | boolean

// AIさんがこんなことも出来るんだぞ！って教えてくれやつ。激しい
type KindMap<T> =
  T extends string ? { kind: 'string', value: T } :
  T extends number ? { kind: 'number', value: T } :
  { kind: 'other', value: T }

type Mixed = string | number | boolean
type Result3 = KindMap<Mixed>
// → { kind: 'string', value: string } | { kind: 'number', value: number } | { kind: 'other', value: false } | { kind: 'other', value: true }

// なぬっ Booleanがリテラルで展開されているだと・・・（AIさんいわく、TS5.7からとのこと）
type BooleanTest3_1<B> = B extends any ? { value: B } : never
type Result3_1 = BooleanTest3_1<boolean>
// → { value: false } | { value: true}
type BooleanTest3_2<B> = B extends any ? B : never
type Result3_2 = BooleanTest3_2<boolean>
// → boolean

// なんか、戻ってるという話が・・・
type MyBoolean = false | true // → boolean
// つまり、3_2 は分配されて戻ったと・・・？