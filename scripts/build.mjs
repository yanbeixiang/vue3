// 进行打包 Monerepo 获取到需要打包的包
import fs from 'fs';
import path from 'path';
import { execa } from 'execa';

const packagesPath = path.resolve(process.cwd(), 'packages');

// 需要打包的目录
const packageDirs = fs.readdirSync(packagesPath)
                .filter((name)=> fs.statSync(path.resolve(packagesPath,name)).isDirectory());

async function build(target) {
  return execa('rollup', ['-c', '--bundleConfigAsCjs', '--environment', `TARGET:${target}`], { stdio: 'inherit' });
}

// 进行打包 并行打包
async function runParallel(packageDirs, build) {
  const result = packageDirs.map((packageDir) => build(packageDir));
  
  return Promise.all(result);
}

runParallel(packageDirs, build).then(() => {
  console.log('成功');
})