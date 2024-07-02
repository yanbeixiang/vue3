//已经渲染到页面上（style：）
export function patchStyle(el: HTMLBaseElement, prev: CSSStyleDeclaration, next: CSSStyleDeclaration) {
  const style = el.style;

  //判断
  if (!next) {
    el.removeAttribute('style');
    return;
  }

  //注意 老的有 新的没有
  if (prev) {
    for (let key in prev) {
      if (!next[key]) {
        style[key] = '';
      }
    }
  }

  //新的有 老的没有
  if (prev) {
    for (let key in next) {
      style[key] = next[key];
    }
  }
}