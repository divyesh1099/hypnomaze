// HypnoMaze v6 — more projects, simpler maze, anti‑stick
// Additive to v5: NOTHING REMOVED
// • More projects (extended PROJECTS list)
// • Portals at EVERY dead‑end (round‑robin assignment across all projects)
// • Simpler maze to roam: DFS + optional "braid" (carves a few loops)
// • Better sliding + wall "anti‑stick" nudge when wedged into a corner
// • All previous features kept: fullscreen, HUD, minimap, shader ground+ceiling,
//   one‑shot E with cooldown, visit counter, dense hypnotic shader, etc.

import React, { useRef, useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Billboard, Text, Html } from '@react-three/drei'

// --- TRIBUTE ---------------------------------------------------
const TRIBUTE = {
  title: 'Tribute: PapaPupp',
  url: 'https://www.youtube.com/@PapaPupp', // PapaPupp’s YT
  blurb: 'Huge thanks to PapaPupp—his Catacombs of Solaris Revisited videos inspired HypnoMaze.'
};

// --------------------- USER PROJECTS ---------------------------
const PROJECTS = [
  { title: 'Resume & Contact', url: 'https://divyeshvishwakarma.com', blurb: 'Say hi 👋' },
  { title: 'HypnoMaze', url: 'https://github.com/divyesh1099/hypnomaze', blurb: 'Platform to showcase my projects the fun way. You are here!' },
  { title: 'Portfolio', url: 'https://github.com/divyesh1099/divyesh1099.github.io', blurb: 'My personal portfolio website.' },
  { title: 'Motor Switch (Arduino)', url: 'https://github.com/divyesh1099/motorSwitchArduino', blurb: 'Arduino Code for NodeMCU to control a switch module.' },
  { title: 'Kitni Roti', url: 'https://github.com/divyesh1099/kitniRoti', blurb: 'Users can tell the chef how many Rotis they want to eat.' },
  { title: 'Compress PDF', url: 'https://github.com/divyesh1099/compressPDF', blurb: 'Compress PDFs easily for free, totally open source.' },
  { title: 'Motor Switch (NodeMCU)', url: 'https://github.com/divyesh1099/motorSwitch', blurb: 'Control a Switch via NodeMCU over WiFi with a Servo actuator.' },
  { title: 'dmarkify', url: 'https://github.com/divyesh1099/dmarkify', blurb: 'A watermarking tool for text and image watermarks using React and Django.' },
  { title: 'snapHub', url: 'https://github.com/divyesh1099/snapHub', blurb: 'A Django project to share stunning images, with Gmail SMTP and TailwindCSS.' },
  { title: 'Jyotii', url: 'https://github.com/divyesh1099/jyotii', blurb: 'An IoT Project to track the live status of the Akhand Navratri Jyoti.' },
  { title: 'Resume Customizer', url: 'https://github.com/divyesh1099/resumeCustomizer', blurb: 'Helps professionals tailor resumes and cover letters for job applications.' },
  { title: 'Deficit-App', url: 'https://github.com/divyesh1099/Deficit-App', blurb: 'A Flutter app to track a user\'s calorie deficit.' },
  { title: 'Ram Mandir VR', url: 'https://github.com/divyesh1099/ramMandirVR', blurb: 'A virtual reality experience of the Shri Ram Mandir of Ayodhya.' },
  { title: 'ChatGemini', url: 'https://github.com/divyesh1099/ChatGemini', blurb: 'A Flutter application that uses Google\'s Gemini API.' },
  { title: 'WiChat', url: 'https://github.com/divyesh1099/WiChat', blurb: 'Chat without internet over a local LAN (WiFi, hotspot, or wired).' },
  { title: 'WiFi Calling', url: 'https://github.com/divyesh1099/wificalling', blurb: 'Python-based voice calls over a local Wi-Fi network.' },
  { title: '3D T-Shirt Customizer', url: 'https://github.com/divyesh1099/threeshirt', blurb: 'AI-Powered 3D Tshirt Customizer with Three.js, React, and Tailwind.' },
  { title: 'LeetCode Bahubali', url: 'https://github.com/divyesh1099/leetcodebahubali', blurb: 'Chrome extension that plays Bahubali music when your solution is accepted.' },
  { title: 'Bhiksha', url: 'https://github.com/divyesh1099/bhiksha', blurb: 'Yes, you can beg online now. Money, forgiveness, a date... start begging!'},
  { title: 'PuppaPupp', url: 'https://www.youtube.com/@PapaPupp', blurb: 'This is the awesome youtuber that inspired this project when I saw a youtube short where he was playing that awesome game named "The Catacombs of Solaris Revisited".'},
  { title: 'The Catacombs of Solaris Revisited', url: 'https://ianmaclarty.itch.io/catacombs-of-solaris', blurb: 'The game that inspired this project. Check out the full version!'},
]

