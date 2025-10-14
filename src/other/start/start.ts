

class Start {
  start(): void {
    console.log('はしるよ')
  }
}

class CStart extends Start {
  start(): void {
    console.log('けってはしるよ')
  }
}

class SStart extends Start {
  start(): void {
    console.log('たってはしるよ')
  }
}

function doStart(start: Start) {
  start.start()
}

doStart(new CStart())
doStart(new SStart())
