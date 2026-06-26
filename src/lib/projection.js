import * as THREE from 'three';
import gsap from 'gsap';

function drawFrame(ctx, time, palette) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const t = time * 0.001;

  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, w, h);

  const layers = [
    { x: 0.5 + Math.sin(t * 0.2) * 0.3, y: 0.5 + Math.cos(t * 0.25) * 0.3, r: 0.4, c: 0 },
    { x: 0.5 + Math.cos(t * 0.3) * 0.25, y: 0.5 + Math.sin(t * 0.2) * 0.25, r: 0.35, c: 1 },
    { x: 0.5 + Math.sin(t * 0.35) * 0.2, y: 0.5 + Math.cos(t * 0.3) * 0.2, r: 0.3, c: 2 },
  ];

  for (const l of layers) {
    const g = ctx.createRadialGradient(l.x * w, l.y * h, 0, l.x * w, l.y * h, l.r * w);
    g.addColorStop(0, palette[l.c]);
    g.addColorStop(0.6, palette[(l.c + 1) % palette.length] + '80');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  for (let i = 0; i < 4; i++) {
    const hx = (0.2 + Math.sin(t * 0.4 + i * 2) * 0.6) * w;
    const hy = (0.2 + Math.cos(t * 0.35 + i * 2) * 0.6) * h;
    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 0.06);
    hg.addColorStop(0, '#ffffff60');
    hg.addColorStop(1, 'transparent');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, w, h);
  }
}

export class VideoProjection {
  constructor(canvas, configs) {
    this.canvas = canvas;
    this.grids = [];
    this.currentId = configs[0].id;
    this.oldId = null;
    this.isAnimating = false;
    this.animFrame = null;
    this.startTime = performance.now();

    this.scene = new THREE.Scene();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.z = 9;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a14, 1);

    for (let i = 0; i < configs.length; i++) {
      this.createGrid(configs[i], i);
    }

    for (const g of this.grids) {
      if (g.name !== this.currentId) {
        g.children.forEach((m) => m.scale.setScalar(0));
      }
    }

    console.log(
      'grids created:',
      this.grids.map((g) => `${g.name}: ${g.children.length} cubes`),
    );

    this.resizeHandler = this.resize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
    this.animate();
  }

  createGrid(config, index) {
    const group = new THREE.Group();
    group.name = config.id;
    group.position.z = -1.5 * index;
    this.scene.add(group);

    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    const texCtx = texCanvas.getContext('2d');

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });

    const { data, width, height } = config.maskData;
    const gridSize = config.gridSize || 10;
    const spacing = config.spacing || 0.75;
    const aspect = width / height;

    let gw, gh;
    if (aspect > 1) {
      gw = gridSize;
      gh = Math.max(1, Math.round(gridSize / aspect));
    } else {
      gh = gridSize;
      gw = Math.max(1, Math.round(gridSize * aspect));
    }

    for (let x = 0; x < gw; x++) {
      for (let y = 0; y < gh; y++) {
        const maskX = Math.floor(((x + 0.5) / gw) * width);
        const maskY = Math.floor(((y + 0.5) / gh) * height);
        const fy = height - 1 - maskY;
        const pi = (fy * width + maskX) * 4;
        const brightness = (data[pi] + data[pi + 1] + data[pi + 2]) / 3;
        if (brightness >= 128) continue;

        const geom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const uvW = 1 / gw, uvH = 1 / gh;
        const uvX = x / gw, uvY = y / gh;
        const uvs = geom.attributes.uv.array;

        for (let i = 0; i < uvs.length; i += 2) {
          uvs[i] = uvX + uvs[i] * uvW;
          uvs[i + 1] = uvY + uvs[i + 1] * uvH;
        }
        geom.attributes.uv.needsUpdate = true;

        const mesh = new THREE.Mesh(geom, material);
        mesh.position.x = (x - (gw - 1) / 2) * spacing;
        mesh.position.y = (y - (gh - 1) / 2) * spacing;
        group.add(mesh);
      }
    }

    group.scale.setScalar(0.5);
    group.userData = { texCanvas, texCtx, texture, palette: config.palette };
    this.grids.push(group);
  }

  switchTo(id) {
    if (this.isAnimating || id === this.currentId) return;
    this.isAnimating = true;
    this.oldId = this.currentId;
    this.currentId = id;

    const next = this.grids.find((g) => g.name === id);
    const prev = this.grids.find((g) => g.name === this.oldId);

    this.reveal(next);
    this.hide(prev);
  }

  reveal(grid) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut', duration: 0.8 } });
    grid.children.forEach((child, i) => {
      tl.to(child.scale, { x: 1, y: 1, z: 1 }, i * 0.003);
      tl.to(child.position, { z: 0 }, '<');
    });
  }

  hide(grid) {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut', duration: 0.6 },
      onComplete: () => {
        this.isAnimating = false;
      },
    });
    grid.children.forEach((child, i) => {
      tl.to(child.scale, { x: 0, y: 0, z: 0 }, i * 0.003);
      tl.to(
        child.position,
        {
          z: 6,
          onComplete: () => {
            gsap.set(child.scale, { x: 0, y: 0, z: 0 });
            gsap.set(child.position, { z: -6 });
          },
        },
        '<',
      );
    });
  }

  animate() {
    this.animFrame = requestAnimationFrame(() => this.animate());
    const elapsed = performance.now() - this.startTime;

    for (const g of this.grids) {
      const u = g.userData;
      if (!u.texCtx) continue;
      drawFrame(u.texCtx, elapsed, u.palette);
      u.texture.needsUpdate = true;

      g.children.forEach((mesh, i) => {
        mesh.position.z = Math.sin(elapsed * 0.001 + i * 0.1) * 0.5;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.resizeHandler);
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
  }
}
