;(function(name,root,factory){
  if (typeof define==='function'&&define.amd){
    define(factory);
  }else if(typeof module!='undefined'&&module.exports){
    module.exports = factory();
  }else{
    root[name] = factory();
  }
})('NPrint',this,function(){
  var W = window,D = document,ANCHOR = {
    TOP_LEFT:'top_left',
    TOP:'top',
    TOP_RIGHT:'top_right',
    RIGHT_TOP:'right_top',
    RIGHT:'right',
    RIGHT_BOTTOM:'right_bottom',
    BOTTOM_RIGHT:'bottom_right',
    BOTTOM:'bottom',
    BOTTOM_LEFT:'bottom_left',
    LEFT_BOTTOM:'left_bottom',
    LEFT:'left',
    LEFT_TOP:'left_top',
    CENTER:'center',
    NONE:'none'
  },PAPER = {
    'A0':{width:841,height:1189},
    'A1':{width:594,height:841},
    'A2':{width:420,height:594},
    'A3':{width:297,height:420},
    'A4':{width:210,height:297}
  };
  var ALIGN = ANCHOR;
  var _mask=null,_layer=null,_timer;
  var _clear = function(){
    if(_timer){
      W.clearInterval(_timer);
      _timer = null;
    }
    if(_mask){
      _mask.parentNode.removeChild(_mask);
    }
    _mask = null;
    if(_layer){
      _layer.parentNode.removeChild(_layer);
    }
    _layer = null;
  };
  var DomUtil = (function(){
    var C = [function(el,css){el.style.cssText = css;},function(el,css){el.setAttribute('style',css);}];
    var E=[
      function(el,v,func){
        if('[object Array]'===Object.prototype.toString.call(v)){
          for(var i=0,j=v.length;i<j;i++){
            el.attachEvent('on' + v[i],function(e){V(el,e,func);});
          }
        }else{
          el.attachEvent('on' + v,function(e){V(el,e,func);});
        }
      },
      function(el,v,func){
        if('[object Array]'===Object.prototype.toString.call(v)){
          for(var i=0,j=v.length;i<j;i++){
            el.addEventListener(v[i],function(e){V(el,e,func);},false);
          }
        }else{
          el.addEventListener(v,function(e){V(el,e,func);},false);
        }
      }
    ];
    var S=[
      function(style){
        D.createStyleSheet().cssText = style;
      },
      function(style){
        var o = D.createElement('style');
        o.type = 'text/css';
        o.innerHTML = style;
        D.getElementsByTagName('head')[0].appendChild(o);
      }
    ];
    var V =function(el,e,func){
      var prop = func.call(el,W.event||e);
      if(!prop){
        if(e.stopPropagation){
          e.stopPropagation();
        }else{
          e.cancelBubble = true;
        }
        if(e.preventDefault){
          e.preventDefault();
        }else{
          e.returnValue = false;
        }
      }
    };
    var Z=[
      function(el,className){el.className = className;},
      function(el,className){el.setAttribute('class',className);}
    ];
    var _try = function(funcs,args){
      for(var i=0,j=funcs.length;i<j;i++){
        var func = funcs[i];
        try{
          func.apply(func,args);
          break;
        }catch(e){}
      }
    };
    var _addEvent = function(el,v,func){
      _try(E,[el,v,func]);
    };
    var _setStyle = function(el,css){
      _try(C,[el,css]);
    };
    var _addStyle = function(el,css){
      var s = el.style.cssText;
      if(';'!=s.substr(s.length-1)) s+=';';
      _setStyle(el,s+css);
    };
    var _style = function(css){
      _try(S,[css]);
    };
    var _setClass = function(el,className){
      _try(Z,[el,className]);
    };
    var _addClass = function(el,className){
      if (!_hasClass(el,className)){
        _setClass(el,_getClass(el)+" "+className);
      }
    };
    var _removeClass = function(el,className){
      if(_hasClass(el,className)){
        _setClass(el,_getClass(el).replace(new RegExp('(\\s|^)' + className + '(\\s|$)'),' '));
      }
    };
    var _getClass = function(el){
      var s = el.className||el.getAttribute('class');
      return s?s:'';
    };
    var _hasClass = function(el,className){
      return _getClass(el).match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    };
    var _getLocation = function(o){
      var x=0,y=0;
      switch(o.length){
        case 1:
          var r=_getLocation([]);
          var m=o[0];
          if(m.getBoundingClientRect){
            x=m.getBoundingClientRect().left + r.x - D.documentElement.clientLeft;
            y=m.getBoundingClientRect().top + r.y - D.documentElement.clientTop;
          }else{
            for(;m;x+=m.offsetLeft,y+=m.offsetTop,m=m.offsetParent);
          }
          break;
        default:
          x=Math.max(D.documentElement.scrollLeft,D.body.scrollLeft);
          y=Math.max(D.documentElement.scrollTop,D.body.scrollTop);
      }
      return {x:x,y:y};
    };
    var _getSize = function(o){
      var w=0,h=0;
      switch(o.length){
        case 1:
          var m=o[0];
          w=m.offsetWidth;
          h=m.offsetHeight;
          break;
        default:
          w=D.documentElement.clientWidth;
          h=D.documentElement.clientHeight;
      }
      return {width:w,height:h};
    };
    var _getChildren = function(el){
      var c=[];
      for(var i=0,j=el.childNodes.length;i<j;i++){
        var m=el.childNodes[i];
        if(1==m.nodeType) c.push(m);
      }
      return c;
    };
    var _getDPI = function(){
      var ret={x:0,y:0,toString:function(){return this.x+','+this.y;}};
      if(screen.deviceXDPI&&screen.deviceYDPI){
        ret.x = screen.deviceXDPI;
        ret.y = screen.deviceYDPI;
      }else {
        var o = D.createElement('div');
        DomUtil.setStyle(o,'width:1in;height:1in;font-size:0;position:absolute;left:0;top:0;visibility:hidden');
        D.body.appendChild(o);
        ret.x = parseInt(o.offsetWidth,10);
        ret.y = parseInt(o.offsetHeight,10);
        o.parentNode.removeChild(o);
      }
      return ret;
    };
    return {
      addEvent:function(el,v,func){_addEvent(el,v,func);return this;},
      setStyle:function(el,css){_setStyle(el,css);return this;},
      addStyle:function(el,css){_addStyle(el,css);return this;},
      style:function(css){_style(css);return this;},
      getClass:function(el){return _getClass(el);},
      hasClass:function(el,className){return _hasClass(el,className);},
      setClass:function(el,className){_setClass(el,className);return this;},
      addClass:function(el,className){_addClass(el,className);return this;},
      removeClass:function(el,className){_removeClass(el,className);return this;},
      getLocation:function(){return _getLocation(arguments);},
      getSize:function(){return _getSize(arguments);},
      getChildren:function(el){return _getChildren(el);},
      getDPI:function(){
        return _getDPI();
      }
    };
  })();
  var MathUtil = (function(){
    return {
      mm2px:function(dpi,mm){
        return Math.ceil(dpi/25.4*mm);
      }
    };
  })();
  var _createText = function(){
    var text = _createPanel();
    text._content = '';
    text._color = '#000';
    text._size = '12px';
    text._align = ALIGN.LEFT_TOP;
    text.getContent = function(){return this._content;};
    text.setContent = function(s){
      this._content = s;
      return this;
    };
    text.getColor = function(){return this._color;};
    text.setColor = function(s){
      this._color = s;
      return this;
    };
    text.getSize = function(){return this._size;};
    text.setSize = function(size){
      this._size = size;
      return this;
    };
    text.getAlign = function(){return this._align;};
    text.setAlign = function(align){
      this._align = align;
      return this;
    };
    return text;
  };
  var _createImage = function(){
    var img = _createPanel();
    img._src = '';
    img.setSource = function(src){
      this._src = src;
      return this;
    };
    img.getSource = function(){
      return this._src;
    };
    return img;
  };
  var _createPanel = function(){
    return {
      _width:0,
      _height:0,
      _padding:{
        _left:0,
        _top:0,
        _right:0,
        _bottom:0,
        setLeft:function(n){this._left=n;return this;},
        setTop:function(n){this._top=n;return this;},
        setRight:function(n){this._right=n;return this;},
        setBottom:function(n){this._bottom=n;return this;},
        getLeft:function(){return this._left;},
        getTop:function(){return this._top;},
        getRight:function(){return this._right;},
        getBottom:function(){return this._bottom;}
      },
      _location:{
        _x:0,
        _y:0,
        setX:function(x){this._x=x;return this;},
        setY:function(y){this._y=y;return this;},
        getX:function(){return this._x;},
        getY:function(){return this._y;}
      },
      _anchor:ANCHOR.CENTER,
      _bgcolor:'#FFF',
      _layer:null,
      _children:[],
      getWidth:function(){return this._width;},
      setWidth:function(w){
        this._width=w;
        return this;
      },
      getHeight:function(){return this._height;},
      setHeight:function(h){
        this._height=h;
        return this;
      },
      getAnchor:function(){return this._anchor;},
      setAnchor:function(anchor){
        this._anchor=anchor;
        return this;
      },
      getPadding:function(){
        return this._padding;
      },
      getLocation:function(){
        return this._location;
      },
      setBgColor:function(color){
        this._bgcolor = color;
        return this;
      },
      getBgColor:function(){
        return this._bgcolor;
      },
      setLayer:function(layer){
        this._layer = layer;
        return this;
      },
      getLayer:function(){
        return this._layer;
      },
      addPanel:function(){
        var panel = _createPanel();
        this._children.push({type:'panel',instance:panel});
        return panel;
      },
      addGrid:function(){
        var grid = _createGrid();
        this._children.push({type:'grid',instance:grid});
        return grid;
      },
      addText:function(){
        var text = _createText();
        this._children.push({type:'text',instance:text});
        return text;
      },
      addImage:function(){
        var img = _createImage();
        this._children.push({type:'image',instance:img});
        return img;
      },
      getChildren:function(){
        return this._children;
      }
    };
  };
  var _createGrid = function(){
    var grid = _createPanel();
    grid._cols = 1;
    grid._rows = 1;
    grid._cells = {};
    grid.getCols = function(){return this._cols;};
    grid.setCols = function(cols){
      this._cols = cols;
      return this;
    };
    grid.getRows = function(){return this._rows;};
    grid.setRows = function(rows){
      this._rows = rows;
      return this;
    };
    grid.getCell = function(row,col){
      var cell = this._cells[row+'-'+col];
      if(!cell){
        cell = _createPanel();
        var width = this.getWidth()/this.getCols(),height = this.getHeight()/this.getRows();
        cell.setWidth(width).setHeight(height);
        this._cells[row+'-'+col] = {_row:row,_col:col,getRow:function(){return this._row;},getCol:function(){return this._col;},instance:cell};
      }
      return cell;
    };
    grid.getCells = function(){
      var l = [];
      for(var i in this._cells){
        l.push(this._cells[i]);
      }
      return l;
    };
    return grid;
  };
  var _addPage = function(doc){
    var page = _createGrid();
    page._document = doc;
    page.getDocument = function(){
      return this._document;
    };
    var paper = doc.getPaper();
    page.setCols(1);
    page.setRows(1);
    page.setWidth(paper.getWidth()).setHeight(paper.getHeight());
    page.setAnchor(ANCHOR.NONE);
    delete page['setCols'];
    delete page['setRows'];
    delete page['setWidth'];
    delete page['setHeight'];
    delete page['setAnchor'];
    return page;
  };
  var _createDocument = function(){
    return {
      _dpi:DomUtil.getDPI(),
      _paper:{
        _width:210,
        _height:297,
        getWidth:function(){
          return this._width;
        },
        getHeight:function(){
          return this._height;
        },
        setWidth:function(w){
          this._width = w;
          return this;
        },
        setHeight:function(h){
          this._height = h;
          return this;
        },
        setType:function(type){
          var t = PAPER[type];
          if(t){
            this.setWidth(t.width).setHeight(t.height);
          }
          return this;
        }
      },
      _pages:[],
      _build:function(iframe){
        var doc = iframe.document;
        doc.open();
        doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><style type="text/css">*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;margin:0;padding:0;border:0;}body{font-size:12px;word-wrap:break-word}img{border:0}table{border-spacing:0}@page{size:'+this._paper._width+'mm '+this._paper._height+'mm landscape;margin:0;}aside{display:none}</style></head><body></body></html>');
        doc.close();
        iframe.body = doc.body;
        for(var i=0,j=this._pages.length;i<j;i++){
          this._buildPage(iframe,this._pages[i]);
        }
      },
      _buildPage:function(iframe,page){
        var dpi = this.getDPI();
        var div = iframe.document.createElement('div');
        var w = MathUtil.mm2px(dpi.x,page.getWidth());
        var h = MathUtil.mm2px(dpi.y,page.getHeight())-1;
        DomUtil.setStyle(div,'position:relative;width:'+w+'px;height:'+h+'px;background-color:'+page.getBgColor()+';overflow:hidden;page-break-after:always');
        iframe.body.appendChild(div);
        page.setLayer(div);
        var children = page.getChildren();
        for(var i=0,j=children.length;i<j;i++){
          this._buildControl(iframe,page,children[i]);
        }
      },
      _buildControl:function(iframe,father,panel){
        var that = this;
        switch(panel.type){
          case 'panel':
            that._buildPanel(iframe,father,panel);
            break;
          case 'grid':
            that._buildGrid(iframe,father,panel);
            break;
          case 'text':
            that._buildText(iframe,father,panel);
            break;
          case 'image':
            that._buildImage(iframe,father,panel);
            break;
        }
        var instance = panel.instance;
        var children = instance.getChildren();
        for(var i=0,j=children.length;i<j;i++){
          this._buildControl(iframe,instance,children[i]);
        }
      },
      _computeAnchor:function(father,panel){
        var fw = father.getWidth(),fh = father.getHeight(),pw = panel.getWidth(),ph = panel.getHeight();
        var padding = father.getPadding();
        if(!padding){
          padding={
            getLeft:function(){return 0;},
            getTop:function(){return 0;},
            getRight:function(){return 0;},
            getBottom:function(){return 0;}
          };
        }
        var fx = (fw-pw)/2,fy = (fh-ph)/2;
        var left = 0,top = 0;
        switch(panel.getAnchor()){
          case ANCHOR.LEFT_TOP:
          case ANCHOR.TOP_LEFT:
            left = padding.getLeft();
            top = padding.getTop();
            break;
          case ANCHOR.TOP:
            left = fx;
            top = padding.getTop();
            break;
          case ANCHOR.RIGHT_TOP:
          case ANCHOR.TOP_RIGHT:
            left = fw-pw-padding.getRight();
            top = padding.getTop();
            break;
          case ANCHOR.RIGHT:
            left = fw-pw-padding.getRight();
            top = fy;
            break;
          case ANCHOR.RIGHT_BOTTOM:
          case ANCHOR.BOTTOM_RIGHT:
            left = fw-pw-padding.getRight();
            top = fh-ph-padding.getBottom();
            break;
          case ANCHOR.BOTTOM:
            left = fx;
            top = fh-ph-padding.getBottom();
            break;
          case ANCHOR.LEFT_BOTTOM:
          case ANCHOR.BOTTOM_LEFT:
            left = padding.getLeft();
            top = fh-ph-padding.getBottom();
            break;
          case ANCHOR.LEFT:
            left = padding.getLeft();
            top = fy;
            break;
          case ANCHOR.CENTER:
            left = fx;
            top = fy;
            break;
          case ANCHOR.NONE:
            var location = panel.getLocation();
            left = location.x;
            top = location.y;
            break;
        }
        return {left:left,top:top};
      },
      _buildText:function(iframe,father,panel){
        var dpi = this.getDPI();
        var div = this._buildPanel(iframe,father,panel);
        var instance = panel.instance;
        var child = iframe.document.createElement('div');
        div.appendChild(child);
        child.innerHTML = instance.getContent();
        var align = '';
        switch(instance.getAlign()){
          case ALIGN.NONE:
          case ALIGN.LEFT_TOP:
          case ALIGN.TOP_LEFT:
            align = ';text-align:left;display:table-cell;vertical-align:top';
            break;
          case ALIGN.TOP:
            align = ';text-align:center;display:table-cell;vertical-align:top';
            break;
          case ALIGN.RIGHT_TOP:
          case ALIGN.TOP_RIGHT:
            align = ';text-align:right;display:table-cell;vertical-align:top';
            break;
          case ALIGN.RIGHT:
            align = ';text-align:right;display:table-cell;vertical-align:middle';
            break;
          case ALIGN.RIGHT_BOTTOM:
          case ALIGN.BOTTOM_RIGHT:
            align = ';text-align:right;display:table-cell;vertical-align:bottom';
            break;
          case ALIGN.BOTTOM:
            align = ';text-align:center;display:table-cell;vertical-align:bottom';
            break;
          case ALIGN.LEFT_BOTTOM:
          case ALIGN.BOTTOM_LEFT:
            align = ';text-align:left;display:table-cell;vertical-align:bottom';
            break;
          case ALIGN.LEFT:
            align = ';text-align:left;display:table-cell;vertical-align:middle';
            break;
          case ALIGN.CENTER:
            align = ';text-align:center;display:table-cell;vertical-align:middle';
            break;
        }
        DomUtil.addStyle(div,'display:table');
        var size = instance.getSize();
        if(size===+size){
          size = size+'mm';
        }
        DomUtil.addStyle(child,'color:'+instance.getColor()+';font-size:'+size+align);
        return div;
      },
      _buildImage:function(iframe,father,panel){
        var div = this._buildPanel(iframe,father,panel);
        var instance = panel.instance;
        div.innerHTML = '<img src="'+instance.getSource()+'" width="100%" height="100%">';
        return div;
      },
      _buildPanel:function(iframe,father,panel){
        var dpi = this.getDPI();
        var instance = panel.instance;
        var pw = instance.getWidth(),ph = instance.getHeight();
        var anchor = this._computeAnchor(father,instance);
        var x = MathUtil.mm2px(dpi.x,anchor.left);
        var y = MathUtil.mm2px(dpi.y,anchor.top);
        var w = MathUtil.mm2px(dpi.x,pw);
        var h = MathUtil.mm2px(dpi.y,ph);
        var div = iframe.document.createElement('div');
        DomUtil.setStyle(div,'position:absolute;left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background-color:'+instance.getBgColor());
        father.getLayer().appendChild(div);
        instance.setLayer(div);
        return div;
      },
      _buildGrid:function(iframe,father,panel){
        var dpi = this.getDPI();
        var div = this._buildPanel(iframe,father,panel);
        var instance = panel.instance;
        var cols = instance.getCols();
        var rows = instance.getRows();
        var pw = instance.getWidth(),ph = instance.getHeight();
        var width = pw/cols,height = ph/rows;
        var w = MathUtil.mm2px(dpi.x,width);
        var h = MathUtil.mm2px(dpi.y,height);
        var s = '<table><tbody>';
        for(var i=0;i<rows;i++){
          s += '<tr>';
          for(var j=0;j<cols;j++){
            s+='<td style="width:'+w+'px;height:'+h+'px;position:relative;"></td>';
          }
          s += '</tr>';
        }
        s += '</tbody></table>';
        div.innerHTML = s;
        var cells = instance.getCells();
        var cellSize = cells.length;
        if(cellSize>0){
          var trs = DomUtil.getChildren(div.getElementsByTagName('tbody')[0]);
          for(var i=0;i<cellSize;i++){
            var cell = cells[i];
            var gf = cell.instance;
            var tds = DomUtil.getChildren(trs[cell.getRow()]);
            gf.setLayer(tds[cell.getCol()]);
            this._buildControl(iframe,gf,cell);
          }
        }
        return div;
      },
      _listImages:function(panel){
        var images = [];
        if(!panel) return images;
        var cells = [];
        try{cells=panel.getCells();}catch(e){}
        var l = panel.getChildren().concat(cells);
        if(!l) return images;
        var size = l.length;
        if(size<1) return images;
        for(var i=0;i<size;i++){
          var o = l[i];
          if('image'==o.type){
            var src = o.instance.getSource();
            if(src){
              images.push(src);
            }
          }
          images = images.concat(this._listImages(o.instance));
        }
        return images;
      },
      _prepare:function(parentNode,callback){
        var iframe = D.createElement('iframe');
        iframe.wmode='Opaque';
        iframe.frameBorder='0';
        iframe.src='about:blank';
        DomUtil.setStyle(iframe,'position:absolute;left:-999px;top:-999px;width:0,height:0;border:0;');
        parentNode.appendChild(iframe);

        var images = [];
        for(var i=0,j=this._pages.length;i<j;i++){
          images = images.concat(this._listImages(this._pages[i]));
        }

        var imageNotLoad = images.length;
        for(var i=0,j=imageNotLoad;i<j;i++){
          var img = new Image();
          img.src = images[i];
          if(img.complete){
            imageNotLoad--;
          }else{
            img.onload = function(){
              imageNotLoad--;
            };
            img.onerror = function(){
              imageNotLoad--;
            };
          }
        }

        _timer = W.setInterval(function(){
          var win = iframe.contentWindow;
          var doc=win.document||iframe.contentDocument;
          if(doc&&doc.body&&imageNotLoad<1){
            W.clearInterval(_timer);
            _timer=null;
            callback.call({iframe:iframe,window:win,document:doc});
          }
        },16);
      },
      addPage:function(){
        var page = _addPage(this);
        this._pages.push(page);
        return page;
      },
      preview:function(){
        _clear();
        var that = this;
        var dpi = that.getDPI();
        var paper = that.getPaper();
        var w = paper.getWidth(),h = paper.getHeight();
        var width = MathUtil.mm2px(dpi.x,w);
        var height = MathUtil.mm2px(dpi.y,h);
        var mask = D.createElement('div');
        DomUtil.setStyle(mask,'-webkit-user-select:none;position:fixed;left:0;top:0;_position:absolute;_bottom:auto;_top:expression(eval(document.documentElement.scrollTop));width:100%;height:100%;background-color:rgba(0,0,0,.2);background-color:#EEE\\9;z-index:9998;');
        D.body.appendChild(mask);
        _mask = mask;

        var div = D.createElement('div');
        DomUtil.setStyle(div,'position:absolute;left:50%;top:10px;width:'+(width+20)+'px;height:'+(height+20)+'px;margin-left:-'+(width/2+10)+'px;overflow:hidden;z-index:9999');
        D.body.appendChild(div);
        _layer = div;

        that._prepare(div,function(){
          var obj = this;
          DomUtil.setStyle(obj.iframe,'position:absolute;left:10px;top:10px;width:'+width+'px;height:'+height+'px;border:0;-webkit-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-moz-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-ms-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-o-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);');
          that._build(obj);
          var a = D.createElement('a');
          DomUtil.addClass(a,'nprint-btn-print');
          DomUtil.addStyle(a,'left:50%;margin-left:'+(width/2+20)+'px');
          mask.appendChild(a);
          DomUtil.addEvent(a,'click',function(){
            try{
              obj.document.execCommand("print",false,null);
            }catch(e){
              obj.window.print();
            }
          });
        });

        DomUtil.addEvent(mask,'click',function(){
          _clear();
        });
      },
      print:function(){
        _clear();
        var that = this;
        that._prepare(D.body,function(){
          var obj = this;
          _layer = obj.iframe;
          that._build(obj);
          W.setTimeout(function(){
            try{
              obj.document.execCommand("print",false,null);
            }catch(e){
              obj.window.print();
            }
          },100);
        });
      },
      getPaper:function(){
        return this._paper;
      },
      getDPI:function(){
        return this._dpi;
      }
    };
  };
  DomUtil.style('a.nprint-btn-print{position:absolute;left:20px;top:20px;width:50px;height:40px;font-size:0;text-decoration:none;border:0;background-color:#5BC0DE;border:1px solid #46B8DA;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;-khtml-user-select:none;user-select:none;-webkit-transition:all .2s linear 0s;-moz-transition:all .2s linear 0s;-ms-transition:all .2s linear 0s;-o-transition:all .2s linear 0s;transition:all .2s linear 0s;cursor:pointer;background-repeat:no-repeat;background-position:center center;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB5klEQVRYR+2W61HDMBCEdyuADggVABUAHUAFQAdQAaQC6IBQAVABSQekA6cCoIJjNnM2knFiybEnwwz6A+Po8elub0/Elge3fD6SAMzMuoCSbN2/dYIOdoAvAO+JIIcAdvoGmJE8SQEwsymA43+AvxkBM7tT/gAk5TtFEwA+XcATkk/hmqgKzEwqP/AJs8TNU6btBvsK4qpcVAH4zW8BiPCapKh7G2YmiBeP7jlJ/f9jRH77EUlNHGQ4xAeAV5JndQC5XXKth4RmNgJwEeWWHAffta+8QaZW6A/J/T4BJNi3GgDNrPw+JilxCyAyqVADm0RAaZP9VkM39pDre0FSNx8GIEcwyREws2VDydl8zdxFdgRK0p4A8jVgZpcApG55wwLAJBMmXDcNqiBPhP4WyC7PVeu8DEFSl4uMSCrdA3BEsnp4hBt5VKJ6b4jKjdY3AQRGVF0oLEM507M3DlllaRxVeQZ2vS4bp16CUVn74fcAlFpBPkQR8BrVj48Nu3dNQRPoXJ227DW/3oRun3KtZY68eXQFqL8j1YDUDatG1/oorWlAUNLJujHXAanizQVQZFRe2RpYtSAXQM2l7aWkEBeDRCDHiPoGKN90OQyKVKt4U1OQc3A4d3OArienrmuNQOpGXed9A6bJXjBdbLGMAAAAAElFTkSuQmCC);}a.nprint-btn-print:hover{background-color:#31B0D5;border-color:#269ABC;text-decoration:none;-webkit-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-moz-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-ms-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);-o-box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);box-shadow:0 5px 11px 0 rgba(0,0,0,0.18),0 4px 15px 0 rgba(0,0,0,0.15);}');
  return {
    PAPER:PAPER,
    ANCHOR:ANCHOR,
    ALIGN:ALIGN,
    createDocument:function(){
      return _createDocument();
    }
  };
});