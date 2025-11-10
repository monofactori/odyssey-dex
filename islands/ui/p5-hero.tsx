import { useEffect, useRef } from "preact/hooks";
import type p5 from "p5";

// Helper functions
function pack3(value: number): [number, number, number] {
	const z = Math.floor(value / 65536);
	const y = Math.floor((value - z * 65536) / 256);
	const x = Math.floor(value) % 256;
	return [x, y, z];
}

function unpack3(values: [number, number, number]): number {
	return values[0] + values[1] * 256 + values[2] * 65536;
}

function realToRaw(realValue: number): number {
	return (realValue + 4096.0) * 1000.0;
}

function rawToReal(rawValue: number): number {
	return rawValue / 1000.0 - 4096.0;
}

function inverseLerp(min: number, max: number, value: number): number {
	return (value - min) / (max - min);
}

// NYModel class
class NYModel {
	static UV_CENTER = 0;
	static UV_TOP_DOWN = 1;

	verts: number[][];
	vertColors: number[][];
	triangles: number[][];
	uvs: number[][];
	vertIndex: number;
	modelName: string;
	customAttributeNames: string[];
	customAttributeDatas: Record<string, number[]>;
	uvMode: number;

	constructor(_modelName: string) {
		this.verts = [];
		this.vertColors = [];
		this.triangles = [];
		this.uvs = [];
		this.vertIndex = 0;
		this.modelName = _modelName;
		this.customAttributeNames = [];
		this.customAttributeDatas = {};
		this.uvMode = NYModel.UV_TOP_DOWN;
	}

	addRegularShape(
		_centerX: number,
		_centerY: number,
		_radius = 100,
		_edgeCount = 4,
		_initRotation = 0
	) {
		const minX = _centerX - _radius;
		const maxX = _centerX + _radius;
		const minY = _centerY - _radius;
		const maxY = _centerY + _radius;

		for (let i = 0; i < _edgeCount; i++) {
			const p1x = _centerX;
			const p1y = _centerY;

			const p2Angle = (i / _edgeCount) * 360.0;
			const p3Angle = ((i + 1) / _edgeCount) * 360.0;

			const p2x = _centerX + Math.sin((p2Angle * Math.PI) / 180) * _radius;
			const p2y = _centerY + Math.cos((p2Angle * Math.PI) / 180) * _radius;

			const p3x = _centerX + Math.sin((p3Angle * Math.PI) / 180) * _radius;
			const p3y = _centerY + Math.cos((p3Angle * Math.PI) / 180) * _radius;

			let uv1 = [0, 1];
			let uv2 = [1, 0];
			let uv3 = [1, 1];

			if (this.uvMode == NYModel.UV_CENTER) {
				uv1 = [0, 0];
				uv2 = [i / _edgeCount, 1];
				uv3 = [(i + 1) / _edgeCount, 1];
			} else if (this.uvMode == NYModel.UV_TOP_DOWN) {
				uv1 = [0.5, 0.5];
				uv2 = [inverseLerp(minX, maxX, p2x), inverseLerp(minY, maxY, p2y)];
				uv3 = [inverseLerp(minX, maxX, p3x), inverseLerp(minY, maxY, p3y)];
			}

			this.addTriangle(p1x, p1y, p2x, p2y, p3x, p3y, uv1, uv2, uv3);
		}
	}

	addFullScreenTriangle(_xWidth: number, _yHeight: number) {
		const p1x = -0.5 * _xWidth;
		const p1y = 0.5 * _yHeight;

		const p2x = -0.5 * _xWidth;
		const p2y = -1.5 * _yHeight;

		const p3x = 1.5 * _xWidth;
		const p3y = 0.5 * _yHeight;

		this.addTriangle(p1x, p1y, p2x, p2y, p3x, p3y, [0, 0], [0, 2], [2, 0]);
	}

