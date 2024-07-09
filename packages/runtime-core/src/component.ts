import { isFunction, isObject, ShapeFlags } from "@vue/shared";
import { componentPublicInstance } from "./componentPublicInstance";

//组件 实例
export function createComponentInstance(vNode: any) {
  const instance = { //组件 props attrs slots
    vNode,
    type: vNode.type,
    props: {},
    attrs: {},
    setupState: {},
    ctx: {}, //代理
    proxy: {},
    data: {},
    render: false,
    isMounted: false, //是否挂载
  }

  instance.ctx = { _: instance };

  return instance;
}

//解析数据到组件实例上
export function setupComponent(instance: any) {
  const { props, children } = instance.vNode;

  instance.props = props;
  instance.children = children; //slots 插槽


  //是有状态组件
  let isStateFulComponent = instance.vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (isStateFulComponent) {
    setupStateComponent(instance);
  }
}

//处理setup
function setupStateComponent(instance: any) {
  //代理
  instance.proxy = new Proxy(instance.ctx, componentPublicInstance as any)

  //获取组件的类型拿到组件的setup方法 参数(props, context) 返回值（对象 or 函数）

  let component = instance.type;
  let { setup } = component;

  //看一下这个组件有没有setup
  if (!setup) { //没有setup
    //调用 render
    finishComponentSetup(instance);
    return;
  }

  //处理参数
  const setupContext = createContext(instance);
  const setupResult = setup(instance.props, setupContext); //setup返回值 1. 对象（值） 2. 函数（render）

  handlerSetupResult(instance, setupResult);
}

function handlerSetupResult(instance: any, setupResult: any) {
  // 1. 对象（值） 2. 函数（render）
  if (isObject(setupResult)) {
    instance.setupState = setupResult;
  } else if (isFunction(setupResult)) {
    instance.render = setupResult;
  }

  //走render方法
  finishComponentSetup(instance);
}

//处理render
function finishComponentSetup(instance: any) {
  // 判断一下 组件中有没有这个render
  const Component = instance.type;
  if (!instance.render) {
    if (Component.render) {
      instance.render = Component.render
    } else if (Component.template) {
      //TODO: 模板 => render
    }
  }
}

function createContext(instance: any) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => { },
    expose: () => { },
  }
}