// Maze sizing (slightly simpler grid + optional braiding for loops)
const GRID = { cols: 19, rows: 19 } // a little smaller than 21×21
const CELL = 3
const WALL_H = 2.8
const PLAYER_H = 1.6
const BRAID_P = 0.22 // 0..1 chance to convert a dead‑end into a loop (simplicity)

// --------------------- RNG + MAZE ------------------------------
function rng(seed = 1337) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff }
function makeMaze(cols, rows, seed = 42){ const R=rng(seed); const W=cols,H=rows; const g=Array.from({length:H},()=>Array.from({length:W},()=>0)); const inB=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1; const carve=(x,y)=>{g[y][x]=1}; let sx=(Math.floor(R()*(W/2))*2)|1, sy=(Math.floor(R()*(H/2))*2)|1; carve(sx,sy); const st=[[sx,sy]]; const dirs=[[2,0],[-2,0],[0,2],[0,-2]]; while(st.length){ const [cx,cy]=st[st.length-1]; const sh=dirs.slice().sort(()=>R()-0.5); let carved=false; for(const [dx,dy] of sh){ const nx=cx+dx, ny=cy+dy; if(inB(nx,ny)&&g[ny][nx]===0){ g[cy+dy/2][cx+dx/2]=1; carve(nx,ny); st.push([nx,ny]); carved=true; break } } if(!carved) st.pop() } g[1][0]=1; g[H-2][W-1]=1; return g }
function braidMaze(grid, p = BRAID_P, seed = 99){ const R = rng(seed); const H=grid.length, W=grid[0].length; function isPass(x,y){ return x>0&&y>0&&x<W-1&&y<H-1&&grid[y][x]===1 } for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) if (grid[y][x]===1){ let n=0; if(isPass(x,y-1)) n++; if(isPass(x,y+1)) n++; if(isPass(x-1,y)) n++; if(isPass(x+1,y)) n++; if(n===1 && R()<p){ const walls=[]; if(grid[y-1][x]===0) walls.push([x,y-1]); if(grid[y+1][x]===0) walls.push([x,y+1]); if(grid[y][x-1]===0) walls.push([x-1,y]); if(grid[y][x+1]===0) walls.push([x+1,y]); if(walls.length){ const [wx,wy]=walls[Math.floor(R()*walls.length)]; grid[wy][wx]=1 } } } return grid }
function worldToCell(x,z){ const gx=Math.round(x/CELL+GRID.cols/2-0.5), gz=Math.round(z/CELL+GRID.rows/2-0.5); return [gx,gz] }
function isWalkable(grid,gx,gz){ if(gz<0||gz>=grid.length||gx<0||gx>=grid[0].length) return false; return grid[gz][gx]===1 }
function deadEnds(grid){ const H=grid.length,W=grid[0].length; const ends=[]; for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) if(grid[y][x]===1){ let n=0; if(grid[y-1][x]===1) n++; if(grid[y+1][x]===1) n++; if(grid[y][x-1]===1) n++; if(grid[y][x+1]===1) n++; if(n===1) ends.push([x,y]) } ends.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1])); return ends.map(([x,y])=>({x:(x-GRID.cols/2+0.5)*CELL, z:(y-GRID.rows/2+0.5)*CELL})) }

