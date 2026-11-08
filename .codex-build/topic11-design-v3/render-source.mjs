import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const b='C:/Users/ADMIN/Downloads/MLN/.codex-build/topic11-design-v3';
const p=await PresentationFile.importPptx(await FileBlob.load(b+'/source.pptx'));
await fs.mkdir(b+'/source-previews',{recursive:true});
for(const [i,s] of p.slides.items.entries()){
 const png=await p.export({slide:s,format:'png',scale:1});
 await fs.writeFile(`${b}/source-previews/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
}
console.log('Source slides:',p.slides.items.length);
