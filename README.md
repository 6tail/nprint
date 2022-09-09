# NPrint [![License](https://img.shields.io/badge/license-MIT-4EB1BA.svg?style=flat-square)](https://github.com/6tail/lunar-javascript/blob/master/LICENSE)

NPrint is a pure javascript web print library without browser plugins.

[简体中文](https://github.com/6tail/nprint/blob/master/README_ZH.md)

## Example

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Print Demo</title>
  </head>
  <body>
    <script src="nprint.js"></script>
    <script>
      //create a print document
      var doc = NPrint.createDocument();

      //set paper type
      doc.getPaper().setType('A4');

      //add a print page
      var page = doc.addPage();

      //add 100mm*26mm region at page center to fill text 'Hello World!',text size 10mm,text align CENTER
      page.addText().setWidth(100).setHeight(26).setAnchor(NPrint.ANCHOR.CENTER).setContent('Hello World!').setSize(10).setAlign(NPrint.ALIGN.CENTER);

      //preview
      doc.preview();

      //print
      //doc.print();
    </script>
  </body>
</html>
```

Output:

![sample](https://6tail.cn/nprint/sample.png "sample")

## Documentation

Please visit [https://6tail.cn/nprint/api.html](https://6tail.cn/nprint/api.html "https://6tail.cn/nprint/api.html")