	addTriangle(
		_x1: number,
		_y1: number,
		_x2: number,
		_y2: number,
		_x3: number,
		_y3: number,
		_uv1: number[] = [0, 1],
		_uv2: number[] = [1, 0],
		_uv3: number[] = [1, 1]
	) {
		this.verts.push([_x1, _y1]);
		this.verts.push([_x2, _y2]);
		this.verts.push([_x3, _y3]);

		this.vertColors.push([1.0, 1.0, 1.0, 1.0]);
		this.vertColors.push([1.0, 1.0, 1.0, 1.0]);
		this.vertColors.push([1.0, 1.0, 1.0, 1.0]);

		this.uvs.push(_uv1);
		this.uvs.push(_uv2);
		this.uvs.push(_uv3);

		this.triangles.push([
			this.vertIndex + 0,
			this.vertIndex + 1,
			this.vertIndex + 2,
		]);
		this.vertIndex += 3;
	}

	addCustomAttribute(_attributeName: string, _data: number[]) {
		if (!this.customAttributeNames.includes(_attributeName)) {
			this.customAttributeNames.push(_attributeName);
			this.customAttributeDatas[_attributeName] = [];
		}

		for (let i = 0; i < _data.length; i++) {
			this.customAttributeDatas[_attributeName].push(_data[i]);
		}
	}

	build(_renderer: any = null, p5Instance?: any) {
		const P5Constructor = p5Instance?.constructor || (window as any).p5;
		const md = new P5Constructor.Geometry();
		md.gid = this.modelName;

		md.vertices = Array(this.verts.length).fill(null);
		for (let i = 0; i < this.verts.length; i++) {
			md.vertices[i] = new P5Constructor.Vector(
				this.verts[i][0],
				this.verts[i][1],
				0
			);
		}

		md.faces = this.triangles;
		md.uvs = this.uvs;
		md.vertexColors = this.vertColors;

		if (this.customAttributeNames.length > 0) {
			if (_renderer == null) {
				console.error("Need renderer reference for custom attributes");
				return;
			}

			for (let i = 0; i < this.customAttributeNames.length; i++) {
				const attributeName = this.customAttributeNames[i];
				const customDataName = "custom_" + attributeName;
				const customBufferName = customDataName + "Buffer";

				const data = this.customAttributeDatas[attributeName];
				const dataCountPerVertex = Math.floor(data.length / this.verts.length);

				if (data.length % this.verts.length != 0) {
					console.error(
						`WARNING: custom attribute ${attributeName} data count [${data.length}] not match vertices count [${this.verts.length}]`
					);
					return;
				}

				md[customDataName] = [];
				for (let d = 0; d < data.length; d++) {
					md[customDataName].push(data[d]);
				}

				_renderer.retainedMode.buffers.fill.push(
					new P5Constructor.RenderBuffer(
						dataCountPerVertex,
						customDataName,
						customBufferName,
						attributeName,
						_renderer
					)
				);
			}
		}
		return md;
	}
}

// Shader code
const particleMoveVert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

#define DEG_TO_RAD 0.0174532925

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

attribute vec2 aCenterPos;
attribute float aMoveSeed;
attribute float aMoveSpeed;
attribute float aMoveHeight;

varying vec2 vTexCoord;

uniform vec2 uScreenSize;
uniform float uMoveSpace;
uniform float uTime;

float moveSpeed = 0.0;

