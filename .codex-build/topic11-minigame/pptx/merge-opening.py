from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
from lxml import etree as ET

BUILD = Path(__file__).resolve().parent
ROOT = BUILD.parents[2]
ORIGINAL = ROOT / 'Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/Slide-Chu-de-11.pptx'
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}

with ZipFile(ORIGINAL) as archive:
    package = {name: archive.read(name) for name in archive.namelist()}

with ZipFile(BUILD / 'revised-session.pptx') as revised:
    for number in [1, 2]:
        filename = f'ppt/slides/slide{number}.xml'
        old = ET.fromstring(package[filename])
        new = ET.fromstring(revised.read(filename))
        old_shapes = {
            shape.find('p:nvSpPr/p:cNvPr', NS).get('name'): shape
            for shape in old.findall('.//p:sp', NS)
        }
        for shape in new.findall('.//p:sp', NS):
            name = shape.find('p:nvSpPr/p:cNvPr', NS).get('name')
            body = shape.find('p:txBody', NS)
            if body is not None:
                target = old_shapes[name]
                target.replace(target.find('p:txBody', NS), deepcopy(body))
        package[filename] = ET.tostring(old, xml_declaration=True, encoding='utf-8', standalone=True)
        notes = f'ppt/notesSlides/notesSlide{number}.xml'
        package[notes] = revised.read(notes)

with ZipFile(BUILD / 'candidate.pptx', 'w', ZIP_DEFLATED) as archive:
    for filename, data in package.items():
        archive.writestr(filename, data)

with ZipFile(ORIGINAL) as old, ZipFile(BUILD / 'candidate.pptx') as new:
    changed = {name for name in old.namelist() if old.read(name) != new.read(name)}
    assert changed == {
        'ppt/slides/slide1.xml', 'ppt/slides/slide2.xml',
        'ppt/notesSlides/notesSlide1.xml', 'ppt/notesSlides/notesSlide2.xml',
    }, changed
    assert len([name for name in new.namelist() if name.endswith('.wav')]) == 3
print('PASS: edited opening slides and notes, with all other package parts preserved.')
