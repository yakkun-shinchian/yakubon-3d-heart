import { CatmullRomCurve3, Vector3 } from 'three';

// Educational guide paths, not measured vessel centerlines or CFD streamlines.
// Fractions below are layout estimates within the source mesh bounding boxes.
export const FLOW_SECONDS = 5;
export const FLOW_COLORS = { right: '#1681d5', left: '#db3e60' };
export const FLOW_STEPS = {
  right: ['svc', 'ivc', 'ra', 'tricuspid', 'rv', 'pulmonary-valve', 'pa'],
  left: ['pv', 'la', 'mitral', 'lv', 'aortic-valve', 'aorta'],
};
export const FLOW_NOTE = '模式的な経路（推定）を透視表示。実際の流線・血流速度・弁の開閉を再現するものではありません。';

export function advanceFlow(time, deltaSeconds, speed, playing, active, pageVisible) {
  if (!playing || !active || !pageVisible) return time;
  // Bound long gaps so resuming a suspended tab never causes a particle jump.
  return (time + Math.max(0, Math.min(deltaSeconds, .1)) * speed) % FLOW_SECONDS;
}

export function makeFlowPaths(boxes) {
  function point(ids, fractions = [.5, .5, .5]) {
    const selected = ids.map(id => {
      if (!boxes[id]) throw new Error(`Missing blood-flow landmark: ${id}`);
      return boxes[id];
    });
    const min = [0, 1, 2].map(i => Math.min(...selected.map(b => b.min[i])));
    const max = [0, 1, 2].map(i => Math.max(...selected.map(b => b.max[i])));
    return new Vector3(...min.map((v, i) => v + (max[i] - v) * fractions[i]));
  }
  const a = {
    svc: point(['FJ3645'], [.5, .9, .5]),
    svcEntry: point(['FJ3645'], [.5, .06, .5]),
    ivc: point(['FJ3441'], [.5, .1, .5]),
    ivcEntry: point(['FJ3441'], [.5, .94, .5]),
    ra: point(['FJ2424'], [.48, .55, .47]),
    tv: point(['FJ2421', 'FJ2433', 'FJ2436'], [.43, .70, .44]),
    rv: point(['FJ2423'], [.50, .43, .65]),
    pv: point(['FJ2417', 'FJ2434', 'FJ2427']),
    pa: point(['FJ2966'], [.5, .87, .23]),
    rpa: point(['FJ3019'], [.13, .62, .25]),
    lpa: point(['FJ2924'], [.86, .61, .28]),
    rupv: point(['FJ3020'], [.12, .62, .5]),
    ripv: point(['FJ3040'], [.13, .5, .5]),
    lupv: point(['FJ2925', 'FJ2933'], [.81, .67, .50]),
    lipv: point(['FJ2944', 'FJ2950', 'FJ2955'], [.78, .51, .45]),
    la: point(['FJ2425'], [.57, .61, .4]),
    mv: point(['FJ2420', 'FJ2432'], [.44, .76, .40]),
    lv: point(['FJ2422'], [.59, .40, .51]),
    av: point(['FJ2431', 'FJ2435', 'FJ2426']),
    ascending: point(['FJ3413'], [.49, .66, .52]),
    archFront: point(['FJ3411'], [.43, .42, .89]),
    archTop: point(['FJ3411'], [.52, .76, .54]),
    aortaEnd: point(['FJ3411'], [.60, .3, .09]),
  };
  const edges = [
    ['svc-ra', 'right', 'svc', 'ra', ['svc', 'svcEntry', 'ra']],
    ['ivc-ra', 'right', 'ivc', 'ra', ['ivc', 'ivcEntry', 'ra']],
    ['ra-tv', 'right', 'ra', 'tricuspid', ['ra', 'tv']],
    ['tv-rv', 'right', 'tricuspid', 'rv', ['tv', 'rv']],
    ['rv-pv', 'right', 'rv', 'pulmonary-valve', ['rv', 'pv']],
    ['pv-pa', 'right', 'pulmonary-valve', 'pa', ['pv', 'pa']],
    ['pa-right-lung', 'right', 'pa', 'lungs', ['pa', 'rpa']],
    ['pa-left-lung', 'right', 'pa', 'lungs', ['pa', 'lpa']],
    ['rupv-la', 'left', 'pv', 'la', ['rupv', 'la']],
    ['ripv-la', 'left', 'pv', 'la', ['ripv', 'la']],
    ['lupv-la', 'left', 'pv', 'la', ['lupv', 'la']],
    ['lipv-la', 'left', 'pv', 'la', ['lipv', 'la']],
    ['la-mv', 'left', 'la', 'mitral', ['la', 'mv']],
    ['mv-lv', 'left', 'mitral', 'lv', ['mv', 'lv']],
    ['lv-av', 'left', 'lv', 'aortic-valve', ['lv', 'av']],
    ['av-body', 'left', 'aortic-valve', 'aorta', ['av', 'ascending', 'archFront', 'archTop', 'aortaEnd']],
  ];
  return edges.map(([id, side, from, to, names]) => ({
    id, side, from, to,
    points: names.map(name => a[name]),
    // Centripetal interpolation avoids the pronounced overshoot of uniform splines.
    curve: new CatmullRomCurve3(names.map(name => a[name]), false, 'centripetal'),
  }));
}
