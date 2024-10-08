import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import gsap from 'gsap'

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

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    if(fox)
    {
        setFoxScale(fox)
        setFoxPosition(fox)
    }

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

/**
 * Rotation Controls
 */
const rotationControls = {
    x: 0,
    y: 0,
    z: 0,
    rotationSpeed: 0.01
}

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

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms:
    {
        iResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        iTime: new THREE.Uniform(0),
        iTimeDelta: new THREE.Uniform(0),
        iFrame: new THREE.Uniform(0),
        uTriangleMultiplier: new THREE.Uniform(50),
        uColor_a: new THREE.Uniform(materialParameters.uColor_a),
        uColor_b: new THREE.Uniform(materialParameters.uColor_b),
        uColor_c: new THREE.Uniform(materialParameters.uColor_c),
        uColor_adjuster: new THREE.Uniform(0),
    }
})

gui
    .add(material.uniforms.uTriangleMultiplier, 'value').min(1).max(100).step(1)
gui
    .add(material.uniforms.uColor_adjuster, 'value').min(0).max(1).step(0.01)

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

const rotationFolder = gui.addFolder('Rotation Controls')

rotationFolder
    .add(rotationControls, 'x')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.01)
    .name('Rotation X')
    .onChange(() => {
        if (fox) {
            fox.rotation.x = rotationControls.x
        }
    })

rotationFolder
    .add(rotationControls, 'y')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.01)
    .name('Rotation Y')
    .onChange(() => {
        if (fox) {
            fox.rotation.y = rotationControls.y
        }
    })

rotationFolder
    .add(rotationControls, 'z')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.01)
    .name('Rotation Z')
    .onChange(() => {
        if (fox) {
            fox.rotation.z = rotationControls.z
        }
    })

rotationFolder
    .add(rotationControls, 'rotationSpeed')
    .min(0)
    .max(0.1)
    .step(0.001)
    .name('Rotation Speed')


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
function setFoxScale(fox)
{
    const adjuster = screen.orientation.type.includes("portrait") ? 0.05 : 0.02
    const maxwidth = 1920
    const size = sizes.width * adjuster / maxwidth
    fox.scale.set(size, size, size)
}

function setFoxPosition(fox)
{
    const y = screen.orientation.type.includes("portrait") ? -0.5 : 4
    fox.position.set(0,y,0)
}
let fox = null
let mixer = null
gltfLoader.load(
    './scene.gltf',
    (gltf) =>
    {
        fox = gltf.scene
       
        setFoxScale(fox)
        setFoxPosition(fox)

        fox.rotation.y = -1
       
        fox.traverse((child) =>
        {
            if(child.isMesh)
                child.material = material
        })
        scene.add(fox)

        // mixer = new THREE.AnimationMixer(fox)
        // const stay = mixer.clipAction(gltf.animations[0])
        // stay.play()

        // const walk = mixer.clipAction(gltf.animations[1])
        // const run = mixer.clipAction(gltf.animations[2])

        // fox.stay = stay
        // fox.walk = walk
        // fox.run = run
    }
)

// scene.add(new THREE.AmbientLight(0xffffff, 2))

let is_initModel = false;
const initModel = function()
{
    if(!fox || is_initModel) return;

    // gsap.to(material.uniforms.uTriangleMultiplier, 
    //     { value: 60,
    //          duration: 10,
    //          ease:'sine.out' ,
    //          onComplete: () => {
               
    //         }
    //     }
    // )
    // gsap.to(material.uniforms.uColor_adjuster, 
    //     { value: 1,
    //          duration: 10,
    //          ease: 'power1.inOut' ,
    //     }
    // )
    console.log("init")
    is_initModel = true
}



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
    material.uniforms.uColor_adjuster.value = Math.sin(elapsedTime * 0.35) * 0.5 + 0.5

    // Render
    renderer.render(scene, camera)

    if(mixer)
    {
        // mixer.update(deltaTime)
    }
    if(fox)
    {
        initModel()
        // rotationControls.x = fox.rotation.x
        // rotationControls.y = fox.rotation.y
        // rotationControls.z = fox.rotation.z
    }
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()