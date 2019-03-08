## 客户端

- cocos creator 使用protobuf
- `npm install -g protobufjs`方便使用protobufjs提供的pbjs命令行
- pbjs可以将proto原文件转换成json、js等，以提供不同的加载proto的方式，我们可以根据自己的实际情况选择使用，还有pbts，用来将转化后的js文件转为ts
- 下载protobuf.js [https://www.npmjs.com/package/protobufjs]
- 把下载好的protobuf中这个文件夹下的protobuf.js文件 把这个文件拖到Creator工程中并且导入为插件
- 创建自己的proto消息文件
- 在保存proto文件的目录下打开命令行执行如下命令
- `pbjs -t static-module -w commonjs -o proto.js *.proto`