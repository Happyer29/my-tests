import * as W3DE from './W3DE/W3DE';

let t = new W3DE.Matrix3([[0, 1, 0]]);

console.log(t.matrix)

let objInput : HTMLButtonElement = document.querySelector("#obj-loader");
let textureInput : HTMLButtonElement = document.querySelector("#texture-loader");
let drawGeometryBtn : HTMLButtonElement = document.querySelector("#draw-geometry");

let buttons : HTMLButtonElement[] = [
    objInput,
    textureInput,
    drawGeometryBtn,
]

objInput.addEventListener('change', readObjectFromInput, false);
textureInput.addEventListener('change', readTextureFromInput, false);
drawGeometryBtn.addEventListener('click', drawGeometry, false);

async function readObjectFromInput(event : Event) {
    const input = event.target as HTMLInputElement;

    const files = input.files;
    const file = files[0];
    const fileText = await W3DE.FileLoader.loadAsText(file);

    const object = await new W3DE.ObjParser().parseObjectFromString(fileText);

    const sphereGeometry = new W3DE.SphereGeometry(75, 100); // change roundness to 10-20 to clearly see rotation

    const defaultMaterial = await W3DE.Material.getDefaultMaterial();

    const sphere = new W3DE.Mesh(sphereGeometry, defaultMaterial);

    const scene = new W3DE.Scene();
    // TODO object.move(x,y,z); object.rotate.x();

    const renderer = new W3DE.WebGLRenderer(scene, {selector: "#canvas-parent", width: "1000px", height: "1000px"});
    renderer.animationSpeed = 0.03;

    scene.add(object);
    scene.add(sphere);

    renderer.resizeCanvasToDisplaySize();
    renderer.render();

    buttons.forEach(button => {
        button.disabled = true;
    })    
}

async function readTextureFromInput(event : Event) {
    const input = event.target as HTMLInputElement;
    
    const files = input.files;
    const file = files[0];

    const texture = await W3DE.TextureLoader.loadFromFile(file);
    const material = new W3DE.Material(texture);
    console.log(material);

    buttons.forEach(button => {
        button.disabled = true;
    }) 
}

async function drawGeometry() {
    const sphereGeometry = new W3DE.SphereGeometry(50, 100); // change roundness to 10-20 to clearly see rotation
    const defaultMaterial = await W3DE.Material.getDefaultMaterial();

    const sphere = new W3DE.Mesh(sphereGeometry, defaultMaterial);

    const scene = new W3DE.Scene();
    
    const renderer = new W3DE.WebGLRenderer(scene, {selector: "#canvas-parent", width: "1000px", height: "1000px"});
    renderer.animationSpeed = 0.5;
    scene.add(sphere);

    renderer.resizeCanvasToDisplaySize();
    renderer.render();

    buttons.forEach(button => {
        button.disabled = true;
    }) 
}
