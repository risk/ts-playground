/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

export type CaFabricResult<OUT> =
  | {
      ok: true
      value: OUT
    }
  | {
      ok: false
      error: Error
    }

export function isThenable<T = unknown>(x: unknown): x is Promise<T> | { then: (...args: unknown[]) => unknown } {
  return (
    !!x &&
    (typeof x === 'object' || typeof x === 'function') &&
    'then' in x &&
    typeof (x as { then: unknown }).then === 'function'
  )
}

export function caFabricSucess<RET>(value: RET): CaFabricResult<RET> {
  return {
    ok: true,
    value,
  }
}

export function caFabricError(error: Error): CaFabricResult<never> {
  return {
    ok: false,
    error,
  }
}

export type CaUsecaseFabricHandler<IN, REPOS extends {}, OUT> = (input: IN, repos: REPOS) => OUT | Promise<OUT>
export type CaFabricHandler<IN, OUT> = (input: IN) => OUT | Promise<OUT>

function caFabricThenableError(name: string) {
  return caFabricError(new Error(`${name}: Cannot use thenable function. Please use runAsync()`))
}

export class CaFabricator<USECASE_IN, USECASE_OUT, REPOS extends {}, GATEWAY_IN = unknown, PRESENTER_OUT = unknown> {
  private constructor(
    private usecase: CaUsecaseFabricHandler<USECASE_IN, REPOS, USECASE_OUT>,
    private usecaseWithRepos: CaFabricHandler<USECASE_IN, USECASE_OUT> | null,
    private controller: CaFabricHandler<GATEWAY_IN, USECASE_IN> | null,
    private presenter: CaFabricHandler<USECASE_OUT, PRESENTER_OUT> | null
  ) {}

  /**
   * Weave usecase to fabric (first step)
   * @param handler Usecase handler :
   *  un-used repositories : (input: Usecase input) => Usecase output
   *  use repositories : (input: Usecase input, repos: Repository object interface) => Usecase input
   * @returns Usecase weaved fabricator
   */
  static weaveUsecase<sI, sREPOS extends {}, sO>(handler: CaUsecaseFabricHandler<sI, sREPOS, sO>) {
    return new CaFabricator(handler, null, null, null)
  }

  /**
   * Weave repositories to fabric
   * @param repos Repository object, repository type from usecase handler defined (2nd argument type)
   * @returns Controller weaved fabricator
   */
  weaveRepositories(repos: REPOS) {
    this.usecaseWithRepos = (input: USECASE_IN) => {
      return this.usecase(input, repos)
    }
    return this
  }

  /**
   * Weave controller to fabric
   * @param handler Controller handler : (input: Controller input) => Usecase input
   * @returns Controller weaved fabricator
   */
  weaveController<IN>(handler: CaFabricHandler<IN, USECASE_IN>) {
    return new CaFabricator(this.usecase, this.usecaseWithRepos, handler, this.presenter)
  }

  /**
   * Weave presenter to fabric
   * @param handler PresenterHandler : (input: Usecase output) => Prenseter output
   * @returns Presenter weaved fabricator
   */
  weavePresenter<OUT>(handler: CaFabricHandler<USECASE_OUT, OUT>) {
    return new CaFabricator(this.usecase, this.usecaseWithRepos, this.controller, handler)
  }

  /**
   * Run weaved fabric. contoller -> usecase -> presenter
   * @param input Gateway input
   * @returns Presenter output on CaFabricResult type
   */
  run(input: GATEWAY_IN): CaFabricResult<PRESENTER_OUT> {
    // Validation handler
    if (this.controller === null) {
      return caFabricError(new Error('Gateway not found'))
    }
    if (this.presenter === null) {
      return caFabricError(new Error('Presenter not found'))
    }

    // Call controller
    const controllerResult = this.controller(input)
    if (isThenable(controllerResult)) {
      return caFabricThenableError('usecase handler')
    }
    if (controllerResult instanceof Error) {
      return caFabricError(controllerResult)
    }

    // Call usecase
    const usecaseResult =
      this.usecaseWithRepos !== null
        ? this.usecaseWithRepos(controllerResult)
        : this.usecase(controllerResult, {} as REPOS)
    if (isThenable(usecaseResult)) {
      return caFabricThenableError('usecase handler')
    }
    if (usecaseResult instanceof Error) {
      return caFabricError(usecaseResult)
    }

    // Call presenter
    const presenterResult = this.presenter(usecaseResult)
    if (isThenable(presenterResult)) {
      return caFabricThenableError('usecase handler')
    }
    if (presenterResult instanceof Error) {
      return caFabricError(presenterResult)
    }

    // Return presenter result
    return caFabricSucess(presenterResult)
  }

  /**
   * Run weaved fabric on async. contoller -> usecase -> presenter
   * @param input Gateway input
   * @returns Presenter output on CaFabricResult type in Promise
   */
  async runAsync(input: GATEWAY_IN): Promise<CaFabricResult<PRESENTER_OUT>> {
    // Validation handler
    if (this.controller === null) {
      return caFabricError(new Error('Gateway not found'))
    }
    if (this.presenter === null) {
      return caFabricError(new Error('Presenter not found'))
    }

    // Call controller
    const controllerResult = await this.controller(input)
    if (controllerResult instanceof Error) {
      return caFabricError(controllerResult)
    }

    // Call usecase
    const usecaseResult =
      this.usecaseWithRepos !== null
        ? await this.usecaseWithRepos(controllerResult)
        : await this.usecase(controllerResult, {} as REPOS)
    if (usecaseResult instanceof Error) {
      return caFabricError(usecaseResult)
    }

    // Call presenter
    const presenterResult = await this.presenter(usecaseResult)
    if (presenterResult instanceof Error) {
      return caFabricError(presenterResult)
    }

    // Return presenter result
    return await caFabricSucess(presenterResult)
  }
}

// fabric
const fabric = CaFabricator.weaveUsecase((input: number) => input.toString())
  .weaveController((input: { data: number }) => input.data)
  .weavePresenter((input: string) => `result: ${input}`)
console.log(fabric.run({ data: 1 }))

interface Repos {
  user: (input: { id: number }) => {
    name: string
    age: number
  }
}

// fabric with repositories
const fabricWithRepos = CaFabricator.weaveUsecase((input: number, repos: Repos) => {
  const userData = repos.user({ id: input })
  return userData.name
})
  .weaveRepositories({
    user: (_input: { id: number }) => ({ name: 'dummy name', age: 35 }),
  })
  .weaveController((input: { data: number }) => input.data)
  .weavePresenter((input: string) => `result: ${input}`)

console.log(fabricWithRepos.run({ data: 1 }))

async function mainAsync() {
  // async fabric
  const fabricAsync = CaFabricator.weaveUsecase(async (input: number) => input.toString())
    .weaveController(async (input: { data: number }) => input.data)
    .weavePresenter(async (input: string) => `result(async): ${input}`)

  console.log(await fabricAsync.runAsync({ data: 1 }))

  // async fabric with repositories
  interface ReposAsync {
    user: (input: { id: number }) => Promise<{
      name: string
      age: number
    }>
  }

  const fabricWithReposAsync = CaFabricator.weaveUsecase(async (input: number, repos: ReposAsync) => {
    const userData = await repos.user({ id: input })
    return userData.name
  })
    .weaveRepositories({
      user: async (_input: { id: number }) => ({ name: 'dummy name(async)', age: 35 }),
    })
    .weaveController(async (input: { data: number }) => input.data)
    .weavePresenter(async (input: string) => `result(async): ${input}`)

  console.log(await fabricWithReposAsync.runAsync({ data: 1 }))
}
mainAsync()
