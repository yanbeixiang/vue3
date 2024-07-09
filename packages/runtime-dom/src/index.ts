// runtime-dom 操作dom （1）节点 （2）属性

import { extend } from "@vue/shared";
import { createRenderer } from "@vue/runtime-core";

import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProp";

// vue3 dom全部 操作

const renderOptionDom = extend({ patchProps }, nodeOps);

export const createApp = (rootComponent: any, rootProps: Record<string, any>) => {
  //有不同的平台 创建渲染器(createRender)
  const app: any = createRenderer(renderOptionDom).createApp(rootComponent, rootProps);
  const { mount } = app;

  app.mount = function (container: string) {
    //挂载组件
    //清空容器的内容

    const containerEle = nodeOps.querySelector(container);

    if (!containerEle) {
      return;
    }

    containerEle.innerHTML = '';

    //将组件渲染的dom元素进行挂载
    mount(containerEle);
  }

  return app;
}

export * from '@vue/runtime-core';