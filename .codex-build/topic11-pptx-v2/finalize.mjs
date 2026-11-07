import path from 'node:path';
import {pathToFileURL} from 'node:url';

const SKILL = 'C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations';
const workspaceDir = 'C:/Users/ADMIN/Downloads/MLN';
const build = path.join(workspaceDir,'.codex-build/topic11-pptx-v2');
process.env.RUNTIME_NODE_MODULES = 'C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation} = await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const result = await finalizePresentation({
  workspaceDir,
  candidatePath:path.join(build,'candidate-audio.pptx'),
  finalPath:path.join(build,'output/Slide-Chu-de-11-Cap-nhat.pptx'),
  pythonExecutable:'C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),
  explicitTotalSlideCount:15,
  requiredNativeTableOwnerSlides:[4,6,14],
  requiredNativeChartOwnerSlides:[5,8,9],
  materializeLiteralChartWorkbooks:true,
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','4','--require-native-table-slide','6','--require-native-table-slide','14'],
  fontPolicy:{basis:'design',families:['Arial']},
  verifyArtifactToolImport:true,
  receiptPath:path.join(build,'validation-final.json'),
});
console.log(JSON.stringify(result,null,2));