// --------------------- SHADER (v4+ dense) ---------------------
const wallShader = { uniforms:{ uTime:{value:0}, uCamPos:{value:new THREE.Vector3()}, uViewDir:{value:new THREE.Vector3(0,0,-1)}, uIntensity:{value:0.5}, uIdle:{value:0}, uFlow:{value:0}, uTiling:{value:24} }, vertexShader:`
    precision highp float; varying vec2 vUv; varying vec3 vWorldPos; varying vec3 vWorldNormal; uniform float uTime; uniform float uIntensity; uniform float uIdle;
    void main(){ vUv=uv; vec3 pos=position; float amp=mix(0.0,0.16,clamp(uIdle,0.0,1.0))*(0.6+uIntensity*0.6); float w=sin(uTime*4.1+dot(position,vec3(4.1,3.2,2.4)))+cos(uTime*2.7+position.y*5.0); pos+=normal*(w*amp); vec4 wp=modelMatrix*vec4(pos,1.0); vWorldPos=wp.xyz; vWorldNormal=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*wp; }
  `, fragmentShader:`
    precision highp float; varying vec2 vUv; varying vec3 vWorldPos; varying vec3 vWorldNormal; uniform float uTime; uniform vec3 uCamPos; uniform vec3 uViewDir; uniform float uIntensity; uniform float uIdle; uniform float uFlow; uniform float uTiling;
    float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y);} float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);} vec3 hsv2rgb(vec3 c){ vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.); return c.z*mix(vec3(1.),clamp(p-1.,0.,1.), c.y);} 
    void main(){ vec3 n=normalize(abs(vWorldNormal)); vec2 uvx=vWorldPos.zy; vec2 uvy=vWorldPos.xz; vec2 uvz=vWorldPos.xy; vec2 base=(n.x>n.y&&n.x>n.z)?uvx:(n.y>n.z?uvy:uvz); vec2 uv=base*(uTiling*0.5); uv+=uCamPos.xz*0.10; vec2 dir=normalize(uViewDir.xz+1e-5); float an=atan(dir.y,dir.x); mat2 rot=mat2(cos(an),-sin(an),sin(an),cos(an)); vec2 fuv=rot*(uv+vec2(uTime*(0.7+2.5*uFlow),0.0)); float idleK=smoothstep(0.2,1.0,clamp(uIdle,0.0,1.0)); vec2 warp=vec2(noise(uv*0.6+uTime*0.3),noise(uv*0.6-uTime*0.25)); warp+=idleK*vec2(noise(uv*2.5+uTime*2.0),noise(uv*2.5-uTime*1.6))*1.6; fuv+=(warp-0.5)*(1.4+2.4*uIntensity); float freq=mix(2.5,8.0,uIntensity)+idleK*8.0; float a=sin(fuv.x*freq+uTime*3.5)*0.5+0.5; float b=sin(length(uv-7.0)*(4.0+6.0*uIntensity)+uTime*2.6)*0.5+0.5; float c=step(0.5,fract(fuv.y*1.1+uTime*0.09)); float s=mix(a,b,0.55)*0.6 + c*0.4; s=pow(s,mix(0.55,1.85,uIntensity)); float hue=fract(s+uTime*0.035+dot(uCamPos.xy,vec2(0.02,-0.015))); float sat=mix(0.7,1.0,uIntensity); float val=mix(0.6,1.0,uIntensity)*mix(1.0,1.25,uFlow); vec3 col=hsv2rgb(vec3(hue,sat,val)); float shimmer=smoothstep(0.35,0.65,abs(sin((fuv.x+fuv.y)*3.8+uTime*12.0))); col=mix(col,col*1.5+vec3(0.25)*shimmer,idleK*0.55); gl_FragColor=vec4(col, 1.0); }
  `,
}

