import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { Scalar } from "@babylonjs/core/Maths";

type Bounds = { left: number; right: number; back: number; front: number };

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: false });

const SETTINGS = {
  world: {
    width: 50,   // X extent (left/right)
    depth: 30,   // Z extent (top/bottom)
    tableThickness: 0.5
  },
  paddle: {
    widthX: 1.2,     // paddle thickness along X
    lengthZ: 8,      // paddle length along Z (movement axis)
    heightY: 1.4,    // visual height
    speed: 28        // units/sec along Z
  },
  ball: {
    radius: 0.7,
    speedStart: 18,
    speedMax: 40,
    bounceAngleMaxDeg: 45,
    speedGainPerHit: 1.06,
    y: 0.8          // constant Y height for gameplay plane
  },
  ai: {
    maxSpeed: 20,
    trackOnlyWhenIncoming: true,
    returnToCenterSpeed: 10
  },
  wallPadding: 2.0,
  uiFontSize: 32
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function radians(deg: number) {
  return (deg * Math.PI) / 180;
}

function createScene(): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.05, 0.06, 0.08, 1);

  // ArcRotateCamera for free orbit/zoom
  const camera = new ArcRotateCamera(
    "cam",
    Math.PI * 1.5,   // alpha (around Y)
    0.95,            // beta (down from Y)
    65,              // radius
    new Vector3(0, 0.5, 0),
    scene
  );
  camera.lowerBetaLimit = 0.2;
  camera.upperBetaLimit = Math.PI / 2.05;
  camera.lowerRadiusLimit = 20;
  camera.upperRadiusLimit = 120;
  camera.wheelPrecision = 30;
  camera.panningSensibility = 120;
  camera.attachControl(canvas, true);

  // Lights
  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.9;
  const dir = new DirectionalLight("dir", new Vector3(-0.4, -1, -0.3), scene);
  dir.intensity = 0.3;

  // Materials
  const paddleMat = new StandardMaterial("paddleMat", scene);
  paddleMat.diffuseColor = new Color3(0.9, 0.9, 0.95);
  paddleMat.emissiveColor = new Color3(0.2, 0.2, 0.25);

  const ballMat = new StandardMaterial("ballMat", scene);
  ballMat.diffuseColor = new Color3(1.0, 0.92, 0.2);
  ballMat.emissiveColor = new Color3(0.3, 0.25, 0.05);

  const tableMat = new StandardMaterial("tableMat", scene);
  tableMat.diffuseColor = new Color3(0.08, 0.17, 0.25);
  tableMat.specularColor = new Color3(0.02, 0.02, 0.02);
  tableMat.emissiveColor = new Color3(0.02, 0.05, 0.08);

  const lineMat = new StandardMaterial("lineMat", scene);
  lineMat.diffuseColor = new Color3(0.9, 0.9, 0.95);
  lineMat.emissiveColor = new Color3(0.6, 0.6, 0.7);

  const wallMat = new StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
  wallMat.emissiveColor = new Color3(0.05, 0.05, 0.06);

  // Bounds on XZ plane
  const worldBounds: Bounds = {
    left: -SETTINGS.world.width / 2,
    right: SETTINGS.world.width / 2,
    back: -SETTINGS.world.depth / 2,
    front: SETTINGS.world.depth / 2
  };

  // Table
  const table = MeshBuilder.CreateBox("table", {
    width: SETTINGS.world.width + 2,
    depth: SETTINGS.world.depth + 2,
    height: SETTINGS.world.tableThickness
  }, scene);
  table.position.y = SETTINGS.world.tableThickness / 2 - 0.05;
  table.material = tableMat;
  table.receiveShadows = true;

  // Center dashed line
  const dashCount = 11;
  const dashLen = SETTINGS.world.depth / (dashCount * 1.5);
  const centerDashes = new TransformNode("centerDashes", scene);
  for (let i = 0; i < dashCount; i++) {
    const z = Scalar.Lerp(worldBounds.back + dashLen, worldBounds.front - dashLen, i / (dashCount - 1));
    const dash = MeshBuilder.CreateBox(`dash_${i}`, { width: 0.3, depth: dashLen, height: 0.1 }, scene);
    dash.material = lineMat;
    dash.position.set(0, SETTINGS.world.tableThickness + 0.01, z);
    dash.parent = centerDashes;
  }

  // Side walls (visual)
  const wallThickness = 0.4;
  const wallLength = SETTINGS.world.width;
  const topWall = MeshBuilder.CreateBox("topWall", {
    width: wallLength,
    depth: wallThickness,
    height: 0.6
  }, scene);
  topWall.material = wallMat;
  topWall.position.set(0, SETTINGS.world.tableThickness + 0.3, worldBounds.front + wallThickness / 2);

  const bottomWall = topWall.clone("bottomWall");
  bottomWall.position.set(0, SETTINGS.world.tableThickness + 0.3, worldBounds.back - wallThickness / 2);

  // Paddles
  const leftPaddle = MeshBuilder.CreateBox("leftPaddle", {
    width: SETTINGS.paddle.widthX,
    depth: SETTINGS.paddle.lengthZ,
    height: SETTINGS.paddle.heightY
  }, scene);
  leftPaddle.material = paddleMat;

  const rightPaddle = leftPaddle.clone("rightPaddle");

  // Ball
  const ball = MeshBuilder.CreateSphere("ball", { diameter: SETTINGS.ball.radius * 2, segments: 18 }, scene);
  ball.material = ballMat;

  // UI
  const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const scoreText = new TextBlock();
  scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  scoreText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  scoreText.color = "#EEE";
  scoreText.fontSize = SETTINGS.uiFontSize;
  scoreText.top = "10px";
  ui.addControl(scoreText);

  const centerText = new TextBlock();
  centerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  centerText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  centerText.color = "#DDD";
  centerText.fontSize = SETTINGS.uiFontSize;
  centerText.text = "Press Space to serve";
  ui.addControl(centerText);

  // Positions and state
  const setInitialPositions = () => {
    const px = worldBounds.left + SETTINGS.wallPadding;
    const ax = worldBounds.right - SETTINGS.wallPadding;
    const y = SETTINGS.ball.y;

    leftPaddle.position.set(px, y, 0);
    rightPaddle.position.set(ax, y, 0);
    ball.position.set(0, y, 0);
  };
  setInitialPositions();

  let playerScore = 0;
  let aiScore = 0;
  let paused = true;

  let vx = 0; // ball velocity X
  let vz = 0; // ball velocity Z

  const input = { up: false, down: false };
  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") input.up = true;
    if (e.code === "ArrowDown" || e.code === "KeyS") input.down = true;
    if (e.code === "Space" && paused) {
      serveBall();
      paused = false;
      centerText.text = "";
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") input.up = false;
    if (e.code === "ArrowDown" || e.code === "KeyS") input.down = false;
  });

  const updateScoreText = () => {
    scoreText.text = `You: ${playerScore}    |    AI: ${aiScore}`;
  };
  updateScoreText();

  const resetBallToCenter = () => {
    ball.position.set(0, SETTINGS.ball.y, 0);
    vx = 0;
    vz = 0;
  };

  const serveBall = () => {
    resetBallToCenter();
    const dirX = Math.random() < 0.5 ? -1 : 1;
    const angle = radians((Math.random() * 2 - 1) * (SETTINGS.ball.bounceAngleMaxDeg * 0.6));
    const speed = SETTINGS.ball.speedStart;
    vx = Math.cos(angle) * speed * dirX;
    vz = Math.sin(angle) * speed;
  };

  const pointScored = (byPlayer: boolean) => {
    if (byPlayer) playerScore++; else aiScore++;
    updateScoreText();
    centerText.text = "Point! Press Space to serve";
    paused = true;
    resetBallToCenter();
    leftPaddle.position.z = 0;
    rightPaddle.position.z = 0;
  };

  const circleRectCollideXZ = (
    cx: number, cz: number, r: number,
    rx: number, rz: number, rw: number, rd: number
  ) => {
    const halfW = rw / 2;
    const halfD = rd / 2;
    const closestX = clamp(cx, rx - halfW, rx + halfW);
    const closestZ = clamp(cz, rz - halfD, rz + halfD);
    const dx = cx - closestX;
    const dz = cz - closestZ;
    return (dx * dx + dz * dz) <= r * r;
  };

  const reflectFromPaddle = (paddle: Mesh) => {
    const halfLen = SETTINGS.paddle.lengthZ / 2;
    const impact = (ball.position.z - paddle.position.z) / halfLen; // -1..1
    const clampedImpact = clamp(impact, -1, 1);
    const maxAngle = radians(SETTINGS.ball.bounceAngleMaxDeg);
    const angle = clampedImpact * maxAngle;

    const speed = Math.min(Math.hypot(vx, vz) * SETTINGS.ball.speedGainPerHit, SETTINGS.ball.speedMax);

    const dirX = (ball.position.x > paddle.position.x) ? 1 : -1;
    vx = Math.cos(angle) * speed * dirX;
    vz = Math.sin(angle) * speed;

    const halfW = SETTINGS.paddle.widthX / 2;
    const r = SETTINGS.ball.radius;
    ball.position.x = paddle.position.x + dirX * (halfW + r + 0.01);
  };

  // Raise visuals slightly
  leftPaddle.position.y = SETTINGS.ball.y;
  rightPaddle.position.y = SETTINGS.ball.y;
  ball.position.y = SETTINGS.ball.y;

  // Game loop
  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;

    // Player control (Z axis)
    if (!paused) {
      let pz = leftPaddle.position.z;
      if (input.up) pz += SETTINGS.paddle.speed * dt;
      if (input.down) pz -= SETTINGS.paddle.speed * dt;
      pz = clamp(
        pz,
        worldBounds.back + SETTINGS.paddle.lengthZ / 2,
        worldBounds.front - SETTINGS.paddle.lengthZ / 2
      );
      leftPaddle.position.z = pz;
    }

    // AI control
    const aiIncoming = vx > 0; // towards right paddle
    const aiTargetZ = (SETTINGS.ai.trackOnlyWhenIncoming && !aiIncoming) ? 0 : ball.position.z;
    const aiSpeed = (SETTINGS.ai.trackOnlyWhenIncoming && !aiIncoming)
      ? SETTINGS.ai.returnToCenterSpeed
      : SETTINGS.ai.maxSpeed;
    const dz = aiTargetZ - rightPaddle.position.z;
    const maxMove = aiSpeed * dt;
    rightPaddle.position.z += clamp(dz, -maxMove, maxMove);
    rightPaddle.position.z = clamp(
      rightPaddle.position.z,
      worldBounds.back + SETTINGS.paddle.lengthZ / 2,
      worldBounds.front - SETTINGS.paddle.lengthZ / 2
    );

    if (!paused) {
      // Ball movement (XZ)
      ball.position.x += vx * dt;
      ball.position.z += vz * dt;
      ball.position.y = SETTINGS.ball.y;

      const r = SETTINGS.ball.radius;

      // Z bounds (top/bottom)
      if (ball.position.z + r > worldBounds.front) {
        ball.position.z = worldBounds.front - r;
        vz = -vz;
      } else if (ball.position.z - r < worldBounds.back) {
        ball.position.z = worldBounds.back + r;
        vz = -vz;
      }

      // Paddle collisions
      if (
        circleRectCollideXZ(
          ball.position.x, ball.position.z, r,
          leftPaddle.position.x, leftPaddle.position.z,
          SETTINGS.paddle.widthX, SETTINGS.paddle.lengthZ
        ) && vx < 0
      ) {
        reflectFromPaddle(leftPaddle);
      }

      if (
        circleRectCollideXZ(
          ball.position.x, ball.position.z, r,
          rightPaddle.position.x, rightPaddle.position.z,
          SETTINGS.paddle.widthX, SETTINGS.paddle.lengthZ
        ) && vx > 0
      ) {
        reflectFromPaddle(rightPaddle);
      }

      // Scoring (ball passes X bounds)
      if (ball.position.x - r > worldBounds.right) {
        pointScored(true);   // player scores
      } else if (ball.position.x + r < worldBounds.left) {
        pointScored(false);  // AI scores
      }
    }
  });

  return scene;
}

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
