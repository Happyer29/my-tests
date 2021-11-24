import { Mesh } from "../objects/Mesh";
import { Unit, UnitType } from "../utils/unitType";
import { config } from "./config";
import { WebGlShaderCreator } from "./WebGlShaderCreator";
import { Matrix4 } from "../maths/Matrix4";
import { Scene } from "../scenes/Scene";
import { Object3D } from "../W3DE";

interface CtxAttr {
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    desynchronized?: boolean;
    antialias?: boolean;
    failIfMajorPerformanceCaveat?: boolean;
    powerPreference?: "default" | "high-performance" | "low-power";
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    xrCompatible?: boolean;
}

//Опции которые передаются в конструктор рендерера
interface ConstructorOptions {
    selector?: parentCanvasSelector, // селектор для id или body
    width?: UnitType, //ширина канваза
    height?: UnitType, //высота канваза
}

type parentCanvasSelector = `#${string}` | "body";

export class WebGLRenderer {
    private readonly _canvas;
    private readonly _parentCanvasEl: HTMLElement;
    private _ctx;
    //private readonly _canvas: HTMLCanvasElement;

    private _options: ConstructorOptions = {};
    private _pixelRatio = 1;

    private _width: Unit;
    private _height: Unit;

    private _scene: Scene;
    private _animationSpeed: number = 0;
    private time: number = 1;

    constructor(scene: Scene, options: ConstructorOptions = {}) {
        this._options = options;
        this._scene = scene;

        this._parentCanvasEl = document.querySelector(options.selector ?? "body")
        this._canvas = this.createCanvasElement()
        this._ctx = this.getCtx();
        this.setSize(new Unit(options.width ?? undefined), new Unit(options.height ?? undefined), true)
    }

    //TODO webgl2 and webgl, now only webgl2
    //TODO now used 2d only for rectangles tests
    public getCtx(attr?: CtxAttr) {
        return this._canvas.getContext("webgl", attr);
    }

    public setSize(width: Unit = config.width, height: Unit = config.height, updateStyle: boolean = false) {
        this._width = width;
        this._height = height;

        this._canvas.width = Math.floor(width.intUnit * this._pixelRatio);
        this._canvas.height = Math.floor(height.intUnit * this._pixelRatio);

        if (updateStyle !== false) {
            //console.log(width);
            this._canvas.style.width = width + 'px';
            this._canvas.style.height = height + 'px';
            //console.log(this._canvas.style.width);
        }
    }

    public resizeCanvasToDisplaySize(multiplier?) {
        multiplier = multiplier || 1;
        const width = new Unit(this._parentCanvasEl.clientWidth).multiple(multiplier);
        const height = new Unit(this._parentCanvasEl.clientHeight).multiple(multiplier);
        if (!Unit.equal(this._width, width) || !Unit.equal(this._height, height)) {
            this.setSize(width, height, true);
        }
    }

    private createCanvasElement() {
        const canvas = this.createElementNS('canvas');
        this._parentCanvasEl.appendChild(canvas);

        canvas.style.display = 'block';
        return canvas;
    }

    //TODO wtf??
    private createElementNS(name) {
        return document.createElementNS('http://www.w3.org/1999/xhtml', name);
    }

    public get scene(): Scene {
        return this._scene;
    }

    public set scene(value: Scene) {
        this._scene = value;
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get animationSpeed(): number {
        return this._animationSpeed;
    }
    public set animationSpeed(value: number) {
        this._animationSpeed = value;
    }

    public render() {
        this.time += this.animationSpeed;

        this.scene.getItemsToRender().forEach(object3d => {
            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            let size = 3;          // 2 components per iteration
            let type = this._ctx.FLOAT;   // the data is 32bit floats
            let normalize = false; // don't normalize the data
            let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            let offset = 0;        // start at the beginning of the buffer
            // TODO: Rename this.init, cause init = initialize (now returns array)
            // TODO: May be refactor to 1 function render() using utils functions like createAttributeSetters(), setAttributes(), 
            // TODO: Reference: https://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
            this._ctx.vertexAttribPointer(this.init(object3d), size, type, normalize, stride, offset);

            let primitiveType = this._ctx.TRIANGLES;
            let offsetDraw = 0;
            let count = object3d.geometry.position.length / 3;

            this._ctx.drawArrays(primitiveType, offsetDraw, count);
        })
        

        requestAnimationFrame(() => this.render());
    }

    private mainMatrix(){
        function degToRad(d) {
            return d * Math.PI / 180;
        }

        let matrix = Matrix4.projection(this._ctx.canvas.clientWidth, this._ctx.canvas.clientHeight, 1000);
        matrix = Matrix4.translate(matrix, config.translation[0], config.translation[1], config.translation[2]);
        matrix = Matrix4.xRotate(matrix, degToRad(config.rotation[0]));
        matrix = Matrix4.yRotate(matrix, degToRad(config.rotation[1] * this.time));
        matrix = Matrix4.zRotate(matrix, degToRad(config.rotation[2]));
        matrix = Matrix4.scale(matrix, config.scale[0], config.scale[1], config.scale[2]);

        return matrix.matrixToArray();
    }
  
    private init(object3d : Object3D) {
        let gl = this._ctx;

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        function createProgram(gl, vertexShader, fragmentShader) {
            let program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            let success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }

            console.log(gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
        }

        const vs = `
        attribute vec4 a_position;
 
uniform mat4 u_matrix;
 
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
}
        `;

        const fs = `
  precision highp float;
 
  void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
  }`;
        // create GLSL shaders, upload the GLSL source, compile the shaders
        let vertexShader = new WebGlShaderCreator(gl).createVertexShader(vs);
        let fragmentShader = new WebGlShaderCreator(gl).createFragmentShader(fs);
        // Link the two shaders into a program
        let program = createProgram(gl, vertexShader, fragmentShader);
        // look up where the vertex data needs to go.
        let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        let matrixLocation = gl.getUniformLocation(program, "u_matrix");

        // Create a buffer and put three 2d clip space points in it

        let positionBuffer = gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let positions = object3d.geometry.position;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // code above this line is initialization code.
        // code below this line is rendering code.

        this.resizeCanvasToDisplaySize();

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas


        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
        gl.uniformMatrix4fv(matrixLocation, false, this.mainMatrix());
        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        return positionAttributeLocation;
    }
}