/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

type unionType = string | number

// 基礎
type DCT1<T> = T extends string ? 'string' : 'not string'
type UseStringDCT1 = DCT1<string> // → 'string'
type UseNumberDCT1 = DCT1<number> // → 'not string'
type UseUnionDCT1 = DCT1<unionType> // → 'string' | 'not string'
// T が string なら 'string'
// T が string でないなら 'not string'
// 要するに、Unionを評価する場合に、それぞれを評価して再結合してくれる

// 分配されるの嫌だったら [] でくくろう
type DCT2_1<T> = [T] extends [string | number] ? 'string or number' : 'unmatched'
type UseDCT2_1 = DCT2_1<unionType> // → 'string or number'
type UseWithBoleanDCT2_1 = DCT2_1<unionType | boolean> // → 'unmatched'
type UseWithNeverDCT2_1 = DCT2_1<unionType | never> // → 'string or number'

type DCT2_2<T> = [T] extends string | number ? 'string or number' : 'unmatched'
type UseDCT2_2 = DCT2_2<unionType> // → 'unmatched'

// Extract と Exclude の再現


