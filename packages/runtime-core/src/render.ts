import { apiCreateApp } from "./apiCreateApp";

export function createRenderer(rendererOption: any) { //实现渲染 vue3 => vnode => render
  let render= (vNode: any, container: string) => { //渲染
    //组件初始化
    console.log(vNode);
  }

  return {
    createApp: apiCreateApp(render), //创建 vnode 组件操作 =》vNode =》render()
  }
}

// 总结：
// 1. 创建 createApp方法 => runtime-dom 但是渲染组件 (运行在不同的平台)