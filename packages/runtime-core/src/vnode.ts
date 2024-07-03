//创建 VNode 1. createVNode和h作用一样
//2. 区分是组件还是元素
//3. 创建vNode
//注意： createVNode = h('div', {style: { color: 'red' }}, [])

import { isArray, isFunction, isObject, isString, } from "@vue/shared";
import { ShapeFlags } from "@vue/shared";

export function createVNode(type: any, props: Record<string, any>, children: any = null) {
  
  //区分 是组件还是元素

  const shapeFlag= isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : 0;

  const vNode = {
    _v_isVNode: true, //是一个vNode节点
    type,
    props,
    children,  
    key: props && props.key,//diff 会用到
    el: null,// 和真实的dom和vNode对应
    component: {},
    shapeFlag,
  }

  //儿子标识
  normalizeChildren(vNode, children);

  return vNode;
}

function normalizeChildren(vNode: any, children?: any) {
  if (!children) {
    return;
  }

  let type = 0;

  if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vNode.shapeFlag = vNode.shapeFlag | type;
}