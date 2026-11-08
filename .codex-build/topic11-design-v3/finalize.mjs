import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const SKILL='C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations';
const workspaceDir='C:/Users/ADMIN/Downloads/MLN';
const build=path.join(workspaceDir,'.codex-build/topic11-design-v3');
process.env.RUNTIME_NODE_MODULES='C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
await fs.mkdir(path.join(build,'output'),{recursive:true});
const result=await finalizePresentation({
 workspaceDir,candidatePath:path.join(build,'draft.pptx'),finalPath:path.join(build,'output/Slide-Chu-de-11-Thiet-ke-moi.pptx'),
 pythonExecutable:'C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
 explicitTotalSlideCount:14,requiredNativeTableOwnerSlides:[3,5,13],requiredNativeChartOwnerSlides:[4,7,8],
 materializeLiteralChartWorkbooks:true,
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','3','--require-native-table-slide','5','--require-native-table-slide','13'],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:path.join(build,'validation-design.json'),
});
await fs.writeFile(path.join(build,'finalize-result.json'),JSON.stringify(result,null,2));
console.log('Finalized design PPTX.');
