export function patchClass(el: HTMLBaseElement, value: any) {
  //对这个标签的class赋值 （1）如果没有 赋值为空 （2）如果有 新的覆盖
  el.className = value || "";
}