import { isObject } from "@vue/shared";
import { reactiveHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';

//注意 核心 proxy 源码中 柯里化：根据不同参数处理
//4个方法 1.是不是只读 2.是不是深层代理

export function reactive(target: Record<string, Function>) {
  return createReactObj(target, false, reactiveHandlers);
}

export function shallowReactive(target: Record<string, Function>) {
  return createReactObj(target, false, shallowReactiveHandlers);
}

export function readonly(target: Record<string, Function>) {
  return createReactObj(target, false, readonlyHandlers);
}

export function shallowReadonly(target: Record<string, Function>) {
  return createReactObj(target, false, shallowReadonlyHandlers);
}


// 数据结构
const reactiveMap = new WeakMap(); //key 必须是对象 自动的垃圾回收
const readonlyMap = new WeakMap();

function createReactObj(target: Record<string, Function>, isReadonly: boolean, baseHandler: Record<string, Function>) {
  //注意 proxy() 对象

  if (!isObject(target)) {
    return;
  }

  //核心 proxy
  //问题 如果target已经是proxy，就不需要再进行代理。
  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const proxyEs = proxyMap.get(target); //已存在

  if (proxyEs) {
    return proxyEs;
  }

  const proxy = new Proxy(target, baseHandler);
  proxyMap.set(target, proxy); //保存

  return proxy;
}