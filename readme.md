# JS-mScroll
移动web：模拟滚动(条)，数据更新、加载...

-----------------------------------------

### 支持
* 滚动条显示
* 方向选择
* 数据刷新，加载

### 使用
```js
// var scroll = new mScroll(el, opts);

var scroll = new mScroll('.wrapper', {
	direction: 'top',
	display: true, 
	usePullDown: true, 
	usePullUp: true,  
	pullDownOffset: 35,
	pullUpOffset: 35,
	pullDownStart: function() {
		
	},
	pullDownCancel: function() {

	},
	pullDownEnd: function(tx, ty) {

	},
	pullUpStart: function() {

	},
	pullUpCancel: function() {

	},
	pullUpEnd: function(tx, ty) {

	}
});


var scroll = new mScroll('.wrapper', {
	direction: 'top',
	usePullDown: true
});
scroll.$on('pullDownStart', function(){

});
scroll.$on('pullDownCancel', function() {

});
scroll.$on('pullDownEnd', function() {

});
//...

```

### DEMO
index.html  ----  load.html
