import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/DRACOLoader';

const W_H = 16 / 9;
const moSel = document.querySelector('#motionSelector')
moSel.value = 'HLC-Scoring-FixedBasket'
// let allModelUrl = ['./assets/generated_motions/RaiseTwoArms.glb'];
// let allModelUrl = new URL(`./assets/grasp_generation_color/RaiseTwoArms.glb`, import.meta.url)
const allCanvas = document.querySelectorAll('canvas');
const allRenders = [];
let model;
let mixer;

// Process all canvas
// function load_model() {

const canvas = allCanvas[0];
const scene = new THREE.Scene();
// const modelUrl = new URL('./assets/generated_motions/RaiseTwoArms.glb', import.meta.url);
// load glb model and add to scene

// create camera
const camera = new THREE.PerspectiveCamera(45, W_H, 0.1, 100);
camera.position.set(3, 2, -3);
scene.add(camera);

// create light
const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

// create grid
const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

// create controls
const controls = new OrbitControls(camera, canvas);
controls.enableZoom = true;
controls.enableDamping = true;
controls.object.position.set(camera.position.x, camera.position.y, camera.position.z);
controls.target = new THREE.Vector3(0, 0, 0);
controls.update();

// create renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  if (mixer)
    mixer.update(clock.getDelta());
  renderer.render(scene, camera);
});

allRenders.push(renderer);


function load_model(){
  const draco = new DRACOLoader();
  draco.setDecoderConfig({ type: 'js' });
  draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

  const assetLoader = new GLTFLoader();
  assetLoader.setDRACOLoader(draco)
  if (moSel.value == '') {
    return
  }
  let allModelUrl = './assets/generated_motions/' + moSel.value + '.glb';
  
  scene.remove(model)
  document.querySelector('#motion_loading').innerHTML = `<img src="./assets/icons/loading.svg" width="48" height="48">`
  let modelUrl = new URL(allModelUrl, import.meta.url);
  assetLoader.load(modelUrl.href, function(gltf) {
    model = gltf.scene;
    scene.add(model);
    document.querySelector('#motion_loading').innerHTML = ''
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;

    camera.position.set(3, 2, -3);
    scene.add(camera);

    clips.forEach(function(clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });

  }, undefined, function(error) {
      console.error(error);
  });

  
}

moSel.addEventListener('change', load_model)
load_model()

// resize renderers
function resizeRenderers() {
  let content_width = document.querySelector('#teaser-demo').offsetWidth * 1.0;
  for (let i = 0; i < allRenders.length; i++) {
    allRenders[i].setSize(content_width, content_width / W_H);
  }
}
window.addEventListener('resize', () => {
  resizeRenderers();
})
resizeRenderers();
