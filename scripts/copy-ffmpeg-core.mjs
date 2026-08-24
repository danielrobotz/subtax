// Copies the ffmpeg.wasm core (loaded lazily by src/lib/videoExport.ts only when a
// user triggers an export) into public/ so it's served same-origin instead of
// depending on a third-party CDN at runtime.
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const coreSrcDir = join(rootDir, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const ffmpegSrcDir = join(rootDir, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm');
const destDir = join(rootDir, 'public', 'ffmpeg');

const coreFiles = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];
// Served as-is (not bundled) so the browser loads them as plain ES module
// worker scripts, sidestepping a Turbopack/webpack dynamic-import bundling
// error in @ffmpeg/ffmpeg's worker.js.
const workerFiles = ['worker.js', 'const.js', 'errors.js'];

await mkdir(destDir, { recursive: true });

for (const file of coreFiles) {
  await copyFile(join(coreSrcDir, file), join(destDir, file));
}
for (const file of workerFiles) {
  await copyFile(join(ffmpegSrcDir, file), join(destDir, file));
}

console.log(`Copied ffmpeg-core and worker files to ${destDir}`);
