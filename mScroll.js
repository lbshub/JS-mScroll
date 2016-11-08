/**
 * LBS mScroll
 * Date: 2015-5-5
 * ===================================================
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
 * ===================================================
 **/
(function(window, document) {
	'use strict';

	var utils = (function() {
		var d = document,
			body = d.body,
			div = d.createElement('div'),
			style = div.style,
			vendors = ['webkit', 'Moz', 'ms', 'O'],
			i = 0,
			l = vendors.length,
			toHumb = function(str) {
				return str.replace(/-\D/g, function(match) {
					return match.charAt(1).toUpperCase();
				});
			};

		var on = function(el, type, fn) {
				if (typeof type === 'string') return el.addEventListener(type, fn, false);
				for (var i = 0, l = type.length; i < l; i++) el.addEventListener(type[i], fn, false);
			},

			prefix = function(property) {
				var prop = toHumb(property);
				if (prop in style) return prop;
				for (i = 0; i < l; i++) {
					prop = toHumb(vendors[i] + '-' + property);
					if (prop in style) return prop;
				}
				return null;
			},

			supportCss = function(property) {
				var prop = toHumb(property);
				if (prop in style) return true;
				for (i = 0; i < l; i++) {
					prop = toHumb(vendors[i] + '-' + property);
					if (prop in style) return true;
				}
				return false;
			},

			support3d = function() {
				var has3d, transform;
				body.appendChild(div);
				if (supportCss('transform')) {
					transform = prefix('transform');
					div.style[transform] = 'translate3d(1px,1px,1px)';
					has3d = window.getComputedStyle(div, null)[transform];
				}
				body.removeChild(div);
				return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
			},

			getTime = Date.now || function() {
				return new Date().getTime();
			},

			momentum = function(current, start, time, lowerMargin, wrapperSize, deceleration) {
				var distance = current - start,
					speed = Math.abs(distance) / time,
					destination,
					duration;
				deceleration = deceleration === undefined ? 0.0006 : deceleration;
				// 初速度为0 距离等于速度的平方除以2倍加速度
				destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
				// 初始时间为0，初始速度为0 时间等于速度除以加速度
				duration = speed / deceleration;
				if (destination < lowerMargin) {
					destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
					distance = Math.abs(destination - current);
					duration = distance / speed;
				} else if (destination > 0) {
					destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
					distance = Math.abs(current) + destination;
					duration = distance / speed;
				}
				return {
					destination: Math.round(destination),
					duration: duration
				};
			};

		return {
			on: on,
			prefix: prefix,
			hasTransition: supportCss('transition'),
			hasTransform2d: supportCss('transform'),
			hasTransform3d: support3d(),
			getTime: getTime,
			momentum: momentum
		};
	}());

	var _prefixTransition = utils.prefix('transition');
	var _prefixTransform = utils.prefix('transform');

	var mScroll = function(el, opts) {
		opts = opts || {};
		this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.children[0];
		this.direction = opts.direction || 'top';
		this.display = !!opts.display || false;
		this.prevent = opts.prevent === false ? false : true;
		this.useTransform = opts.useTransform === false ? false : true;

		this.scrollStart = opts.scrollStart || function() {};
		this.scrollMove = opts.scrollMove || function() {};
		this.scrollEnd = opts.scrollEnd || function() {};
		this.scrollCancel = opts.scrollCancel || function() {};

		// pullDown pullUp
		this.usePullDown = opts.usePullDown || false;
		this.usePullUp = opts.usePullUp || false;
		this.pullDownOffset = opts.pullDownOffset || 50;
		this.pullUpOffset = opts.pullUpOffset || 50;
		this.pullDown = opts.pullDown || function() {};
		this.pullUp = opts.pullUp || function() {};
		this.pullDownStart = opts.pullDownStart || function() {};
		this.pullUpStart = opts.pullUpStart || function() {};
		this.pullDownEnd = opts.pullDownEnd || function() {};
		this.pullUpEnd = opts.pullUpEnd || function() {};
		this.pullDownCancel = opts.pullDownCancel || function() {};
		this.pullUpCancel = opts.pullUpCancel || function() {};
		this.$locked = false;

		this.x = this.y = 0;
		this.maxScrollX = this.maxScrollY = 0;
		this._events = {};
		this._init();
	};
	mScroll.prototype = {
		_init: function() {
			if (this.display) {
				this._initBar();
			}
			this.$refresh();
			this._initEvent();
		},
		_setup: function() {
			if (this.direction === 'top') {
				this.wrapperH = this.wrapper.offsetHeight;
				this.scrollerH = this.scroller.offsetHeight;
				this.maxScrollY = this.wrapperH - this.scrollerH;
				if (this.maxScrollY > 0) this.maxScrollY = 0;
			} else if (this.direction === 'left') {
				this._setCss();
				this.wrapperW = this.wrapper.offsetWidth;
				this.scrollerW = this.scroller.offsetWidth;
				this.maxScrollX = this.wrapperW - this.scrollerW;
				if (this.maxScrollX > 0) this.maxScrollX = 0;
			}
		},
		_setCss: function() {
			var els = this.scroller.children,
				i = 0,
				n = els.length,
				total = 0;
			for (; i < n; i++) total += els[i].offsetWidth;
			this.scroller.style.width = total + 'px';
		},
		_initEvent: function() {
			utils.on(this.wrapper, 'touchstart', this._start.bind(this));
			utils.on(this.wrapper, 'touchmove', this._move.bind(this));
			utils.on(this.wrapper, 'touchend', this._end.bind(this));
			utils.on(this.scroller, ['webkitTransitionEnd', 'transitionend'], this._transitionEnd.bind(this));
			utils.on(window, ['resize', 'orientationchange'], this._resize.bind(this));

			this.$on('scrollStart', this.scrollStart);
			this.$on('scrollMove', this.scrollMove);
			this.$on('scrollEnd', this.scrollEnd);
			this.$on('scrollCancel', this.scrollCancel);

			this.$on('pullDown', this.pullDown);
			this.$on('pullUp', this.pullUp);
			this.$on('pullDownStart', this.pullDownStart);
			this.$on('pullUpStart', this.pullUpStart);
			this.$on('pullDownEnd', this.pullDownEnd);
			this.$on('pullUpEnd', this.pullUpEnd);
			this.$on('pullDownCancel', this.pullDownCancel);
			this.$on('pullUpCancel', this.pullUpCancel);
		},
		_start: function(e) {
			if (!e.touches) return;

			this.startX = e.touches[0].pageX;
			this.startY = e.touches[0].pageY;
			this.startTime = utils.getTime();

			// reset
			this.distX = this.distY = 0;
			this.moveX = this.moveY = null;
			this.fixed = '';
			this.moved = false;

			// pullDown pullUp
			this.isPullDown = this.isPullUp = false;

			// 记录移动前x y位置
			this.scrollX = this.x;
			this.scrollY = this.y;

			utils.hasTransition ? this._transition() : clearTimeout(this.aTimer);
		},
		_move: function(e) {
			if (!e.touches) return;
			if (this.prevent) e.preventDefault();
			if (this.$locked) return;

			var moveX = e.touches[0].pageX,
				moveY = e.touches[0].pageY,
				deltaX = this.moveX === null ? 0 : moveX - this.moveX,
				deltaY = this.moveY === null ? 0 : moveY - this.moveY,
				timestamp = utils.getTime();

			if (this.fixed === '') {
				if (Math.abs(moveY - this.startY) > Math.abs(moveX - this.startX)) {
					this.fixed = 'top';
				} else {
					this.fixed = 'left';
				}
			}

			if (!this.moved) {
				this.moved = true;
				this._trigger('scrollStart');
			}

			if (this.fixed === 'top' && this.direction === 'top') {
				if (this.y > 0 || this.y < this.maxScrollY) deltaY /= 4;
				this.distY += deltaY;
				this._translate(0, this.y + deltaY);
			} else if (this.fixed === 'left' && this.direction === 'left') {
				if (this.x > 0 || this.x < this.maxScrollX) deltaX /= 4;
				this.distX += deltaX;
				this._translate(this.x + deltaX, 0);
			}

			// pullDown  pullUp
			this._pullStart();

			this.moveX = moveX;
			this.moveY = moveY;

			if (timestamp - this.startTime >= 300) {
				this.startTime = timestamp;
				this.scrollX = this.x;
				this.scrollY = this.y;
			}
		},
		_end: function(e) {
			if (!e.changedTouches) return;

			if (!this.moved) {
				this._trigger('scrollCancel');
				return;
			}

			// pullDown pullUp
			if (!this._pullEnd()) {
				return;
			}

			if (!this._resetPosition()) {
				return;
			}

			var duration = utils.getTime() - this.startTime,
				nowX = this.x,
				nowY = this.y,
				time = 0,
				momentum = {};

			if (duration < 300 && (Math.abs(this.distY) > 10 || Math.abs(this.distX) > 10)) {
				if (this.direction === 'top') {
					momentum = utils.momentum(this.y, this.scrollY, duration, this.maxScrollY, this.wrapperH);
					nowY = Math.round(momentum.destination);
					time = Math.round(momentum.duration);
					if (nowY === this.y) {
						this._trigger('scrollCancel');
						return;
					}
					return this.$scrollTo(0, nowY, time);
				} else if (this.direction === 'left') {
					momentum = utils.momentum(this.x, this.scrollX, duration, this.maxScrollX, this.wrapperW);
					nowX = Math.round(momentum.destination);
					time = Math.round(momentum.duration);
					if (nowX === this.x) {
						this._trigger('scrollCancel');
						return;
					}
					return this.$scrollTo(nowX, 0, time);
				}
			}

			this._trigger('scrollEnd');
		},
		_transitionEnd: function() {
			utils.hasTransition ? this._transition() : clearTimeout(this.aTimer);

			// pullDown pullUp
			if (!!this.isPullDown || !!this.isPullUp) {
				return;
			}

			if (!this._resetPosition()) {
				return;
			}

			this._trigger('scrollEnd');
		},
		_resetPosition: function() {
			if (this.y > 0 || this.x > 0) {
				this.$scrollTo(0, 0, 400);
				return false;
			}

			if (this.direction === 'top') {
				if (this.y < this.maxScrollY) {
					this.$scrollTo(0, this.maxScrollY, 400);
					return false;
				}
			} else if (this.direction === 'left') {
				if (this.x < this.maxScrollX) {
					this.$scrollTo(this.maxScrollX, 0, 400);
					return false;
				}
			}

			return true;
		},
		_resize: function() {
			var isBottom = false,
				timer = null;
			if ((this.direction === 'top' && this.y === this.maxScrollY) || (this.direction === 'left' && this.x === this.maxScrollX)) isBottom = true;
			timer && clearTimeout(timer);
			timer = setTimeout(function() {
				this.$refresh();
				if (isBottom) {
					this._transition();
					if (this.direction === 'top') {
						this._translate(0, this.maxScrollY);
					} else if (this.direction === 'left') {
						this._translate(this.maxScrollX, 0);
					}
				}
			}.bind(this), 60);
		},
		_transition: function(time) {
			time = time || 0;
			this.scroller.style[_prefixTransition] = 'all ' + time + 'ms';
			this._trigger('transition', time);
		},
		_translate: function(x, y) {
			if (this.useTransform && utils.hasTransform3d) {
				this.scroller.style[_prefixTransform] = 'translate3d(' + x + 'px,' + y + 'px, 0px)';
			} else if (this.useTransform && utils.hasTransform2d) {
				this.scroller.style[_prefixTransform] = 'translate(' + x + 'px,' + y + 'px)';
			} else {
				this.scroller.style.left = x + 'px';
				this.scroller.style.top = y + 'px';
			}

			this._trigger('scrollMove', x, y);

			this.x = x;
			this.y = y;
		},
		_animate: function(x, y, time) {
			var _this = this,
				startX = this.x,
				startY = this.y,
				changeX = x - startX,
				changeY = y - startY,
				startTime = utils.getTime(),
				duration = time,
				easefn = function(k) {
					return Math.sqrt(1 - (--k * k));
				};
			! function animate() {
				var nowTime = utils.getTime(),
					timestamp = nowTime - startTime,
					delta = easefn(timestamp / duration),
					nowX = startX + delta * changeX,
					nowY = startY + delta * changeY;
				_this._translate(nowX, nowY);
				if (timestamp >= duration) {
					_this._translate(x, y);
					_this._transitionEnd();
					return;
				}
				_this.aTimer = setTimeout(animate, 10);
			}();
		},
		$scrollTo: function(x, y, time) {
			if (utils.hasTransition) {
				this._transition(time);
				this._translate(x, y);
			} else {
				this._animate(x, y, time);
			}
		},
		$moveTo: function(el, time, bool) {
			el = typeof el === 'string' ? document.querySelector(el) : el;
			if (!el) return;
			var ex = 0,
				ey = 0;
			if (this.direction === 'top') {
				ey = -el.offsetTop;
				if (!!bool == true) ey += (this.wrapperH - el.offsetHeight) / 2;
			} else if (this.direction === 'left') {
				ex = -el.offsetLeft;
				if (!!bool == true) ex += (this.wrapperW - el.offsetWidth) / 2;
			}
			if (ey > 0) ey = 0;
			if (ey < this.maxScrollY) ey = this.maxScrollY;
			if (ex > 0) ex = 0;
			if (ex < this.maxScrollX) ex = this.maxScrollX;
			this.$scrollTo(ex, ey, time || 400);
		},
		_pullStart: function() {
			if (!!this.usePullDown && (this.y > 0 || this.x > 0)) {
				this._trigger('pullDown');
				if (!this.isPullDown && (this.y > this.pullDownOffset || this.x > this.pullDownOffset)) {
					this.isPullDown = true;
					this._trigger('pullDownStart');
				}
			}

			if (!!this.usePullUp && (this.y < this.maxScrollY || this.x < this.maxScrollX)) {
				this._trigger('pullUp');
				if (!this.isPullUp && (this.y < this.maxScrollY - this.pullUpOffset || this.x < this.maxScrollX - this.pullUpOffset)) {
					this.isPullUp = true;
					this._trigger('pullUpStart');
				}
			}

			if (this.direction === 'top') {
				if (!!this.isPullDown && this.y <= this.pullDownOffset) {
					this.isPullDown = false;
					this._trigger('pullDownCancel');
				}
				if (!!this.isPullUp && this.y >= this.maxScrollY - this.pullUpOffset) {
					this.isPullUp = false;
					this._trigger('pullUpCancel');
				}
			} else if (this.direction === 'left') {
				if (!!this.isPullDown && this.x <= this.pullDownOffset) {
					this.isPullDown = false;
					this._trigger('pullDownCancel');
				}
				if (!!this.isPullUp && this.x >= this.maxScrollX - this.pullUpOffset) {
					this.isPullUp = false;
					this._trigger('pullUpCancel');
				}
			}
		},
		_pullEnd: function() {
			if (!!this.isPullDown) {
				this._trigger('pullDownEnd', this.pullDownOffset, this.pullDownOffset);
				return false;
			}

			if (!!this.isPullUp) {
				this._trigger('pullUpEnd', this.maxScrollX - this.pullUpOffset, this.maxScrollY - this.pullUpOffset);
				return false;
			}

			return true;
		},
		_initBar: function() {
			var scrollbar = null,
				indicator = null,
				inTimer = null,
				outTimer = null,
				scaleX = 1,
				scaleY = 1,
				_this = this;

			! function create() {
				scrollbar = document.createElement('div');
				indicator = document.createElement('div');
				if (_this.direction === 'top') {
					scrollbar.style.cssText = 'opacity:0;position:absolute;z-index:8888888;width:3px;bottom:0;top:0;right:2px;overflow:hidden;';
					indicator.style.cssText = 'position:absolute;left:0;top:0;width:3px;background:rgba(0,0,0,0.35);border-radius:3px;';
				} else if (_this.direction === 'left') {
					scrollbar.style.cssText = 'opacity:0;position:absolute;z-index:8888888;height:2px;left:0;right:0;bottom:1px;overflow:hidden;';
					indicator.style.cssText = 'position:absolute;left:0;top:0;height:2px;background:rgba(0,0,0,0.35);border-radius:3px;';
				}
				scrollbar.appendChild(indicator);
				_this.wrapper.appendChild(scrollbar);
			}();

			function setup() {
				if (_this.direction === 'top') {
					scaleY = _this.wrapperH / _this.scrollerH;
					if (scaleY > 1) scaleY = 1;
					indicator.style.height = _this.wrapperH * scaleY + 'px';
				} else if (_this.direction === 'left') {
					scaleX = _this.wrapperW / _this.scrollerW;
					if (scaleX > 1) scaleX = 1;
					indicator.style.width = _this.wrapperW * scaleX + 'px';
				}
			}

			function hideBar() {
				clearTimeout(inTimer);
				outTimer = setTimeout(fadeOut, 300);
			}

			function showBar() {
				clearTimeout(outTimer);
				inTimer = setTimeout(fadeIn, 100);
			}

			function fadeIn() {
				scrollbar.style[_prefixTransition] = 'all 200ms';
				scrollbar.style.opacity = 1;
			}

			function fadeOut() {
				scrollbar.style[_prefixTransition] = 'all 500ms';
				scrollbar.style.opacity = 0;
			}

			function transition(time) {
				indicator.style[_prefixTransition] = 'all ' + time + 'ms';
			}

			function translate(x, y) {
				if (utils.hasTransform3d) {
					indicator.style[_prefixTransform] = 'translate3d(' + (-x * scaleX) + 'px,' + (-y * scaleY) + 'px, 0px)';
				} else if (utils.hasTransform2d) {
					indicator.style[_prefixTransform] = 'translate(' + (-x * scaleX) + 'px,' + (-y * scaleY) + 'px)';
				} else {
					indicator.style.left = (-x * scaleX) + 'px';
					indicator.style.top = (-y * scaleY) + 'px';
				}
			}

			this.$on('refresh', function() {
				setTimeout(setup, 100);
			});
			this.$on('scrollStart', function() {
				showBar();
			});
			this.$on('scrollMove', function(x, y) {
				translate(x, y);
			});
			this.$on('scrollCancel', function() {
				hideBar();
			});
			this.$on('scrollEnd', function() {
				hideBar();
			});
			this.$on('transition', function(time) {
				transition(time);
			});
			this.$on('pullDownEnd', function() {
				hideBar();
			});
			this.$on('pullUpEnd', function() {
				hideBar();
			});
		},
		_trigger: function(type) {
			if (!this._events[type]) return;
			var i = 0,
				l = this._events[type].length;
			if (!l) return;
			for (; i < l; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		},
		$refresh: function() {
			this._setup();
			this._trigger('refresh');
		},
		$on: function(type, fn) {
			if (!this._events[type]) this._events[type] = [];
			this._events[type].push(fn);
		},
		$off: function(type, fn) {
			if (!this._events[type]) return;
			var index = this._events[type].indexOf(fn);
			if (index > -1) {
				this._events[type].splice(index, 1);
			}
		}
	};

	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define('mScroll', [], function() {
			return mScroll;
		});
	} else {
		window.mScroll = mScroll;
	}
}(window, document));