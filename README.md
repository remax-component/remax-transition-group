# Remax Transition Group

[`react-transition-group`](https://github.com/reactjs/react-transition-group/tree/master)以 Remax 方式实现

## 安装

```sh
yarn add @remax-component/transition-group
# 或者
npm i @remax-component/transition-group
```

## 使用

```js
import "rmc-checkbox/dist/assets/index.css"; // 亦可引入其它样式
import { View } from "remax/one";
import Checkbox from "rmc-checkbox";

export default () => {
  return (
    <View>
      <Checkbox />
    </View>
  );
};
```

## API

| 名称           | 类型                            | 默认值 | 描述                                                                        |
| -------------- | ------------------------------- | ------ | --------------------------------------------------------------------------- |
| prefixCls      | string                          |        | rmc-checkbox                                                                |
| className      | string                          |        | 为根节点添加的额外类名                                                      |
| name           | string                          |        | 用于原生的 Form 的表单字段                                                  |
| checked        | boolean                         |        | 是否被选中（受控属性）                                                      |
| defaultChecked | boolean                         |        | 是否默认被选中，当且仅当组件被挂载时生效                                    |
| onChange       | `(event: CheckboxEvent) => any` |        | Checkbox 值改变时被调用，通过`e.target.value`和`e.target.checked`可获取状态 |
| onClick        | `(event: CheckboxEvent) => any` |        | 同`onChange`                                                                |

## 开发

```sh
yarn install
yarn start
```

最后用支付宝工具打开`example/dist/alipay`目录。

![image](https://user-images.githubusercontent.com/20639676/79632808-399db080-8194-11ea-8f10-d0ae527c99f1.png)

## TODO

- [ ] 单元测试
- [ ] 网页端 Demo

## License

MIT
