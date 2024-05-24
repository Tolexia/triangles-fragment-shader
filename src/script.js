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
materialParameters.color = '#ff794d'
materialParameters.shadowColor = '#8e19b8'
materialParameters.lightColor = '#e5ffe0'

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms:
    {
        iResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        iTime: new THREE.Uniform(0),
        iTimeDelta: new THREE.Uniform(0),
        iFrame: new THREE.Uniform(0),
    }
})

// gui
//     .addColor(materialParameters, 'color')
//     .onChange(() =>
//     {
//         material.uniforms.uColor.value.set(materialParameters.color)
//     })

// gui
//     .add(material.uniforms.uShadowRepetitions, 'value')
//     .min(1)
//     .max(300)
//     .step(1)
// gui
//     .add(material.uniforms.uLightRepetitions, 'value')
//     .min(1)
//     .max(300)
//     .step(1)

// gui
//     .addColor(materialParameters, 'shadowColor')
//     .onChange(() =>
//     {
//         material.uniforms.uShadowColor.value.set(materialParameters.shadowColor)
//     })
// gui
//     .addColor(materialParameters, 'lightColor')
//     .onChange(() =>
//     {
//         material.uniforms.uLightColor.value.set(materialParameters.lightColor)
//     })

/**
 * Objects
 */
// Plane
const Plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5,5, 50,50),
    material
)
Plane.rotateX(- Math.PI / 2)

scene.add(Plane)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // material.uniforms.iTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()