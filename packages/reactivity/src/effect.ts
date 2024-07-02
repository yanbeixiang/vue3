

import { isArray, isIntegerKey } from "@vue/shared";
import { TrackOpTypes, TriggerOpTypes } from "./constants";

//定义effect  定义相关的属性
//effect 收集依赖 更新视图
export function effect(fn: Function, options: any = {}) {
  const effect = createReactEffect(fn, options);

  if (!options.lazy) {
    effect();
  }

  return effect;
}

let uid = 0;
let activeEffect: Function; //保存当前的effect
const effectStack: Function[] = [];
function createReactEffect(fn: Function, options: any = {}) {
  const effect = function reactiveEffect() { //响应式的 effect
    console.log('执行effect');
    let result;
    try {
      //入栈
      effectStack.push(effect);
      activeEffect = effect;
      result = fn(); //执行用户的方法
    } finally {
      activeEffect = effectStack[effectStack.length - 1];
      //出栈
      effectStack.pop();
    }

    return result;
  }

  effect.id = uid++; //区别effect
  effect._isEffect = true; // 区别effect 是不是响应式的effect
  effect.raw = fn; //保存用户的方法
  effect.options = options;

  return effect;
}

//收集effect 在获取数据的时候触发get  收集 effect
let targetMap: WeakMap<object, Map<string | symbol, Set<Function>>> = new WeakMap(); //创建表
export function track(target: object, type: TrackOpTypes, property: string | symbol) {
  console.log('收集依赖', target, property);
  // 1. name => effect
  //对应的key
  //key和我们的effect一一对应 map => key = target => 属性 => [effect]

  if (activeEffect === undefined) { //没有在effect中使用
    return;
  }

  //获取effect {target: 值（map）}
  let depMap = targetMap.get(target);
  if (!depMap) { // 没有
    targetMap.set(target, (depMap = new Map()));
  }
  //有
  let dep = depMap.get(property);
  if (!dep) { // 没有属性
    depMap.set(property, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect); //Set可以去重
  }
}

export function trigger(target: object, type: TriggerOpTypes, key: string | symbol, newValue?: unknown, oldValue?: unknown) {
  //触发依赖
  console.log('触发依赖', target, key, newValue, targetMap);
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  let effectSet = new Set(); //如果有多个同时修改一个值，并且值相同， set过滤一下
  const add = (effectAdd?: Set<Function>) => {
    if (effectAdd) {
      effectAdd.forEach((effect: Function) => effectSet.add(effect));
    }
  }

  //处理数组 就是 key === length 修改数组的length
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || parseInt(key as string) >= (newValue as number)) {
        // [1,2,3,4], 当执行length = 2, 需要触发触发key===length和key>=length(2)的effect
        //也就是说： 如果更改的length<收集的索引，那么这个索引需要重新执行effect
        add(dep);
      }
    });
  } else {
    //可能是对象
    if (typeof key !== 'undefined') {
      add(depsMap.get(key)) //获取当前属性的effect
    }

    switch (type) {
      case TriggerOpTypes.ADD:
        // a = [1,2], a[100] = 100 这时需要出发length的effect 
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
        break;
    }

  }

  //执行
  effectSet.forEach((effect: any) => {
    if (effect.options.sch) {
      effect.options.sch(effect);
    } else {
      effect();
    }
  });
}