"""Reproducible OBJ -> glTF 2.0 GLB. Python standard library only.
No invented anatomy. All objects share one rigid coordinate transformation.
"""
import csv
import hashlib
import json
import math
from pathlib import Path
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source/bodyparts3d'
OUT = ROOT / 'public/models'
GROUPS = [
    ('ra', 'chambers', ['FMA11359'], '#4688c9'),
    ('rv', 'chambers', ['FMA9291'], '#75b9dd'),
    ('la', 'chambers', ['FMA9465'], '#e67c97'),
    ('lv', 'chambers', ['FMA9466'], '#cf5367'),
    ('tricuspid', 'valves', ['FMA7238', 'FMA7239', 'FMA7240'], '#f2be52'),
    ('pulmonary-valve', 'valves', ['FMA7247', 'FMA7249', 'FMA7250'], '#75cfbd'),
    ('mitral', 'valves', ['FMA7242', 'FMA7243'], '#f39861'),
    ('aortic-valve', 'valves', ['FMA7252', 'FMA7253', 'FMA7254'], '#b09ce4'),
    ('aorta', 'vessels', ['FMA3736', 'FMA3768'], '#cf5367'),
    ('pa', 'vessels', ['FMA8612', 'FMA50872', 'FMA50873'], '#6fa8d4'),
    ('pv', 'vessels', ['FMA49911', 'FMA49913', 'FMA49914', 'FMA49916'], '#e67c97'),
    ('svc', 'vessels', ['FMA4720'], '#4688c9'),
    ('ivc', 'vessels', ['FMA10951'], '#4688c9'),
    ('rca', 'coronary', ['FMA3802'], '#d68e24'),
    ('lad', 'coronary', ['FMA74912'], '#e5b533'),
    ('lcx', 'coronary', ['FMA3895'], '#cb7336'),
    ('lm', 'coronary', ['FMA3855'], '#efc261'),
    ('myocardium', 'wall', ['FMA9457', 'FMA9531', 'FMA13884'], '#b77a7b'),
]

def transform(p):
    x, y, z = p
    return [(x - 20) * .025, (z - 1240) * .025, -(y + 115) * .025]

def normal(n):
    d = math.sqrt(sum(v*v for v in n)) or 1
    return [n[0]/d, n[2]/d, -n[1]/d]

