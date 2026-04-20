import React, { useEffect, useRef } from 'react';

interface GlobalBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  theme?: "light" | "dark";
}

export const GlobalBackground: React.FC<GlobalBackgroundProps> = ({
  primaryColor = "var(--accent-primary)",
  secondaryColor = "var(--accent-secondary)",
  theme = "dark"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      canvas.style.background = 'var(--bg-page, #05050c)';
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };

    const color1 = hexToRgb(primaryColor);
    const color2 = hexToRgb(secondaryColor);

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float dist = distance(uv, u_mouse / u_resolution.xy);
        
        vec3 colorA = u_color1;
        vec3 colorB = u_color2;
        
        float pulse = 0.5 + 0.5 * sin(u_time * 0.3);
        
        // Se for tema claro, usamos um fundo quase branco e misturamos as cores de forma muito sutil
        // Se for escuro, mantemos a base escura
        ${theme === 'light' ? `
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        ` : `
          vec3 finalColor = mix(colorA, colorB, uv.y * pulse + dist * 0.1);
          finalColor *= 0.12; 
          gl_FragColor = vec4(finalColor, 1.0);
        `}
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program || !vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const color1Loc = gl.getUniformLocation(program, "u_color1");
    const color2Loc = gl.getUniformLocation(program, "u_color2");

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = canvas.height - e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      gl.uniform3f(color1Loc, color1[0], color1[1], color1[2]);
      gl.uniform3f(color2Loc, color2[0], color2[1], color2[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, [primaryColor, secondaryColor, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="global-background-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        display: "block"
      }}
    />
  );
};
