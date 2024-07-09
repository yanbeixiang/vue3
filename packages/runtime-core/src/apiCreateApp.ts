import { createVNode } from "./vnode";

export function apiCreateApp(render: any) {
  return function createApp(rootComponent: any, rootProps: Record<string, any>) {
    const app = {
      //添加相关的属性
      _component: rootComponent = rootComponent,
      _props: rootProps,
      _container: null as any,
      mount(container: string) {
        //框架 组件 vNode
        // 1. vNode 根据组件创建vnode节点
        let vNode = createVNode(rootComponent, rootProps, []);

        // 2. 渲染 render(container)          
        render(vNode, container);

        app._container = container;
      }
    }

    return app;
  }
} 