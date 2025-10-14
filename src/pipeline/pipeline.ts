export namespace pipeline {

  type Result<T> = T | Error

  function makeStep<A, R>(step: (input: A) => Result<R>) {
    return (input: A): Result<R> => { 
      const ret = step(input)
      return ret ?? new Error(`step failed ${step.name}`)
    }
  }

  export class Pipeline<I, Init> {
    private constructor(private steps: ((input: any) => any)[]) {}

    static from<Init, R>(entry: (input: Init) => Result<R>) {
      return new Pipeline<R, Init>([makeStep(entry)])
    }

    then<R>(fn: (input: I) => Result<R>): Pipeline<R, Init> {
      return new Pipeline([...this.steps, makeStep(fn)])
    }

    inject<R>(pipeline: Pipeline<R, I>) {
      return this.then(makeStep((input: I): Result<R> => pipeline.run(input)))
    }

    tap(fn: (arg: I) => void): Pipeline<I, Init> {
      return this.then((x: I) => { fn(x); return x as I })
    }

    run(input: Init): Result<I> {
      let result: any = input
      for (const step of this.steps) {
        result = step(result)
        if (result instanceof Error) {
          return result
        }
      }
      return result
    }
  }
}

const ret = pipeline.Pipeline
  .from((x: string) => x + 'start')
  .then((x) => x + ' 1st')
  .then((x) => x + ' 2nd')
  // .then((x) => { console.log("error"); return new Error('cut') })
  .then((x) => ({str: x + ' 3rd', num: 1}))
  .then((x) => ({str: x.str + ' 4th', num: x.num + 2}))
  .inject(
    pipeline.Pipeline
      .from((x: {str: string, num: number}) => ({str: x.str + ' 4th(Inject1)', num: x.num + 2}))
      .then((x) => ({str: x.str + ' 4th(Inject2)', num: x.num + 2}))
      .then((x) => ({str: x.str + ' 4th(Inject3)', num: x.num + 2}))
  )
  .tap((x) => console.log('tap', x))
  .then((x) => ({str: x.str + ' 5th', num: x.num + 2}))
  .run('')

console.log('execute result', ret)