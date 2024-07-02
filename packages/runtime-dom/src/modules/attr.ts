//自定的属性 div a=1 a=2
export function patchAttr(el: HTMLBaseElement, key: string, value: any) {
  if (!value) {
    el.removeAttribute(key);
    return;
  }

  el.setAttribute(key, value);
}