void main () {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`;

const particleMoveFrag = `
precision highp float;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

const float c_precision = 256.0;
const float c_precisionp1 = c_precision + 1.0;

float color2float(vec3 color) {
	return floor(color.r * c_precision + 0.5)
		+ floor(color.g * c_precision + 0.5) * c_precisionp1
		+ floor(color.b * c_precision + 0.5) * c_precisionp1 * c_precisionp1;
}

vec3 float2color(float value) {
	vec3 color = vec3(1.0);
	color.r = mod(value, c_precisionp1) / c_precision;
	color.g = mod(floor(value / c_precisionp1), c_precisionp1) / c_precision;
	color.b = floor(value / (c_precisionp1 * c_precisionp1)) / c_precision;
	return color;
}

float realToRaw(float realValue) {
  return (realValue + 4096.) * 1000.;
}

float rawToReal(float rawValue) {
  return rawValue / 1000. - 4096.;
}

varying vec4 vColor;
varying vec2 vTexCoord;

uniform sampler2D uDataTexture;
uniform sampler2D uRandomSeedTexture;
uniform vec2 uScreenSize;
uniform float uTime;

#define DEG_TO_RAD 0.0174532925

void main() {
  vec2 flipTexCoord = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec4 dataColor = texture2D(uDataTexture, flipTexCoord);
  float dataValue = color2float(dataColor.rgb);

  if(flipTexCoord.x < 0.5 && flipTexCoord.y < 0.5) {
    float seed = color2float(texture2D(uRandomSeedTexture, vTexCoord).rgb);
    vec4 dataPosX = texture2D(uDataTexture, flipTexCoord);
    vec4 dataVel = texture2D(uDataTexture, flipTexCoord + vec2(0.5, 0.5));
    vec4 dataRot = texture2D(uDataTexture, flipTexCoord + vec2(0.0, 0.5));

    vec4 dataInitLife = texture2D(uRandomSeedTexture, vTexCoord + vec2(0.0, 0.5));
    vec4 dataParticleLife = texture2D(uRandomSeedTexture, vTexCoord + vec2(0.5, 0.5));

    float lifeOffset = color2float(dataInitLife.rgb);
    float life = color2float(dataParticleLife.rgb);

    float xPos = rawToReal(color2float(dataPosX.rgb));
    float vel = rawToReal(color2float(dataVel.rgb));
    float rot = rawToReal(color2float(dataRot.rgb));

    if(mod(uTime - lifeOffset, life) == 0.0) {
      float circleAngle = random(vec2(uTime, seed)) * 360.0;
      float shortSide = uScreenSize.x < uScreenSize.y ? uScreenSize.x : uScreenSize.y;
      xPos = sin(circleAngle * DEG_TO_RAD) * shortSide * 0.56 + 0.5 * uScreenSize.x;
    }
    
    xPos += sin(rot * DEG_TO_RAD) * vel * 0.003;
    
    vec3 resultColor = float2color(realToRaw(xPos));
    gl_FragColor = vec4(resultColor, 1.0);
  }
  else if(flipTexCoord.x >= 0.5 && flipTexCoord.y < 0.5) {
    float seed = color2float(texture2D(uRandomSeedTexture, vTexCoord + vec2(-0.5, 0.0)).rgb);
    vec4 dataPosY = texture2D(uDataTexture, flipTexCoord);
    vec4 dataVel = texture2D(uDataTexture, flipTexCoord + vec2(0.0, 0.5));
    vec4 dataRot = texture2D(uDataTexture, flipTexCoord + vec2(-0.5, 0.5));

    vec4 dataInitLife = texture2D(uRandomSeedTexture, vTexCoord + vec2(-0.5, 0.5));
    vec4 dataParticleLife = texture2D(uRandomSeedTexture, vTexCoord + vec2(0.0, 0.5));

    float lifeOffset = color2float(dataInitLife.rgb);
    float life = color2float(dataParticleLife.rgb);

    float yPos = rawToReal(color2float(dataPosY.rgb));
    float vel = rawToReal(color2float(dataVel.rgb));
    float rot = rawToReal(color2float(dataRot.rgb));

    if(mod(uTime - lifeOffset, life) == 0.0) {
      float circleAngle = random(vec2(uTime, seed)) * 360.0;
      float shortSide = uScreenSize.x < uScreenSize.y ? uScreenSize.x : uScreenSize.y;
      yPos = cos(circleAngle * DEG_TO_RAD) * shortSide * 0.56 + 0.5 * uScreenSize.y;
    }
    
    yPos += cos(rot * DEG_TO_RAD) * vel * 0.003;
    
    vec3 resultColor = float2color(realToRaw(yPos));
    gl_FragColor = vec4(resultColor, 1.0);
  }
  else if(flipTexCoord.x < 0.5 && flipTexCoord.y >= 0.5) {
    vec4 dataPosX = texture2D(uDataTexture, flipTexCoord + vec2(0.0, -0.5));
    vec4 dataPosY = texture2D(uDataTexture, flipTexCoord + vec2(+0.5, -0.5));
    vec4 dataRot = texture2D(uDataTexture, flipTexCoord);

    float posX = rawToReal(color2float(dataPosX.rgb));
    float posY = rawToReal(color2float(dataPosY.rgb));
    float rot = rawToReal(color2float(dataRot.rgb));

    rot = mix(rot, snoise(vec3(posX * 0.001, posY * 0.001, uTime * 0.001)) * 360., 0.01);

    vec3 resultColor = float2color(realToRaw(rot));
    gl_FragColor = vec4(resultColor, 1.0);
  }
  else if(flipTexCoord.x >= 0.5 && flipTexCoord.y >= 0.5) {
    vec4 dataPosX = texture2D(uDataTexture, flipTexCoord + vec2(-0.5, -0.5));
    vec4 dataPosY = texture2D(uDataTexture, flipTexCoord + vec2(0.0, -0.5));
    vec4 dataRot = texture2D(uDataTexture, flipTexCoord + vec2(-0.5, 0.0));
    vec4 dataVel = texture2D(uDataTexture, flipTexCoord + vec2(0.0, -0.5));

    float posX = rawToReal(color2float(dataPosX.rgb));
    float posY = rawToReal(color2float(dataPosY.rgb));
    float vel = rawToReal(color2float(dataVel.rgb));
    float rot = rawToReal(color2float(dataRot.rgb));

    float noiseVel = snoise(vec3(posX, posY, uTime)) * 0.5 + 0.5;
    vel += noiseVel;
    vel *= 0.9;

    float storeValue = realToRaw(vel);
    vec3 resultColor = float2color(storeValue);
    gl_FragColor = vec4(resultColor, 1.0);
  }
  else {
    gl_FragColor = dataColor;
  }
}
`;

const particleDrawVert = `
precision mediump float;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);

  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

