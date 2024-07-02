export * from './shapeFlags';

export function isObject(target: unknown) {
  return typeof target === 'object' && target !== null;
}

export const extend = Object.assign;

export const isArray = Array.isArray;

export const isFunction = (val: unknown) => typeof val === 'function';

export const isString = (val: unknown): val is string => typeof val === 'string'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol,
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key


export const hasChange = (value: unknown, oldValue: unknown) => value !== oldValue;

export const isOn = (value: string) => /^on[A-Z]/.test(value);
