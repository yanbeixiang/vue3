import { ShapeFlags } from "@vue/shared";

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
    isMounted: false, //是否挂载
  }

  instance.ctx={_: instance};

  return instance;
}

//解析数据到组件实例上
export function setupComponent(instance: any) {
  const { props, children } = instance.vNode;

  instance.props = props;
  instance.children = children; //slots 插槽

  //看一下这个组件有没有setup
  let isStateFulComponent = instance.vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
  if (isStateFulComponent) {
    setupStateComponent(instance);
  }

}

//处理setup
function setupStateComponent(instance: any) {
  // setup 返回值是我们的render函数

  //获取组件的类型拿到组件的setup方法 参数(props, context) 返回值（对象 or 函数）

  let component  = instance.type;
  let { setup } = component;
  //处理参数
  const setupContext = createContext(instance);

  setup(instance.props, setupContext);
}

function createContext(instance: any) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}

export function setupRenderEffect() {

}