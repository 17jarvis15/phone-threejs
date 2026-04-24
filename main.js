import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#webgl");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.4, 5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 2.2));

const keyLight = new THREE.DirectionalLight(0xffffff, 4);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);

const blueLight = new THREE.PointLight(0x00aaff, 5, 10);
blueLight.position.set(-3, 2, 3);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0xff00ff, 4, 10);
purpleLight.position.set(3, -1, 3);
scene.add(purpleLight);

// Load phone model
const loader = new GLTFLoader();
let phone;

loader.load(
  "models/phone.glb",
  function (gltf) {
    phone = gltf.scene;

    phone.scale.set(1.6, 1.6, 1.6);
    phone.position.set(0, -0.5, 0);

    scene.add(phone);

    // Make model more colorful/glossy
    phone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();

        child.material.metalness = 0.4;
        child.material.roughness = 0.25;

        // screen/glass-like parts
        if (child.name.toLowerCase().includes("screen")) {
          child.material.color.set(0x050816);
          child.material.emissive.set(0x001144);
          child.material.emissiveIntensity = 0.4;
        }
      }
    });

    addExtraLabelsOnPhone();
  },
  undefined,
  function (error) {
    console.error("Model loading error:", error);
  }
);

// 3D text labels attached near phone
function makeTextSprite(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.fillStyle = "white";
  ctx.font = "bold 70px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.3, 0.55, 1);
  return sprite;
}

function addExtraLabelsOnPhone() {
  const punchLabel = makeTextSprite("Punch Hole Camera", "#00c6ff");
  punchLabel.position.set(0, 1.3, 0.4);
  scene.add(punchLabel);

  const speakerLabel = makeTextSprite("Speaker Grill", "#ffcc00");
  speakerLabel.position.set(-1.4, -0.9, 0.4);
  scene.add(speakerLabel);

  const backLabel = makeTextSprite("Back Cameras on Back", "#ff00ff");
  backLabel.position.set(1.4, 0.4, 0.4);
  scene.add(backLabel);
}

// Animation
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (phone) {
    phone.rotation.y += 0.003;
  }

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