function TributeMarker({ x, z, tribute }) {
  const ringRef = useRef();
  useFrame(({ clock }) => { if (ringRef.current) ringRef.current.rotation.z = clock.getElapsedTime() * 1.2 });

  const open = () => window.open(tribute.url, '_blank', 'noopener');

  return (
    <group position={[x, 0, z]}>
      <pointLight color={new THREE.Color('#ffd166')} intensity={1.6} distance={7} position={[0,2.2,0]} />
      <mesh ref={ringRef} position={[0,1.4,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[0.65, 0.12, 24, 96]} />
        <meshBasicMaterial color={'#ffd166'} transparent opacity={0.95} />
      </mesh>

      <Billboard position={[0, 2.2, 0]}>
        <mesh>
          <planeGeometry args={[2.6, 1.2]} />
          <meshBasicMaterial color={'#000'} transparent opacity={0.55} />
        </mesh>
        <Text position={[0,0.18,0.01]} fontSize={0.22} color="#fff" anchorY="top" maxWidth={2.3}>
          {tribute.title}
        </Text>
        <Text position={[0,-0.18,0.01]} fontSize={0.12} color="#ffe8b5" maxWidth={2.3}>
          Press P to visit • Press E on any portal
        </Text>
      </Billboard>

      {/* Clickable HTML button too (optional) */}
      <Html position={[0, 0.9, 0]} distanceFactor={12} transform occlude>
        <button onClick={open} style={{
          padding:'6px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.25)',
          background:'rgba(0,0,0,0.6)', color:'#ffd166', cursor:'pointer', fontWeight:700
        }}>
          Open PapaPupp Channel
        </button>
      </Html>
    </group>
  );
}

function CreditRibbon() {
  return (
    <div style={{
      position:'fixed', right:12, bottom:12, pointerEvents:'auto',
      background:'rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.25)',
      borderRadius:12, padding:'8px 10px', color:'#fff', fontSize:12
    }}>
      Inspired by <a href={TRIBUTE.url} target="_blank" rel="noreferrer" style={{color:'#ffd166', fontWeight:700}}>PapaPupp</a>
      <span style={{opacity:0.8}}> • </span>
      <a href="https://ianmaclarty.itch.io/catacombs-of-solaris" target="_blank" rel="noreferrer" style={{color:'#a7f3d0'}}>
        Catacombs of Solaris Revisited
      </a>
    </div>
  );
}

function makeMaterial(shared, tiling){ return new THREE.ShaderMaterial({ ...wallShader, side:THREE.DoubleSide, uniforms:{ uTime:shared.uTime, uCamPos:shared.uCamPos, uViewDir:shared.uViewDir, uIntensity:shared.uIntensity, uIdle:shared.uIdle, uFlow:shared.uFlow, uTiling:{value:tiling} } }) }

// --------------------- STRUCTURE -------------------------------
function Walls({ grid, sharedUniforms }){
  const wallMat = useMemo(()=>makeMaterial(sharedUniforms, 28.0),[sharedUniforms])
  const boxes = useMemo(()=>{ const arr=[]; const H=grid.length,W=grid[0].length; const g2w=(x,y)=>[(x-GRID.cols/2+0.5)*CELL,(y-GRID.rows/2+0.5)*CELL]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(grid[y][x]===0){ const [wx,wz]=g2w(x,y); arr.push([wx,wz]) } return arr },[grid])
  return (<group>{boxes.map(([x,z],i)=>(<mesh key={i} position={[x,WALL_H/2,z]} material={wallMat}><boxGeometry args={[CELL*0.98,WALL_H,CELL*0.98]} /></mesh>))}</group>)
}

function ProjectMarker({ x, z, title, blurb }){
  const portalRef = useRef()
  useFrame(({ clock }) => { const t = clock.getElapsedTime(); if (portalRef.current) portalRef.current.rotation.z = t * 0.8 })
  return (
    <group position={[x, 0, z]}>
      <pointLight color={new THREE.Color('#ff7cf8')} intensity={1.4} distance={6} position={[0,2.0,0]} />
      <mesh ref={portalRef} position={[0,1.3,0]} rotation={[Math.PI/2,0,0]}>
        <torusGeometry args={[0.55, 0.1, 24, 72]} />
        <meshBasicMaterial color={'#ffffff'} transparent opacity={0.9} />
      </mesh>
      <Billboard position={[0, 2.0, 0]}>
        <mesh>
          <planeGeometry args={[2.2, 1.08]} />
          <meshBasicMaterial color={'#000'} transparent opacity={0.48} />
        </mesh>
        <Text position={[0,0,0.01]} fontSize={0.2} color="white" anchorY="top">{title}</Text>
        <Text position={[0,-0.32,0.01]} fontSize={0.11} color="#e5e7eb" maxWidth={2.0}>{blurb}</Text>
        <Text position={[0,-0.57,0.01]} fontSize={0.11} color="#ffe3ff">Press E to open</Text>
      </Billboard>
    </group>
  )
}

// --------------------- INPUT & FLOW ----------------------------
function useKeys(){ const keys=useRef({}); useEffect(()=>{ const d=e=>keys.current[e.code]=true; const u=e=>keys.current[e.code]=false; window.addEventListener('keydown',d); window.addEventListener('keyup',u); return()=>{ window.removeEventListener('keydown',d); window.removeEventListener('keyup',u) } },[]); return keys }
function nearestProjectFlow(camPos, arr, viewDir){ if(!arr.length) return 0; let best=Infinity, vec=new THREE.Vector3(); const cp=new THREE.Vector3(camPos.x,0,camPos.z); for(const p of arr){ const v=new THREE.Vector3(p[0],0,p[1]).sub(cp); const d=v.length(); if(d<best){ best=d; vec.copy(v) } } if(best===Infinity) return 0; vec.normalize(); const f=Math.max(0, vec.dot(new THREE.Vector3(viewDir.x,0,viewDir.z))); const distBoost=THREE.MathUtils.clamp(6/Math.max(2,best),0,1); return THREE.MathUtils.clamp(f*0.7+distBoost*0.3,0,1) }

// --------------------- PLAYER (smooth + anti‑stick) -----------
function Player({ grid, sharedUniforms, portals, onOpen, setNear }){
  const { camera }=useThree(); const keys=useKeys()
  const vel = useRef(new THREE.Vector3())
  const targetVel = useRef(new THREE.Vector3())
  const [idle, setIdle] = useState(0)
  const last = useRef({ x: 0, z: 0, t: performance.now() })
  const lastInteract = useRef(0)
  const prevE = useRef(false)
  const MAX_SPEED = 4.8, DAMP = 10.0, RADIUS = CELL*0.30 // slightly smaller radius helps exiting corners

  useEffect(()=>{ camera.position.set((1-GRID.cols/2+0.5)*CELL, PLAYER_H, (1-GRID.rows/2+0.5)*CELL) },[camera])
  useEffect(()=> {
    const onKey=(e)=>{
      if(e.code==='KeyM') setShowMap(s=>!s);
      if(e.code==='KeyF'){ if(document.fullscreenElement) document.exitFullscreen(); else { const de=document.documentElement; de.requestFullscreen?.() } }
      if(e.code==='KeyP'){ window.open(TRIBUTE.url, '_blank', 'noopener'); } // <— Tribute hotkey
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_, dt)=>{
    const v = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion)
    sharedUniforms.uViewDir.value.copy(v)
    sharedUniforms.uTime.value += dt
    sharedUniforms.uCamPos.value.copy(camera.position)

    // camera‑relative input
    const forward = new THREE.Vector3(v.x,0,v.z).normalize()
    const right = new THREE.Vector3().crossVectors(forward,new THREE.Vector3(0,1,0)).multiplyScalar(-1)
    const wish = new THREE.Vector3()
    if (keys.current['KeyW']||keys.current['ArrowUp']) wish.add(forward)
    if (keys.current['KeyS']||keys.current['ArrowDown']) wish.sub(forward)
    if (keys.current['KeyA']||keys.current['ArrowLeft']) wish.sub(right)
    if (keys.current['KeyD']||keys.current['ArrowRight']) wish.add(right)
    if (wish.lengthSq()>0) wish.normalize()

    // smooth steering
    targetVel.current.copy(wish).multiplyScalar(MAX_SPEED)
    vel.current.x = THREE.MathUtils.damp(vel.current.x, targetVel.current.x, DAMP, dt)
    vel.current.z = THREE.MathUtils.damp(vel.current.z, targetVel.current.z, DAMP, dt)

    // --- collision: axis‑separated with anti‑stick nudge ---
    const tryMove = (nx, nz) => [worldToCell(nx+RADIUS, nz), worldToCell(nx-RADIUS, nz), worldToCell(nx, nz+RADIUS), worldToCell(nx, nz-RADIUS)]
    let nx = camera.position.x + vel.current.x * dt
    let nz = camera.position.z + vel.current.z * dt
    const okX = [worldToCell(nx+RADIUS, camera.position.z), worldToCell(nx-RADIUS, camera.position.z)].every(([gx,gz])=>isWalkable(grid,gx,gz))
    const okZ = [worldToCell(camera.position.x, nz+RADIUS), worldToCell(camera.position.x, nz-RADIUS)].every(([gx,gz])=>isWalkable(grid,gx,gz))
    if (okX) camera.position.x = nx; else vel.current.x = 0
    if (okZ) camera.position.z = nz; else vel.current.z = 0

    // if wedged (neither axis ok), nudge toward cell center to free the player
    if (!okX && !okZ) {
      const [cgx,cgz] = worldToCell(camera.position.x, camera.position.z)
      const cx = (cgx - GRID.cols/2 + 0.5)*CELL
      const cz = (cgz - GRID.rows/2 + 0.5)*CELL
      const toCenter = new THREE.Vector3(cx - camera.position.x, 0, cz - camera.position.z)
      if (toCenter.lengthSq() > 1e-6) {
        toCenter.normalize().multiplyScalar(0.02) // tiny push each frame
        camera.position.x += toCenter.x
        camera.position.z += toCenter.z
      }
    }

    // idle detection
    const now=performance.now(); const moved=Math.hypot(camera.position.x-last.current.x, camera.position.z-last.current.z)>0.001
    if(moved){ setIdle(0); last.current={x:camera.position.x,z:camera.position.z,t:now} } else if(now-last.current.t>800){ setIdle(1) }
    sharedUniforms.uIdle.value = idle

    // shader flow hint
    const arr = portals.map(p=>[p.x,p.z])
    sharedUniforms.uFlow.value = nearestProjectFlow(camera.position, arr, v)

    // E to open (one‑shot w/ cooldown)
    let nearest=null, nd=Infinity
    for(const p of portals){ const d=Math.hypot(p.x-camera.position.x, p.z-camera.position.z); if(d<nd){ nd=d; nearest=p } }
    setNear(nearest && nd < 1.9 ? nearest : null)
    const eDown = !!keys.current['KeyE']
    const justPressed = eDown && !prevE.current
    prevE.current = eDown
    if (justPressed && nearest && nd < 1.9 && (now - lastInteract.current) > 800) {
      lastInteract.current = now
      onOpen(nearest.meta)
    }
  })
  return null
}

// --------------------- SCENE ----------------------------------
function Scene({ intensity, reduceMotion, onVisit }){
  const base = useMemo(()=>makeMaze(GRID.cols, GRID.rows, 123),[])
  const grid = useMemo(()=>braidMaze(base, BRAID_P, 321),[base])
  const ends = useMemo(()=>deadEnds(grid),[grid])

  // round‑robin portals across all dead‑ends
  const portals = useMemo(()=> ends.map((p,i)=>({ x:p.x, z:p.z, meta: PROJECTS[i % PROJECTS.length] })),[ends])

  const sharedUniforms=useMemo(()=>THREE.UniformsUtils.clone(wallShader.uniforms),[])
  useEffect(()=>{ sharedUniforms.uIntensity.value=intensity },[intensity,sharedUniforms])
  useFrame(()=>{ if(reduceMotion) sharedUniforms.uTime.value+=0.002 })

  const groundMat=useMemo(()=>makeMaterial(sharedUniforms, 36.0),[sharedUniforms])
  const ceilMat=useMemo(()=>makeMaterial(sharedUniforms, 36.0),[sharedUniforms])
  const [near,setNear]=useState(null)
  const handleOpen = (meta)=>{ if(!meta?.url) return; onVisit(meta); window.open(meta.url,'_blank','noopener') }

  // Place shrine a bit to the right of the spawn tile (grid 1,1)
  const startX = (1 - GRID.cols/2 + 0.5) * CELL + CELL * 1.6;
  const startZ = (1 - GRID.rows/2 + 0.5) * CELL;
  return (
    <>
      <color attach="background" args={[0.02,0.02,0.03]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0,10,0]} intensity={0.2} />

      <Walls grid={grid} sharedUniforms={sharedUniforms} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} material={groundMat}><planeGeometry args={[GRID.cols*CELL, GRID.rows*CELL]} /></mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,WALL_H,0]} material={ceilMat}><planeGeometry args={[GRID.cols*CELL, GRID.rows*CELL]} /></mesh>

      {/* Tribute shrine near spawn */}
      <TributeMarker x={startX} z={startZ} tribute={TRIBUTE} />

      {portals.map((p,i)=>(<ProjectMarker key={`${p.x},${p.z},${i}`} x={p.x} z={p.z} title={p.meta.title} blurb={p.meta.blurb} />))}

      <PointerLockControls selector="#lock" />
      <Player grid={grid} sharedUniforms={sharedUniforms} portals={portals} onOpen={handleOpen} setNear={setNear} />

      {near && (
        <Html position={[near.x, 1.2, near.z]} occlude>
          <div style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:12, maxWidth:260, color:'#fff' }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{near.meta.title}</div>
            <div style={{ opacity:0.85, fontSize:12 }}>{near.meta.blurb}</div>
            <div style={{ marginTop:6, fontSize:13, fontWeight:700 }}>Press E to open</div>
          </div>
        </Html>
      )}
    </>
  )
}

