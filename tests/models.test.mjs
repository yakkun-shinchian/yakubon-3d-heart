import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {structures} from '../src/anatomy.js';
const data=readFileSync(new URL('../public/models/heart.glb',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('../public/models/manifest.json',import.meta.url)));
const jsonLength=data.readUInt32LE(12);
const gltf=JSON.parse(data.subarray(20,20+jsonLength).toString());
const bin=data.subarray(28+jsonLength);
test('GLB header, buffer lengths and checksum match the recorded artifact',()=>{
  assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
  assert.equal(data.readUInt32LE(16),0x4e4f534a);assert.equal(data.readUInt32LE(24+jsonLength),0x004e4942);
  assert.equal(bin.length,gltf.buffers[0].byteLength);
  assert.equal(createHash('sha256').update(data).digest('hex'),manifest.glbSHA256);
  assert(data.length<4*1024*1024);
});
test('Every UI structure has distinct traceable source meshes; four chambers and four valves exist',()=>{
  assert.deepEqual(manifest.structures.map(s=>s.id).sort(),structures.map(s=>s.id).sort());
  const elements=manifest.structures.flatMap(s=>s.elements.map(e=>e.id));assert.equal(new Set(elements).size,elements.length);
  const required={ra:['FJ2424'],rv:['FJ2423'],la:['FJ2425'],lv:['FJ2422'],tricuspid:['FJ2421','FJ2433','FJ2436'],mitral:['FJ2420','FJ2432'],'pulmonary-valve':['FJ2417','FJ2434','FJ2427'],'aortic-valve':['FJ2431','FJ2435','FJ2426'],rca:['FJ2723'],lad:['FJ2631']};
  for(const [id,expected] of Object.entries(required))assert.deepEqual(manifest.structures.find(s=>s.id===id).elements.map(e=>e.id),expected);
  for(const s of manifest.structures) for(const e of s.elements){
    const bytes=readFileSync(new URL(`../source/bodyparts3d/selected/${e.id}.obj`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),e.sha256);
  }
});
test('All indices address finite vertex data and normals are unit length',()=>{
  function values(id){const a=gltf.accessors[id],v=gltf.bufferViews[a.bufferView],count=a.count*(a.type==='VEC3'?3:1);assert(v.byteOffset+v.byteLength<=bin.length);return Array.from({length:count},(_,i)=>a.componentType===5126?bin.readFloatLE(v.byteOffset+i*4):bin.readUInt32LE(v.byteOffset+i*4));}
  for(const m of gltf.meshes){const p=m.primitives[0],pos=values(p.attributes.POSITION),norm=values(p.attributes.NORMAL),indices=values(p.indices);assert(pos.every(Number.isFinite));assert.equal(pos.length,norm.length);assert.equal(indices.length%3,0);assert(indices.every(i=>i<pos.length/3));for(let i=0;i<norm.length;i+=3)assert(Math.abs(Math.hypot(...norm.slice(i,i+3))-1)<1e-5);}
});
test('Official anatomical axes survive conversion: right atrium lies right of left atrium, LAD anterior',()=>{
  const bounds=id=>{const node=gltf.nodes.find(n=>n.name===id);return gltf.accessors[gltf.meshes[node.mesh].primitives[0].attributes.POSITION];};
  const ra=bounds('FJ2424'),la=bounds('FJ2425'),lad=bounds('FJ2631');
  assert((ra.min[0]+ra.max[0])<(la.min[0]+la.max[0]));assert(lad.min[2]>0);
  const ivc=bounds('FJ3441');assert(Math.abs(ivc.min[1]-(1162-1240)*.025)<1e-5);
});
