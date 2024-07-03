import { ShapeFlags } from "@vue/shared";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent, setupRenderEffect } from "./component";

export function createRenderer(rendererOption: any) { //实现渲染 vue3 => vnode => render
  const mountComponent = (initialVNode: any, container: any) => {
    //组件的渲染流程 核心
    //1. 先有一个组件的实例对象 render(proxy)
    const instance = initialVNode.component = createComponentInstance(initialVNode);
    //2. 解析数据到这个实现对象中
    setupComponent(instance);
    //3. 创建一个effect 让render函数运行
    setupRenderEffect();

  };

  // 组件的创建
  const processComponent = (oldVNode: any, currentVNode: any, container: any) => {
    if (oldVNode === null) { //是第一次加载
      mountComponent(currentVNode, container);
      return;
    }

    //更新组件
  }


  const patch = (oldVNode: any, currentVNode: any, container: any) => { //比对
    //针对不同的类型 组件/元素
    let { shapeFlag } = currentVNode;

    if (shapeFlag & ShapeFlags.ELEMENT) {
      console.log('元素')
      return;
    } 
    
    if (shapeFlag & ShapeFlags.COMPONENT) {
      processComponent(oldVNode, currentVNode, container);
    }
  }

  let render= (vNode: any, container: string) => { //渲染 将虚拟dom渲染成真实dom
    //组件初始化
    console.log(vNode);
    //调用render 
    patch(null, vNode, container); //比对
  }

  return {
    createApp: apiCreateApp(render), //创建 vnode 组件操作 =》vNode =》render()
  }
}

// 总结：
// 1. 创建 createApp方法 => runtime-dom 但是渲染组件 (运行在不同的平台)