import * as THREE from 'three';
import { FLOW_COLORS, FLOW_SECONDS, makeFlowPaths } from './flowPaths.js';

export function createBloodFlow(meshes) {
  const boxes = {};
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox();
    const b = mesh.geometry.boundingBox;
    boxes[mesh.name] = { min: b.min.toArray(), max: b.max.toArray() };
  }
  const paths = makeFlowPaths(boxes);
  const root = new THREE.Group();
  root.name = 'schematic-blood-flow';
  const batches = [];
  const sphere = new THREE.SphereGeometry(.06, 10, 8);
  const cone = new THREE.ConeGeometry(.07, .20, 10);
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const position = new THREE.Vector3();

  for (const side of ['right', 'left']) {
    const routes = paths.filter(p => p.side === side);
    const group = new THREE.Group();
    root.add(group);
    const material = new THREE.MeshBasicMaterial({ color: FLOW_COLORS[side], transparent: true, depthTest: false, depthWrite: false });
    const particles = new THREE.InstancedMesh(sphere, material, routes.length * 3);
    const arrows = new THREE.InstancedMesh(cone, material, routes.length);
    particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particles.frustumCulled = false;
    arrows.frustumCulled = false;
    particles.renderOrder = 11;
    arrows.renderOrder = 10;
    group.add(particles, arrows);
    const guides = [];
    routes.forEach((route, i) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(route.curve.getSpacedPoints(64));
      const lineMaterial = new THREE.LineDashedMaterial({ color: FLOW_COLORS[side], transparent: true, opacity: .46, dashSize: .065, gapSize: .045, depthTest: false, depthWrite: false });
      const line = new THREE.Line(geometry, lineMaterial);
      line.computeLineDistances();
      line.renderOrder = 9;
      guides.push(line);
      group.add(line);
      dummy.position.copy(route.curve.getPointAt(.58));
      dummy.quaternion.setFromUnitVectors(up, route.curve.getTangentAt(.58).normalize());
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      arrows.setMatrixAt(i, dummy.matrix);
    });
    arrows.instanceMatrix.needsUpdate = true;
    batches.push({ side, routes, group, particles, arrows, guides, material });
  }

  function update(time, side = 'both') {
    for (const batch of batches) {
      batch.group.visible = side === 'both' || side === batch.side;
      if (!batch.group.visible) continue;
      batch.routes.forEach((route, i) => {
        for (let n = 0; n < 3; n++) {
          const t = (time / FLOW_SECONDS + n / 3 + i * .07) % 1;
          route.curve.getPointAt(t, position);
          dummy.position.copy(position);
          dummy.quaternion.identity();
          // Fade the start/end using scale, without drawing an artificial return path.
          dummy.scale.setScalar(Math.min(1, t * 14, (1 - t) * 14));
          dummy.updateMatrix();
          batch.particles.setMatrixAt(i * 3 + n, dummy.matrix);
        }
      });
      batch.particles.instanceMatrix.needsUpdate = true;
    }
  }

  function dispose() {
    sphere.dispose(); cone.dispose();
    batches.forEach(b => {
      b.material.dispose(); b.particles.dispose(); b.arrows.dispose();
      b.guides.forEach(line => { line.geometry.dispose(); line.material.dispose(); });
    });
    root.removeFromParent();
  }
  update(0);
  return { root, update, dispose, paths };
}