def parse_obj(text, clip_z=None):
    vertices, normals, faces = [], [], []
    for line in text.splitlines():
        items = line.split()
        if not items:
            continue
        if items[0] == 'v': vertices.append(list(map(float, items[1:4])))
        if items[0] == 'vn': normals.append(list(map(float, items[1:4])))
        if items[0] == 'f':
            f = []
            for item in items[1:]:
                ids = item.split('/')
                f.append(vertices[int(ids[0])-1] + normals[int(ids[2])-1])
            faces.append(f)
    positions, ns, indices, seen = [], [], [], {}
    for polygon in faces:
        if clip_z is not None:
            clipped = []
            for a, b in zip(polygon, polygon[1:] + polygon[:1]):
                inside_a, inside_b = a[2] >= clip_z, b[2] >= clip_z
                if inside_a: clipped.append(a)
                if inside_a != inside_b:
                    t = (clip_z-a[2])/(b[2]-a[2])
                    clipped.append([x+(y-x)*t for x,y in zip(a,b)])
            polygon = clipped
        if len(polygon) < 3: continue
        face = []
        for v in polygon:
            key = tuple(v)
            if key not in seen:
                seen[key] = len(positions)//3
                positions.extend(transform(v[:3]))
                ns.extend(normal(v[3:]))
            face.append(seen[key])
        for i in range(1, len(face)-1): indices.extend([face[0], face[i], face[i+1]])
    return positions, ns, indices

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mapping = {}
    for fma, name, element in list(csv.reader((SOURCE/'isa_element_parts.txt').open(), delimiter='\t'))[1:]:
        mapping.setdefault(fma, []).append((name, element))
    archive = SOURCE/'isa_BP3D_4.0_obj_99.zip'
    z = zipfile.ZipFile(archive)
    assert z.testzip() is None, 'Source ZIP CRC failed'
    doc = {'asset': {'version': '2.0', 'generator': 'YAKUBON build_models.py', 'copyright': 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International'}, 'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [], 'accessors': [], 'bufferViews': [], 'buffers': []}
    blob = bytearray()
    manifest = {'source': 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip', 'retrieved': '2026-09-29', 'license': 'CC-BY-4.0', 'licenseURL': 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html', 'archiveSHA256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'transform': '[(x-20)*0.025,(z-1240)*0.025,-(y+115)*0.025]; +X patient left, +Y superior, +Z anterior', 'structures': []}
    def accessor(values, kind, components, bounds=False):
        while len(blob)%4: blob.append(0)
        offset = len(blob)
        fmt = 'f' if kind == 5126 else 'I'
        blob.extend(struct.pack('<'+fmt*len(values), *values))
        view = len(doc['bufferViews'])
        doc['bufferViews'].append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(blob)-offset})
        a = {'bufferView': view, 'componentType': kind, 'count': len(values)//components, 'type': 'VEC3' if components==3 else 'SCALAR'}
        if bounds:
            a['min'] = [min(values[i::3]) for i in range(3)]
            a['max'] = [max(values[i::3]) for i in range(3)]
        doc['accessors'].append(a)
        return len(doc['accessors'])-1
    for key, category, fmas, color in GROUPS:
        mat = len(doc['materials'])
        rgb = [int(color[i:i+2],16)/255 for i in (1,3,5)]
        doc['materials'].append({'name':key, 'doubleSided':True, 'pbrMetallicRoughness': {'baseColorFactor':rgb+[1], 'metallicFactor':0, 'roughnessFactor':.55}})
        parent = len(doc['nodes'])
        doc['nodes'].append({'name':key,'children':[], 'extras':{'structureId':key,'category':category}})
        doc['scenes'][0]['nodes'].append(parent)
        entry = {'id':key,'category':category,'color':color,'fma':fmas,'elements':[], 'triangles':0}
        for fma in fmas:
            for name, element in mapping[fma]:
                if key=='ivc' and element=='FJ3659': continue
                data=z.read('isa_BP3D_4.0_obj_99/'+element+'.obj')
                dest=SOURCE/'selected'/f'{element}.obj'
                dest.parent.mkdir(exist_ok=True)
                if not dest.exists(): dest.write_bytes(data)
                positions, normals, indices = parse_obj(data.decode(),1162 if key=='ivc' else None)
                assert positions and indices, element
                attrs={'POSITION':accessor(positions,5126,3,True),'NORMAL':accessor(normals,5126,3)}
                idx=accessor(indices,5125,1)
                mesh=len(doc['meshes'])
                doc['meshes'].append({'name':element,'primitives':[{'attributes':attrs,'indices':idx,'material':mat}]})
                node=len(doc['nodes'])
                doc['nodes'].append({'name':element,'mesh':mesh,'extras':{'structureId':key,'fma':fma,'sourceName':name}})
                doc['nodes'][parent]['children'].append(node)
                entry['triangles']+=len(indices)//3
                entry['elements'].append({'id':element,'name':name,'sha256':hashlib.sha256(data).hexdigest()})
        if key=='ivc': entry['modification']='FJ3659 omitted; FJ3441 clipped at source z=1162 mm, open boundary; no artificial vessel cap.'
        manifest['structures'].append(entry)
    doc['buffers']=[{'byteLength':len(blob)}]
    js=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode()
    js+=b' '*((-len(js))%4)
    blob.extend(b'\0'*((-len(blob))%4))
    glb=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
    (OUT/'heart.glb').write_bytes(glb)
    manifest['glbSHA256']=hashlib.sha256(glb).hexdigest()
    manifest['bytes']=len(glb)
    manifest['triangles']=sum(e['triangles'] for e in manifest['structures'])
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f"{len(GROUPS)} structures / {manifest['triangles']:,} triangles / {len(glb):,} bytes")

if __name__=='__main__': main()
