import React, { useState } from 'react';
import HeartViewer from './HeartViewer';
import { categories, structures, byId, allVisible } from './anatomy';

function Eye({open}) {return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 12s3.7-6.7 10-6.7S22 12 22 12s-3.7 6.7-10 6.7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{!open&&<path d="m3 3 18 18"/>}</svg>}
function InfoDialog({onClose}) {return <div className="modal-backdrop" onClick={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const els=[...e.currentTarget.querySelectorAll('a,button')];const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}>
    <button className="close" onClick={onClose} autoFocus>閉じる</button><h2 id="about-title">3D HEARTについて</h2>
    <p>看護の「わからない」を30秒で、なるほどへ。</p><h3>使い方</h3><p>1本指のドラッグで回転。2本指のピンチで拡大・縮小、2本指のドラッグで移動します。PCでは左ドラッグで回転、右ドラッグで移動、ホイールで拡大できます。</p><p>構造名またはモデルをタップして選択。目のボタンで表示を切り替えます。キーボードは3D領域にフォーカスし、矢印キーで回転、＋／−で拡大・縮小できます。</p>
    <h3>モデルと色について</h3><p>色は構造を区別するための学習用配色です。心腔の面は内部空間を表し、心筋ではありません。弁尖は静止形状で、開閉や血流速度を再現していません。末梢血管など一部を省略しています。</p><p>BodyParts3Dの軽量版を使用しています。個人差があり、微細構造・病変の判定には使えません。v1は医学監修・実機iPad検証前の学習用プレビューです。</p>
    <h3>出典・利用条件</h3><p>BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.</p><p>変更：心臓部品の抽出、共通座標変換、GLB変換、配色、下大静脈の表示範囲短縮。元形状の推測による追加はしていません。</p><p><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">公式利用許諾</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · <a href="./models/manifest.json" target="_blank" rel="noreferrer">部品ID・取得記録</a></p>
    <p>解説の確認資料：<a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy" target="_blank" rel="noreferrer">OpenStax</a> / <a href="https://www.nhlbi.nih.gov/health/heart/blood-flow" target="_blank" rel="noreferrer">NHLBI</a>。取得・確認日：2026年9月29日。</p>
  </section></div>}

export default function App(){
  const [mode,setMode]=useState('chambers'),[selected,setSelected]=useState('ra');
  const [visible,setVisible]=useState(allVisible),[opacity,setOpacity]=useState(20);
  const [view,setView]=useState('front'),[resetKey,setResetKey]=useState(0),[about,setAbout]=useState(false);
  const s=byId[selected],category=categories.find(c=>c.id===mode);
  function select(id){setSelected(id);setVisible(v=>({...v,[id]:true}));if(byId[id].category!==mode)changeMode(byId[id].category,id);}
  function changeMode(id,selection){setMode(id);setSelected(selection||structures.find(s=>s.category===id).id);setOpacity(id==='valves'?8:id==='coronary'?15:20);}
  function preset(id){setView(id);setResetKey(k=>k+1);if(id==='top')changeMode('valves');}
  function reset(){setMode('chambers');setSelected('ra');setVisible(allVisible());setOpacity(20);setView('front');setResetKey(k=>k+1);}
  const toggle=id=>setVisible(v=>({...v,[id]:!v[id]}));
  return <><header className="header"><a className="brand" href="./"><span>YAKUBON STUDIO</span><strong>3D HEART</strong></a><button className="text-button" id="help-button" onClick={()=>setAbout(true)}>使い方・出典</button></header>
    <main className="app-layout"><section className="stage" aria-label="心臓の3Dビュー">
      <div className="stage-heading"><h1>心臓を、立体で理解する。</h1><p>指で回す。透かす。つながりが見える。</p>
      <div className="view-controls" aria-label="視点を選ぶ">{[['front','前面'],['back','背面'],['left','左側'],['top','弁を上から']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>preset(id)}>{label}</button>)}</div></div>
      <HeartViewer {...{mode,selected,visible,opacity,view,resetKey}} onSelect={select} onFreeView={()=>setView(null)}/>
      <div className="selection-caption"><span style={{background:s.color}}/>{s.short&&`${s.short}｜`}{s.label}{!visible[selected]&&'（非表示）'}</div>
      <div className="stage-bottom"><p>1本指で回転 / 2本指で拡大・移動</p><button className="text-button" onClick={reset}>最初の表示に戻す</button></div>
    </section><aside className="inspector"><div className="inspector-title"><h2>構造を見つける</h2><p>見たい構造を選んで、つながりを観察。</p></div>
      <nav className="tabs" aria-label="構造の分類">{categories.map(c=><button key={c.id} aria-pressed={mode===c.id} onClick={()=>changeMode(c.id)}>{c.label}</button>)}</nav>
      <div className="structure-list">{structures.filter(s=>s.category===mode).map(item=><div className={`structure-row ${item.id===selected?'selected':''} ${!visible[item.id]?'hidden-structure':''}`} key={item.id}><button className="select-structure" aria-pressed={selected===item.id} onClick={()=>select(item.id)}><span className="color-dot" style={{background:item.color}}/><span>{item.label}</span><small>{item.short}</small></button><button className="eye-button" onClick={()=>toggle(item.id)} aria-label={`${item.label}を${visible[item.id]?'非表示':'表示'}にする`} aria-pressed={visible[item.id]}><Eye open={visible[item.id]}/></button></div>)}</div>
      <section className="structure-detail" aria-live="polite"><h2>{s.label}</h2><p className="english">{s.english}</p><p>{s.description}</p><p className="tip">{s.tip}</p></section>
      <div className="opacity-control"><div className="slider-heading"><label htmlFor="opacity">心筋の不透明度</label><output htmlFor="opacity">{opacity}%</output></div><input id="opacity" type="range" min="0" max="100" step="1" value={opacity} onChange={e=>setOpacity(Number(e.target.value))} aria-valuetext={`${opacity}パーセント。100パーセントは透けない表示。`}/><div className="slider-labels"><span>0% 透明</span><span>100% 透けない</span></div><label className="wall-toggle"><input type="checkbox" checked={visible.myocardium} onChange={()=>toggle('myocardium')}/>心筋を表示</label></div>
      <p className="mode-note">{category.note}</p>
      <footer className="credits"><span>3Dモデル提供 <strong>BodyParts3D / DBCLS</strong></span><button className="text-button" onClick={()=>setAbout(true)}>学習用モデル · v1 / 出典・利用条件</button><p>© The Database Center for Life Science<br/><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · 心臓部品の抽出・GLB変換・配色等</p></footer>
    </aside></main>{about&&<InfoDialog onClose={()=>{setAbout(false);document.getElementById('help-button')?.focus();}}/>}</>;
}
