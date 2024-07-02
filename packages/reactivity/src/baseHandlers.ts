import { hasChange, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared";
import { reactive, readonly } from "./reactive";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./constants";

//获取：是否只读、是否浅的
const get = createGetter(); // 不是只读，是深度
const shallowGet = createGetter(false, true); // 不是只读，是浅的
const readonlyGet = createGetter(true); // 是只读， 是深的
const shallowReadonlyGet = createGetter(true, true); // 是只读， 是浅的

function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
  return function get(target: object, property: string | symbol, receiver: object) {
    // Proxy + Reflect
    const res = Reflect.get(target, property, receiver);

    if (!isReadonly) { //不是只读
      //收集依赖，等数据变化后更新视图
      //收集effect
      track(target, TrackOpTypes.GET, property);
    }

    if (isShallow) { //浅 {name: 'zhongShan', list: {n: 100}}
      return res;
    }

    //res是一个对象 递归 vue3
    //懒代理 state.list 在使用state.list的是时候才会去代理state.list
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  }
}

//set
const set = createSetter();
const shallowSet = createSetter(true);

function createSetter(isShallow: boolean = false) {
  return function set(target: object, property: string | symbol, value: any, receiver: object) {
    // 1. 获取旧值
    const oldValue = (target as any)[property];

    //注意 1. 是数组还是对象 2. 是添加值还是修改
    // 2. 判断
    const hadKey = isArray(target) && isIntegerKey(property) //是数组
      ? Number(property) < target.length
      : hasOwn(target, property);

    const result = Reflect.set(target, property, value, receiver); //target[key] = value

    if (!hadKey) { //没有
      //新增
      trigger(target, TriggerOpTypes.ADD, property, value);
    } else { //修改的时候 新值和原来的值一样
      if (hasChange(value, oldValue)) {
        trigger(target, TriggerOpTypes.ADD, property, value, oldValue);
      }
    }

    return result;
  }
}

export const reactiveHandlers = {
  get,
  set,
};
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};
export const readonlyHandlers = {
  get: readonlyGet,
  set() {
    console.log('set on key is failed')
  }
};
export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set() {
    console.log('set on key is failed')
  }
};

