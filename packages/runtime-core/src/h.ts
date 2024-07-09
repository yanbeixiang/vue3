import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type: any, propsOrChildren?: any, children?: any) {//Create vNode
  //参数
  const i = arguments.length; //获取参数个数

  if (i === 2) {
    if (isObject(propsOrChildren)) {
      if (isVNode(propsOrChildren)) { //h('div', h('div')) 没有props
        return createVNode(type, null, propsOrChildren)
      }

      return createVNode(type, propsOrChildren); //h('div', {name: 'zs'}) 没有儿子
    }

    //不是对象 就是儿子
    return createVNode(type, null, propsOrChildren); //h('div', [h('div), h('div)]) 没有props
  }

  if (i === 3) {
    if (!isObject(propsOrChildren)) {
      console.error('无效的props');
      return;
    }

    return createVNode(type, propsOrChildren, children);
  }

  return createVNode(type);
}