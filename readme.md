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
```

### 选项 | 方法
* el 外围包裹容器(一个字符串的CSS选择器或者元素对象)
* ===================================================
* *选项 属性*
* opts.direction 滚动方向 默认top (左右:left 上下:top)
* opts.display 是否显示滚动条 (默认false 不显示)
* opts.prevent 是否取消滚动时浏览器默认行为 默认true
* opts.useTransform 是否用transform方式滚动 默认true 
* opts.usePullDown 是否开启下(拉/滑)模式 默认false
* opts.usePullUp 是否开启上(拉/滑)模式 默认false
* opts.pullDownOffset 下(拉/滑)偏移值 默认 50
* opts.pullUpOffset 上(拉/滑)偏移值 默认 50 
* ****************************************************
* *选项 方法*
* opts.scrollStart 滚动开始事件函数
* opts.scrollMove 滚动中事件函数(不停触发)
* opts.scrollEnd 滚动结束事件函数
* opts.scrollCancel 滚动取消事件函数
* opts.pullDown 下拉/滑(touchmove 不停触发)
* opts.pullDownStart 下拉/滑-开始(touchmove 触发一次)
* opts.pullDownCancel 下拉/滑-取消(touchmove 触发一次)
* opts.pullDownEnd 下拉/滑-结束(touchend 触发一次)
* opts.pullUp 上拉/滑(touchmove 不停触发)
* opts.pullUpStart 上拉/滑-开始(touchmove 触发一次)
* opts.pullUpCancel 上拉/滑-取消(touchmove 触发一次)
* opts.pullUpEnd 上拉/滑-结束(touchend 触发一次)
* ===================================================
* this.$locked 是否锁定滑动(touchmove) 默认false 手动设置为true则禁止滑动 
* this.$scrollTo(x, y, time) 滚动方法
* this.$moveTo(el, time, bool) 滚动方法 bool为true则使el位于中间位置
* this.$refresh 当滚动容器宽高改变时 手动刷新
* this.$on(type, fn) 增加一个(type)事件函数
* this.$off(type, fn) 移除一个(type)事件函数
* ===================================================
* (type)事件类型 
* scrollStart 滚动-开始
* scrollMove 滚动-移动
* scrollEnd 滚动-结束
* scrollCancel 滚动-取消
* pullDown下拉/滑  pullUp上拉/滑
* pullDownStart下拉/滑-开始  pullUpStart上拉/滑-开始 
* pullDownCancel下拉/滑-取消  pullUpCancel上拉/滑-取消 
* pullDownEnd下拉/滑-结束  pullUpEnd上拉/滑-结束 

### DEMO
index.html  ----  load.html
