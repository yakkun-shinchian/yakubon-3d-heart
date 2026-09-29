export const categories = [
  { id: 'chambers', label: '心腔', note: '色のついた面は、心腔の内部空間を表しています。' },
  { id: 'valves', label: '弁', note: '心腔と大血管を薄く表示しています。弁尖は静止した形状です。' },
  { id: 'vessels', label: '大血管', note: '背面に回すと、左心房へ戻る肺静脈を確認できます。' },
  { id: 'coronary', label: '冠動脈', note: '心筋を透かして、冠動脈の走行をたどりましょう。' },
];
const specs = [
  ['ra','chambers','右心房','RA','Right Atrium','#4688c9','全身から戻る血液を受け取る心腔。上・下大静脈とのつながりを見てみましょう。','前面から見て左側が、身体の右です。'],
  ['rv','chambers','右心室','RV','Right Ventricle','#75b9dd','右心房からの血液を肺動脈へ送り出します。心臓の前面側に広がっています。','前面から、肺動脈へ向かう部分を探しましょう。'],
  ['la','chambers','左心房','LA','Left Atrium','#e67c97','肺静脈から戻る血液を受け取ります。心臓の背面側に位置します。','「背面」にすると、肺静脈とのつながりが見えます。'],
  ['lv','chambers','左心室','LV','Left Ventricle','#cf5367','血液を大動脈から全身へ送り出す心腔です。心尖部側へ続きます。','腔の色と、その外側の心筋を見分けましょう。'],
  ['tricuspid','valves','三尖弁','TV','Tricuspid Valve','#f2be52','右心房と右心室の間にある房室弁です。','黄色の3つの弁尖を確認できます。'],
  ['pulmonary-valve','valves','肺動脈弁','PV','Pulmonary Valve','#75cfbd','右心室から肺動脈幹へ出るところにあります。','大動脈弁との前後・上下の関係を観察しましょう。'],
  ['mitral','valves','僧帽弁','MV','Mitral Valve','#f39861','左心房と左心室の間にある房室弁です。','2枚の弁尖を元データの位置に表示しています。'],
  ['aortic-valve','valves','大動脈弁','AV','Aortic Valve','#b09ce4','左心室から大動脈へ出るところにあります。','大動脈の根元と弁の位置を照らし合わせましょう。'],
  ['aorta','vessels','大動脈','Ao','Aorta','#cf5367','左心室から全身へ血液を運びます。本モデルは上行大動脈と大動脈弓を表示します。','弓の先や頸部へ向かう枝は、この教材では省略しています。'],
  ['pa','vessels','肺動脈','PA','Pulmonary Artery','#6fa8d4','右心室から肺へ向かう血管。肺動脈幹と左右の肺動脈を表示しています。','横から回して、大動脈との立体的な関係を見ましょう。'],
  ['pv','vessels','肺静脈','PVs','Pulmonary Veins','#e67c97','肺から左心房へ戻る血管です。左右の上・下肺静脈の部品をまとめています。','「背面」で左心房への入り口を見てみましょう。'],
  ['svc','vessels','上大静脈','SVC','Superior Vena Cava','#4688c9','上半身から右心房へ血液が戻る経路です。','右心房の上方に注目しましょう。'],
  ['ivc','vessels','下大静脈','IVC','Inferior Vena Cava','#4688c9','下半身から右心房へ血液が戻る経路です。心臓付近だけを表示しています。','下端は表示範囲の切り口で、血管の終わりではありません。'],
  ['rca','coronary','右冠動脈','RCA','Right Coronary Artery','#d68e24','右の房室間溝に沿って、右側から後方へ回り込みます。','個人差があります。本モデルでは主幹を表示しています。'],
  ['lad','coronary','左前下行枝','LAD','Left Anterior Descending Artery','#e5b533','前室間溝に沿って、心尖部の方向へ走ります。','前面から心尖部まで、指で回しながらたどりましょう。'],
  ['lcx','coronary','左回旋枝','LCX','Left Circumflex Artery','#cb7336','左の房室間溝に沿って、左側から後方へ回り込みます。','「左側」から「背面」へ回すと走行が見やすくなります。'],
  ['lm','coronary','左冠動脈主幹部','LMT','Left Main Coronary Artery','#efc261','大動脈側からLAD・LCXへ続く短い主幹部です。','分岐先との位置関係を確認しましょう。'],
  ['myocardium','wall','心筋（心房壁・心室壁）','','Chamber Walls','#b77a7b','心房壁と心室壁の表面モデルです。','心室壁は左右共通のメッシュです。'],
];
export const structures = specs.map(([id,category,label,short,english,color,description,tip])=>({id,category,label,short,english,color,description,tip}));
export const byId = Object.fromEntries(structures.map(s=>[s.id,s]));
export const allVisible = () => Object.fromEntries(structures.map(s=>[s.id,true]));
