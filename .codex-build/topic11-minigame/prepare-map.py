"""Compile locally cached 2025 GeoJSON into inline, offline SVG geometry."""
import json
import unicodedata
from pathlib import Path
from shapely.geometry import shape
from shapely.ops import polylabel

ROOT = Path(__file__).parent
source = json.loads((ROOT / 'provinces-2025.geojson').read_text(encoding='utf-8'))

def slug(name):
    value = unicodedata.normalize('NFD', name.lower().replace('đ', 'd'))
    return '-'.join(''.join(c for c in value if not unicodedata.combining(c)).split())

def project(point):
    lon, lat = point[:2]
    # Offshore archipelagos are displayed in clearly marked inset panels.
    if lon > 110 and lat > 14:
        return 490 + (lon - 111) * 38, 345 + (18 - lat) * 38
    if lon > 110:
        return 475 + (lon - 110) * 24, 625 + (12 - lat) * 24
    return 26 + (lon - 102) * 55, 25 + (23.5 - lat) * 58

regions = []
for feature in source['features']:
    properties = feature['properties']
    name = properties['TinhThanh']
    # Source feature Ma=31 has a duplicated name. Its geometry is Dong Thap.
    if properties['Ma'] == '31':
        name = 'Đồng Tháp'
    province_id = 'tp-hcm' if name.startswith('TP.') else slug(name)
    geometry = shape(feature['geometry']).simplify(.003, preserve_topology=True)
    polygons = list(geometry.geoms) if geometry.geom_type == 'MultiPolygon' else [geometry]
    commands = []
    offshore_commands = []
    for polygon in polygons:
        target = offshore_commands if polygon.centroid.x > 110 else commands
        for ring in [polygon.exterior, *polygon.interiors]:
            points = [project(point) for point in ring.coords]
            target.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in points) + 'Z')
    mainland = max(polygons, key=lambda polygon: polygon.area)
    anchor = polylabel(mainland, tolerance=.005)
    x, y = project((anchor.x, anchor.y))
    regions.append({'id': province_id, 'path': ''.join(commands), 'offshore': ''.join(offshore_commands), 'x': round(x, 2), 'y': round(y, 2)})

assert len(regions) == len({region['id'] for region in regions}) == 34
(ROOT / 'map-regions.json').write_text(json.dumps(regions, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('Prepared 34 province geometries with interior selection anchors.')
