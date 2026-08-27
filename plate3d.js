(function(){
  "use strict";
  const stage = document.getElementById("plateCanvas");
  const fallbackImg = document.querySelector(".plate-fallback");
  const labelWrap = document.querySelector(".plate-labels");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function showFallback(){ if (stage) stage.hidden = true; if (fallbackImg) fallbackImg.hidden = false; if (labelWrap) labelWrap.hidden = true; }
  if (!window.THREE || !stage) { showFallback(); return; }
  let gl;
  try { const testCanvas = document.createElement("canvas"); gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"); } catch(e){ gl = null; }
  if (!gl) { showFallback(); return; }

  let width = stage.clientWidth || 320, height = stage.clientHeight || 320;
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(width, height); stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width/height, 0.1, 100);
  camera.position.set(0, 3.1, 4.4); camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xfff2d9, 0.75));
  const key = new THREE.DirectionalLight(0xffe9bf, 0.9); key.position.set(3, 5, 2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc7a45a, 0.5); rim.position.set(-3, 2, -3); scene.add(rim);

  const plateGroup = new THREE.Group();
  const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.05, 24, 64), new THREE.MeshStandardMaterial({ color:0xC7A45A, metalness:0.55, roughness:0.32 }));
  rimMesh.rotation.x = Math.PI/2; plateGroup.add(rimMesh);
  plateGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.45, 0.14, 64, 1, false), new THREE.MeshStandardMaterial({ color:0xF7F3EA, roughness:0.42, metalness:0.05 })));
  const wellMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, 0.05, 48), new THREE.MeshStandardMaterial({ color:0xEFE8D6, roughness:0.5 }));
  wellMesh.position.y = 0.09; plateGroup.add(wellMesh);
  const inlay = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.012, 12, 64), new THREE.MeshStandardMaterial({ color:0xC7A45A, metalness:0.6, roughness:0.3 }));
  inlay.rotation.x = Math.PI/2; inlay.position.y = 0.12; plateGroup.add(inlay);
  plateGroup.rotation.x = -0.18; scene.add(plateGroup); renderer.render(scene, camera);

  let rotY = 0, targetRotY = 0, dragging = false, lastX = 0;
  stage.addEventListener("pointerdown", e=>{ dragging = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener("pointerup", ()=> dragging = false);
  stage.addEventListener("pointercancel", ()=> dragging = false);
  stage.addEventListener("pointermove", e=>{ if (!dragging) return; const dx = e.clientX-lastX; lastX=e.clientX; targetRotY += dx*0.008; });

  function positionLabels(){
    if (!labelWrap) return;
    const r = stage.clientWidth * 0.42;
    labelWrap.querySelectorAll("span").forEach(span=>{
      const baseAngle = parseFloat(span.dataset.a) * Math.PI/180, angle = baseAngle + rotY;
      const x = Math.cos(angle)*r, y = Math.sin(angle)*(r*0.5);
      span.style.transform = `translate(${x}px, ${y}px)`;
      span.style.opacity = (Math.sin(angle) > -0.3) ? "0.95" : "0.35";
    });
  }

  let raf = null;
  function animate(){ raf = requestAnimationFrame(animate); if (!dragging && !reduceMotion) targetRotY += 0.0022; rotY += (targetRotY-rotY)*0.08; plateGroup.rotation.y = rotY; renderer.render(scene,camera); positionLabels(); }
  function start(){ if (raf === null) animate(); }
  function stop(){ if (raf !== null){ cancelAnimationFrame(raf); raf = null; } }
  const io = new IntersectionObserver(entries=>entries.forEach(entry=> entry.isIntersecting ? start() : stop()), {threshold:0.05});
  io.observe(stage);

  window.addEventListener("resize", ()=>{
    const w=stage.clientWidth, h=stage.clientHeight; if(!w||!h) return;
    width=w; height=h; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); positionLabels();
  });
})();