const float c_precision = 256.0;
const float c_precisionp1 = c_precision + 1.0;

float color2float(vec3 color) {
	return floor(color.r * c_precision + 0.5)
		+ floor(color.g * c_precision + 0.5) * c_precisionp1
		+ floor(color.b * c_precision + 0.5) * c_precisionp1 * c_precisionp1;
}

vec3 float2color(float value) {
	vec3 color = vec3(1.0);
	color.r = mod(value, c_precisionp1) / c_precision;
	color.g = mod(floor(value / c_precisionp1), c_precisionp1) / c_precision;
	color.b = floor(value / (c_precisionp1 * c_precisionp1)) / c_precision;
	return color;
}

float realToRaw(float realValue) {
  return (realValue + 4096.) * 1000.;
}

float rawToReal(float rawValue) {
  return rawValue / 1000. - 4096.;
}

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aVertexColor;

#define DEG_TO_RAD 0.0174532925

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

attribute vec2 aCenterPos;
attribute float aMoveSeed;
attribute float aMoveSpeed;
attribute float aMoveHeight;

varying vec4 vColor;
varying vec2 vTexCoord;
varying float vAlpha;

uniform vec2 uScreenSize;
uniform sampler2D uDataTexture;
uniform sampler2D uRandomSeedTexture;
uniform float uMoveSpace;
uniform float uTime;

