import { hasOwn } from "@vue/shared";

export const componentPublicInstance = {
  get({ _: instance }: Record<string, any>, key: string) {
    //获取值 props children data
    const { props, data, setupState } = instance;

    if (key[0] === '$') { //属性以$开头的不能获取
      return;
    }

    if (hasOwn(props, key)) {
      return props[key];
    }

    if (hasOwn(setupState, key)) {
      return setupState[key];
    }

    if (hasOwn(data, key)) {
      return data[key];
    }

  },
  set({ _: instance }: Record<string, any>, key: string, value: any) {
    const { props, data, setupState } = instance;

    if (hasOwn(props, key)) {
      props[key] = value;
      return;
    }

    if (hasOwn(setupState, key)) {
      setupState[key] = value;
      return;
    }

    if (hasOwn(data, key)) {
      data[key] = value;
      return;
    }
  }
}