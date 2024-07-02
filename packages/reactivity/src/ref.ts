import { hasChange, isArray } from "@vue/shared";
import { TrackOpTypes, TriggerOpTypes } from "./constants";
import { track, trigger } from "./effect";

export function ref(target: any) {
  return createRef(target);
}

export function shallowRef(target: any) {
  return createRef(target);
}

//RefImpl类
class RefImpl {
  public __v_isRef: boolean = true; //标识 他是ref
  public _value: any;

  constructor(public _rawValue: any, public __v_isShallow: boolean) {
    this._value = _rawValue;
  }
  //类的属性访问器

  get value() {
    track(this, TrackOpTypes.GET, 'value');
    return this._value;
  }

  set value(newValue: any) {
    if (!hasChange(newValue, this._value)) {
      return;
    }

    this._value = newValue;
    this._rawValue = newValue;

    trigger(this, TriggerOpTypes.SET, 'value', newValue, this._value);

  }
}

export function createRef(target: any, isShallow: boolean = false) {
  //创建ref 实例对象
  return new RefImpl(target, isShallow);

}

export function toRef(target: any, key: string | symbol) {
  return new ObjectRefImpl(target, key);
}

class ObjectRefImpl {
  public __v_isRef = true;
  public _defaultValue?: any;

  constructor(public _object: any, public _key: string | symbol) { }

  //获取value
  get value() {
    return this._object[this._key];
  }

  set value(newValue: any) {
    if (!hasChange(newValue, this._object[this._key])) {
      return;
    }

    this._object[this._key] = newValue;
  }
}

export function toRefs(target: object) {
  let res: any = isArray(target) ? new Array(target.length) : {};

  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      res[key] = toRef(target, key);
    }
  }
  return res;
}