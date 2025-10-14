

const countOfRow = 5
const countOfColumn = 5

const mapData = [
  [0, 1, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0]
]

class RecursiveMonadoSample {

  constructor(
    private countOfRow: number, private countOfColumn: number,
    private curRow: number, private curColumn: number,
    private parent: RecursiveMonadoSample | null = null) {}

  outOfRange(row: number, column: number) {
    return row < 0 || row >= this.countOfRow ||
    column < 0 ||column >= this.countOfColumn
  }

  print() {
    console.log('now', this.curRow +1, this.curColumn +1)
  }

  getCountFromMap() {
    return mapData[this.curRow][this.curColumn]
  }

  private generator: Generator<RecursiveMonadoSample> | null = null

  move() {
    if(!this.generator) {
      this.generator = this.moveGenerator()
    }
    const result = this.generator.next()
    return result.done ? this.parent : result.value
  }

  isInvalid() {
    return this.getCountFromMap() === 1
  }

  isFinished() {
    return this.curRow === this.countOfRow - 1 && this.curColumn === this.countOfColumn - 1
  }

  *moveGenerator() {
    if(this.isInvalid()) {
      return this.parent
    }

    const originalRow = this.curRow
    const originalColumn = this.curColumn

    // to next
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ]
    for(const direction of directions) {
      const newRow = originalRow + direction[0]
      const newColumn = originalColumn + direction[1]
      if (this.outOfRange(newRow, newColumn) ||
        (this.parent?.curRow === newRow &&
         this.parent?.curColumn === newColumn)) {
        continue
      }
      yield new RecursiveMonadoSample(this.countOfRow, this.countOfColumn,
        newRow, newColumn, this)
    }
  }
}

let current : RecursiveMonadoSample | null = new RecursiveMonadoSample(countOfRow, countOfColumn, 0, 0)
do {
  current = current.move()
  if(current === null) {
    break
  }
  if(!current.isInvalid())
    current.print()
} while(!current.isFinished())
