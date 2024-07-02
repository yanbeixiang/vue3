//一个元素 绑定事件 addEventListener
//缓存 {click: fn} => 

type HTMLElementEvent = keyof HTMLElementEventMap;

export function patchEvent(el: HTMLBaseElement & { vei?: Record<string, Function> }, key: string, value: Function) {
  //1. 对函数缓存
  const invokers = el.vei || (el.vei = {});

  const exists = invokers[key];

  if (exists && value) {
    // 原来有 新的也有
    invokers[key] = value;

  } else {
    //原来没有或者新的没有
    //获取事件名称 （1）新的有 （2）新的没有
    const eventName = key.slice(2).toLocaleLowerCase() as HTMLElementEvent;

    if (value) { //新的有 替换缓存
      let invoker = invokers[key] = createInvoker(value);
      el.addEventListener(eventName, invoker);
    } else { //新的没有
      el.removeEventListener(eventName, exists as any);
      delete invokers[key] //清除缓存
    }
  }
}

function createInvoker(value: Function) {
  const fn = (e: Event) => {
    fn.value(e)
  }

  fn.value = value;
  return fn;
}

//事件的处理

//1. 给元素缓存一个绑定的事件列表
//2. 如果缓存中没有值，并且value有值， 需要绑定方法并缓存起来
//3. 如果缓存中有值，表示以前绑定过事件，需要移除事件绑定， 缓存也需要清除
//4. 如果两者都有， 直接将新值覆盖缓存中的值 