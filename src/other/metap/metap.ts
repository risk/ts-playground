type Constructor<T = {}> = new (...args: any[]) => T

// interface ITest {
//   test(): void
// }

// function WithTest<TBase extends Constructor<ITest>>(Base: TBase) {
//   return class extends Base {
//     wrappedTest(): void {
//       console.log('wrappedTest start')
//       this.test()
//       console.log('wrappedTest end')
//     }
//   }
// }

// const WithLog = <TBase extends Constructor<ITest>>(Base: TBase) => 
//   class extends Base {
//     log(message: string) {
//       console.log(`[LOG] ${message}`)
//     }
//   }

// // ここがクラスか。
// class Sample implements ITest {
//   test(): void {
//     console.log('test')
//   }
// }

// const SampleFull = WithLog(WithTest(Sample))
// const s = new SampleFull()
// s.log('hello')
// s.wrappedTest()

function WithLogger<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(msg: string) {
      console.log(`[LOG]: ${msg}`)
    }
  }
}

function WithTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now()
  }
}

function WithTimestamp2<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
  }
}

function WithTimestamp3<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
  }
}

class Core {}

const Mixed = WithLogger(WithTimestamp(WithTimestamp2(WithTimestamp3(Core))))
const m = new Mixed()

m.log('hi') 