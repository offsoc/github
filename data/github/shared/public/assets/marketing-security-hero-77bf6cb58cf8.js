"use strict";(globalThis.webpackChunk=globalThis.webpackChunk||[]).push([["marketing-security-hero"],{52455:(e,t,i)=>{let o;var s=i(39437);let r=new class Common{init(e,t){this.pixelRatio=Math.min(1.5,window.devicePixelRatio),this.renderer=new s.JeP({alpha:!0,canvas:t}),this.$canvas=t,this.$wrapper=e,this.$wrapper.appendChild(this.$canvas),this.renderer.setPixelRatio(this.pixelRatio),this.clock=new s.zD7,this.clock.start(),this.resize()}resize(){if(!this.$wrapper)return;let e=this.$wrapper.getBoundingClientRect();this.wrapperOffset.set(e.left,e.top);let t=e.width,i=e.height;this.screenSize_old.copy(this.screenSize),this.screenSize.set(t,i),this.fbo_screenSize.set(t*this.pixelRatio,i*this.pixelRatio),this.aspect=t/i,this.camera.aspect=this.camera2.aspect=this.aspect,window.innerWidth<=543?this.cameraZ=.7:this.cameraZ=.9,this.camera.updateProjectionMatrix(),this.camera2.updateProjectionMatrix(),this.renderer?.setSize(this.screenSize.x,this.screenSize.y)}getEase(e=1){return Math.min(1,e*this.delta)}update(){let e=this.clock?.getDelta();this.delta=e||0,this.time+=this.delta}constructor(){this.screenSize=new s.I9Y,this.screenSize_old=new s.I9Y,this.isMobile=!1,this.wrapperOffset=new s.I9Y,this.pixelRatio=1,this.aspect=1,this.center=new s.Pq0(0,0,0),this.cameraZ=.9,this.camera=new s.ubm(80,this.aspect,.1,50),this.camera2=new s.ubm(80,this.aspect,.1,50),this.fbo_screenSize=new s.I9Y,this.time=0,this.delta=0,this.$wrapper=null,this.delay={bg:600,middle:200,main:600},this.camera.position.set(0,0,this.cameraZ),this.camera2.position.set(0,0,this.cameraZ),this.fbo_screenSize=new s.I9Y}};var a=i(17888),n=i(9289);let l=new class Assets{load(e){Promise.all([...this.loadImages(),...this.loadGltfs(),...this.loadSvgs()]).then(()=>{e&&e()})}loadGltfs(){let e=new a.B;return Object.values(this.gltfs).map(t=>new Promise((i,o)=>{e.load(t.src,e=>{t.scene=e.scene,i(e.scene)},void 0,e=>o(e))}))}loadImages(){let e=new s.Tap;return Object.values(this.images).map(t=>new Promise((i,o)=>{e.load(t.src,e=>{t.texture=e,e.flipY=t.flipY,i(e)},void 0,e=>o(e))}))}loadSvgs(){let e=new n.c;return Object.values(this.svgs).map(t=>new Promise(i=>{e.load(t.src,e=>{let o=e.paths;t.paths=o,i(o)})}))}constructor(){let e="/images/modules/site/security-hero/";this.gltfs={shield:{src:`${e}/shield.glb`,scene:null}},this.images={matcap4:{src:`${e}textures/matcap4.jpg`,texture:null,flipY:!0}},this.svgs={gitlines1:{src:`${e}nodes/s-gitlines1.svg`,paths:null},gitlines2:{src:`${e}nodes/s-gitlines2.svg`,paths:null}}}},u={utils:`
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

float random (in vec2 _st) {
  return fract(sin(dot(_st.xy,
  vec2(12.9898,78.233)))*
      43758.5453123);
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise2D(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
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


//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise3D(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

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

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

//	Simplex 4D Noise
//	by Ian McEwan, Ashima Arts
//
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

  return p;
}

float snoise4D(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

`,blurFrag:`
uniform sampler2D uDiffuse;
uniform vec2 uStep;
uniform vec2 uStepSize;
uniform float uWeight[BLUR_RADIUS];


varying vec2 vUv;

void main() {
  float count =  float(BLUR_RADIUS) - 1.0;

  vec4 color = vec4(0.0);
  vec4 sum = vec4(0.0);
  float w;
  float sumW = 0.0;
  float actualWeight;

  vec2 pxstep = uStep;

  // loop
  for(int i = 0; i <  BLUR_RADIUS - 1; i++){
    w = uWeight[i];

    color = texture2D( uDiffuse, vUv - count * pxstep * uStepSize);
    actualWeight = w * color.a;
    sum.rgb += color.rgb * actualWeight;
    sum.a += color.a * w;
    sumW += actualWeight;

    color = texture2D( uDiffuse, vUv + count * pxstep * uStepSize);
    actualWeight = w * color.a;
    sum.rgb += color.rgb * actualWeight;
    sum.a += color.a * w;
    sumW += actualWeight;

    count--;
  }

  w = uWeight[BLUR_RADIUS - 1];

  color = texture2D( uDiffuse, vUv );
  actualWeight = w * color.a;
  sum.rgb += color.rgb * actualWeight;
  sum.a += color.a * w;
  sumW += actualWeight;

  gl_FragColor = vec4(sum.rgb / sumW, sum.a);
}
`,circleFrag:`
uniform vec2 uResolution;
uniform float uTime;
uniform float uBeatSpeed;
varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 3

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float easeOutCubic( float t ) {
    float t1 = t - 1.0;
    return t1 * t1 * t1 + 1.0;
}

float easeInOutCubic( float t ) {
    return t < 0.5 ? 4.0 * t * t * t : ( t - 1.0 ) * ( 2.0 * t - 2.0 ) * ( 2.0 * t - 2.0 ) + 1.0;
}


void main(){
  vec2 st = (vUv - 0.5)  * (uResolution / min(uResolution.x, uResolution.y)) + 0.5;

  vec4 color = vec4(vec3(0.0), 1.0);

  vec2 torusSt = st - 0.5;
  float f = fbm(torusSt * 10.0 + uTime * 2.0);
  torusSt *= (1.0 + f * 1.0);
  float torusL = length(torusSt);

  float torusThickness = 0.1;

  float radiusProgress = easeInOutCubic(fract(uTime * uBeatSpeed));

  float radius = mix(torusThickness, 6.0, radiusProgress);
  float torusAlpha = smoothstep(radius + 0.2, radius, torusL) * smoothstep(radius - 0.2, radius, torusL);
  color.rgb = mix(color.rgb, vec3(1.0), torusAlpha * torusAlpha); //* dotAlpha;


  gl_FragColor = color;
}
`,haloOrbFrag:`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec4 uRandom;
uniform vec4 uColorMap;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

void main(){

  vec2 st = gl_FragCoord.xy / uResolution.xy;
  float l = length(st - 0.5) * 2.0;
  float noise = snoise3D(vec3(vUv, uTime * 0.05 + uRandom.y * 10.0)) * 0.5 + 0.5;
  vec3 color;

  color = mix(uColor1, uColor2, smoothstep(0.0, uColorMap.x, noise));
  color = mix(color, uColor3, smoothstep(uColorMap.x, uColorMap.z, noise));
  color = mix(color, uColor4, smoothstep(uColorMap.y, 1.0, noise));

  vec3 hsv = rgb2hsv(color);
  hsv.x -= 0.03;
  hsv.g += mix(0.5, -0.1, smoothstep(0.1, 0.4, l));
  hsv.b += mix(0.0, 0.3, l);
  color = hsv2rgb(hsv);


  float alpha = 1.0;

  float uvl = length(vUv - 0.5) * 2.0;
  alpha = smoothstep(0.8, 0.0, uvl);

  alpha = alpha * 0.35 + pow(alpha, 6.0) * 0.3;

  gl_FragColor = vec4(color, alpha);
}
`,haloOrbVert:`
varying vec2 vUv;
uniform vec4 uRandom;
uniform float uTime;
uniform float uBeatSpeed;
uniform vec4 uProgress;

float easeOutCubic( float t ) {
    float t1 = t - 1.0;
    return t1 * t1 * t1 + 1.0;
}

float easeInOutCubic( float t ) {
    return t < 0.5 ? 4.0 * t * t * t : ( t - 1.0 ) * ( 2.0 * t - 2.0 ) * ( 2.0 * t - 2.0 ) + 1.0;
}



void main() {
  vUv = uv;

  vec3 pos = position * mix(0.6, 0.8, cos(uTime + uRandom.x * 6.0) * 0.5 + 0.5);

  float scale = fract(uTime * uBeatSpeed - 0.1);
  scale = easeInOutCubic(smoothstep(0.0, 0.25, scale)) * smoothstep(1.0, 0.8, scale);
  scale = mix(0.5, 1.0, scale) * uProgress.x;
  vec4 worldPosition = modelMatrix * vec4(pos * scale, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`,lineFrag:`
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec4 uColorMap;
uniform vec2 uAlphaMapVector;
uniform vec4 uGradient;

uniform vec2 uResolution;
uniform float uTime;
uniform float uAlpha;
uniform vec4 uProgress;
uniform float uBlurRangeMin;

varying vec2 vIndex;
varying float vX;

float parabola(float t){
  return -pow(2.0 * t - 1.0, 2.0) + 1.0;
}

float convertNormal(float minT, float maxT, float t){
  return max(0.0, min(1.0, (t - minT) / (maxT - minT)));
}

// float calcProgress(float p, float index, float pOffset){
//   float _progress = mix(-pOffset, 1.0 + pOffset, p);
//   return smoothstep(-pOffset * (1.0 - index), 1.0 + pOffset * index, _progress);
// }

vec4 calcProgress(vec4 p, float index, vec4 pOffset){
  vec4 _p = mix(-pOffset, 1.0 + pOffset, p);
  return smoothstep(vec4(index), vec4(index) + pOffset, _p);
}

float calcProgress(float p, float index, float pOffset){
  float _p = mix(-pOffset, 1.0 + pOffset, p);
  return smoothstep(index, index + pOffset, _p);
}

void main(){
  vec4 progress = calcProgress(uProgress, vIndex.x, vec4(0.05, 0.6, 0.1, 0.1));
  vec2 st = gl_FragCoord.xy / uResolution;

  float alpha = pow(1.0 - abs((vX - 0.5) * 2.0), 2.0);
  alpha = smoothstep(uBlurRangeMin, 1.0, alpha) * uAlpha;

  alpha *= mix(uAlphaMapVector.x, 1.0, convertNormal(uGradient.x, uGradient.y, vIndex.x));
  alpha *= mix(1.0, uAlphaMapVector.y, convertNormal(uGradient.z, uGradient.w, vIndex.x));
  alpha *= progress.x;
  alpha *= mix(parabola(vIndex.x), 1.0, uProgress.z);

  vec3 color = mix(vec3(0.2), vec3(1.0), progress.y);

  if(alpha < 0.001) discard;


  gl_FragColor = vec4(color, alpha);
}`,lineVert:`
attribute vec2 aindex;
attribute vec3 alineposition;
attribute vec3 positionprevious;
attribute vec3 positionnext;
attribute vec2 atangentscale;
uniform float uSegmentNum;
uniform float uTime;
uniform float uLineWidth;
uniform float uScale;
uniform vec4 uRandom;

const float PI = 3.14159265359;

varying vec2 vIndex;
varying float vX;

mat3 lookAtMatrix(vec3 tangent, vec3 up){
    vec3 zaxis = -tangent;
    vec3 xaxis = normalize(cross(up, zaxis));
    vec3 yaxis = cross(zaxis, xaxis);

    return mat3(
        xaxis, yaxis, zaxis
    );
}

void main(){
  vec3 prevP = positionprevious * uScale;
  vec3 currentP = position * uScale;
  vec3 nextP = positionnext * uScale;

  vec3 dist1 = normalize(prevP - currentP);
  vec3 dist2 = normalize(currentP - nextP);

  vec3 tangent = normalize(dist1 * atangentscale.x + dist2 * atangentscale.y);

  vec3 up = vec3(0.0, 0.0, -1.0);

  vec3 pos = vec3(alineposition.x * uLineWidth, 0.0, 0.0);

  pos = lookAtMatrix(tangent, up) * pos;
  pos += currentP;

  vX = alineposition.x + 0.5;

  vIndex = aindex;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}`,maskImageFrag:`
uniform sampler2D uGitlines;
uniform sampler2D uShield;
uniform sampler2D uCircle;
uniform vec2 uResolution;
varying vec2 vUv;

void main(){
  vec4 shield = texture2D(uShield, (vUv - 0.5) * 1.0 + 0.5);
  vec4 gitlines = texture2D(uGitlines, vUv);

  vec4 maskImage = vec4(0.0);

  maskImage.rgb = gitlines.rgb;
  maskImage.a = mix(gitlines.a, 0.0, shield.a);

  maskImage.rgb = mix(vec3(1.0), maskImage.rgb, maskImage.a);

  float circle = texture2D(uCircle, vUv).r;
  vec4 color = maskImage;

  color.a *= circle;
  color.a += shield.a * 0.05;

  color.rgb += maskImage.rgb * (1.0 - color.a);

  color.rgb = mix(vec3(0.0), color.rgb, color.a);

  float gray = color.r + color.g + color.b;


  color.rgb = vec3(gray);
  color.a = 1.0;

  gl_FragColor = color;
}`,outputFrag:`
uniform sampler2D uShield;
uniform sampler2D uGitlines;
uniform sampler2D uMask;
uniform sampler2D uBlur;
uniform sampler2D uHalo;
uniform sampler2D uShieldBack;
uniform float uTime;
uniform float uBeatSpeed;
uniform vec4 uProgress;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

uniform vec3 uBgColor;
uniform vec3 uGlowColor;
uniform vec2 uResolution;
varying vec2 vUv;


void main(){
  vec2 st = (vUv - 0.5) * uResolution / min(uResolution.x, uResolution.y);
  float gitlineColorMap = length(st);

  vec3 gitlineColor = mix(uColor1, uColor2, smoothstep(0.1, 0.3, gitlineColorMap));
  gitlineColor = mix(gitlineColor, uColor3, smoothstep(0.3, 0.5, gitlineColorMap));
  gitlineColor = mix(gitlineColor, uColor4, smoothstep(0.5, 1.0, gitlineColorMap));

  vec4 shield = texture2D(uShield, vUv);
  vec4 gitlines = texture2D(uGitlines, vUv);
  vec4 shieldBack = texture2D(uShieldBack, vUv);

  vec4 halo = texture2D(uHalo, vUv);

  float beat = fract(uTime * uBeatSpeed - 0.2);


  float haloIntensity = smoothstep(0.0, 0.2, beat);
  float haloScale = mix(1.75, 1.0, haloIntensity);

  vec3 grayShield = vec3(shield.r + shield.g + shield.b) * 0.333;

  float mask = texture2D(uMask, vUv).r;
  float blur = texture2D(uBlur, vUv).r;
  blur = pow(blur, 2.0) * 1.4 + pow(blur, 3.0) * 1.5 + blur * 0.8;
  mask += blur * 1.5;

  mask *= uProgress.x;

  gitlineColor = mix(vec3(0.0), gitlineColor, gitlines.r);

  vec3 color = vec3(0.0);
  color = mix(uBgColor, gitlineColor, 0.3 * smoothstep(0.0, 0.2, gitlines.a));

  vec3 glowColor = uGlowColor;
  vec3 hsv = rgb2hsv(glowColor);
  hsv.x += 0.1 * blur + mask * mask * 0.05;
  hsv.y += 0.1 * mask + 0.2;

  glowColor = hsv2rgb(hsv);
  color = color + halo.rgb * haloScale * halo.a + glowColor * mask;
  color = mix(color, shield.rgb, shield.a);

  float outlineAlpha = shieldBack.a - shield.a;
  float outlineIntensity = shieldBack.r;

  color += outlineAlpha * outlineIntensity;
  color = mix(uBgColor, color, smoothstep(0.2, 0.5, vUv.y));

  gl_FragColor = vec4(color, 1.0);
}
`,screenVert:`
varying vec2 vUv;

void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
  gl_Position.z = 1.0;
}`,shield_backFrag:`
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uProgress;
const float PI = 3.14159265359;

varying vec3 vNormal;
varying vec3 vViewPosition;

float fresnelEffect(float power){
  return pow((1.0 - clamp(dot(normalize(vNormal), normalize(-vViewPosition)), 0.0, 1.0)), power);
}


void main(){
  vec2 st = (gl_FragCoord.xy / uResolution);
  st -= 0.5;
  st *= (uResolution / min(uResolution.x, uResolution.y));
  float radian = (atan(st.y, st.x) / PI + uTime * 0.25);
  float intensity = fract(radian);
  intensity = smoothstep(mix(0.0, 0.4, uProgress.y), 0.0, intensity) * smoothstep(0.0, 0.05, intensity);

  float fresnel = 1.0 - fresnelEffect(0.7);
  intensity *= smoothstep(0.0, 0.4, fresnel);


  gl_FragColor = vec4(vec3(intensity), 1.0);
}`,shield_backVert:`
varying vec3 vNormal;
varying vec3 vViewPosition;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 viewPosition;

  viewPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
  vViewPosition = viewPosition.xyz;


  gl_Position = projectionMatrix * viewPosition;
}
`,shieldFrag:`
uniform sampler2D uMatcap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uLightColor;
uniform float uTime;
uniform vec3 uRandom;
uniform vec3 uBgColor;
uniform vec4 uColorMap;
uniform vec3 uLightPos;
uniform float uLightIntensity;
uniform vec2 uBgRange;
uniform vec4 uProgress;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vPosition;
varying vec3 vWorldPos;

float fresnelEffect(float power){
  return pow((1.0 - clamp(dot(normalize(vNormal), normalize(-vViewPosition)), 0.0, 1.0)), power);
}

mat2 rotate2D(float r){
  float c = cos(r);
  float s = sin(r);
  return mat2(c, s, -s, c);
}

void main(){
  float light = smoothstep(0.0, 0.8, dot(normalize(vNormal), normalize(uLightPos - vWorldPos)));
  vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );
	vec3 y = cross( viewDir, x );

	vec2 uv = vec2( dot( x, vNormal ), dot( y, vNormal ) ) * 0.495 + 0.5;

  uv -= 0.5;
  uv.x *= -1.0;
  uv += 0.5;

  vec3 light3 = texture2D(uMatcap, uv).rgb;
  float matLight = light3.b;
  float noise_matLight = snoise4D(vec4(vPosition * 0.8, uTime * 0.025 + uRandom.x * 10.0)) * 0.5 + 0.5;

  matLight = mix(
    pow(matLight, 4.0), pow(matLight, 2.0), noise_matLight
  );

  float spotLight = 0.0;

  float noise = snoise4D(vec4(vPosition * 0.7, uTime * 0.1 + uRandom.y * 10.0)) * 0.5 + 0.5;
  vec3 color;

  // shield

  #if (CHECK == 1)
    // noise = cos(uTime * 0.1 + uRandom.x * 10.0) * 0.5 + 0.5;
    color = mix(uColor1, uColor2, noise);
    color = pow(color, vec3(0.1));
  #else
    color = mix(uColor1, uColor2, smoothstep(0.0, uColorMap.x, noise));
    color = mix(color, uColor3, smoothstep(uColorMap.x, uColorMap.z, noise));
    color = mix(color, uColor4, smoothstep(uColorMap.y, 1.0, noise));
  #endif
  // color = mix(vec3(0.0), color, light);


  float f2 = 1.0 - fresnelEffect(0.7);

  vec3 lightDir = uLightPos - vWorldPos;
  float l = length(lightDir);
  lightDir = normalize(lightDir);

  spotLight = clamp(dot(vNormal, lightDir), 0.0, 1.0);
  spotLight = (pow(spotLight, 3.0) * 0.2 + pow(spotLight, 10.0) * 0.1);

  #if (CHECK == 0)
  color = mix(color, uBgColor, smoothstep(0.5, 0.8, (vPosition.x - vPosition.y) * 0.5 + 0.49) * f2);
  color += smoothstep(0.2, 0.46, -vPosition.x + vPosition.y + vPosition.z * 3.0) * 0.8 * mix(0.5, 0.8, noise_matLight);
  #endif

  color = mix(color, pow(color, vec3(2.0)), light3.g);
  float f = fresnelEffect(1.5);
  f *= 1.2;

  color = mix(color, uLightColor, f);
  color = mix(color, vec3(1.0), smoothstep(0.0, 0.7, matLight));
  color *= 1.2;

  float alpha = 1.0;
  #if(CHECK == 0)
    alpha = smoothstep(0.9, 0.75, f);
  #else
    alpha = smoothstep(0.25, 0.15, f);
  #endif

  vec3 bgColorHSV = rgb2hsv(uBgColor);

  vec3 hsv = rgb2hsv(color);
  hsv.r = mix(bgColorHSV.r, hsv.r, uProgress.x);
  hsv.g = mix(mix(bgColorHSV.g, 0.0, light), hsv.g, uProgress.x);
  hsv.b = mix(mix(bgColorHSV.b, 1.0, light), hsv.b, uProgress.z);
  color = hsv2rgb(hsv);


  gl_FragColor = vec4(color, alpha);
}
`,shieldVert:`
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vPosition;
varying vec3 vWorldPos;

varying vec2 vUv;


void main(){
  vNormal = normalize(normalMatrix * normal);

  vec4 worldPosition;
  vec4 viewPosition;

  worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPosition.xyz;
  viewPosition = viewMatrix * worldPosition;
  vPosition = worldPosition.xyz / modelMatrix[3][3];

  vViewPosition = viewPosition.xyz;
  vUv = uv;

  gl_Position = projectionMatrix * viewPosition;
}
`},c={uColor1:{value:new s.Q1f(617438)},uColor2:{value:new s.Q1f(1314815)},uColor3:{value:new s.Q1f(2815)},uColor4:{value:new s.Q1f(7067344)},uLightColor:{value:new s.Q1f(15792127)},uTime:{value:0},uBgColor:{value:new s.Q1f(856343)},uColorMap:{value:new s.IUQ(.4,.7,.8,.95)},uLightPos:{value:new s.Pq0(0,0,1.5)},uLightIntensity:{value:0},uBeatSpeed:{value:.25}},h=class Shield{init(){this.createMesh()}createMesh(){this.uniforms.uMatcap&&l.images.matcap4&&l.images.matcap4.texture&&(this.uniforms.uMatcap.value=l.images.matcap4.texture),l.gltfs.shield?.scene&&l.gltfs.shield.scene.traverse(e=>{if("Mesh"===e.type){let t=e.geometry,i=this.createMaterial({isCheck:"check"===e.name}),o=new s.eaF(t,i);this.group.add(o);let r=this.createMaterial_back(),a=new s.eaF(t,r);a.scale.set(1.03,1.03,1.03),this.shieldBackGroup.add(a)}})}createMaterial({isCheck:e}){let t={...this.uniforms};return new s.BKk({vertexShader:u.shieldVert,fragmentShader:u.utils+u.shieldFrag,uniforms:t,transparent:!0,defines:{CHECK:e?1:0}})}createMaterial_back(){return new s.BKk({vertexShader:u.shield_backVert,fragmentShader:u.utils+u.shield_backFrag,uniforms:this.uniforms,transparent:!0})}update(){}constructor(){this.group=new s.YJl,this.progress=new s.IUQ(0,0,0,0),this.lightPos=new s.Pq0(-.5,1,-2),this.shieldBackGroup=new s.YJl,this.uniforms={...c,uMatcap:{value:null},uRandom:{value:new s.Pq0(Math.random(),Math.random(),Math.random())},uLightPos:{value:this.lightPos},uResolution:{value:r.fbo_screenSize},uProgress:{value:this.progress}}}},v=new class MouseMng{init(){window.addEventListener("mousemove",e=>{let t=(e.clientX-r.wrapperOffset.x)/r.screenSize.x;t=(t-.5)*2;let i=(e.clientY-r.wrapperOffset.y)/r.screenSize.y;i=(.5-i)*2,this.updateMousePos(t,i)}),window.addEventListener("touchstart",e=>{if(e.touches[0]){let t=(e.touches[0].clientX-r.wrapperOffset.x)/r.screenSize.x;t=(t-.5)*2;let i=(e.touches[0].clientY-r.wrapperOffset.y)/r.screenSize.y;i=(.5-i)*2,this.updateMousePos(t,i)}})}updateMousePos(e,t){for(let i of(this.pos.target.set(Math.max(-1,Math.min(1,e)),Math.max(-1,Math.min(1,t))),this.mousemoveFuncs))i()}addMousemoveFunc(e){this.mousemoveFuncs.push(e)}resize(){}update(){let e=this.pos.current.clone(),t=this.pos.current2.clone();this.pos.current.lerp(this.pos.target,r.getEase(2)),this.pos.current2.lerp(this.pos.target,r.getEase(1.5)),this.pos.diff.subVectors(this.pos.current,e),this.pos.diff2.subVectors(this.pos.current2,t)}constructor(){this.originalPos=new s.I9Y,this.mousemoveFuncs=[],this.pos={target:new s.I9Y,current:new s.I9Y,current2:new s.I9Y,diff:new s.I9Y,diff2:new s.I9Y}}},m=new s.I9Y(1600,1e3),d=class CustomLineGeometry extends s.LoY{restrictT(e){return this.isClosed&&(e-=Math.floor(e)),e}getPoint(e){e=Math.min(1,Math.max(0,e));let t=this.path.getPoint(e);return{x:t.x/m.x-.5,y:-(t.y/m.y-.5)*(m.y/m.x)}}constructor(e=1,t,i,o,r){super(),this.isClosed=!1,this.type="CustomLineGeometry",this.isClosed=r,this.path=t,this.pathDist=i,this.lIndex=o,this.parameters={width:1,height:1,widthSegments:1,heightSegments:e};let a=Math.floor(1),n=Math.floor(e),l=a+1,u=n+1,c=1/a,h=1/n,v=[],m=[],d=[],p=[],f=[],x=[],g=[];for(let e=0;e<u;e++){let t=e*h-.5,i=0,s=0;s=e/(u-1),i=this.pathDist>0?s:1-s;let r=this.restrictT(i-1/u),a=this.restrictT(i),n=this.restrictT(i+1/u),v=this.getPoint(r),w=this.getPoint(a),b=this.getPoint(n),y=[1,1];this.isClosed||(y[0]=r<0?0:1,y[1]=n>1?0:1);for(let e=0;e<l;e++){let i=e*c-.5;x.push(i,-t,0),m.push(w.x,w.y,0),d.push(v.x,v.y,0),p.push(b.x,b.y,0),g.push(s,o),(0===y[0]||1===y[0])&&f.push(y[0]),(0===y[1]||1===y[1])&&f.push(y[1])}}for(let e=0;e<n;e++)for(let t=0;t<a;t++){let i=t+l*e,o=t+l*(e+1),s=t+1+l*(e+1),r=t+1+l*e;v.push(i,o,r),v.push(o,s,r)}this.setIndex(v),this.setAttribute("position",new s.qtW(m,3)),this.setAttribute("alineposition",new s.qtW(x,3)),this.setAttribute("aindex",new s.qtW(g,2)),this.setAttribute("atangentscale",new s.qtW(f,2)),this.setAttribute("positionprevious",new s.qtW(d,3)),this.setAttribute("positionnext",new s.qtW(p,3))}},p={linear:e=>e,easeInSine:e=>-1*Math.cos(Math.PI/2*e)+1,easeOutSine:e=>Math.sin(Math.PI/2*e),easeInOutSine:e=>-.5*(Math.cos(Math.PI*e)-1),easeInQuad:e=>e*e,easeOutQuad:e=>e*(2-e),easeInOutQuad:e=>e<.5?2*e*e:-1+(4-2*e)*e,easeInCubic:e=>e*e*e,easeOutCubic(e){let t=e-1;return t*t*t+1},easeInOutCubic:e=>e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1,easeInQuart:e=>e*e*e*e,easeOutQuart(e){let t=e-1;return 1-t*t*t*t},easeInOutQuart(e){let t=e-1;return e<.5?8*e*e*e*e:1-8*t*t*t*t},easeInQuint:e=>e*e*e*e*e,easeOutQuint(e){let t=e-1;return 1+t*t*t*t*t},easeInOutQuint(e){let t=e-1;return e<.5?16*e*e*e*e*e:1+16*t*t*t*t*t},easeInExpo:e=>0===e?0:Math.pow(2,10*(e-1)),easeOutExpo:e=>1===e?1:-Math.pow(2,-10*e)+1,easeInOutExpo(e){if(0===e||1===e)return e;let t=2*e,i=t-1;return t<1?.5*Math.pow(2,10*i):.5*(-Math.pow(2,-10*i)+2)},easeInCirc:e=>-1*(Math.sqrt(1-e/1*e)-1),easeOutCirc(e){let t=e-1;return Math.sqrt(1-t*t)},easeInOutCirc(e){let t=2*e,i=t-2;return t<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-i*i)+1)},easeInBack:(e,t=1.70158)=>e*e*((t+1)*e-t),easeOutBack(e,t=1.70158){let i=e/1-1;return i*i*((t+1)*i+t)+1},easeInOutBack(e,t=1.70158){let i=2*e,o=i-2,s=1.525*t;return i<1?.5*i*i*((s+1)*i-s):.5*(o*o*((s+1)*o+s)+2)},easeInElastic(e,t=.7){if(0===e||1===e)return e;let i=e/1-1,o=1-t;return-(Math.pow(2,10*i)*Math.sin(2*Math.PI*(i-o/(2*Math.PI)*Math.asin(1))/o))},easeOutElastic(e,t=.7){if(0===e||1===e)return e;let i=1-t,o=2*e;return Math.pow(2,-10*o)*Math.sin(2*Math.PI*(o-i/(2*Math.PI)*Math.asin(1))/i)+1},easeInOutElastic(e,t=.65){if(0===e||1===e)return e;let i=1-t,o=2*e,s=o-1,r=i/(2*Math.PI)*Math.asin(1);return o<1?-(Math.pow(2,10*s)*Math.sin(2*Math.PI*(s-r)/i)*.5):Math.pow(2,-10*s)*Math.sin(2*Math.PI*(s-r)/i)*.5+1},easeOutBounce(e){let t=e/1;if(t<1/2.75)return 7.5625*t*t;if(t<2/2.75){let e=t-1.5/2.75;return 7.5625*e*e+.75}if(t<2.5/2.75){let e=t-2.25/2.75;return 7.5625*e*e+.9375}{let e=t-2.625/2.75;return 7.5625*e*e+.984375}},easeInBounce(e){return 1-this.easeOutBounce(1-e)},easeInOutBounce(e){return e<.5?.5*this.easeInBounce(2*e):.5*this.easeOutBounce(2*e-1)+.5}},f=class Timeline{to(e,t,i,o){return this._to(e,t,i,o),this}_to(e,t,i,o){let s=0;if(isNaN(o)){if(this.animations.length>0){let e=this.animations[this.animations.length-1];e&&(s=e.duration+e.delay)}}else s=o;s+=this.delay;let r={datas:Array.isArray(e)?e:[e],duration:t,easing:i.easing||this.easing,onComplete:i.onComplete,onUpdate:i.onUpdate,values:[],delay:s,properties:i,isStarted:!1};this.animations.push(r);let a=0;for(let e=0;e<this.animations.length;e++){let t=this.animations[e];if(!t)continue;let i=t.duration+t.delay;a<i&&(a=i,this.lastIndex=e),t.isLast=!1}return r}start(){if(-1===this.lastIndex)return;this.startTime=new Date,this.oldTime=new Date;let e=this.animations[this.lastIndex];e&&(e.isLast=!0),window.addEventListener("visibilitychange",this.onVisiblitychange),this.animate()}arrangeDatas(e){let{properties:t,datas:i,values:o}=e;for(let e in t){let s=0,r=[],a=[],n=[];switch(e){case"easing":case"onComplete":case"onUpdate":break;default:for(let o of i)null!==o&&"object"==typeof o&&(r[s]=o[e],a[s]=o[e],n[s]=t[e],s++);o.push({key:e,start:r,current:a,end:n})}}}calcProgress(e,t,i){return Math.max(0,Math.min(1,(i-e)/(t-e)))}calcLerp(e,t,i){return e+(t-e)*i}constructor(e={}){this.animate=()=>{let e=new Date;if(this.isWindowFocus||(this.oldTime=e),this.oldTime){let t=e.getTime()-this.oldTime.getTime();this.time+=t}for(let t of(this.oldTime=e,this.animations)){let{datas:e,duration:i,easing:o,values:s,delay:r}=t;if(this.time>r&&!t.isFinished){t.isStarted||(t.isStarted=!0,this.arrangeDatas(t));let a=this.calcProgress(0,i,this.time-r);a=p[o](a);for(let t=0;t<s.length;t++){let i=s[t];if(i)for(let t=0;t<e.length;t++){let o=e[t];i.current[t]=this.calcLerp(i.start[t],i.end[t],a),"object"==typeof o&&null!==o&&(o[i.key]=i.current[t])}}if(t.onUpdate&&t.onUpdate(),1===a&&(t.isFinished=!0,t.onComplete&&t.onComplete(),t.isLast)){this.isFinished=!0;return}}}this.isFinished?(window.removeEventListener("visibilitychange",this.onVisiblitychange),this.onComplete()):(this.onUpdate(),requestAnimationFrame(this.animate))},this.onVisiblitychange=()=>{"visible"===document.visibilityState?this.isWindowFocus=!0:this.isWindowFocus=!1},this.easing=e.easing||"linear",this.options=e,this.onUpdate=e.onUpdate||function(){},this.onComplete=e.onComplete||function(){},this.delay=e.delay||0,this.isFinished=!1,this.lastIndex=-1,this.isWindowFocus=!0,this.animations=[],this.time=0}},x=class Lines{init(){for(let e of this.lineParams){let t=l.svgs[e.name],i=e.lineWidth||1,o=t?.paths,a=new s.YJl;this.group.add(a),a.position.copy(e.position),a.rotation.copy(e.rotation);let n=new s.YJl;a.add(n);let u=new f({easing:"easeOutCubic",delay:r.delay.main});if(o)for(let t=0;t<o.length;t++){let r=o[t];if(!r)continue;let n=r.currentPath||r.subPaths[0],l=t/(o.length-1),c=new d(this.vertexNum,n,-1,l,!1),h=new s.I9Y(0,0),v={uProgress:{value:new s.IUQ(0,0,0,0)}},m=e.alpha||1,p=e.gradient[t]||new s.IUQ(0,.25,.75,1),f=this.createMaterial(e.scale,h,v,i,m,.5,p);this.noAnimation?v.uProgress.value.set(1,1,1,1):u.to([v.uProgress.value],4e3,{x:1},500).to([v.uProgress.value],4e3,{y:1},600).to([v.uProgress.value],3e3,{z:1},1500);let x=new s.eaF(c,f);x.frustumCulled=!1,x.renderOrder=0,x.position.z=1e-5*t,a.add(x)}u.start()}}createMaterial(e,t,i,o=1,r=1,a=.5,n){return new s.BKk({vertexShader:u.lineVert,fragmentShader:u.utils+u.lineFrag,uniforms:{...this.uniforms,...i,uScale:{value:e},uAlphaMapVector:{value:t},uLineWidth:{value:.04*this.lineWidthScale*o},uAlpha:{value:r},uBlurRangeMin:{value:a},uGradient:{value:n}},side:s.$EB,transparent:!0})}constructor(e,t=1,i=!1){this.lineParams=e,this.noAnimation=i,this.group=new s.YJl,this.lineWidthScale=t,this.vertexNum=200,this.uniforms={uSegmentNum:{value:100},uResolution:{value:r.fbo_screenSize},...c}}},g=class GaussianBlur{init(){this.originalFbo&&(this.blurFbos.push(new s.nWS(this.originalFbo.width,this.originalFbo.height),new s.nWS(this.originalFbo.width,this.originalFbo.height)),this.step.set(1/this.originalFbo.width,1/this.originalFbo.height),this.makeWeight(),this.vertical=new s.eaF(new s.bdM(2,2),new s.BKk({vertexShader:u.screenVert,fragmentShader:u.blurFrag,uniforms:{...this.uniforms,uDiffuse:{value:this.originalFbo.texture},uStepSize:{value:new s.I9Y(0,1)}},defines:this.defines})),this.horizontal=new s.eaF(new s.bdM(2,2),new s.BKk({vertexShader:u.screenVert,fragmentShader:u.blurFrag,uniforms:{...this.uniforms,uDiffuse:{value:this.blurFbos[0]?this.blurFbos[0].texture:null},uStepSize:{value:new s.I9Y(1,0)}},defines:this.defines})))}makeWeight(){this.weight=[];let e=0;for(let t=this.blurRadius-1;t>=0;t--){let i=1+2*t,o=Math.exp(-(i*i*.5)/(this.blurRadius*this.blurRadius));this.weight.push(o),t>0&&(o*=2),e+=o}for(let t=0;t<this.weight.length;t++)this.weight[t]/=e;this.uniforms.uWeight.value=this.weight}resize(){if(this.originalFbo){for(let e=0;e<this.blurFbos.length;e++)this.blurFbos[e]&&this.blurFbos[e]?.setSize(this.originalFbo.width,this.originalFbo.height);this.step&&this.step?.set(1/this.originalFbo.width,1/this.originalFbo.height)}}update(){this.vertical&&this.blurFbos[0]&&(r.renderer?.setRenderTarget(this.blurFbos[0]),r.renderer?.render(this.vertical,this.camera)),this.horizontal&&this.blurFbos[1]&&(r.renderer?.setRenderTarget(this.blurFbos[1]),r.renderer?.render(this.horizontal,this.camera))}constructor(e,t=12){this.blurFbos=[],this.weight=[],this.blurRadius=t,this.camera=new s.i7d,this.step=new s.I9Y,this.uniforms={uStep:{value:this.step},uWeight:{value:this.weight}},this.defines={BLUR_RADIUS:this.blurRadius},this.originalFbo=e,this.init()}},w=class Halo{init(){for(let e=0;e<this.num;e++){let t=Math.PI*(e/this.num)*2,i=new s.bdM(2,2),o=new s.BKk({vertexShader:u.haloOrbVert,fragmentShader:u.utils+u.haloOrbFrag,uniforms:{...c,uRandom:{value:new s.IUQ(Math.random(),Math.random(),Math.random(),Math.random())},uResolution:{value:r.fbo_screenSize},uProgress:{value:this.progress}},depthTest:!1,depthWrite:!1,transparent:!0}),a=new s.eaF(i,o);this.scene.add(a),a.position.z+=.1*e,a.userData.radian=t,a.userData.rotationSpeed=.2+.3*Math.random()}}update(){for(let e of this.scene.children){e.userData.radian-=r.delta*e.userData.rotationSpeed*4;let t=.1*Math.cos(e.userData.radian),i=.1*Math.sin(e.userData.radian);e.position.x=t,e.position.y=i}}constructor(){this.scene=new s.Z58,this.num=6,this.progress=new s.IUQ(0,0,0,0),this.init()}},b=[new s.IUQ(.15,.39,.7371,.7597),new s.IUQ(.15,.39,.5295,.6174),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1025,.388,.6788),new s.IUQ(0,.1025,.7144,.9784),new s.IUQ(0,.1025,.7144,.9784),new s.IUQ(0,.1025,.7144,.9784),new s.IUQ(0,.1025,.7144,.9784),new s.IUQ(.15,.39,.7371,.7597),new s.IUQ(.15,.39,.5295,.8),new s.IUQ(.1,.2,.3,.4),new s.IUQ(.1,.2,.4,.5),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(.1,.2,.4955,.5771),new s.IUQ(0,.1,.4955,.5771),new s.IUQ(0,.1,.4,.5),new s.IUQ(.1,.2,.9563,.9921),new s.IUQ(0,.1025,.7144,.9784),new s.IUQ(.1,.2,.7144,.9784),new s.IUQ(.2,.3,.7144,.9784)],y={mouseParallax:[.1,.1],group:{lines:[{name:"gitlines1",position:new s.Pq0(0,0,0),rotation:new s.O9p(0,0,0),scale:3.04,lineWidth:.7,gradient:b},{name:"gitlines2",position:new s.Pq0(0,0,0),rotation:new s.O9p(0,0,0),scale:3.04,lineWidth:.4,alpha:.1,gradient:b}],position:new s.Pq0(0,0,0),rotation:new s.O9p(0,0,0)}},C=class MainScene{init(){let e=new s.IUQ(0,0,0,0),t=new f({delay:r.delay.middle});t.to([e],2e3,{x:1,easing:"easeOutCubic"},0),t.start(),this.plane_circle=new s.eaF(new s.bdM(2,2),new s.BKk({vertexShader:u.screenVert,fragmentShader:u.circleFrag,uniforms:{uResolution:{value:this.circleResolution},uTime:c.uTime,uBeatSpeed:c.uBeatSpeed}})),this.output=new s.eaF(new s.bdM(2,2),new s.BKk({vertexShader:u.screenVert,fragmentShader:u.utils+u.outputFrag,uniforms:{uShield:{value:this.fbo_shield.texture},uGitlines:{value:this.fbo_gitlines.texture},uMask:{value:this.fbo_mask.texture},uBgColor:c.uBgColor,uGlowColor:{value:new s.Q1f(7067344)},uBlur:{value:this.gaussianBlur.blurFbos[1]?this.gaussianBlur.blurFbos[1].texture:null},uHalo:{value:this.fbo_halo.texture},uShieldBack:{value:this.fbo_shieldBack.texture},uTime:c.uTime,uBeatSpeed:c.uBeatSpeed,uProgress:{value:this.progress},uColor1:{value:new s.Q1f(2131162)},uColor2:{value:new s.Q1f(5421522)},uColor3:{value:new s.Q1f(9755966)},uColor4:{value:new s.Q1f(2504660)},uResolution:{value:r.fbo_screenSize}},transparent:!0})),this.scene_whole.add(this.output),this.plane_maskImage=new s.eaF(new s.bdM(2,2),new s.BKk({vertexShader:u.screenVert,fragmentShader:u.maskImageFrag,uniforms:{uShield:{value:this.fbo_shield.texture},uGitlines:{value:this.fbo_gitlines.texture},uCircle:{value:this.fbo_circle.texture},uResolution:{value:r.fbo_screenSize},uGlowColor:{value:new s.Q1f(7067344)}},transparent:!0})),this.scene_mask.add(this.plane_maskImage),this.initShieldScene(),this.initGirlinesScene(),this.halo=new w,this.createOpening()}createOpening(){if(this.shield&&this.halo){let e=new f({delay:0});e.to([this.shield.lightPos],1250,{z:.1,easing:"easeOutCubic"},0),e.to([this.shield.progress],2500,{y:1,easing:"easeOutCubic"},0),e.to([this.shield.progress],3750,{x:1,easing:"easeOutCubic"},750),e.to([this.shield.progress],3750,{z:1,easing:"easeOutCubic"},1e3),e.to([this.halo.progress],5e3,{x:1,easing:"easeOutCubic"},0),e.to([this.progress],1250,{x:1,easing:"easeOutCubic"},625),e.to([this.mouseIntensity],1250,{x:1,easing:"easeOutCubic"},2500),e.start()}}initShieldScene(){let e=new s.YJl;this.scene_shield.add(e),e.position.copy(y.group.position),e.rotation.copy(y.group.rotation);let t=new f({delay:r.delay.main});this.shield=new h,this.shield.init(),this.shieldBackGroup=this.shield.shieldBackGroup,this.shield.group.position.set(0,-.05,0),this.shield.group.scale.set(6,6,6),this.shieldBackGroup.position.copy(this.shield.group.position),this.shieldBackGroup.scale.set(this.shield.group.scale.x,this.shield.group.scale.y,this.shield.group.scale.z),e.add(this.shield.group),t.start()}initGirlinesScene(){let e=new x(y.group.lines);this.scene_gitlines.add(e.group),e.init()}resize(){this.circleResolution.set(Math.round(r.fbo_screenSize.x*this.circleRatio),Math.round(r.fbo_screenSize.y*this.circleRatio)),this.fbo_gitlines.setSize(r.fbo_screenSize.x,r.fbo_screenSize.y),this.fbo_shield.setSize(r.fbo_screenSize.x,r.fbo_screenSize.y),this.fbo_mask.setSize(r.fbo_screenSize.x*this.maskRatio,r.fbo_screenSize.y*this.maskRatio),this.fbo_circle.setSize(this.circleResolution.x,this.circleResolution.y),this.fbo_halo.setSize(r.fbo_screenSize.x*this.haloRatio,r.fbo_screenSize.y*this.haloRatio),this.fbo_shieldBack.setSize(r.fbo_screenSize.x,r.fbo_screenSize.y),this.gaussianBlur.resize()}update(){this.shield&&this.shield.update();let e=v.pos.current2.x*y.mouseParallax[0],t=v.pos.current2.y*y.mouseParallax[0];r.camera.position.x=e*this.mouseIntensity.x,r.camera.position.y=t*this.mouseIntensity.x,r.camera.position.z=r.cameraZ;let i=r.camera.position.length();r.camera.position.multiplyScalar(1/(i/r.cameraZ)),r.camera.lookAt(r.center),r.camera2.position.x=v.pos.current2.x*y.mouseParallax[1],r.camera2.position.y=v.pos.current2.y*y.mouseParallax[1],r.camera2.lookAt(r.center)}renderMainScene(){this.plane_circle&&(r.renderer?.setClearColor(0,1),r.renderer?.setRenderTarget(this.fbo_circle),r.renderer?.render(this.plane_circle,r.camera)),r.renderer?.setClearColor(16777215,0),r.renderer?.setRenderTarget(this.fbo_gitlines),r.renderer?.render(this.scene_gitlines,r.camera),r.renderer?.setClearColor(16777215,0),r.renderer?.setRenderTarget(this.fbo_shield),r.renderer?.render(this.scene_shield,r.camera),this.shieldBackGroup&&(r.renderer?.setRenderTarget(this.fbo_shieldBack),r.renderer?.render(this.shieldBackGroup,r.camera)),r.renderer?.setClearColor(0,1),r.renderer?.setRenderTarget(this.fbo_mask),r.renderer?.render(this.scene_mask,r.camera),this.halo&&(this.halo.update(),r.renderer?.setClearColor(16777215,0),r.renderer?.setRenderTarget(this.fbo_halo),r.renderer?.render(this.halo.scene,r.camera)),this.gaussianBlur.update()}renderWholeScene(){r.renderer?.setClearColor(0),r.renderer?.setRenderTarget(null),r.renderer?.render(this.scene_whole,r.camera)}constructor(){this.scene_whole=new s.Z58,this.scene_main=new s.Z58,this.scene_mask=new s.Z58,this.scene_shield=new s.Z58,this.scene_gitlines=new s.Z58,this.group_main=new s.YJl,this.mouseIntensity=new s.IUQ(0,0,0,0),this.maskRatio=.5,this.circleRatio=.3,this.haloRatio=.2,this.progress=new s.IUQ(0,0,0,0),this.scene_main.add(this.group_main),this.fbo_gitlines=new s.nWS(r.fbo_screenSize.x,r.fbo_screenSize.y),this.fbo_shield=new s.nWS(r.fbo_screenSize.x,r.fbo_screenSize.y),this.circleResolution=new s.I9Y(Math.round(r.fbo_screenSize.x*this.circleRatio),Math.round(r.fbo_screenSize.y*this.circleRatio)),this.fbo_mask=new s.nWS(r.fbo_screenSize.x*this.maskRatio,r.fbo_screenSize.y*this.maskRatio),this.fbo_halo=new s.nWS(r.fbo_screenSize.x*this.haloRatio,r.fbo_screenSize.y*this.haloRatio),this.fbo_shieldBack=new s.nWS(r.fbo_screenSize.x,r.fbo_screenSize.y),this.fbo_circle=new s.nWS(this.circleResolution.x,this.circleResolution.y),this.gaussianBlur=new g(this.fbo_mask,30)}};var z=i(21403);let S=!1;(0,z.lB)(".js-security-hero",e=>{let t=document.querySelector(".lp-Hero-visual"),i=null;r.init(t,e),o=new C,v.init();let s=!0;new IntersectionObserver(e=>{for(let t of e)t.isIntersecting?(s=!0,S&&null===i?u():a()):(s=!1,h())}).observe(t);let a=()=>{v.update(),r.update(),s&&(c.uTime.value+=1.25*r.delta,o.update(),o.renderMainScene(),o.renderWholeScene(),i=window.requestAnimationFrame(a))},n=()=>{r.resize(),o.resize()};n();let u=()=>{o.init();let e=new f;e.to([c.uLightIntensity],1e3,{value:1},3e3),e.start(),S=!0,a()},h=()=>{i&&window.cancelAnimationFrame(i),v.update(),r.update()};S||l.load(u),window.addEventListener("resize",n),window.addEventListener("scroll",()=>{r.resize()})})}},e=>{var t=t=>e(e.s=t);e.O(0,["vendors-node_modules_github_selector-observer_dist_index_esm_js","vendors-node_modules_three_build_three_module_js","vendors-node_modules_three_examples_jsm_loaders_GLTFLoader_js","vendors-node_modules_three_examples_jsm_loaders_SVGLoader_js"],()=>t(52455)),e.O()}]);
//# sourceMappingURL=marketing-security-hero-98f232b2d6ba.js.map