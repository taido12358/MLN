import path from 'node:path';
import {pathToFileURL} from 'node:url';
const skill='C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations';
const workspaceDir='C:/Users/ADMIN/Downloads/MLN';
const build=path.join(workspaceDir,'.codex-build/topic11-minigame/pptx');
process.env.RUNTIME_NODE_MODULES='C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({
  workspaceDir,
  candidatePath:path.join(build,'candidate.pptx'),
  finalPath:path.join(build,'output/Slide-Chu-de-11-Sau-minigame.pptx'),
  pythonExecutable:'C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
  explicitTotalSlideCount:15,
  requiredNativeTableOwnerSlides:[4,12],
  requiredNativeChartOwnerSlides:[],
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit','--require-native-table-slide','4','--require-native-table-slide','12'],
  fontPolicy:{basis:'design',families:['Arial']},
  verifyArtifactToolImport:true,
  receiptPath:path.join(build,'validation.json'),
});
console.log(JSON.stringify({finalPath:result.finalPath,bytes:result.byteCount,integrity:result.packageIntegrity.status,layoutFindings:result.presentationLayout.finding_count,imported:result.firstPartyImport.passed}));
