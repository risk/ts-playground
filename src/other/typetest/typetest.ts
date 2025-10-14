class DataA {
  baseData: string = ''
}

class DataAC extends DataA {
  baseData2: string = ''
}

class A<T> {
  constructor(private data: T) {}
  get(): T {
    return this.data
  }
}

class AC<T> extends A<T> {
  constructor(private data2: T) {
    super(data2)
  }
  get2(): T {
    return this.data2
  }
}


const a: A<DataA> = new AC<DataAC>(new DataAC())
console.log(a.get())