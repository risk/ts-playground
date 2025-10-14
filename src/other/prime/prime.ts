function* primeGenerator(): Generator<number> {
  const primes: number[] = []

  const nextPrime = (num: number) => {
    let next = num
    while (true) {
      if(primes.every(prime => next % prime !== 0)) {
        primes.push(next)
        return next
      }
      next += 1
    }
  }
  let prime = 2
  while (true) {
    yield nextPrime(prime)
  }
}

const prime = primeGenerator()
console.log(prime.next())
console.log(prime.next())
console.log(prime.next())
console.log(prime.next())
console.log(prime.next())
console.log(prime.next())