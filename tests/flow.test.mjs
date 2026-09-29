import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeFlowPaths, advanceFlow, FLOW_SECONDS } from '../src/flowPaths.js';
import { createBloodFlow } from '../src/BloodFlow.js';
import { Box3, Vector3 } from 'three';

const bytes=readFileSync(new URL('../public/models/heart.glb',import.meta.url));
const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
const boxes=Object.fromEntries(doc.nodes.filter(n=>n.mesh!==undefined).map(n=>{
  const a=doc.accessors[doc.meshes[n.mesh].primitives[0].attributes.POSITION];
  return [n.name,{min:a.min,max:a.max}];
}));
const paths=makeFlowPaths(boxes);

test('Both caval inlets pass the correct chambers and valves, with no direct right-to-left connection',()=>{
  const edges=paths.map(p=>`${p.from}>${p.to}`);
  for(const edge of ['svc>ra','ivc>ra','ra>tricuspid','tricuspid>rv','rv>pulmonary-valve','pulmonary-valve>pa','pa>lungs','pv>la','la>mitral','mitral>lv','lv>aortic-valve','aortic-valve>aorta'])assert(edges.includes(edge),edge);
  assert.equal(paths.filter(p=>p.from==='pv'&&p.to==='la').length,4);
  assert.equal(paths.filter(p=>p.to==='lungs').length,2);
  const right=new Set(paths.filter(p=>p.side==='right').flatMap(p=>[p.from,p.to]));
  const left=new Set(paths.filter(p=>p.side==='left').flatMap(p=>[p.from,p.to]));
  assert([...right].every(id=>!left.has(id)));
  assert.equal(paths.length,16);
});

test('Flow curves are open, finite, continuous at chamber/valve joins, and have correct caval direction',()=>{
  for(const p of paths){assert.equal(p.curve.closed,false);assert(p.curve.getLength()>.1);for(const t of [0,.1,.3,.5,.8,1]){assert(p.curve.getPointAt(t).toArray().every(Number.isFinite));assert(Math.abs(p.curve.getTangentAt(t).length()-1)<1e-6);}}
  for(const [inlet,outlet] of [['svc-ra','ra-tv'],['ivc-ra','ra-tv'],['ra-tv','tv-rv'],['tv-rv','rv-pv'],['rv-pv','pv-pa'],['la-mv','mv-lv'],['mv-lv','lv-av'],['lv-av','av-body']]){
    assert(paths.find(p=>p.id===inlet).curve.getPointAt(1).distanceTo(paths.find(p=>p.id===outlet).curve.getPointAt(0))<1e-8);
  }
  const svc=paths.find(p=>p.id==='svc-ra'),ivc=paths.find(p=>p.id==='ivc-ra');
  assert(svc.points[0].y>svc.points.at(-1).y);assert(ivc.points[0].y<ivc.points.at(-1).y);
  assert.throws(()=>makeFlowPaths({}),/Missing blood-flow landmark/);
});

test('Timeline freezes when paused, outside flow mode or in background; speed and wrap are deterministic',()=>{
  assert.equal(advanceFlow(2,.05,1,false,true,true),2);
  assert.equal(advanceFlow(2,.05,1,true,false,true),2);
  assert.equal(advanceFlow(2,.05,1,true,true,false),2);
  assert.equal(advanceFlow(2,.05,2,true,true,true),2.1);
  assert.equal(advanceFlow(2,.05,.5,true,true,true),2.025);
  assert.equal(advanceFlow(2,60,1,true,true,true),2.1);
  assert(Math.abs(advanceFlow(FLOW_SECONDS-.01,.02,1,true,true,true)-.01)<1e-8);
});

test('Animation matrices move, side filtering changes actual scene visibility, and disposal is safe',()=>{
  const meshes=Object.entries(boxes).map(([name,b])=>({name,geometry:{computeBoundingBox(){},boundingBox:new Box3(new Vector3(...b.min),new Vector3(...b.max))}}));
  const flow=createBloodFlow(meshes);
  flow.update(0,'both');
  const particle=flow.root.children[0].children.find(o=>o.isInstancedMesh);
  const before=Array.from(particle.instanceMatrix.array);
  flow.update(.3,'right');assert.notDeepEqual(Array.from(particle.instanceMatrix.array),before);
  assert.equal(flow.root.children[0].visible,true);assert.equal(flow.root.children[1].visible,false);
  flow.update(.3,'left');assert.equal(flow.root.children[0].visible,false);assert.equal(flow.root.children[1].visible,true);
  flow.update(0,'both');assert.deepEqual(Array.from(particle.instanceMatrix.array),before);
  flow.dispose();
});