// --------------------- UI + APP --------------------------------
function requestFullscreen(){ const de=document.documentElement; if(de.requestFullscreen) de.requestFullscreen(); else if(de.webkitRequestFullscreen) de.webkitRequestFullscreen() }

function UI({ intensity, setIntensity, reduceMotion, setReduceMotion, showMap, setShowMap, visited, total }){
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
      <div style={{ position:'absolute', left:16, top:12, color:'#fff', fontWeight:800, fontSize:16, pointerEvents:'none', textShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>
        Visited: {visited} / {total} • WASD move • E open • F fullscreen • M map
      </div>

      <div style={{ position:'absolute', top:12, right:12, pointerEvents:'auto', display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
        <button id="lock" onClick={()=>requestFullscreen()} style={{ padding:'6px 10px', borderRadius:8, fontSize:12 }}>Click to Play (Full Screen)</button>
        <div style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:16, padding:12, width:300, color:'#fff', fontSize:12 }}>
          <div style={{ opacity:0.9, marginBottom:8, fontWeight:600 }}>HypnoMaze Controls</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <label htmlFor="intensity" style={{ fontSize:10, opacity:0.8 }}>Intensity</label>
            <input id="intensity" name="intensity" style={{ flex:1 }} type="range" min={0.15} max={1} step={0.01} defaultValue={0.5} onChange={(e)=>setIntensity(parseFloat(e.target.value))} />
          </div>
          <label htmlFor="reduce" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input id="reduce" name="reduce" type="checkbox" checked={reduceMotion} onChange={(e)=>setReduceMotion(e.target.checked)} /> Reduce motion
          </label>
          <div style={{ marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <label htmlFor="map" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input id="map" name="map" type="checkbox" checked={showMap} onChange={(e)=>setShowMap(e.target.checked)} /> Mini‑map
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMap({ show }){ const { camera }=useThree(); const ref=useRef(); useFrame(()=>{ if(!ref.current) return; const x=camera.position.x/(GRID.cols*CELL)*100; const y=camera.position.z/(GRID.rows*CELL)*100; ref.current.style.transform=`translate(${50+x}%, ${50+y}%)` }); if(!show) return null; return (<Html prepend zIndexRange={[10,0]}><div style={{ position:'absolute', left:12, bottom:12, width:128, height:128, pointerEvents:'none', borderRadius:12, border:'1px solid rgba(255,255,255,0.3)', background:'rgba(0,0,0,0.5)' }}><div ref={ref} style={{ position:'absolute', width:6, height:6, borderRadius:999, background:'#fff', left:'50%', top:'50%', transform:'translate(-50%, -50%)' }} /></div></Html>) }

export default function App(){
  const prefersReduced = typeof window!=='undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [reduceMotion,setReduceMotion]=useState(prefersReduced)
  const [intensity,setIntensity]=useState(0.5)
  const [showMap,setShowMap]=useState(false)
  const [visitedSet, setVisitedSet] = useState(()=>new Set())

  useEffect(()=>{ const style=document.createElement('style'); style.innerHTML=`html,body,#root{height:100%;margin:0;} #root,.hypno-root{position:fixed;inset:0;} canvas{display:block;}`; document.head.appendChild(style); return()=>document.head.removeChild(style) },[])
  useEffect(()=>{ const onKey=(e)=>{ if(e.code==='KeyM') setShowMap(s=>!s); if(e.code==='KeyF'){ if(document.fullscreenElement) document.exitFullscreen(); else { const de=document.documentElement; de.requestFullscreen?.() } } }; window.addEventListener('keydown', onKey); return()=>window.removeEventListener('keydown', onKey) }, [])

  const onVisit = (meta)=>{ if(!meta?.url) return; setVisitedSet(prev=>{ const next=new Set(prev); next.add(meta.url); return next }) }

  return (
    <div className="hypno-root" style={{ position:'fixed', inset:0, background:'#000' }}>
      <Canvas dpr={[1,1.5]} gl={{ antialias:false, powerPreference:'high-performance' }} style={{ position:'absolute', top:0, left:0, width:'100vw', height:'100vh' }} camera={{ fov:75, near:0.1, far:1000, position:[0,PLAYER_H,0] }}>
        <Scene intensity={intensity} reduceMotion={reduceMotion} onVisit={onVisit} />
        <MiniMap show={showMap} />
      </Canvas>
      <UI intensity={intensity} setIntensity={setIntensity} reduceMotion={reduceMotion} setReduceMotion={setReduceMotion} showMap={showMap} setShowMap={setShowMap} visited={visitedSet.size} total={PROJECTS.length} />
      <CreditRibbon />
      <div style={{ position:'absolute', bottom:8, left:0, right:0, textAlign:'center', color:'rgba(255,255,255,0.6)', fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize:11, pointerEvents:'none' }}>
        HypnoMaze v6 • Dead‑end portals • E: open • F: fullscreen • M: map
      </div>
    </div>
  )
}
