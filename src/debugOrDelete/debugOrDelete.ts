/**
 * Copyright (c) 2025 risk
 * Licensed under the MIT License.
 * https://github.com/risk/ts-playground
 */
interface executer {
  execute(reverse?: boolean): executer | null
}

class Node<P, T> implements executer {

  next: Node<T, unknown> | null = null

  constructor(private prev: Node<unknown, P> | null, private x: T) {}

  execute(reverse: boolean = false): executer | null {
    // ここで Prevの x は正しい型で取れる
    console.log(`${this.prev ? this.prev.x : 'empty'}(${this.prev && typeof this.prev.x})`, this.x)
    return reverse ? this.prev : this.next
  }

  getPrev() {
    return this.prev
  }

  getNext() {
    return this.next
  }

  addNext<NEXT_T>(nextX: NEXT_T) {
    const next = new Node<T, NEXT_T>(this, nextX) // <-　ここで次の構造に自分の型を渡してる
    this.next = next
    return next
  }
}

const root = new Node(null, 1)
const last = root.addNext('a').addNext(2).addNext(true)

console.log('normal')
let cur: executer | null = root
while(cur !== null) {
  cur = cur.execute()
}

console.log('reverse')
let revCur: executer | null = last
while(revCur !== null) {
  revCur = revCur.execute(true)
}