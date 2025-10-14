
function* birthdayGenerator(): Generator<boolean> {
  const birthdayHistory: number[] = []
  while(true) {
    const newDay = Math.floor(Math.random() * 365)
    console.log(newDay)
    yield birthdayHistory.includes(newDay)
    birthdayHistory.push(newDay)
  }
}

const firstHitTiming = [...Array(100)].map(() => {
  const birthday = birthdayGenerator()
  let count = 0
  while(true) {
    count++
    const result = birthday.next()
    if (result.value) break
    console.log(count, result.value)
  }
  return count
})

console.log(firstHitTiming)
console.log(firstHitTiming.reduce((acc, curr) => acc + curr) / firstHitTiming.length)