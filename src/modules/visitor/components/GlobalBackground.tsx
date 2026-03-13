import React, { useEffect, useRef } from 'react';

export const GlobalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      canvas.style.background = '#05050c';
      return;
    }

    const resize = () => {
      const scale = Math.min(1, 720 / window.innerWidth);
      canvas.width = Math.round(window.innerWidth * scale);
      canvas.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const V = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`;
    const F = `
precision mediump float;
uniform float T;
uniform vec2 R;
uniform vec2 M;

float h(vec2 p){
  p=fract(p*vec2(127.1,311.7));
  p+=dot(p,p+19.19);
  return fract(p.x*p.y);
}
float n(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
  for(int i=0;i<5;i++){v+=a*n(p);p=rot*p*2.1;a*=0.48;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float ar=R.x/R.y;
  uv.x*=ar;
  float t=T*0.05;
  vec2 q=vec2(fbm(uv+t),fbm(uv+vec2(5.2,1.3)+t*0.9));
  vec2 r=vec2(fbm(uv+4.0*q+vec2(1.7,9.2)+t*0.4),fbm(uv+4.0*q+vec2(8.3,2.8)+t*0.35));
  float f=fbm(uv+4.0*r);
  vec2 mo=vec2(M.x*ar,M.y);
  f+=0.1*exp(-length(uv-mo)*3.0);
  vec3 c=vec3(0.02,0.01,0.04);
  c=mix(c,vec3(0.10,0.04,0.01),smoothstep(0.2,0.55,f));
  c=mix(c,vec3(0.35,0.18,0.02),smoothstep(0.5,0.72,f));
  c=mix(c,vec3(0.65,0.42,0.06),smoothstep(0.68,0.88,f));
  c=mix(c,vec3(0.88,0.65,0.15),smoothstep(0.82,1.0,f));
  vec2 vig=(gl_FragCoord.xy/R)-0.5;
  c*=clamp(1.0-dot(vig,vig)*1.8,0.0,1.0);
  c*=0.55;
  gl_FragColor=vec4(c,1.0);
}`;

    const sh = (src: string, type: number) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = sh(V, gl.VERTEX_SHADER);
    const fs = sh(F, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, 'T');
    const uR = gl.getUniformLocation(prog, 'R');
    const uM = gl.getUniformLocation(prog, 'M');

    let mx = 0.5, my = 0.5, t = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth;
      my = 1 - (e.clientY / window.innerHeight);
    };
    document.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    const frame = () => {
      t += 0.4;
      gl.uniform1f(uT, t);
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};
