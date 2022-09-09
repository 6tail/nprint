# NPrint [![License](https://img.shields.io/badge/license-MIT-4EB1BA.svg?style=flat-square)](https://github.com/6tail/lunar-javascript/blob/master/LICENSE)

NPrint是一个纯javascript的WEB打印库，使用它不需要安装任何浏览器插件。

[English](https://github.com/6tail/nprint/blob/master/README.md)

## 示例

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>NPrint打印示例</title>
  </head>
  <body>
    <script src="nprint.js"></script>
    <script>
      //创建一个打印文档
      var doc = NPrint.createDocument();

      //设置纸张类型
      doc.getPaper().setType('A4');

      //添加一个打印页
      var page = doc.addPage();

      //在页正中心添加一个100mm*26mm的文字区域，填充文字大小为10mm，文字对齐方式为居中对齐
      page.addText().setWidth(100).setHeight(26).setAnchor(NPrint.ANCHOR.CENTER).setContent('Hello World!').setSize(10).setAlign(NPrint.ALIGN.CENTER);

      //预览
      doc.preview();

      //打印
      //doc.print();
    </script>
  </body>
</html>
```

输出结果：

![示例](https://6tail.cn/nprint/sample.png "示例")

## 文档

请移步至 [https://6tail.cn/nprint/api.html](https://6tail.cn/nprint/api.html "https://6tail.cn/nprint/api.html")
