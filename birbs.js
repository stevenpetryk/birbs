// @ts-check

const WIDTH = 960
const HEIGHT = 540
const BIRB_COUNT = 100
const VIEW_RADIUS = WIDTH / 16
const VIEWING_ANGLE = (4 / 3) * Math.PI
const HIGHLIGHT_FIRST_BIRB = false
const SPEED_LIMIT = WIDTH / 9

const SEPARATION = 20
const ALIGNMENT = 60
const COHESION = 20

/** @type {Birb[]} */
let birbs = []

function setup() {
  createCanvas(WIDTH, HEIGHT)

  for (let i = 0; i < BIRB_COUNT; i++) {
    birbs.push({
      position: new p5.Vector(random(WIDTH), random(HEIGHT), 0),
      velocity: p5.Vector.random2D().setMag(SPEED_LIMIT),
      acceleration: new p5.Vector(0, 0),
    })
  }
}

function draw() {
  clear()
  background(40)

  for (const birb of birbs) {
    drawBirb(birb)

    let birbsInFieldOfView = 0
    const cohesion = new p5.Vector(0, 0)
    const separation = new p5.Vector(0, 0)
    const alignment = new p5.Vector(0, 0)
    const mouseForce = new p5.Vector(0, 0)

    for (const otherBirb of birbs) {
      if (otherBirb === birb) {
        continue
      }

      const birbToBirb = p5.Vector.sub(otherBirb.position, birb.position)

      const otherBirbInFieldOfView =
        birbToBirb.mag() < VIEW_RADIUS &&
        birbToBirb.angleBetween(birb.velocity) < VIEWING_ANGLE

      if (otherBirbInFieldOfView) {
        birbsInFieldOfView++

        separation.add(birbToBirb.copy().setMag(birbToBirb.mag() - VIEW_RADIUS))
        alignment.add(otherBirb.velocity.copy().normalize())
        cohesion.add(p5.Vector.sub(otherBirb.position, birb.position))
      }
    }

    cohesion.div(birbsInFieldOfView)

    if (mouseIsPressed) {
      fill(`rgba(255, 255, 255, 0.003)`)
      noStroke()
      ellipse(mouseX, mouseY, 200)

      mouseForce.add(
        p5.Vector.sub(birb.position, new p5.Vector(mouseX, mouseY)),
      )
      mouseForce.setMag(Math.pow(3000 / mouseForce.mag(), 2))
    }

    birb.acceleration
      .add(separation.mult(SEPARATION))
      .add(alignment.mult(ALIGNMENT))
      .add(cohesion.mult(COHESION))
      .add(mouseForce.mult(1))

    birb.velocity.add(birb.acceleration.mult(deltaTime / 1000.0))
    birb.velocity.limit((30 / 100) * WIDTH)

    birb.position.add(birb.velocity.copy().mult(deltaTime / 1000.0))
    birb.position.x = positiveModulo(birb.position.x, WIDTH)
    birb.position.y = positiveModulo(birb.position.y, HEIGHT)
    birb.acceleration.limit(0)
  }
}

/** @type {(birb: Birb) => void} */
function drawBirb(birb) {
  const directionOfTravel = birb.velocity.copy().setMag((1 / 100) * WIDTH)
  const front = birb.position.copy().add(directionOfTravel)
  const left = birb.position
    .copy()
    .add(directionOfTravel.copy().rotate((5 * Math.PI) / 6))
  const right = birb.position
    .copy()
    .add(directionOfTravel.copy().rotate(-(5 * Math.PI) / 6))

  fill(800)

  if (HIGHLIGHT_FIRST_BIRB && birb === birbs[0]) {
    fill(`rgba(255, 255, 255, 0.1)`)
    arc(
      birb.position.x,
      birb.position.y,
      VIEW_RADIUS * 2,
      VIEW_RADIUS * 2,
      birb.velocity.heading() - VIEWING_ANGLE / 2,
      birb.velocity.heading() + VIEWING_ANGLE / 2,
    )
    fill("red")
  }

  noStroke()
  triangle(front.x, front.y, left.x, left.y, right.x, right.y)
}

/** @type {(n: number, d: number) => number} */
function positiveModulo(n, d) {
  return ((n % d) + d) % d
}
