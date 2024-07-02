// 通过rollup打包

//（1）引入相关依赖
import ts from 'rollup-plugin-typescript2'; //解析ts
import json from '@rollup/plugin-json';
import resolvePlugin from '@rollup/plugin-node-resolve'; //解析第三方插件
import path from 'path'; //处理路径

//(2) 获取文件路径
let packagesDir = path.resolve(__dirname, 'packages');

// 2.1 获取需要打包的包
let packageDir = path.resolve(packagesDir, process.env.TARGET);

//2.2 打包获取到 每个包的项目配置
let resolve = p => path.resolve(packageDir, p);
const pkg = require(resolve('package.json')); //获取json
const buildOptions = pkg.buildOptions || {}; //获取package.json中的buildOptions
const name = path.basename(packageDir);

//3 创建一个表
const outputOptions = {
  'esm-builder': {
    file: resolve(`dist/${name}.esm-builder.js`),
    format: 'es',
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife',
  },
};

function createConfig(output) {
  return {
    input: resolve(`src/index.ts`),
    output: {
      name: buildOptions.name,
      sourcemap: true,
      ...output,

    },
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      }),
      resolvePlugin()
    ]
  }
}

 const configs = buildOptions.formats.map((format) => createConfig(outputOptions[format]));

 export default configs;