import { ShapeFlags } from "@vue/shared";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { effect } from "packages/reactivity/src";
import { h } from "./h";
import { CVNode, TEXT } from "./vnode";

export function createRenderer(rendererOption: any) { //实现渲染 vue3 => vnode => render

  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProps: hostPatchProps,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText
  } = rendererOption;

  function setupRenderEffect(instance: any, container: any) {
    //创建effect
    effect(function componentEffect() {
      // 判断第一次加载
      if (!instance.isMounted) {
        const proxy = instance.proxy;
        let subTree = instance.render.call(proxy, proxy); //执行render
        //渲染子树
        patch(null, subTree, container); //组件渲染的结点 => 渲染到页面中

        instance.isMounted = true;

        return;
      }

      //TODO: 更新
      console.log('更新');
    })
  }

  // 给组件创建一个instance，添加相关信息
  // 处理setup中的context参数
  // 治理proxy参数 为方便取值
  const mountComponent = (initialVNode: any, container: any) => {
    //组件的渲染流程 核心
    //1. 先有一个组件的实例对象 render(proxy)
    const instance = initialVNode.component = createComponentInstance(initialVNode);
    //2. 解析数据到这个实现对象中
    setupComponent(instance);
    //3. 创建一个effect 让render函数运行
    setupRenderEffect(instance, container);
  };

  // 组件的创建
  const processComponent = (oldVNode: any, currentVNode: any, container: any) => {
    if (oldVNode === null) { //是第一次加载
      mountComponent(currentVNode, container);
      return;
    }

    //TODO: 更新组件
  }

  //----------------处理文本-----------------
  function processText(oldVNode: any, currentVNode: any, container: any) {
    if (oldVNode === null) {//是第一次加载
      //创建文本 渲染到页面
      currentVNode.el = hostCreateText(currentVNode.children);

      hostInsert(currentVNode.el, container);
      return;
    }

    //TODO: 更新文本
  }


  //----------------处理元素-----------------
  function mountChildren(el: any, children: Array<any>) {
    children.forEach((child) => {
      const childVNode = CVNode(child);

      patch(null, childVNode, el);
    })
  }

  const mountElement = (initialVNode: any, container: any) => {
    // 递归 渲染 h('div', {}, [h('div)]) => dom操作 => 放到对应位置
    const { props, shapeFlag, type, children } = initialVNode;
    //创建真实元素
    const el = hostCreateElement(type);
    //添加属性
    if (props) {
      Object.entries(props).forEach(([key, value]) => hostPatchProps(el, key, null, value))
    }
    //处理children
    // h('div', {}, 'text')
    // h('div', {}, ['text'])
    // h('div', {}, [h()])
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, children);
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(el, children);
      }
    }

    //放到对应的位置
    hostInsert(el, container);
  };

  function processElement(oldVNode: any, currentVNode: any, container: any) {
    if (oldVNode === null) { //是第一次加载
      mountElement(currentVNode, container);
      return;
    }

    //TODO: 更新
  }

  const patch = (oldVNode: any, currentVNode: any, container: any) => { //比对
    //针对不同的类型 组件/元素/文本
    let { shapeFlag, type } = currentVNode;

    if (type === TEXT) {
      processText(oldVNode, currentVNode, container);
      return;
    }

    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 处理元素
      processElement(oldVNode, currentVNode, container);
      return;
    }

    if (shapeFlag & ShapeFlags.COMPONENT) {
      // 处理组件
      processComponent(oldVNode, currentVNode, container);
    }
  }

  let render = (vNode: any, container: string) => { //渲染 将虚拟dom渲染成真实dom
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