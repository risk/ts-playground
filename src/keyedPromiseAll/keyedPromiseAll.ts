namespace keyedPromiseAll {

  type PromisesMap<TA extends Record<keyof TA, Promise<any>>> = {
    [Key in keyof TA]: TA[Key]
  }

  type FuncsMap<TA extends Record<keyof TA, (...args: any) => Promise<any>>> = {
    [Key in keyof TA]: TA[Key]
  }

  type ArgsMap<TA extends Record<keyof TA, (...args: any) => Promise<any>>> = {
    [Key in keyof TA]: [...Parameters<TA[Key]>]
  }

  type PromiseReturnType<T> = {
    ok: true,
    value: T
  } | {
    ok: false,
    error: unknown
  }

  type ReturnsMap<TA extends Record<keyof TA, Promise<any>>> = {
    [Key in keyof TA]: PromiseReturnType<Awaited<TA[Key]>>
  }

  type FuncReturnsMap<TA extends Record<keyof TA, (...args: any) => Promise<any>>> = {
    [Key in keyof TA]: PromiseReturnType<Awaited<ReturnType<TA[Key]>>>
  }

  export async function promiseAll
      <T extends Record<string, Promise<any>>>(
      promises: PromisesMap<T>): Promise<ReturnsMap<T>> {

    type TKey = keyof typeof promises
    type TValue = T[TKey]
    type TNode = [TKey, TValue]
    const entries = Object.entries(promises) as TNode[]

    const ret = {} as ReturnsMap<T>
    await Promise.all(
      entries.map(async ([key, p]) => {
        try {
          ret[key] = {
            ok: true,
            value: await p
          }
        } catch(e) {
          ret[key] = {
            ok: false,
            error: e
          }
        }
      })
    )

    return ret
  }

  export async function promiseAllWithArgs<T extends Record<string, (...args: any[]) => Promise<any>>>(
      funcs: FuncsMap<T>, args: ArgsMap<T>): Promise<FuncReturnsMap<T>> {

    type TKey = keyof typeof funcs
    type TFunc = T[TKey]
    type TNode = [TKey, TFunc]

    const entries = Object.entries(funcs) as TNode[]

    const promises = entries.map(([key, fn]) => {
      return [key, fn(...args[key])] as const
    })

    const ret = {} as FuncReturnsMap<T>
    await Promise.all(
      promises.map(async ([key, p]) => {
        try {
          ret[key] = {
            ok: true,
            value: await p
          }
        } catch(e) {
          ret[key] = {
            ok: false,
            error: e
          }
        }
      })
    )

    return ret
  }

  export function handleResult<T, R = void>(
    ret: PromiseReturnType<T>,
    onOk: (value: T) => R,
    onNg: (error: unknown) => R): R {
    return ret.ok ? onOk(ret.value) : onNg(ret.error)
  }
}

async function main() {

  function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  const loopCount = 10
  const waitCount = 100
  const asyncBaseFunc = async <T>(key: string, input: number, ret: T, message: string): Promise<{ret: T, message: string}> => {
    for(let i of [...Array(loopCount)].map((_, i) => i)) {
      console.log(key, i)
      await wait(waitCount * input)
    }
    console.log(key, {message})
    return {ret, message}
  }
  const asyncA = async (input: number) => asyncBaseFunc('A     ', 1.2, 'string', `${input}`)
  const asyncB = async (input1: string, input2: string) => asyncBaseFunc('  B   ', 1.1, 100, `${input1}/${input2}`)
  const asyncC = async (inputA: boolean, ...inputB: string[]) => asyncBaseFunc('    C ', 1.0, new Error('error'), `${inputA}, ${inputB}`)
  const asyncErr = async () => Promise.reject('reject!')
  
  const asyncPromises = {
    asyncA: asyncA(1),
    asyncB : asyncB('test1', 'test2'),
    asyncC: asyncC(true, 'test3', 'test4', 'test5', 'test6'),
    asyncErr: asyncErr()
  } as const

  const asyncFunctions = {
    asyncA,
    asyncB,
    asyncC,
    asyncErr
  } as const

  const retPromise = keyedPromiseAll.promiseAll(asyncPromises)
  const retFuncs = keyedPromiseAll.promiseAllWithArgs(asyncFunctions, {
    asyncA: [2],
    asyncB: ['test7', 'test8'] as const,
    asyncC: [false, 'test9', 'test10', 'test11', 'test12'],
    asyncErr: []
  })

  const groupRet = await keyedPromiseAll.promiseAll({
    promiseOnly: retPromise,
    withArgs: retFuncs
  })

  if(groupRet.promiseOnly.ok) {
    const ret = groupRet.promiseOnly.value

    keyedPromiseAll.handleResult(ret.asyncA,
      (value) => {
        console.log(value.ret)
      },
      (error) => {
        console.log(error)
      }
    )
    
    keyedPromiseAll.handleResult(ret.asyncErr,
      (value) => {
        console.log(value)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  console.log('result ---')
  console.dir(groupRet, {depth: null})
}
main()
