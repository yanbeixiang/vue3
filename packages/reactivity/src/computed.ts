import { isFunction } from "@vue/shared";
import { effect } from "./effect";

type ComputedOptions = {
  get: Function,
  set: Function;
};

export function computed(getterOrOptions: Function | ComputedOptions) {
  // 1. 函数 2. 对象

  let getter: Function; //获取
  let setter: Function; //设置数据

  if(isFunction(getterOrOptions)) {//函数 getter
    getter = getterOrOptions as Function;
    setter = () => {
      console.warn('computed value must be readonly')
    }
  } else {
    getter = (getterOrOptions as ComputedOptions).get;
    setter = (getterOrOptions as ComputedOptions).set;
  }

  return new ComputedRefImpl(getter, setter);
}

class ComputedRefImpl {
  public _dirty = true; //默认获取执行
  public _value: any;
  public effect;

  constructor(public getter: Function, public _setter: Function){
    this.effect = effect(getter, {
      lazy: true,
      sch: () => { //修改数据的时候执行 
        if (!this._dirty) {
          this._dirty = true;
        } 
      }
    });
  }

  //获取 myAge.value => getter 方法中的值
  get value() {
    //获取执行
    if(this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }

    return this._value;

  }

  set value(newValue) {
    this._setter(newValue);
  }
}