void main () {
    vec4 posXColor = texture2D(uDataTexture, aTexCoord);
    vec4 posYColor = texture2D(uDataTexture, aTexCoord + vec2(0.5, 0.0));
    vec4 rotColor = texture2D(uDataTexture, aTexCoord + vec2(0.0, 0.5));

    vec4 dataLifeOffset = texture2D(uRandomSeedTexture, aTexCoord + vec2(0.0, 0.5));
    vec4 dataLife = texture2D(uRandomSeedTexture, aTexCoord + vec2(0.5, 0.5));

    float lifeOffset = color2float(dataLifeOffset.rgb);
    float life = color2float(dataLife.rgb);
    float alpha = 1.0 - mod(uTime - lifeOffset, life) / life;
    vAlpha = clamp(alpha - 0.05, 0.0, 1.0);

    float posXValue = rawToReal(color2float(posXColor.rgb));
    float posYValue = rawToReal(color2float(posYColor.rgb));
    float rotValue = rawToReal(color2float(rotColor.rgb));

    vec2 vertexPos = rotate(aPosition.xy, -rotValue * DEG_TO_RAD);
    vertexPos.x += posXValue - 0.5 * uScreenSize.x;
    vertexPos.y += posYValue - 0.5 * uScreenSize.y;
    
    vec4 vPosition = vec4(vertexPos, 0.0, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * vPosition;

    vTexCoord = aTexCoord;
}
`;

const particleDrawFrag = `
precision mediump float;

varying vec2 vTexCoord;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(vec3(vAlpha * 0.3), 1.0);
}
`;

export default function P5Hero() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		let instance: p5 | null = null;
		let showParticleTexture = false;
		let isA = false;

		const sketch = (s: p5) => {
			let particlePosTexture: any;
			let steamShader: any;
			let testImg: any;
			let texture_particleDataA: any;
			let texture_particleDataB: any;
			let texture_initialData: any;
			let texture_randomSeed: any;
			let shader_particleDataA: any;
			let shader_particleDataB: any;
			let bigTriangleGeometryA: any;
			let bigTriangleGeometryB: any;
			let shader_drawParticle: any;
			let geometry_particles: any;
			let _canvas: any;

			s.setup = async () => {
				const canvas = s.createCanvas(s.windowWidth, s.windowHeight);
				canvas.parent(containerRef.current!);
				canvas.elt.style.position = "fixed";
				canvas.elt.style.top = "0";
				canvas.elt.style.left = "0";
				canvas.elt.style.zIndex = "0";
				canvas.elt.style.pointerEvents = "none";
				s.background(0);
				s.frameRate(30);

				_canvas = s.createGraphics(s.width, s.height, s.WEBGL);
				_canvas.background(s.random(100, 500));
				_canvas.noStroke();
				shader_drawParticle = _canvas.createShader(
					particleDrawVert,
					particleDrawFrag
				);

				initTextures();
				initModels();
				drawStart();
			};

			function initTextures() {
				texture_initialData = s.createGraphics(512, 512, s.WEBGL);
				texture_initialData.noSmooth();
				texture_initialData.textureWrap(s.CLAMP, s.CLAMP);
				texture_initialData.setAttributes({
					alpha: true,
					antialias: false,
				});
				texture_initialData.background(30);

				texture_randomSeed = s.createGraphics(512, 512, s.WEBGL);
				texture_randomSeed.noSmooth();
				texture_randomSeed.textureWrap(s.CLAMP, s.CLAMP);
				texture_randomSeed.setAttributes({
					alpha: true,
					antialias: false,
				});
				texture_randomSeed.background(30);

				texture_particleDataA = s.createGraphics(512, 512, s.WEBGL);
				texture_particleDataB = s.createGraphics(512, 512, s.WEBGL);
				texture_particleDataA.noSmooth();
				texture_particleDataB.noSmooth();
				texture_particleDataA.textureWrap(s.CLAMP, s.CLAMP);
				texture_particleDataB.textureWrap(s.CLAMP, s.CLAMP);
				texture_particleDataA.setAttributes({
					alpha: true,
					antialias: false,
				});
				texture_particleDataB.setAttributes({
					alpha: true,
					antialias: false,
				});

				shader_particleDataA = texture_particleDataA.createShader(
					particleMoveVert,
					particleMoveFrag
				);
				shader_particleDataB = texture_particleDataB.createShader(
					particleMoveVert,
					particleMoveFrag
				);

				for (let x = 0; x < 256; x++) {
					for (let y = 0; y < 256; y++) {
						const xRatio = x / 256;
						const yRatio = y / 256;

						const xPos = Math.floor(xRatio * s.width);
						const yPos = Math.floor(yRatio * s.height);

						const storeX = realToRaw(xPos);
						const storeY = realToRaw(yPos);

						const packedX = pack3(storeX);
						const packedY = pack3(storeY);

						const rot = s.random(0, 360);
						const packRot = pack3(realToRaw(rot));

						const initialVel = s.random(1.0, 200.0);
						const packVel = pack3(realToRaw(initialVel));

						texture_initialData.noStroke();
						texture_initialData.fill(255, 0, 0);
						texture_initialData.rect(x - 256, y - 256, 1, 1);

						texture_initialData.fill(packedY[0], packedY[1], packedY[2]);
						texture_initialData.rect(x, y - 256, 1, 1);

						texture_initialData.fill(packRot[0], packRot[1], packRot[2]);
						texture_initialData.rect(x - 256, y, 1, 1);

						texture_initialData.fill(packVel[0], packVel[1], packVel[2]);
						texture_initialData.rect(x, y, 1, 1);

						const randomSeedValue = Math.floor(s.random(0, 65535));
						const packedRandomValue = pack3(randomSeedValue);

						const initalLife = Math.floor(s.random(0, 300));
						const particleLife = Math.floor(s.random(15, 90));

						const packedInitalLife = pack3(initalLife);
						const packedParticleLife = pack3(particleLife);

						texture_randomSeed.noStroke();
						texture_randomSeed.fill(
							packedRandomValue[0],
							packedRandomValue[1],
							packedRandomValue[2]
						);
						texture_randomSeed.rect(x - 256, y - 256, 1, 1);

						texture_randomSeed.fill(
							packedInitalLife[0],
							packedInitalLife[1],
							packedInitalLife[2]
						);
						texture_randomSeed.rect(x - 256, y, 1, 1);

						texture_randomSeed.fill(
							packedParticleLife[0],
							packedParticleLife[1],
							packedParticleLife[2]
						);
						texture_randomSeed.rect(x, y, 1, 1);
					}
				}
			}

			function initModels() {
				const particleModel = new NYModel("particle");

				const particleW = 1;
				const particleH = 2;

				for (let x = 0; x < 256; x++) {
					for (let y = 0; y < 256; y++) {
						const uvX = (x + 0.5) / 512;
						const uvY = (y + 0.5) / 512;

						const quadUv = [uvX, uvY];
						const p1x = -0.5 * particleW;
						const p1y = -0.5 * particleH;
						const p2x = +0.5 * particleW;
						const p2y = -0.5 * particleH;
						const p3x = +0.5 * particleW;
						const p3y = +0.5 * particleH;
						const p4x = -0.5 * particleW;
						const p4y = +0.5 * particleH;

						particleModel.addTriangle(
							p1x,
							p1y,
							p2x,
							p2y,
							p3x,
							p3y,
							quadUv,
							quadUv,
							quadUv
						);
						particleModel.addTriangle(
							p1x,
							p1y,
							p3x,
							p3y,
							p4x,
							p4y,
							quadUv,
							quadUv,
							quadUv
						);
					}
				}

				geometry_particles = particleModel.build(_canvas._renderer, s);

				const bigTriangleModelA = new NYModel("screenA");
				bigTriangleModelA.addFullScreenTriangle(512, 512);
				bigTriangleGeometryA = bigTriangleModelA.build(
					texture_particleDataA._renderer,
					s
				);

				const bigTriangleModelB = new NYModel("screenB");
				bigTriangleModelB.addFullScreenTriangle(512, 512);
				bigTriangleGeometryB = bigTriangleModelB.build(
					texture_particleDataB._renderer,
					s
				);
			}

			function drawStart() {
				texture_particleDataA.shader(shader_particleDataA);
				shader_particleDataA.setUniform("uDataTexture", texture_initialData);
				shader_particleDataA.setUniform(
					"uRandomSeedTexture",
					texture_randomSeed
				);
				shader_particleDataA.setUniform("uScreenSize", [
					_canvas.width,
					_canvas.height,
				]);
				shader_particleDataA.setUniform("uTime", s.frameCount);
				texture_particleDataA.model(bigTriangleGeometryA);

				texture_particleDataB.shader(shader_particleDataB);
				shader_particleDataB.setUniform("uDataTexture", texture_initialData);
				shader_particleDataB.setUniform("uScreenSize", [
					_canvas.width,
					_canvas.height,
				]);
				shader_particleDataB.setUniform(
					"uRandomSeedTexture",
					texture_randomSeed
				);
				shader_particleDataB.setUniform("uTime", s.frameCount);
				texture_particleDataB.model(bigTriangleGeometryB);
			}

			s.draw = () => {
				if (isA) {
					texture_particleDataA.shader(shader_particleDataA);
					shader_particleDataA.setUniform("uDataTexture", texture_particleDataB);
					shader_particleDataA.setUniform(
						"uRandomSeedTexture",
						texture_randomSeed
					);
					shader_particleDataA.setUniform("uScreenSize", [
						_canvas.width,
						_canvas.height,
					]);
					shader_particleDataA.setUniform("uTime", s.frameCount);
					texture_particleDataA.model(bigTriangleGeometryA);
				} else {
					texture_particleDataB.shader(shader_particleDataB);
					shader_particleDataB.setUniform(
						"uDataTexture",
						texture_particleDataA
					);
					shader_particleDataB.setUniform("uScreenSize", [
						_canvas.width,
						_canvas.height,
					]);
					shader_particleDataB.setUniform(
						"uRandomSeedTexture",
						texture_randomSeed
					);
					shader_particleDataB.setUniform("uTime", s.frameCount);
					texture_particleDataB.model(bigTriangleGeometryB);
				}

				_canvas.background(0);
				_canvas.blendMode(s.ADD);
				_canvas.shader(shader_drawParticle);
				shader_drawParticle.setUniform("uScreenSize", [
					_canvas.width,
					_canvas.height,
				]);
				shader_drawParticle.setUniform("uDataTexture", texture_initialData);
				shader_drawParticle.setUniform(
					"uRandomSeedTexture",
					texture_randomSeed
				);
				shader_drawParticle.setUniform("uTime", s.frameCount);

				if (isA) {
					shader_drawParticle.setUniform("uDataTexture", texture_particleDataA);
				} else {
					shader_drawParticle.setUniform("uDataTexture", texture_particleDataB);
				}

				_canvas.model(geometry_particles);

				s.image(_canvas, 0, 0);

				if (showParticleTexture) {
					s.image(texture_initialData, 0, 0, 256, 256);

					if (isA) {
						s.image(texture_particleDataA, 256, 0, 256, 256);
					} else {
						s.image(texture_particleDataB, 256, 0, 256, 256);
					}

					s.image(texture_randomSeed, 512, 0, 256, 256);
				}

				isA = !isA;
			};

			s.keyPressed = (e: KeyboardEvent) => {
				if (e.key == "t" || e.key == "T") {
					showParticleTexture = !showParticleTexture;
				}
			};

			s.windowResized = () => {
				s.resizeCanvas(s.windowWidth, s.windowHeight);
				if (_canvas) {
					_canvas.resizeCanvas(s.width, s.height);
				}
				const canvas = s.canvas as any;
				if (canvas && canvas.elt) {
					canvas.elt.style.position = "fixed";
					canvas.elt.style.top = "0";
					canvas.elt.style.left = "0";
					canvas.elt.style.zIndex = "0";
					canvas.elt.style.pointerEvents = "none";
				}
			};
		};

		(async () => {
			const { default: P5 } = await import("p5");
			if (!containerRef.current) return;
			instance = new P5(sketch, containerRef.current);
		})();

		return () => {
			instance?.remove();
			instance = null;
		};
	}, []);

	return (
		<div
			ref={containerRef}
			class="fixed inset-0 w-full h-full z-0"
		/>
	);
}
