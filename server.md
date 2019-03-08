## 常用命令
- ls 列举文件
- cd 进入目录
- rm -rf [filename]  递归强制删除文件
- unzip -o [filename]  解压并覆盖文件
- put [filename]  上传
- get [filename]  下载
- 7z a -tzip [zipfile] [file]   将file添加到zipfile中，格式是zip
- certutil -hashfile [filename] MD5(SHA1,SHA256)     windows 查看文件md5 
- ls -l [filename], stat [filename]     显示文件信息
- rm [filename1] [filename2]    将filename1重命名为filename2


## linux下安装node.js
`yum install -y nodejs`
- 软连接
```
ln nodejs/bin/npm /usr/local/bin
ln nodejs/bin/node /usr/local/bin
```

## 安装最新版python

 `wget http://www.python.org/ftp/python/2.7.16/Python-2.7.16.tar.xz`