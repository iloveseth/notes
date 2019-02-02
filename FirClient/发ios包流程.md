## 注意事项
----cocos creator
1.构建工程，模版需要选择jsb-default
2.md5 cache不要勾选，native会自动有md5校验码。勾了热更新会找不到本地的资源索引文件。(cocos creator版本目前1.x.x系列不行，2.x系列有对应的api获取，最好是别勾选)
3.勾选加密脚本，勾选构建全部场景，设备方向调整-Portrait。
4.若是新的马甲包，请变更gulpfile里面的图片压缩质量，将图片的md5 hash值变更掉。

耐心等待发布完毕。

如果ios工程第一次发，则将pro-ios工程，复制一份，专门做pubilsh的local工程。
如果publish的ios工程已经存在。则只需将pro-ios工程下面的res,src，copy,覆盖现有publish工程下的res,src文件。（project.json,main.js 一般不会有变动，若有变动也需要copy-覆盖）

----iOS-publish的工程
这个工程，需要进行一次马甲包混淆。（仅需混淆一次即可）
具体混淆方法，见KLGenerateSpamCode mac工程的reademe.md。