import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from 'file:///C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const build='C:/Users/ADMIN/Downloads/MLN/.codex-build/topic11-pptx-v2';
const deck=await PresentationFile.importPptx(await FileBlob.load(build+'/output/Slide-Chu-de-11-Cap-nhat.pptx'));
await fs.mkdir(build+'/final-previews',{recursive:true});
for(const [i,slide] of deck.slides.items.entries()){
 const image=await deck.export({slide,format:'png',scale:1});
 await fs.writeFile(`${build}/final-previews/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await image.arrayBuffer()));
}
console.log('Rendered final validated PPTX',deck.slides.items.length,'slides.');
