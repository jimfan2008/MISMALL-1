(function($) {
	function _init(t) {
		var bs = $(t).children().show();
		var c1 = bs.first(), c2 = bs.last();
		c1.before(c2.clone());
		c2.after(c1.clone());
		$("#heard").hover(function() {
			var _data = $.data(t, 'banner');
			clearTimeout(_data.animate);
		}, function() {
			_start(t);
			var _data = $.data(t, 'banner');
			_data.direction = 'l';
		});
		$("#heard .change .change_bot").click(function() {
		    if ($(t).is(":animated"))
                return;
            var _data = $.data(t, 'banner');
            _data.direction = 'r';
            _b(t, true);
		
		
		});
		
		$("#heard .change .change_botover").click(function() {
            if ($(t).is(":animated"))
                return;
            var _data = $.data(t, 'banner');
            _data.direction = 'l';
            _b(t, true);
        });
		
		
		$("#top_banner_left").click(function() {
			if ($(t).is(":animated"))
				return;
			var _data = $.data(t, 'banner');
			_data.direction = 'r';
			_b(t, true);
		});
		$("#top_banner_right").click(function() {
			if ($(t).is(":animated"))
				return;
			var _data = $.data(t, 'banner');
			_data.direction = 'l';
			_b(t, true);
		});
		_resize(t);
	};
	
	function _resize(t) {
		var bs = $(t).children();
		var len = bs.size(), w = $(t).width(), cw = len * w;
		bs.width(w);
		$(t).stop().width(cw).css("left", -w);
		var _data = $.data(t, 'banner');
		_data.width = w, _data.cwidth = cw;
	};
	function _start(t) {
		var _data = $.data(t, 'banner');
		var _opts = _data.options;
		clearTimeout(_data.animate);
		_data.animate = setTimeout(function() {
			_b(t);
		}, _opts.space);
	};
	function _b(t, g) {
		var _data = $.data(t, 'banner');
		var _opts = _data.options;
		var _direction = _data.direction;
		var _width = _data.width;
		var _cwidth = _data.cwidth;
		var _circle = _data.circle;
		var _len = _data.len;

		var left = $(t).position().left;
		if (_direction == "l") {
			if (left <= -(_cwidth - _width))
				$(t).css("left", -_width);
			_data.index = _data.index++ >= _len - 1 ? 0 : _data.index;
		} else {
			if (left >= 0)
				$(t).css("left", -_cwidth + 2 * _width);
			_data.index = _data.index-- <= 0 ? _len - 1 : _data.index;
		}
		_circle.removeClass("change_botover").addClass("change_bot");
		_circle.eq(_data.index).addClass("change_botover");
		var dleft = (_direction == "l" ? "-" : "+") + "=" + _width;
		$(t).animate({
			left : dleft
		}, _opts.speed, function() {
			if (!g)
				_start(t);
		});
	};
	$.fn.banner = function(p1, p2) {
		if ( typeof p1 == "string") {
			return $.fn.banner.method[p1](this, p2);
		}
		p1 = p1 ? p1 : {};
		return this.each(function() {
			var _data = $.data(this, 'banner');
			if (_data) {
				$.extend(_data.options, p1);
			} else {
				var circle = $("#top_banner_circles").children();
				$.data(this, 'banner', {
					options : $.extend({}, $.fn.banner.defaults, p1),
					width : 0,
					cwidth : 0,
					direction : 'l',
					animate : undefined,
					len : circle.size(),
					index : 0,
					circle : circle
				});
				_init(this);
			}
			_start(this);
		});
	};
	$.fn.banner.method = {
		resize : function(jq, p2) {
			return jq.each(function() {
				_resize(this);
			});
		}
	};
	$.fn.banner.defaults = {
		speed : 300, //播放速度
		space : 3000,//播放间隔
	};
})(jQuery);
