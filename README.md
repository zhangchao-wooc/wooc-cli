# @wooc/mini-i18n-cli

配合 @wooc/mini-i18n 使用的脚手架工具，用于多语言文件的导出、导入

<br>

# 安装

使用 yarn add @wooc/mini-i18n-cli --dev / npm install @wooc/mini-i18n-cli --save--dev

<br>

# 使用
## export

导出指定位置、指定类型的多语言文件。
导出的源文件支持 json、ts、js
可以导出为 xlsx、json 文件
导出文件位置为源文件的同级目录下，文件名为 locales_ + 年月日 + 文件后缀

<br>

### 使用

```javascript
wooc export --mode single --paths ./src/locales --type xlsx
```

<br>

### config
#### --mode 导出模式 
[1]、single 单文件 

[2]、multiple 多文件 
该模式下会忽略 --paths 的参数
作用 递归当前目录下的所有文件名为 locales 的目录，并读取目录内容，导出文件

default: single

<br>

#### --paths 源文件路径
default: ./src/locales'

<br>

#### --type 导出文件类型
[1] xlsx 表格

[2] json 集合

default: xlsx





