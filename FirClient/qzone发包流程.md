# step1 打包
----cocos creator 确保游戏本地可以正常运行
1.构建工程，选择web-mobile平台
2.初始场景选择LoadSceneQZone.fire
3.勾选 md5 cache
4.勾选 合并场景所有依赖
5.渲染模式-设置自动;方向-Portrait
6.点击构建

# step2 引擎图片处理
 1.将手动修改的RGB444的引擎文件---替换到build目录下.(等待后续优化)

# step3 入口文件剥离
 1.将build目录下的index.html文件移至到目录外面，入口文件需要最后放

# step4 生成游戏zip文件
1.回到cocoscreator，点击外网qzone打包 

# step5 上传|解压 游戏zip文件
1.将zip文件用ftp工具，上传至指定文件目录 /var/www/html/
2.命令行连接远程资源服务器(111.230.151.133)进行，解压缩

# step6 将index.html文件传到远程目录

发布完毕