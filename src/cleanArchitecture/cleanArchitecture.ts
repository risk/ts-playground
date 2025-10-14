// --- Utilities
const createEnum = <T extends string>(...values: T[]) =>
  Object.freeze(values.reduce((acc, v) => ({ ...acc, [v]: v }), {} as Record<T, T>))

// Common
class LayerResultBase<T = unknown> {
  constructor(private success: boolean) {}
  isSucceed(): this is LayerResultSuccess<T> {
    return this.success
  }
  isFailed(): this is LayerResultFailure {
    return !this.success
  }
  getMessage() { return '' }
  getData(): T { throw new Error('Not implemented.') }
}
class LayerResultSuccess<T> extends LayerResultBase<T> {
  constructor(private data: T) {
    super(true)
  }
  getData() : T { return this.data }
}
class LayerResultFailure extends LayerResultBase{
  constructor(private message?: string) {
    super(false)
  }
  getMessage() { return this.message ?? '' }
}

const success = <T>(data: T): LayerResultSuccess<T> => new LayerResultSuccess(data)
const error = (message?: string): LayerResultFailure => new LayerResultFailure(message)

type LayerResult<T> = LayerResultSuccess<T> | LayerResultFailure
type Unwrap<T> = T extends LayerResultSuccess<infer U> ? U : never

// --- Entiries
const UserTypes = createEnum('human', 'dog', 'cat', 'unknown')
type UserType = keyof typeof UserTypes

class EntityUser {
  private type: UserType
  constructor(private name: string, type: UserType | string) {
    this.type = typeof type === 'string' ? EntityUser.convertToType(type) : type
  }

  getName = () => this.name
  getType = () => this.type

  static convertToType(typeString: string): UserType {
    const foundEntry = Object.entries(UserTypes).find(([_id, name]) => name === typeString)
    if (foundEntry) {
      const [_, name] = foundEntry
      return name
    }
    return UserTypes.unknown
  }
}

// --- Driver
// DataStore
const dataStoreUsers = [
  { id: 1, name: '太郎', type: 'human' },
  { id: 2, name: 'ポチ', type: 'dog' },
  { id: 3, name: '花子', type: 'human' },
  { id: 4, name: 'タマ', type: 'cat' },
  { id: 5, name: 'シロ', type: 'dog' }
]

class DriverOnMemoryUser implements GatewayToDriverUser {
  findById(input: GatewayInputFindUserById): LayerResult<GatewayOutputFindUserById> {
    const result = dataStoreUsers.find(user => user.id === input.id)
    if(result === undefined) {
      return error('user not found')
    }
    return success({
      id: result.id,
      name: result.name,
      type: result.type
    })
  }
}

// --- Gateway
interface GatewayToDriverUser {
  findById(input: GatewayInputFindUserById): LayerResult<GatewayOutputFindUserById>
}

type GatewayInputFindUserById = {
  id: number
}

type GatewayOutputFindUserById = {
  id: number
  name: string
  type: string
}

class GatewayUser implements UsecaseGatewayUserInterface{
  constructor(private driver: GatewayToDriverUser) {}

  findById(input: UsecaseToGatewayUserInputFindUserById): LayerResult<UsecaseToGatewayUserOutputFindUserById> {
    const result = this.driver.findById({
      id: input.id
    })
    if(result.isFailed()) {
      return error('user not found')
    }
    const user = result.getData()
    return success({
      id: user.id,
      name: user.name,
      type: user.type
    })
  }
}

// --- Usecase
interface UsecaseInputGetUser {
  condition: {
    id?: number
    type?: UserType
  }
}

interface UsecaseOutputGetUser {
  name: string
  type: UserType
}

interface UsecaseToGatewayUserInputFindUserById {
  id: number
}

interface UsecaseToGatewayUserOutputFindUserById {
  id: number
  name: string
  type: string
}

interface UsecaseGatewayUserInterface {
  findById(input: UsecaseToGatewayUserInputFindUserById): LayerResult<UsecaseToGatewayUserOutputFindUserById>
}

function usecaseGetUser(gatewayUser: UsecaseGatewayUserInterface) {
  return (input: UsecaseInputGetUser): LayerResult<UsecaseOutputGetUser> => {
    if(input.condition.id === undefined) {
      return error('Bad condition')
    }

    const result = gatewayUser.findById({ id: input.condition.id })
    if (result.isFailed()) {
      return error(result.getMessage())
    }

    const rawData = result.getData() 
    const user = new EntityUser(rawData.name, rawData.type)
    return success({
      name: user.getName(),
      type: user.getType()
    })
  }
}

// --- Controller
interface ControllerInputGetUser {
  id: number
}

function controllerGetUser(input: ControllerInputGetUser): LayerResult<UsecaseInputGetUser> {
  return success({
    condition: {
      id: input.id
    }
  })
}

// --- Presenter
interface PresenterOutputGetUser {
  name: string
  type: string
}

function presenterGetUser (input: UsecaseOutputGetUser): LayerResult<PresenterOutputGetUser> {

  const convertTable: Record<UserType, string> = {
    human: '人間',
    dog: '犬',
    cat: '猫',
    unknown: '不明'
  } as const satisfies Record<UserType, string>

  return success({
    name: input.name,
    type: convertTable[input.type] ?? '不明'
  })
}
function presenterJson (input: PresenterOutputGetUser): LayerResult<string> {
  return success(JSON.stringify(input))
}
function presenterName (input: PresenterOutputGetUser): LayerResult<string> {
  return success(input.name)
}

// --- UI
function uiEntryGetUser(id: number = 1): LayerResult<ControllerInputGetUser> {
  return success({
    id
  })
}

function uiExitGetUser(input: string): LayerResult<string> {
  console.log(input)
  return success(input)
}

// --- Executer
class Pipeline<O extends LayerResultBase, Init> {
  private constructor(private steps: ((input: any) => any)[]) {}

  static from<O extends LayerResultBase, Init>(entry: (input: Init) => O) {
    return new Pipeline<O, Init>([entry])
  }

  then<R extends LayerResultBase>(fn: (arg: Unwrap<O>) => R | void): Pipeline<R, Init> {
    return new Pipeline([...this.steps, fn])
  }

  tap(fn: (arg: Unwrap<O>) => void): Pipeline<O, Init> {
    return this.then((x: Unwrap<O>) => { fn(x); return success(x) as unknown as O })
  }

  private executeSteps(input?: Init): O {
    let result: LayerResultBase<Init> | undefined = input ? new LayerResultSuccess(input) : undefined
    for (const step of this.steps) {
      result = step(result?.getData())
      if (result?.isFailed()) {
        console.error(result.getMessage())
        break
      }
    }
    return result as O
  }

  injection() {
    return (input: Init): O => this.executeSteps(input)
  }
  run(input?: Init): O {
    return this.executeSteps(input)
  }
}

const result = Pipeline
  .from(uiEntryGetUser)
  .tap((x) => console.log('xxx', x))
  .then(controllerGetUser)
  .then(usecaseGetUser(new GatewayUser(new DriverOnMemoryUser())))
  .then(
    Pipeline
      .from(presenterGetUser)
      .then(presenterJson)
      .injection())
  .then(uiExitGetUser)
  .run(1)

if(result.isSucceed()) {
  console.log(result.getData())
}

