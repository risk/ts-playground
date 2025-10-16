/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */

interface RecursiveMonadStrategy<N> {
  look(prev: N | null, cur: N): N | null
  isDone(prev: N | null, cur: N) : boolean
}

class RecursiveMonad<N> {
  constructor(
    private strategy: RecursiveMonadStrategy<N>,
    private node: N,
    private parent: RecursiveMonad<N> | null) {}
  
  getNode(): N {
    return this.node
  }

  next(): RecursiveMonad<N> | null {
    const nextNode = this.strategy.look(
      this.parent?.getNode() ?? null, this.node)
    return nextNode ? new RecursiveMonad<N>(this.strategy, nextNode, this) : this.parent
  }
}

// 以下テスト
const testMapData: number[][] = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0]
]

const directions = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
] as const

class SearchNode {
  row: number
  column: number

  generator: Generator<SearchNode> | null = null
  done: boolean = false
  
  constructor(row: number = 0, column: number = 0) {
    this.row = row
    this.column = column
  }
  add(row: number, column: number) {
    return new SearchNode(this.row + row, this.column + column)
  }
}

class MatrixExplorerStrategy<C = {} | null> implements RecursiveMonadStrategy<SearchNode> {

  constructor(
    private map: number[][],
    private checkMovable: (map: number[][], node: SearchNode, context: C) => boolean,
    private stand: (map: number[][], node: SearchNode, context: C) => void = () => {},
    private context: C = {} as C
  ) {}

  private inRange(node: SearchNode) {
    return node.row >= 0 && node.row < this.map.length &&
      node.column >= 0 && node.column < this.map[node.row].length
  }

  private isMovable(node: SearchNode) {
    return this.checkMovable(this.map, node, this.context)
  }

  private *makeLookGenerator(prev: SearchNode | null, cur: SearchNode): Generator<SearchNode> {
    this.stand(this.map, cur, this.context)
    for(const direction of directions) {
      const newNode = cur.add(direction[0], direction[1])
      if(prev !== null &&
        prev.row === newNode.row &&
        prev.column === newNode.column) {
        continue
      }
      if (this.inRange(newNode) && this.isMovable(newNode)) {
        yield newNode
      }
    }
  }

  look(prev: SearchNode | null, cur: SearchNode): SearchNode | null {
    let generator = cur.generator
    if(generator === null) {
      cur.generator = this.makeLookGenerator(prev, cur)
      generator = cur.generator
    }
    const result = generator.next()
    if(result.done) {
      cur.done = true
      return null
    }
    return result.value
  }

  isDone(_prev: SearchNode | null, cur: SearchNode): boolean {
    return cur.done
  }
}

class SearchContext {
  count: number = 0
  history: string[] = []
}

const context = new SearchContext()

const strategy = new MatrixExplorerStrategy(
  testMapData,
  (map, node) => map[node.row][node.column] === 0,
  (_map, _node, context) => {
    context.history.push(`${_node.row},${_node.column}`)
    context.count++
  },
  context)

let cur: RecursiveMonad<SearchNode> | null = new RecursiveMonad<SearchNode>(
  strategy, new SearchNode(), null)
while(cur !== null) {

  cur = cur.next()
  if(cur === null) {
    break
  }

  const n = cur.getNode()
  console.log('now', n.row, n.column)
  if(n.row === 4 && n.column === 4) {
    console.log('Goal', context.count)
    console.log('history', context.history.join(' -> '))
    break
  }
}