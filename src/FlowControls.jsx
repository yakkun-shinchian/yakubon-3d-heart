import React from 'react';
import { byId } from './anatomy';
import { FLOW_NOTE } from './flowPaths';

export function FlowTransport({flow, setFlow, ready}) {
  return <div className="flow-transport" aria-label="血流の再生操作">
    <button className="play-flow" disabled={!ready} onClick={()=>setFlow(f=>({...f,playing:!f.playing}))}>
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">{flow.playing?<path d="M4 3h4v14H4zm8 0h4v14h-4z"/>:<path d="m5 2 12 8-12 8z"/>}</svg>
      {!ready?'モデル読込中':flow.playing?'一時停止':'血流を再生'}
    </button>
    <button disabled={!ready} onClick={()=>setFlow(f=>({...f,revision:f.revision+1}))}>先頭に戻す</button>
  </div>;
}

export default function FlowControls({flow,setFlow,selected,onSelect}) {
  const step = (id, label) => <button key={id} className="flow-step" aria-pressed={selected===id} onClick={()=>onSelect(id)}>{label||byId[id].label}</button>;
  const chain = ids => ids.map((id,i)=><React.Fragment key={id}>{i>0&&<span className="flow-arrow" aria-hidden="true">→</span>}{step(id)}</React.Fragment>);
  return <section className="flow-controls" aria-label="血流の表示設定">
    <h3>血液は、どこからどこへ？</h3>
    <div className="flow-side" aria-label="表示する血流">{[['both','両方'],['right','右心系'],['left','左心系']].map(([id,label])=><button key={id} aria-pressed={flow.side===id} onClick={()=>setFlow(f=>({...f,side:id}))}>{label}</button>)}</div>
    <label className="flow-speed">表示速度<select value={flow.speed} onChange={e=>setFlow(f=>({...f,speed:Number(e.target.value)}))}><option value="0.5">ゆっくり · 0.5倍</option><option value="1">標準 · 1倍</option><option value="2">速く · 2倍</option></select></label>
    {flow.side!=='left'&&<div className="flow-route right"><h4><span/>右心系 <small>酸素の少ない血液</small></h4><div className="flow-chain"><span className="paired-inlet">{step('svc')}<span> / </span>{step('ivc')}</span><span className="flow-arrow" aria-hidden="true">→</span>{chain(['ra','tricuspid','rv','pulmonary-valve','pa'])}<span className="flow-arrow" aria-hidden="true">→</span><strong className="flow-terminal">肺へ</strong></div></div>}
    {flow.side!=='right'&&<div className="flow-route left"><h4><span/>左心系 <small>酸素の多い血液</small></h4><div className="flow-chain"><strong className="flow-terminal">肺から</strong><span className="flow-arrow" aria-hidden="true">→</span>{chain(['pv','la','mitral','lv','aortic-valve','aorta'])}<span className="flow-arrow" aria-hidden="true">→</span><strong className="flow-terminal">全身へ</strong></div></div>}
    <p className="flow-help">構造名を押すと、心臓の中の位置を強調します。</p>
    <p className="flow-note">{FLOW_NOTE}</p>
    <p className="flow-note">青と赤は酸素の量を区別する学習用配色です。血液そのものが青いわけではありません。肺・全身内の循環は省略しています。</p>
  </section>;
}
