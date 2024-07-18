//属性 操作

//策略模式 div class style a=1 onClick=  {style: {color: "red"}} => {style: {background: "red"}}
import { patchClass } from './modules/class';
import { patchStyle } from './modules/style';
import { patchAttr } from './modules/attr';
import { patchEvent } from './modules/event';
import { isOn } from '@vue/shared';

export function patchProps(el: HTMLBaseElement, key: string, preValue: any, nextValue: any) {
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;

    case 'style':
      patchStyle(el, preValue, nextValue);
      break;

    default:
      if (isOn(key)) { //是不是事件 onClick
        patchEvent(el, key, nextValue);
        break;
      }

      patchAttr(el, key, nextValue);
  }
}
