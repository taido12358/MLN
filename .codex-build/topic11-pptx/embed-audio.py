from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as ET

ROOT = Path(__file__).resolve().parent
NS = {
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
    'ct': 'http://schemas.openxmlformats.org/package/2006/content-types',
}

with ZipFile(ROOT / 'draft-final.pptx') as source:
    package = {name: source.read(name) for name in source.namelist()}

tracks = [(1, 'music-intro', 'intro.wav'), (5, 'music-bed', 'bed.wav'), (15, 'music-outro', 'outro.wav')]
for slide_number, shape_name, filename in tracks:
    slide_path = f'ppt/slides/slide{slide_number}.xml'
    rels_path = f'ppt/slides/_rels/slide{slide_number}.xml.rels'
    slide = ET.fromstring(package[slide_path])
    properties = slide.xpath(f'.//p:cNvPr[@name="{shape_name}"]', namespaces=NS)
    assert len(properties) == 1, (slide_number, shape_name)
    properties = properties[0]
    for existing in list(properties.findall('a:hlinkClick', NS)):
        properties.remove(existing)
    hyperlink = ET.Element(f'{{{NS["a"]}}}hlinkClick')
    hyperlink.set('action', 'ppaction://noaction')
    relationship_id = f'rIdMusic{slide_number}'
    sound = ET.SubElement(hyperlink, f'{{{NS["a"]}}}snd')
    sound.set(f'{{{NS["r"]}}}embed', relationship_id)
    sound.set('name', filename)
    properties.insert(0, hyperlink)

    rels = ET.fromstring(package[rels_path])
    relation = ET.SubElement(rels, f'{{{NS["rel"]}}}Relationship')
    relation.set('Id', relationship_id)
    relation.set('Type', NS['r'] + '/audio')
    relation.set('Target', f'../media/{filename}')
    package[slide_path] = ET.tostring(slide, xml_declaration=True, encoding='utf-8', standalone=True)
    package[rels_path] = ET.tostring(rels, xml_declaration=True, encoding='utf-8', standalone=True)
    package[f'ppt/media/{filename}'] = (ROOT / 'assets' / filename).read_bytes()

content_types = ET.fromstring(package['[Content_Types].xml'])
if not content_types.xpath('./ct:Default[@Extension="wav"]', namespaces=NS):
    entry = ET.SubElement(content_types, f'{{{NS["ct"]}}}Default')
    entry.set('Extension', 'wav')
    entry.set('ContentType', 'audio/wav')
package['[Content_Types].xml'] = ET.tostring(content_types, xml_declaration=True, encoding='utf-8', standalone=True)

output = ROOT / 'candidate-audio.pptx'
with ZipFile(output, 'w', ZIP_DEFLATED) as target:
    for filename, data in package.items():
        target.writestr(filename, data)

print(f'Embedded {len(tracks)} WAV excerpts using native PowerPoint click sounds.')
print(f'Candidate bytes: {output.stat().st_size}')
