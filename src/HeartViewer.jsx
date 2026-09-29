import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { byId } from './anatomy';
import { createBloodFlow } from './BloodFlow';
import { advanceFlow } from './flowPaths';

export default function HeartViewer({ mode, selected, visible, opacity, view, resetKey, flow, onReady, onSelect, onFreeView }) {
  const host=useRef(null), engine=useRef(null), latest=useRef({onSelect,onFreeView});
  const [status,setStatus]=useState('心臓モデルを読み込んでいます…');
  const [error,setError]=useState(false);
  latest.current={onSelect,onFreeView,onReady,mode,selected,visible,opacity,flow};
  useEffect(()=>{
    const el=host.current;
    let renderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'}); }
    catch { setStatus('3D表示を開始できませんでした。Safari / Chromeを更新して、ページを開き直してください。');setError(true);return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0xe7edf1,0);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','心臓の3Dモデル。ドラッグで回転、2本指で拡大と移動。矢印キーで回転、プラス・マイナスで拡大縮小。');
    renderer.domElement.tabIndex=0;
    const scene=new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff,0xa4aaba,2.5));
    [[-5,7,9,3],[6,2,-5,2]].forEach(([x,y,z,i])=>{const l=new THREE.DirectionalLight(0xffffff,i);l.position.set(x,y,z);scene.add(l);});
    const camera=new THREE.PerspectiveCamera(34,1,.05,100);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true; controls.dampingFactor=.09;
    controls.minDistance=3.1; controls.maxDistance=22;
    controls.touches.ONE=THREE.TOUCH.ROTATE;
    controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
    const meshes=[], groups=new Map();
    let frame=0, disposed=false, pending=0;
    let bloodFlow=null, flowTime=0, lastTick=null, flowRevision=-1, contextLost=false;
    const compass=el.querySelector('.compass');
    const positions=[['前',new THREE.Vector3(0,0,1)],['後',new THREE.Vector3(0,0,-1)],['左',new THREE.Vector3(1,0,0)],['右',new THREE.Vector3(-1,0,0)],['上',new THREE.Vector3(0,1,0)]];
    function draw(timestamp){
      frame=0;
      if(disposed||document.hidden||contextLost)return;
      const {mode,flow}=latest.current;
      const active=mode==='flow'&&!!bloodFlow;
      flowTime=advanceFlow(flowTime,lastTick===null?0:(timestamp-lastTick)/1000,flow.speed,flow.playing,active,true);
      lastTick=active&&flow.playing?timestamp:null;
      if(bloodFlow){bloodFlow.root.visible=active;if(active)bloodFlow.update(flowTime,flow.side);}
      el.dataset.flowState=active?(flow.playing?'playing':'paused'):'off';
      el.dataset.flowTime=flowTime.toFixed(4);
      el.dataset.flowSide=flow.side;
      const changing=controls.update();
      renderer.render(scene,camera);
      const q=camera.quaternion.clone().invert();
      for(let i=0;i<positions.length;i++){
        const p=positions[i][1].clone().applyQuaternion(q), label=compass.children[i];
        label.style.transform=`translate(${p.x*29}px,${-p.y*29}px)`;
        label.style.opacity=String(.45+(p.z+1)*.275);
      }
      if(changing||pending-->0||active&&flow.playing) invalidate();
    }
    function invalidate(){if(!frame&&!disposed&&!document.hidden&&!contextLost)frame=requestAnimationFrame(draw);}
    function syncFlow(){
      const {flow}=latest.current;
      if(flow.revision!==flowRevision){flowTime=0;flowRevision=flow.revision;}
      lastTick=null;invalidate();
    }
    const visibilityChange=()=>{lastTick=null;if(document.hidden){cancelAnimationFrame(frame);frame=0;el.dataset.flowState='suspended';}else invalidate();};
    document.addEventListener('visibilitychange',visibilityChange);
    function preset(name='front'){
      controls.target.set(0,0,0); camera.up.set(0,1,0);
      // Fit the source envelope in narrow tablet viewports as well as short phones.
      const distance=latest.current.mode==='flow'?Math.max(8.2,2.15/(Math.tan(THREE.MathUtils.degToRad(17))*camera.aspect)+1.95):(camera.aspect<.85?12.6:10.4);
      const p={front:[0,.25,distance],back:[0,.25,-distance],left:[distance,.25,0],top:[0,distance,.001]}[name]||[0,.25,distance];
      camera.position.set(...p); controls.update();pending=3;invalidate();
    }
    function style(){
      const {mode,selected,visible,opacity}=latest.current;
      for(const mesh of meshes){
        const s=byId[mesh.userData.structureId];
        mesh.visible=!!visible[s.id];
        let alpha=1;
        if(s.category==='wall') alpha=opacity/100;
        else if(mode==='flow') alpha=s.category==='chambers'?.10:s.category==='vessels'?.20:s.category==='valves'?.38:.04;
        else if(mode==='valves' && s.category!=='valves') alpha=s.category==='chambers'?.07:.13;
        else if(mode==='coronary' && s.category!=='coronary') alpha=s.category==='chambers'?.14:.28;
        else if(mode==='vessels' && s.category==='chambers') alpha=.35;
        else if(s.category==='chambers') alpha=.9;
        if(mode==='coronary' && s.category==='coronary' && s.id!==selected) alpha=.38;
        if(s.id===selected && s.category!=='wall') alpha=mode==='flow'?.30:1;
        mesh.visible=mesh.visible&&alpha>0;
        mesh.material.opacity=alpha;
        mesh.material.transparent=alpha<1;
        mesh.material.depthWrite=alpha>=1;
        mesh.material.emissive.set(s.id===selected?s.color:0x000000);
        mesh.material.emissiveIntensity=s.id===selected?.18:0;
        mesh.renderOrder=s.category==='wall'?3:alpha<1?2:0;
      }
      invalidate();
    }
    engine.current={style,preset,syncFlow,scene,camera,controls,meshes,renderer};
    const resize=new ResizeObserver(()=>{
      const w=el.clientWidth,h=el.clientHeight;
      renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
      invalidate();
    });resize.observe(el);
    camera.aspect=el.clientWidth/el.clientHeight;preset();
    controls.addEventListener('change',invalidate);
    const start=()=>{latest.current.onFreeView();};controls.addEventListener('start',start);
    const activePointers=new Set(); let down=null, dragged=false;
    const pointerDown=e=>{activePointers.add(e.pointerId);if(activePointers.size>1)dragged=true;else {down={x:e.clientX,y:e.clientY,time:performance.now()};dragged=false;}};
    const pointerMove=e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)dragged=true;};
    const raycaster=new THREE.Raycaster();
    const pointerUp=e=>{
      activePointers.delete(e.pointerId);
      if(!down||dragged||performance.now()-down.time>700)return;
      const rect=renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
      const hits=raycaster.intersectObjects(meshes.filter(m=>m.visible&&byId[m.userData.structureId].category!=='wall'),false);
      const hit=hits.find(h=>byId[h.object.userData.structureId].category===latest.current.mode)||hits.find(h=>h.object.material.opacity>.3);
      if(hit)latest.current.onSelect(hit.object.userData.structureId);
      down=null;
    };
    const cancel=e=>{activePointers.delete(e.pointerId);down=null;dragged=true;};
    const key=e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;
      e.preventDefault();latest.current.onFreeView();
      const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);
      if(e.key==='ArrowLeft')s.theta-=.16;if(e.key==='ArrowRight')s.theta+=.16;
      if(e.key==='ArrowUp')s.phi-=.16;if(e.key==='ArrowDown')s.phi+=.16;
      if(e.key==='+'||e.key==='=')s.radius*=.9;if(e.key==='-')s.radius*=1.1;
      s.radius=THREE.MathUtils.clamp(s.radius,controls.minDistance,controls.maxDistance);s.makeSafe();
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();invalidate();
    };
    const lost=e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frame);latest.current.onReady(false);setStatus('3D表示が中断されました。ページを再読み込みしてください。');setError(true);};
    const events={pointerdown:pointerDown,pointermove:pointerMove,pointerup:pointerUp,pointercancel:cancel,keydown:key,webglcontextlost:lost};
    Object.entries(events).forEach(([n,f])=>renderer.domElement.addEventListener(n,f));
    new GLTFLoader().load(`${import.meta.env.BASE_URL}models/heart.glb`,gltf=>{
      if(disposed){gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return;}
      gltf.scene.traverse(o=>{
        if(!o.isMesh)return;
        const id=o.userData.structureId;
        if(!byId[id])throw new Error(`Unknown structure: ${id}`);
        o.material=o.material.clone();o.material.color.set(byId[id].color);
        o.material.roughness=.52;o.material.metalness=0;
        meshes.push(o);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(o);
      });
      scene.add(gltf.scene);
      bloodFlow=createBloodFlow(meshes);scene.add(bloodFlow.root);bloodFlow.root.visible=false;
      style();syncFlow();setStatus('');latest.current.onReady(true);
      el.dataset.ready='true';el.dataset.structures=String(groups.size);
    },undefined,()=>{if(!disposed){setStatus('モデルを読み込めませんでした。通信を確認して再読み込みしてください。');setError(true);}});
    return ()=>{disposed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibilityChange);bloodFlow?.dispose();resize.disconnect();controls.dispose();Object.entries(events).forEach(([n,f])=>renderer.domElement.removeEventListener(n,f));meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});renderer.dispose();renderer.domElement.remove();engine.current=null;};
  },[]);
  useEffect(()=>{engine.current?.style();},[mode,selected,visible,opacity]);
  useEffect(()=>{if(view)engine.current?.preset(view);},[view,resetKey]);
  useEffect(()=>{engine.current?.syncFlow();},[flow,mode]);
  return <div className="viewer" ref={host} data-testid="viewer">
    <div className="compass" aria-label="身体の向き"><span>前</span><span>後</span><span>左</span><span>右</span><span>上</span></div>
    {status&&<div className={`loading ${error?'error':''}`} role={error?'alert':'status'}>{!error&&<span className="loader"/>}{status}{error&&<button onClick={()=>location.reload()}>再読み込み</button>}</div>}
  </div>;
}
