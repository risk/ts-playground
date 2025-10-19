/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */
namespace keyedPromiseAll {

  type AsyncFunc = (...x: any[]) => Promise<any>

  type ResultType<T> = {
    ok: true,
    value: T
  } | {
    ok: false,
    error: unknown
  }

  class KeyedFunc<
      F extends AsyncFunc,
      FArgs extends Parameters<F> = Parameters<F>,
      FRet extends Awaited<ReturnType<F>> = Awaited<ReturnType<F>>
      > {

    args: FArgs
    private r?: ResultType<FRet>
    constructor(private f: F, ...args: FArgs) {
      this.args = args
    }
    async exec() {
      try {
        this.r = {
          ok: true,
          value: await this.f(...this.args)
        }
      }
      catch(e) {
        this.r = {
          ok: false,
          error: e
        }
      }
    }
    getResult(): ResultType<FRet> | null {
      return this.r ?? null
    }
  }

  type KeyedFuncs<T extends Record<string, AsyncFunc>> = {
    [K in keyof T]: KeyedFunc<T[K]>
  }

  type KeyedReturn<T extends Record<string, AsyncFunc>> = {
    [K in keyof T]: ResultType<Awaited<ReturnType<T[K]>>> | null
  }

  export async function keyedPromiseAll<T extends Record<string, AsyncFunc>>
      (funcs: KeyedFuncs<T>): Promise<KeyedReturn<T>> {

    type Funcs = typeof funcs
    const keys = Object.keys(funcs) as (keyof Funcs)[]

    await Promise.all(keys.map(async key => funcs[key].exec()))

    const results = {} as KeyedReturn<T>
    for(const key of keys) {
      results[key] = funcs[key].getResult()
    }

    return results
  }

  export function keyed<
      T extends Record<never, KeyedFunc<AsyncFunc>>>(funcs:T = {} as T) {
    return new class {
      funcs: T = funcs
      with<K extends string, F extends AsyncFunc>(
        key: K,
        f: F,
        ...args: Parameters<F>
      ) {
        const newFuncs = {
          ...funcs,
          [key]: new KeyedFunc(f, ...args)
        } as T & Record<K, KeyedFunc<F>>
        return keyed(newFuncs)
      }
      build(): T {
        return this.funcs
      }
    }
  }

  export function handleResult<T, R = void>(
    ret: ResultType<T> | null,
    onOk: (value: T) => R,
    onNg: (error: unknown) => R)
    : R | null {
    return ret ?
      ret.ok ? onOk(ret.value) : onNg(ret.error)
      : null
  }
}

async function main() {
  function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  const loopCount = 10
  const waitCount = 100
  const asyncBaseFunc = async <T>(key: string, input: number, ret: T, message: string)
      : Promise<{ret: T, message: string}> => {
    for(let i of [...Array(loopCount)].map((_, i) => i)) {
      console.log(key, i)
      await wait(waitCount * input)
    }
    console.log(key, {message})
    return {ret, message}
  }
  const asyncBaseFuncExt = async <T>(key: string, input: number, ret: T, message: string)
      : Promise<{ ret: {ret: T, message: string}, extends: string}> => {
    return {
      ret: await asyncBaseFunc(key, input, ret, message),
      extends: 'Extended parameter'
    }
  }
  const asyncA = async (input: number) => asyncBaseFunc('A     ', 1.2, 'string', `${input}`)
  const asyncB = async (input1: string, input2: string) => asyncBaseFuncExt('  B   ', 1.1, 100, `${input1}/${input2}`)
  const asyncC = async (inputA: boolean, ...inputB: string[]) => asyncBaseFunc('    C ', 1.0, new Error('error'), `${inputA}, ${inputB}`)
  const asyncErr = async () => Promise.reject('reject!')

  const asyncFunctions = keyedPromiseAll.keyed()
    .with('A', asyncA, 1)
    .with('B', asyncB, 'test1', 'test2')
    .with('C', asyncC, true, 'test3', 'test4', 'test5', 'test6')
    .with('ERR', asyncErr)
    .build()
    

  const result = await keyedPromiseAll.keyedPromiseAll(asyncFunctions)
  
  keyedPromiseAll.handleResult(result.A,
    (value) => console.log('result:A OK', value.message),
    (error) => console.error('result:A ERR', error)
  )
  keyedPromiseAll.handleResult(result.B,
    (value) => console.log('result:B OK', value.ret.message),
    (error) => console.error('result:B ERR', error)
  )
  keyedPromiseAll.handleResult(result.C,
    (value) => console.log('result:C OK', value.message),
    (error) => console.error('result:C ERR', error)
  )
  keyedPromiseAll.handleResult(result.ERR,
    () => console.log('result:ERR OK'),
    (error) => console.error('result:ERR ERR', error)
  )
}
main()