// @ts-check

const WIDTH = 1100
const HEIGHT = 600
const BIRB_COUNT = 150
const VIEW_RADIUS = WIDTH / 10
const VIEWING_ANGLE = (4 / 3) * Math.PI
const HIGHLIGHT_FIRST_BIRB = false

// https://stackoverflow.com/questions/4467539
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n
}

/** @type {Birb[]} */
const birbs = []

function setup() {
  for (let i = 0; i < BIRB_COUNT; i++) {
    birbs.push({
      position: new p5.Vector(random(WIDTH), random(HEIGHT)),
      velocity: new p5.Vector(random(-100, 100), random(-100, 100)).normalize(),
    })
  }
  createCanvas(WIDTH, HEIGHT)
  ellipseMode("center")
  // frameRate(10)
}

function draw() {
  clear()
  background(51)

  fill(`rgba(255, 255, 255, 0.1)`)
  ellipse(mouseX, mouseY, 200, 200)

  for (const birb of birbs) {
    noStroke()

    if (HIGHLIGHT_FIRST_BIRB && birb === birbs[0]) {
      fill("rgba(255, 255, 255, 0.1)")
      arc(
        birb.position.x,
        birb.position.y,
        VIEW_RADIUS * 2,
        VIEW_RADIUS * 2,
        birb.velocity.heading() - VIEWING_ANGLE / 2,
        birb.velocity.heading() + VIEWING_ANGLE / 2,
      )
      fill("tomato")
    } else {
      fill("white")
    }

    ellipse(birb.position.x, birb.position.y, 5, 5)
    moveBirb(birb)
  }
}

/** @type {(birb: Birb) => void} */
function moveBirb(birb) {
  birb.position.add(birb.velocity.copy().mult(deltaTime / 6))

  birb.velocity.add(flock(birb)).setMag(1.5)

  const loopedPosition = new p5.Vector(
    birb.position.x.mod(WIDTH),
    birb.position.y.mod(HEIGHT),
  )

  birb.position = loopedPosition
}

/** @type {(birb: Birb) => p5.Vector} */
function flock(birb) {
  const force = new p5.Vector(0, 0)

  let nearbyBirbCount = 0
  const center = new p5.Vector(0, 0)
  const averageVelocity = new p5.Vector(0, 0)

  for (const otherBirb of birbs) {
    if (birb === otherBirb) continue

    const between = otherBirb.position.copy().sub(birb.position)
    const distance = between.mag()

    if (
      distance < VIEW_RADIUS &&
      between.angleBetween(birb.velocity) < VIEWING_ANGLE / 2
    ) {
      nearbyBirbCount++
      force.add(
        between.mult(-1).setMag(Math.pow(VIEW_RADIUS - distance, 2) / 8),
      )

      center.add(otherBirb.position)
      averageVelocity.add(otherBirb.velocity)

      if (HIGHLIGHT_FIRST_BIRB && birb === birbs[0]) {
        stroke(`rgba(255, 255, 255, ${1 - distance / VIEW_RADIUS})`)
        line(
          birb.position.x,
          birb.position.y,
          otherBirb.position.x,
          otherBirb.position.y,
        )
      }
    }
  }

  if (nearbyBirbCount > 0) {
    center.div(nearbyBirbCount)
    averageVelocity.normalize()

    const positionDiff = center.sub(birb.position)

    force.add(positionDiff.mult(30))
    force.add(averageVelocity.mult(700))
  }

  const birbToMouse = birb.position.copy().sub(new p5.Vector(mouseX, mouseY))
  const distance = birbToMouse.mag()
  birbToMouse.setMag(20000000 / Math.pow(distance, 2))
  force.add(birbToMouse)
  force.div(10000)

  return force
}

/** @type {(start: p5.Vector, vector: p5.Vector) => void} */
function drawVector(start = new p5.Vector(0, 0), vector) {
  stroke(255)
  line(start.x, start.y, start.x + vector.x, start.y + vector.y)
}
