

const func = (a: number, b: string, ...c: boolean[]): [string, number] => {
  return [b, a]
}
console.log(func(1, 'test', true, false))

type Func = typeof func
type FuncParameters = Parameters<Func>


// Value
type Value<T extends number, A extends number[] = []> =
  A['length'] extends T ? A : Value<T, [...A, number]>

// ToValue
type ToV<T extends number[]> = T['length']

// Values Test
type Zero = ToV<Value<0>>
type One = ToV<Value<1>>
type Two = ToV<Value<2>>
type Three = ToV<Value<3>>

// Add
type Add<T1 extends number[], T2 extends number[]> = [...T1, ...T2]
type RetAdd1 = ToV<Add<Value<7>, Value<6>>>
type RetAdd2 = ToV<Add<Value<100>, Value<120>>>

// Sub ver. 1
type lessOne<T extends number[]> = T extends [number, ...(infer U)] ? U : never
type Sub<T1 extends number[], T2 extends number[]> =
    T2 extends [] ? T1 : Sub<lessOne<T1>, lessOne<T2>>
type RetSub1 = ToV<Sub<Value<100>, Value<20>>>
type RetSub2 = ToV<Sub<Value<35>, Value<11>>>

// Mul
type Mul<T1 extends number[], T2 extends number[], NEXT extends number[] = []> =
    T2 extends [] ? NEXT : Mul<T1, lessOne<T2>, Add<NEXT, T1>>
type RetMul1 = ToV<Mul<Value<2>, Value<8>>>
type RetMul2 = ToV<Mul<Value<7>, Value<5>>>

// Sub ver. 2
type NewSub<T1 extends number[], T2 extends number[]> =
    T1 extends [...(infer U), ...T2] ? U : never
type Test1NewSub = ToV<NewSub<Value<8>, Value<2>>>
type Test2NewSub = ToV<NewSub<Value<6>, Value<4>>>

// Div
type ToDivV<T> = T extends [infer U extends number[], infer V extends number[]]
    ? [ToV<U>, ToV<V>] : never
type Div<T1 extends number[], T2 extends number[], COUNT extends number[] = []> =
    T1 extends [...T2, ...number[]]
      ? Div<NewSub<T1, T2>, T2, Add<COUNT, Value<1>>>
      : [COUNT, T1]
type RetDiv1 = ToDivV<Div<Value<10>, Value<2>>>
type RetDiv2 = ToDivV<Div<Value<20>, Value<3>>>
