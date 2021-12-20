import { Point3 } from "./Point3";
import { fixedLengthArray } from "../utils/fixedLengthArray";
import { vector4Points } from "./Vector4";

interface Vector3Obj {
    x: number,
    y: number,
    z: number
}

export type vector3Points = fixedLengthArray<Point3, 2>// equal to [:Point3, :Point3]
export type vector3 = fixedLengthArray<number, 3>;

export class Vector3 {
    protected _vector: fixedLengthArray<number, 3>;
    protected readonly _dimension: number = 3;

    constructor(v: vector3 | vector3Points) {

        if (Vector3.instanceOfVector3Points(v)) {
            this.betweenPoints(v);
        } else {
            this._vector = v;
        }
    }

    private betweenPoints(v: vector3Points) {
        let p1 = v[0].point;
        let p2 = v[1].point;

        let tmp: vector3 = Vector3.zeroVector();
        for (let i = 0; i < this._dimension; i++) {
            tmp[i] = p2[i] - p1[i];
        }
        this._vector = tmp;
    }

    public length(): number {
        let tmp = 0;
        for (let i = 0; i < this._dimension; i++) {
            tmp += Math.pow(this.positionArr[i], 2);
        }
        return Math.sqrt(tmp);
    }

    get positionObj(): Vector3Obj {
        return { x: this._vector[0], y: this._vector[1], z: this._vector[2] }
    }

    get positionArr() {
        return this._vector;
    }

    public static sum(v1: Vector3, v2: Vector3): Vector3 {
        let tmp: vector3 = Vector3.zeroVector();
        for (let i = 0; i < 3; i++) {
            tmp[i] = v1._vector[i] + v2._vector[i];
        }
        return new Vector3(tmp);
    }

    public static minus(v1: Vector3, v2: Vector3): Vector3 {
        let tmp: vector3 = Vector3.zeroVector();
        for (let i = 0; i < 3; i++) {
            tmp[i] = v1._vector[i] - v2._vector[i];
        }
        return new Vector3(tmp);
    }

    public static scalarMultiplication(scalar: number, v: Vector3) {
        let tmp: vector3 = Vector3.zeroVector();
        for (let i = 0; i < 3; i++) {
            tmp[i] = v._vector[i] * scalar;
        }
        return new Vector3(tmp);
    }

    public static scalarDivision(scalar: number, v: Vector3) {
        let tmp: vector3 = Vector3.zeroVector();
        for (let i = 0; i < 3; i++) {
            tmp[i] = v._vector[i] / scalar;
        }
        return new Vector3(tmp);
    }

    public static scalarVectorMultiplication(v1: Vector3, v2: Vector3) {
        let tmp: number = 0;
        for (let i = 0; i < 3; i++) {
            tmp += v1._vector[i] * v2._vector[i];
        }
        return tmp;
    }

    public static normalization(vector: Vector3) {
        let v = vector.positionArr;
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            return new Vector3([v[0] / length, v[1] / length, v[2] / length]);
        } else {
            return new Vector3([0, 0, 0]);
        }

    }

    public static zeroVector(): vector3 {
        return [0, 0, 0];
    }

    private static instanceOfVector3Points(obj: any): obj is vector3Points {
        return (<vector3Points>obj[0].z) !== undefined;
    }

    public static cross(v1: Vector3, v2: Vector3) {
        let v1Arr = v1.positionArr;
        let v2Arr = v2.positionArr;

        return new Vector3([v1Arr[1] * v2Arr[2] - v1Arr[2] * v2Arr[1], v1Arr[2] * v2Arr[0] - v1Arr[0] * v2Arr[2], v1Arr[0] * v2Arr[1] - v1Arr[1] * v2Arr[0]]);
    }
}




