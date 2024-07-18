import { ShapeFlags } from "@vue/shared";
import { apiCreateApp } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { effect } from "packages/reactivity/src";
import { CVNode, TEXT } from "./vnode";

export function createRenderer(rendererOption: any) { //实现渲染 vue3 => vnode => render

  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProps: hostPatchProps,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText
  } = rendererOption;

  function setupRenderEffect(instance: any, container: any) {
    //创建effect
    effect(function componentEffect() {
      // 判断第一次加载
      if (!instance.isMounted) {
        const proxy = instance.proxy;
        let subTree = instance.subTree = instance.render.call(proxy, proxy); //执行render
        //渲染子树
        patch(null, subTree, container); //组件渲染的结点 => 渲染到页面中

        instance.isMounted = true;

        return;
      }

      //TODO: 更新
      console.log('更新');
      //比对旧和新
      const proxy = instance.proxy;
      const prevTree = instance.subTree;
      const nextTree = instance.render.call(proxy, proxy);
      instance.subTree = nextTree;
      patch(prevTree, nextTree, container);
    })
  }

  // 给组件创建一个instance，添加相关信息
  // 处理setup中的context参数
  // 治理proxy参数 为方便取值
  const mountComponent = (initialVNode: any, container: any) => {
    //组件的渲染流程 核心
    //1. 先有一个组件的实例对象 render(proxy)
    const instance = initialVNode.component = createComponentInstance(initialVNode);
    //2. 解析数据到这个实现对象中
    setupComponent(instance);
    //3. 创建一个effect 让render函数运行
    setupRenderEffect(instance, container);
  };

  // 组件的创建
  const processComponent = (oldVNode: any, currentVNode: any, container: any) => {
    if (oldVNode === null) { //是第一次加载
      mountComponent(currentVNode, container);
      return;
    }

    //TODO: 更新组件
  }

  //----------------处理文本-----------------
  function processText(oldVNode: any, currentVNode: any, container: any) {
    if (oldVNode === null) {//是第一次加载
      //创建文本 渲染到页面
      currentVNode.el = hostCreateText(currentVNode.children);

      hostInsert(currentVNode.el, container);
      return;
    }

    //TODO: 更新文本
  }


  //----------------处理元素-----------------
  function mountChildren(el: any, children: Array<any>) {
    children.forEach((child) => {
      const childVNode = CVNode(child);

      patch(null, childVNode, el);
    })
  }

  const mountElement = (vNode: any, container: any, anchor: any) => {
    // 递归 渲染 h('div', {}, [h('div)]) => dom操作 => 放到对应位置
    const { props, shapeFlag, type, children } = vNode;
    //创建真实元素
    const el = vNode.el = hostCreateElement(type);
    //添加属性
    if (props) {
      Object.entries(props).forEach(([key, value]) => hostPatchProps(el, key, null, value))
    }
    //处理children
    // h('div', {}, 'text')
    // h('div', {}, ['text'])
    // h('div', {}, [h()])
    if (children) {
      if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(el, children);
      } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(el, children);
      }
    }

    //放到对应的位置
    hostInsert(el, container, anchor);
  };

  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps === newProps) {
      return;
    }

    //新的有，旧得也有，或新的有，旧的没有
    Object.entries(newProps).forEach(([key, next]: [any, any]) => {
      const prev = oldProps[key];

      if (prev === next) {
        return;
      }

      hostPatchProps(el, key, prev, next);
    });

    //若果旧的有这个属性，新的没有这个属性: 删除这个属性
    Object.entries(oldProps).forEach(([key, prev]: [any, any]) => {
      if ((key in newProps)) {
        return
      }

      hostPatchProps(el, key, prev, null);
    });
  }

  function patchKeyedChildren(c1: Array<any>, c2: Array<any>, el: any) {
    let i = 0; //比对的位置
    const l2 = c2.length
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    // 1. 同一位置比对（两个元素不同 -> 停止比对）2. 哪个数组没有了 -> 停止比对
    // 1. sync from start：从头部开始比对  // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) { //元素相同，进行比对
        patch(n1, n2, el);
      } else {
        break;
      }

      i++;
    }

    // 2. sync form end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) { //元素相同，进行比对
        patch(n1, n2, el);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    //特殊的情况 1. 旧的数据少，新的数据多 2. 新的数据多，旧的数据少
    // 3. common sequence + mount
    // (a b)
    // (a b) c d
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c d (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) { //旧的数据少，新的数据多
      if (i <= e2) {
        //添加数据： 在头部还是在尾部添加
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) { //遍历
          patch(null, c2[i++], el, anchor);
        }
      }

      return;
    }

    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    if (i > e2) {//旧的比新的多
      //删除数据
      while (i <= e1) {
        unmount(c1[i++]);
      }

      return;
    }

    // 5. unknown sequence 乱序
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    // 解决思路： 为新的乱序的child创建一个映射表，（2）在用旧的乱序的诗句去新的表中找 如果有旧复用 没有旧删除

    const s1 = i; // prev starting index
    const s2 = i; // next starting index


    // 5.1 build key:index map for newChildren
    const keyToNewIndexMap = new Map();

    for (let i = s2; i <= e2; i++) {
      const childVNode = c2[i];
      keyToNewIndexMap.set(childVNode.key, i);
    }

    //解决乱序比对的问题：位置不对、新的元素没有创建
    const toBePatched = e2 - s2 + 1; //乱序的个数
    //创建数组  Map<newIndex, oldIndex>
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    // 5.2 循环遍历旧子节点，并尝试更新的匹配节点，并删除不再存在的节点
    for (let i = s1; i <= e1; i++) {
      const oldChildVNode = c1[i];
      let newIndex = keyToNewIndexMap.get(oldChildVNode.key);
      if (newIndex === undefined) {
        unmount(oldChildVNode);
        continue;
      }

      //旧的和新的关系 索引关系
      newIndexToOldIndexMap[newIndex - s2] = i + 1; //就是老的索引位置(新的数据在旧的数据里面的索引位置 0表示没有)
      patch(oldChildVNode, c2[newIndex], el);
    }

    // 5.3 move and mount
    //移动结点并且添加新增的元素 方法 倒序
    for (let i = toBePatched - 1; i >= 0; i--) {
      let currentIndex = i + s2;
      const currentChild = c2[currentIndex];

      //添加 位置
      const anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, currentChild, el, anchor);

        continue;
      }

      hostInsert(currentChild.el, el, anchor)
    }
  }

  //比对child
  function patchChild(oldVNode: any, currentVNode: any, el: any) {
    const oldChildren = oldVNode.children;
    const nextChildren = currentVNode.children;

    if (oldChildren === nextChildren) {
      return;
    }

    //儿子之间 4种
    // 1. 旧的有儿子 新的没有儿子 2. 新的有儿子，旧的没有儿子 3. 儿子都是文本 4. 都有儿子，并且这些儿子是数组的
    //儿子都是文本
    const prevShapeFlag = oldVNode.shapeFlag;
    const nextShapeFlag = currentVNode.shapeFlag;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) { //新的是文本或者null：直接替换
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        hostRemove(oldChildren);
      }

      if (oldChildren !== nextChildren) {
        hostSetElementText(el, nextChildren);
      }

      return;
    }

    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //旧的是数组， 新的也是数组
      patchKeyedChildren(oldVNode.children, currentVNode.children, el);
      return;
    }

    // prev children was text OR null
    // new children is array OR null
    hostSetElementText(el, '');
    mountChildren(el, currentVNode.children);
  }

  function patchElement(oldVNode: any, currentVNode: any, container: any) {

    const el = currentVNode.el = oldVNode.el;
    const oldProps = oldVNode.props || {};
    const newProps = currentVNode.props || {};

    patchProps(el, oldProps, newProps);
    patchChild(oldVNode, currentVNode, el);
  }

  function processElement(oldVNode: any, currentVNode: any, container: any, anchor: any) {
    if (oldVNode === null) { //是第一次加载
      mountElement(currentVNode, container, anchor);
      return;
    }

    //TODO: 更新
    //更新 
    // 比对属性
    patchElement(oldVNode, currentVNode, container)
  }

  function isSameVNodeType(oldVNode: any, currentVNode: any) {
    return oldVNode.type === currentVNode.type && oldVNode.key === currentVNode.key;
  }

  function unmount(vNode: any) {
    hostRemove(vNode.el);
  }

  const patch = (oldVNode: any, currentVNode: any, container: any, anchor: any = null) => { //比对
    //针对不同的类型 组件/元素/文本
    //比对 1. 判断是不是同一个元素 2. 若是同一个元素（1. 比对props、children）
    //判断是不是同一个元素

    if (oldVNode && !isSameVNodeType(oldVNode, currentVNode)) {
      unmount(oldVNode);
      oldVNode = null;
    }

    let { shapeFlag, type } = currentVNode;

    if (type === TEXT) {
      //处理文本
      processText(oldVNode, currentVNode, container);
      return;
    }

    if (shapeFlag & ShapeFlags.ELEMENT) {
      // 处理元素
      processElement(oldVNode, currentVNode, container, anchor);
      return;
    }

    if (shapeFlag & ShapeFlags.COMPONENT) {
      // 处理组件
      processComponent(oldVNode, currentVNode, container);
    }
  }

  let render = (vNode: any, container: string) => { //渲染 将虚拟dom渲染成真实dom
    //组件初始化
    console.log(vNode);
    //调用render 
    patch(null, vNode, container); //比对
  }

  return {
    createApp: apiCreateApp(render), //创建 vnode 组件操作 =》vNode =》render()
  }
}

// 总结：
// 1. 创建 createApp方法 => runtime-dom 但是渲染组件 (运行在不同的平台)