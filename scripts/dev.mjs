// 进行打包 Monerepo 获取到需要打包的包
import { execa } from 'execa';


async function build(target) {
  return execa('rollup', ['-cw', '--bundleConfigAsCjs', '--environment', `TARGET:${target}`], { stdio: 'inherit' });
}

build('runtime-dom');