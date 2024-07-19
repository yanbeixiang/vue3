import { currentInstance, setCurrentInstance } from './component';
import { LifecycleHooks } from './enums';

//写4个生命周期

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_CREATE);

export const onMounted = createHook(LifecycleHooks.MOUNTED);

export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);

export const onUpdated = createHook(LifecycleHooks.UPDATED);

// 1. 在setup执行之前创建全局的currentInstance
// 2. 执行setup, 在setup中使用全局的currentInstance
// 3. setup执行完成, 使currentInstance = null


//生命周期
// 问题 1: 返回值： 是一个函数
function createHook(lifecycle: LifecycleHooks) {
  //核心就是这个生命周期要和当前组件实例产生关联
  return function (hook: Function, target = currentInstance) { //target：当前组件实例
    injectHook(lifecycle, hook, target);
  }
}

//生命周期与实例进行关联
function injectHook(lifecycle: LifecycleHooks, hook: Function, target: any, prepend: boolean = false) {
  //注意： vue3中的生命周期都是在setup中使用的

  if (!target) {
    return;
  }

  //给实例添加生命周期
  const hooks = target[lifecycle] || (target[lifecycle] = []);

  //问题：getCurrentInstance()获取到当前组件的实例
  //vue3源码 用了一个切片的方法来实现

  const rap = () => {
    setCurrentInstance(target); //执行生命周期前存放一个当前的实例
    hook();
    setCurrentInstance(null);
  }

  hooks.push(rap);
}