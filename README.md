# Remax Transition Group

[`react-transition-group`](https://github.com/reactjs/react-transition-group/tree/master)以 Remax 方式实现

## 安装

```sh
yarn add @remax-component/transition-group
# 或者
npm i @remax-component/transition-group
```

## 使用

可见 http://reactcommunity.org/react-transition-group/transition
等待添加新的例子

## API

### `useTransition` ， `<Transition />`，`<CSSTransition />` 共用的属性

| 名称                           | 类型                                                          | 默认值 | 描述                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| in                             | boolean                                                       | false  | 是否展示组件。变化时会触发`enter`和`exit`的状态改变                                                                                                                                                                                                                                    |
| mountOnEnter                   | boolean                                                       | false  | 默认子组件会立即被挂载到`<Transition />`父组件下。如果你想”懒挂载”这个组件，仅当`in={true}`时挂载，你可以设置`mountOnEnter`。当组价首次挂载后，即使状态为`EXITED`，组件依旧会保持存在。除非你设置了`unmountOnExit`                                                                     |
| appear                         | boolean                                                       | false  | 默认状态下， 下，组件挂载时不会改变 enter 的状态，即使`in={true}`。如果你想实现组件挂载后立即改变 enter 的状态，请设置`appear={true}`。请注意，并没有称为`appearing`或`appeared`的状态。然而在`<CSSTransition />`中，有另外的`appear-*`的`className`，凭借于此，你可以设置不同的样式。 |
| enter                          | boolean                                                       | true   | 是否在触发 enter 的 transition                                                                                                                                                                                                                                                         |
| exit                           | boolean                                                       | true   | 是否触发 exit 的 transition                                                                                                                                                                                                                                                            |
| timeout                        | `number | { enter?: number, exit?: number, appear?: number }` | 0      | 各个状态变切换的时间。他与 CSS 样式中的时间相相对应                                                                                                                                                                                                                                    |
| onEnter, onEntering, onEntered | `(isAppearing: boolean) => any`                               |        | 当 in 从`false`到`true`，或者设置了`appear`之后的回调。若`appear={true}`且在组件挂载的时期，则`isAppearing`为 true，其它情况下为`false`                                                                                                                                                |
| onExit, onExiting, onExited    | `() => any`                                                   |        | `in`从`true`变为`false`时的回调                                                                                                                                                                                                                                                        |

## TODO

- TransitionGroup 的实现
- SwitchTransition 的实现

## License

MIT
