import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update materials
    material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 5
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const rendererParameters = {}
rendererParameters.clearColor = '#26132f'

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setClearColor(rendererParameters.clearColor)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

gui
    .addColor(rendererParameters, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(rendererParameters.clearColor)
    })

/**
 * Material
 */
const materialParameters = {}
materialParameters.uColor_a = new THREE.Color("#d81818")
materialParameters.uColor_b = new THREE.Color("#d09816")
materialParameters.uColor_c = new THREE.Color("#ffffff")
materialParameters.uColor_d = new THREE.Color("#ffffff")


const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms:
    {
        iResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        iTime: new THREE.Uniform(0),
        iTimeDelta: new THREE.Uniform(0),
        iFrame: new THREE.Uniform(0),
        uColor_a: new THREE.Uniform(materialParameters.uColor_a),
        uColor_b: new THREE.Uniform(materialParameters.uColor_b),
        uColor_c: new THREE.Uniform(materialParameters.uColor_c),
        uColor_d: new THREE.Uniform(materialParameters.uColor_d),
    }
})

gui
    .addColor(materialParameters, 'uColor_a')
    .onChange(() =>
    {
        material.uniforms.uColor_a.value.set(materialParameters.uColor_a)
    })
gui
    .addColor(materialParameters, 'uColor_b')
    .onChange(() =>
    {
        material.uniforms.uColor_b.value.set(materialParameters.uColor_b)
    })
gui
    .addColor(materialParameters, 'uColor_c')
    .onChange(() =>
    {
        material.uniforms.uColor_c.value.set(materialParameters.uColor_c)
    })
gui
    .addColor(materialParameters, 'uColor_d')
    .onChange(() =>
    {
        material.uniforms.uColor_d.value.set(materialParameters.uColor_d)
    })


/**
 * Objects
 */
// Plane
// const Plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5,5, 50,50),
//     material
// )
// Plane.rotateX(- Math.PI / 2)

// scene.add(Plane)

let fox = null
let mixer = null
gltfLoader.load(
    './scene.gltf',
    (gltf) =>
    {
        fox = gltf.scene
        fox.scale.set(0.025, 0.025, 0.025)
        fox.rotation.set(-Math.PI/4, -Math.PI/2,-Math.PI/5)
        fox.position.set(0,-1,0)
        fox.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
        })
        scene.add(fox)

        mixer = new THREE.AnimationMixer(fox)
        const stay = mixer.clipAction(gltf.animations[0])
        stay.play()

        const walk = mixer.clipAction(gltf.animations[1])
        const run = mixer.clipAction(gltf.animations[2])

        fox.stay = stay
        fox.walk = walk
        fox.run = run
    }
)


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    material.uniforms.iTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    if(mixer)
    {
        mixer.update(deltaTime)
    }
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()