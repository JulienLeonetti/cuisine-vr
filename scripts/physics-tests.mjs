import RAPIER from "@dimforge/rapier3d-compat";

await RAPIER.init();

const STEP = 1 / 120;
const EGG_RADIUS = .052;
const COUNTER_TOP = 1;
const MIN_EGG_CENTER = COUNTER_TOP + EGG_RADIUS - .004;

function createWorld() {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = STEP;
  world.integrationParameters.numSolverIterations = 7;
  world.integrationParameters.numInternalPgsIterations = 2;
  world.integrationParameters.maxCcdSubsteps = 4;
  const counterBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, .92, -1.25));
  world.createCollider(RAPIER.ColliderDesc.cuboid(2.4, .08, .41).setFriction(.82).setRestitution(.02), counterBody);
  const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -.09, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(15, .09, 15).setFriction(.82), floorBody);
  return world;
}

function createEgg(world, { x = 0, y, z = -1.25, velocity = { x: 0, y: 0, z: 0 } }) {
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setLinvel(velocity.x, velocity.y, velocity.z)
      .setLinearDamping(.35)
      .setAngularDamping(.9)
      .setCcdEnabled(true)
      .setSoftCcdPrediction(.22)
      .setAdditionalSolverIterations(4)
      .setCanSleep(true)
  );
  world.createCollider(RAPIER.ColliderDesc.ball(EGG_RADIUS).setDensity(.45).setFriction(.54).setRestitution(.025), body);
  return body;
}

function simulate(world, body, seconds, checkCounter = true) {
  const iterations = Math.ceil(seconds / STEP);
  for (let index = 0; index < iterations; index++) {
    world.step();
    const position = body.translation();
    const aboveCounter = Math.abs(position.x) <= 2.4 + EGG_RADIUS && Math.abs(position.z + 1.25) <= .41 + EGG_RADIUS;
    if (checkCounter && aboveCounter && position.y < MIN_EGG_CENTER) {
      throw new Error(`Pénétration du comptoir détectée à y=${position.y.toFixed(4)} m`);
    }
  }
}

function expectRestingOnCounter(body, label) {
  const y = body.translation().y;
  if (Math.abs(y - (COUNTER_TOP + EGG_RADIUS)) > .012) throw new Error(`${label}: repos incorrect à y=${y.toFixed(4)} m`);
}

const tests = [
  ["chute de 50 cm", () => {
    const world = createWorld(); const egg = createEgg(world, { y: 1.5 });
    simulate(world, egg, 2.5); expectRestingOnCounter(egg, "50 cm");
  }],
  ["chute de 1 m", () => {
    const world = createWorld(); const egg = createEgg(world, { y: 2 });
    simulate(world, egg, 3); expectRestingOnCounter(egg, "1 m");
  }],
  ["projection rapide vers le comptoir", () => {
    const world = createWorld(); const egg = createEgg(world, { x: -1.5, y: 1.7, velocity: { x: 7, y: -4, z: 0 } });
    simulate(world, egg, .45);
  }],
  ["lâcher juste au-dessus du meuble", () => {
    const world = createWorld(); const egg = createEgg(world, { y: 1.09 });
    simulate(world, egg, 1.5); expectRestingOnCounter(egg, "lâcher proche");
  }],
  ["lâcher au bord", () => {
    const world = createWorld(); const egg = createEgg(world, { x: 2.38, y: 1.22, velocity: { x: 1.5, y: 0, z: 0 } });
    simulate(world, egg, 2.5);
    if (egg.translation().y < EGG_RADIUS - .005) throw new Error("L'œuf a traversé le sol après avoir quitté le bord");
  }],
  ["prises et lâchers répétés", () => {
    const world = createWorld(); const egg = createEgg(world, { y: 1.4 });
    for (let pass = 0; pass < 6; pass++) {
      egg.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
      egg.setNextKinematicTranslation({ x: pass * .08 - .2, y: 1.28, z: -1.25 }); world.step();
      egg.setBodyType(RAPIER.RigidBodyType.Dynamic, true); egg.enableCcd(true);
      egg.setLinvel({ x: 0, y: 0, z: 0 }, true); egg.setAngvel({ x: 0, y: 0, z: 0 }, true);
      simulate(world, egg, .8); expectRestingOnCounter(egg, `lâcher ${pass + 1}`);
    }
  }]
];

for (const [name, test] of tests) {
  test();
  console.log(`✓ ${name}`);
}

console.log(`\n${tests.length} tests physiques réussis.`);
