export namespace pipeline {

  type Input<T> = Exclude<T, null | undefined>
  export type Result<T> = Input<T> | Error

  interface PipeInterface {
    unitStream() : void
    getNext(): PipeInterface | null
  }

  function errorPassthrough(error: Error) { return error }

  export class Pipe<I, O, Init> implements PipeInterface {
  
    private result: Result<O> = new Error('not executed')
  
    private start: Pipe<Init, unknown, Init> | null = null
    private entryInput: Result<I> = new Error('not executed (entry)')
    private next: Pipe<O, unknown, Init> | null = null
  
    constructor(
        private parent: Pipe<any, I, Init> | null,
        private step: (input: Input<I>) => Result<O>,
        private recover: (error: Error) => Result<I>) {
      if(this.parent) {
        this.parent.next = this
        this.start = this.parent.start
      }
    }

    static from<sI, sR>(
        fn: (input: Input<sI>) => Result<sR>,
        recover: (error: Error) => Result<sI> = errorPassthrough
      ): Pipe<sI, sR, sI> {
      const pipe = new Pipe<sI, sR, sI>(null, fn, recover)
      pipe.start = pipe
      return pipe
    }

    joint<R>(
        fn: (input: Input<O>) => Result<R>,
        recover: (error: Error) => Result<O> = errorPassthrough
      ): Pipe<O, R, Init> {
      return new Pipe<O, R, Init>(this, fn, recover)
    }
  
    branch<R>(pipe: Pipe<O, R, O>) {
      return this.joint((input: Input<O>): Result<R> => {
        pipe.stream(input)
        return pipe.getResult()
      }, errorPassthrough)
    }

    window(fn: (arg: Input<O>) => void): Pipe<O, O, Init> {
      return this.joint(
          (x: Input<O>) => { fn(x); return x as Result<O> },
          (error: Error) => { console.error(error); return error })
    }

    getResult(): Result<O> {
      if (this.result instanceof Error) return this.result
      return structuredClone(this.result)
    }

    unitStream() {
      let input = this.parent ? this.parent.getResult() : this.entryInput
      if(input instanceof Error) {
        input = this.recover(input)
        if(input instanceof Error) {
          this.result = input
          return
        }
      }
      this.result = this.step(input)
    }

    getNext(): PipeInterface | null {
      return this.next
    }

    doStream(input: Result<I>) {
      this.entryInput = input
      let current: PipeInterface | null = this
      while(current !== null) {
        current.unitStream()
        current = current.getNext()
      }
    }

    stream(input: Result<Init>): Result<O> {
      if(this.start) {
        this.start.doStream(input)
        return this.result
      }
      return new Error('Not executed by run')
    }
  }
}

const ret = pipeline.Pipe
  .from((x: string) => x + 'start')
  .joint((x) => x + ' 1st')
  .joint((x) => x + ' 2nd')
  .joint((x): pipeline.Result<string> => { console.log("error"); return new Error('cut')})
  .joint((x) => ({str: x + ' 3rd', num: 1}), (error) => 'recover error')
  .joint((x) => ({str: x.str + ' 4th', num: x.num + 2}))
  .branch(
    pipeline.Pipe
      .from((x: {str: string, num: number}) => ({str: x.str + ' 4th(Inject1)', num: x.num + 2}))
      .joint((x) => ({str: x.str + ' 4th(Inject2)', num: x.num + 2}))
      .joint((x) => ({str: x.str + ' 4th(Inject3)', num: x.num + 2, b: true }))
  )
  .window((x) => console.log('tap', x))
  .joint((x) => ({str: x.str + ' 5th', num: x.num + 2}))
  .stream('')

console.log('execute result', ret)