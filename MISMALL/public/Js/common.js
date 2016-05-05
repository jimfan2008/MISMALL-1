/**
 * 通用全局函数或方法,不仅限于平台使用
 * @author pzh cy
 */

/**
 * 格式化{[1-9]+}的字符串。
 * 格式从{1}开始。
 */
var _stringFormat = function() {
	var args = arguments;
	var formater = args[0];
	if (!formater)
		return;
	$(args).each(function(i) {
		if (i == 0)
			return;
		formater = formater.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
	});
	return formater;
};

/**
 * 生成一串随机数
 */
var _stringRandom = function() {
	return Math.random();
};

/**
 * 将字符串中的回车换和空格替换成相应的HTML标签
 */
function replaceStr(str) {
	var str = str.replace(/\n/g, "<br>");
	//替换回车符
	var str = str.replace(/\s/g, "&nbsp;");
	//替换空格符
	return str;
}

/**
 * 将字符串中的回车换和空格替换成相应的HTML标签
 */
function strReplace(str) {
	var str = str.replace(/<br>/g, "\n");
	//替换回车符
	var str = str.replace(/\&nbsp;/g, " ");
	//替换空格符
	return str;
}

function upload(fd, url, $obj) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	var $ProgressData = $obj.find('#imgBoxProgressData');
	var $ProgressBar = $obj.find('#imgBoxProgressBar');
	$ProgressData.html("0%").show();
	$ProgressBar.html("").width(0).show();
	xhr.upload.onprogress = function(ev) {
		var percent = 0;
		if (ev.lengthComputable) {
			percent = 100 * ev.loaded / ev.total;
			var finalPercent = parseInt(percent);
			if (finalPercent == 100) {
				$ProgressBar.html("请稍候...");
			}
			$ProgressData.html(finalPercent + '%');
			$ProgressBar.width(percent);
		}
	};
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var data = xhr.responseText;
			var json = JSON.parse(data);
			$obj.find("img").attr('src', json.image).unbind("load").bind("load", function() {
				setTimeout(function() {
					$ProgressData.fadeOut();
					$ProgressBar.fadeOut();
				}, 1000);
			});
		}
	};
	xhr.send(fd);
}

/**
 * 过滤图片文件大小和类型  只允许上传jpg|gif|png|jpeg格式，且大小不超过800K的图片
 * target input[type = "file"] 对象
 */
function checkImgFile(target, maxFileSize, objUnit) {
	//检测上传文件的类型
	if (!(/(?:jpg|gif|png|jpeg)$/i.test(target.value))) {
		alert("只允许上传jpg|gif|png|jpeg格式的图片");
		if (window.ActiveXObject) {//for IE
			target.select();
			//select the file ,and clear selection
			document.selection.clear();
		} else if (window.opera) {//for opera
			target.type = "text";
			target.type = "file";
		} else
			//for FF,Chrome,Safari
			target.value = "";
		return false;
	}

	//检测上传文件的大小
	var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
	var fileSize = 0;
	if (isIE && !target.files) {
		var filePath = target.value;
		var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
		var file = fileSystem.GetFile(filePath);
		fileSize = file.Size;
	} else {
		fileSize = target.files[0].size;
	}
	var size = fileSize / 1024;
	var maxSize = 0;
	if (objUnit == 'M') {
		maxSize = maxFileSize * 1024;
	} else {
		maxSize = maxFileSize;
	}
	if (size > maxSize) {
		if (objUnit == 'M') {
			var Mval = maxSize / 1024;
			maxSize = maxFileSize * 1024;
			alert("亲,文件大小不能超过" + Mval + "M呦~~~");
		} else {
			alert("亲,文件大小不能超过" + maxSize + "K呦~~~");
		}
		if (window.ActiveXObject) {//for IE
			target.select();
			//select the file ,and clear selection
			document.selection.clear();
		} else if (window.opera) {//for opera
			target.type = "text";
			target.type = "file";
		} else {
			//for FF,Chrome,Safari
			target.value = "";
		}
		return false;
	} else {
		return true;
	}
}

/**
 * 将字符串转换成XML结构
 */
String.prototype.ToXml = function() {
	if (!/msie/gi.test(navigator.userAgent)) {
		Node.prototype.__defineGetter__("xml", function() {
			return (new XMLSerializer).serializeToString(this);
		});
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(this, "text/xml");
	} else {// IE
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(this);
	}
	return $(xmlDoc).children(":last");
};

//将xml字符串转换成dom对象
function getXMLDomByString(str) {
	if (window.DOMParser) {
		Node.prototype.__defineGetter__("xml", function() {
			return (new XMLSerializer).serializeToString(this);
		});
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(str, "text/xml");
	} else {// IE
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(str);
	}
	return $(xmlDoc);
};

/**
 * 去掉字符串两端的空格
 */
String.prototype.trim = function(str) {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

/**
 * 截取字符串
 */
function getLength(str, len) {
	if (!str) {
		return '';
	}
	len = len > 0 ? len * 2 : 280;
	var count = 0;
	// 计数：中文2字节，英文1字节
	var temp = '';
	// 临时字符串
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 255) {
			count += 2;
		} else {
			count++;
		}
		// 如果增加计数后长度大于限定长度，就直接返回临时字符串
		if (count > len) {
			return temp;
		}
		// 将当前内容加到临时字符串
		temp += str.charAt(i);
	}
	return str;
}

/**
 * 根据传入的格式化方式格式化日期
 * @param {Object} formatstr
 */
Date.prototype.FormatTime = function(formatstr) {
	formatstr = formatstr ? formatstr : "yyyy-MM-dd HH:mm:ss";
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	var time = formatstr.replace("yyyy", year);
	time = time.replace("MM", month < 10 ? "0" + month : month);
	time = time.replace("dd", day < 10 ? "0" + day : day);
	time = time.replace("HH", hour < 10 ? "0" + hour : hour);
	time = time.replace("mm", minute < 10 ? "0" + minute : minute);
	time = time.replace("ss", second < 10 ? "0" + second : second);
	return time;
};

/**
 * 根据传入的格式化方式格式化日期
 * @param {Object} formatstr
 */
Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1, //month
		"d+" : this.getDate(), //day
		"H+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	};

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	};
	return format;
};

//随机ＩＤ
function numRand(pre, strLen) {
	var array = [];
	var arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	var rand = "";
	do {
		rand = pre ? pre : "mk";
		strLen = strLen ? strLen : 5;
		for (var i = 0; i < strLen; i++) {
			rand += arr[Math.floor(Math.random() * arr.length)];
		}
	} while($("#"+rand).size()==1);
	return rand;
}

/**
 * 通用ajax
 * 拥有参数：
 * a、url(远程地址) -- 必须
 * b、type(数据提交类型，GET|POST,默认POST提交)
 * c、data(传参)
 * d、async(同步/异步获取数据，true:异步|false:同步，默认同步)
 * e、dataType(数据返回类型)
 * f、success(数据获取成功)
 * g、error(数据获取失败)
 * @param {Object} opts
 */
var _commonAjax = function(opts) {
	if (!opts)
		return;
	$.ajax({
		url : (opts.url ? opts.url : null),
		type : (opts.type ? opts.type : "POST"),
		cache : false,
		data : (opts.data ? opts.data : null),
		async : (opts.async === false ? false : true),
		dataType : (opts.dataType ? opts.dataType : 'json'),
		beforeSend : function(XHR) {
			return true;
		},
		success : (opts.success ? function(o) {
			if (o["status"] == "success") {
				opts.success(o["data"]);
			} else {
				if (opts.error) {
					opts.error(o["info"]);
				}
				ezCommon.deBug(o["info"], "public/Js/common", 196);
			}
		} : function(o) {
			ezCommon.deBug(o, "public/Js/common", 199);
		}),
		error : (opts.error ? opts.error : function(XMLHttpRequest, textStatus, errorThrown) {
			ezCommon.deBug(XMLHttpRequest.responseText, "public/Js/common", 202);

		})
	});
};

function html_encode(str) {
	var s = "";
	if (str.length == 0)
		return "";
	s = str.replace(/&/g, "&gt;");
	s = s.replace(/</g, "&lt;");
	s = s.replace(/>/g, "&gt;");
	s = s.replace(/ /g, "&nbsp;");
	s = s.replace(/\'/g, "&#39;");
	s = s.replace(/\"/g, "&quot;");
	s = s.replace(/\n/g, "<br>");
	return s;
}

/* 数据读取时将特殊字符转义回来*/
function html_decode(str) {
	var s = "";
	if (str.length == 0)
		return "";
	s = str.replace(/&amp;/g, "&");
	s = s.replace(/&lt;/g, "<");
	s = s.replace(/&gt;/g, ">");
	s = s.replace(/&nbsp;/g, " ");
	s = s.replace(/&#39;/g, "\'");
	s = s.replace(/&quot;/g, "\"");
	s = s.replace(/<br>/g, "\n");
	return s;
}

/**
 *  获取URL参数值
 *  @param 传入参数 url参数名
 */
var _getUrlParas = function(para) {
	var url = location.href;
	var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
	var paraObj = {};
	for ( i = 0; j = paraString[i]; i++) {
		paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
	}
	if ( typeof (para) == "undefined" || para == '') {
		return paraObj;
	}
	var returnValue = paraObj[para.toLowerCase()];
	if ( typeof (returnValue) == "undefined") {
		return '';
	} else {
		return returnValue;
	}
};

/**
 *  设置cookie, 两个参数
 *  @param	cookie 名
 *	@param	cookie 值
 */
var _setCookie = function(name, value) {
	var exp = new Date();
	// new Date("December 31, 9998");
	exp.setTime(exp.getTime() + 24 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
};

/**
 *  获取cookie
 *  @param	cookie 名
 */
var _getCookie = function(name) {
	var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	if (arr != null)
		return unescape(arr[2]);
	return null;
};

String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
	if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
		return this.replace(new RegExp(reallyDo, ( ignoreCase ? "gi" : "g")), replaceWith);
	} else {
		return this.replace(reallyDo, replaceWith);
	}
};

/**
 * 文本框值改变事件
 * @param {Object} inputDom
 * @param {Object} fun
 */
function onValueChange(inputDom, fun) {
	if (!inputDom)
		return;
	inputDom.oninput = function() {
		fun();
	};
	if (!/msie/i.test(navigator.userAgent)) {
		inputDom.onpropertychange = function() {
			fun();
		};
	}
};

/**
 * 阻止浏览器默认行为
 */
function preventDefault(e) {
	if (e && e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	return false;
}

/**
 * 阻止事件冒泡
 */
function stopEventBubble(event) {
	var e = event || window.event;
	if (e && e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble = true;
	}
}

/**
 * @modify 皮振华
 * @func 动态加载CSS与JS脚本文件
 * @param file 文件名
 * @param path 文件路径
 * @param id  id标识
 */
function includeCssJs(file, path, id) {
	var files = typeof file == "string" ? [file] : file;
	for (var i = 0; i < files.length; i++) {
		var name = files[i].replace(/^\s|\s$/g, "");
		var att = name.split('.');
		var ext = att[att.length - 1].toLowerCase();
		if (ext == "css") {
			$("<link>", {
				id : id,
				rel : "stylesheet",
				type : "text/css",
				href : path + name
			}).appendTo(document.head);
		} else if (ext == "js") {
			$("<script>", {
				id : id,
				type : "text/javascript",
				src : path + name
			}).appendTo($("head"));
		}
	};
}

/**
 * @modify 皮振华
 * @func 动态加载CSS与JS脚本文件
 * @param file 文件名
 * @param path 文件路径
 * @param id  id标识
 */
function includeCssJs(file, path, id) {
	var files = typeof file == "string" ? [file] : file;
	for (var i = 0; i < files.length; i++) {
		var name = files[i].replace(/^\s|\s$/g, "");
		var att = name.split('.');
		var ext = att[att.length - 1].toLowerCase();
		if (ext == "css") {
			$("<link>", {
				id : id,
				rel : "stylesheet",
				type : "text/css",
				href : path + name
			}).appendTo(document.head);
		} else if (ext == "js") {
			$("<script>", {
				id : id,
				type : "text/javascript",
				src : path + name
			}).appendTo($("head"));
		}
	};
}

/**
 * 设置弹出面板的位置总是位置窗口视范围内
 * @param string $popMenu : 弹出层jquery对象
 * @param object e : 鼠标事件对象
 */
function setPopMenuPosition($popMenu, e) {
	var winW = $(window).width(), winH = $(window).height(), cMenuHeight = $popMenu.height(), cMenuWidth = $popMenu.width(), posLeft = Math.min(e.clientX, (winW - cMenuWidth - 10)), posTop = Math.min(e.clientY, (winH - cMenuHeight - 10));
	return {
		left : posLeft,
		top : posTop
	};
}

function isObjNull($obj) {
	return $obj.length ? $obj : false;
}

function onWindowResize(fun) {
	window.onresize = function() {
		var winH = $(window).height(), winW = $(window).width();
		fun.apply(null, [winW, winH]);
	};
}

//判断是否是移动端访问
function isMobile() {
	if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
		if (window.location.href.indexOf("?mobile") < 0) {
			try {
				if (/Android|Windows Phone|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
					return true;
				} else if (/iPad/i.test(navigator.userAgent)) {
					return false;
				} else {
					return true;
				}
			} catch(e) {
			}
		}
	} else {
		return false;
	}
}

function isWeiXin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}

/**
 *  Base64 encode
 */
function Base64() {

	// private property
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// public method for encoding
	this.encode = function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
	// private method for UTF-8 encoding
	_utf8_encode = function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}
		return utftext;
	}
}

//文本框只能输入数字，并屏蔽输入法和粘贴
$.fn.numeral = function() {
	$(this).css("ime-mode", "disabled");
	$(this).attr({
		"oncontextmenu" : "return false",
		"onpaste" : "return false"
	});
	this.bind("keypress", function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		//兼容火狐 IE
		if (!$.support.msie && (e.keyCode == 0x8))//火狐下不能使用退格键
		{
			return;
		}
		return code >= 48 && code <= 57;
	});
	this.bind("blur", function() {
		if (this.value.lastIndexOf(".") == (this.value.length - 1)) {
			this.value = this.value.substr(0, this.value.length - 1);
		} else if (isNaN(this.value)) {
			this.value = "";
		}
	});
	this.bind("paste", function() {
		var s = clipboardData.getData('text');
		if (!/\D/.test(s))
			;
		value = s.replace(/^0*/, '');
		return false;
	});
	this.bind("dragenter", function() {
		return false;
	});
	this.bind("keyup", function() {
		if (/(^0+)/.test(this.value)) {
			//this.value = this.value.replace(/^0*/, '');
		}

	});
};
/**
 * 数组去掉重复值
 */
Array.prototype.ArrayUnique = function() {
	var res = [];
	var json = {};
	for (var i = 0; i < this.length; i++) {
		if (!json[this[i]]) {
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	return res;
};

/**
 * 判断对象是否为空
 * @param {Object} obj
 */
function objIsnull(obj) {
	var hasProp = false;
	if ( typeof obj === "object" && !( obj instanceof Array) && !( obj instanceof jQuery)) {
		for (var prop in obj) {
			hasProp = true;
			break;
		}
	} else if ( obj instanceof Array) {
		hasProp = obj.length > 0 ? obj.length : false;
	} else if ( obj instanceof jQuery) {
		hasProp = obj.length > 0 ? obj.length : false;
	} else if (obj) {
		hasProp = obj;
	}
	return hasProp;
}

//对象比较是否相等

Objectequals = function($this, obj) {
	if ($this == obj)
		return true;
	if ( typeof (obj) == "undefined" || obj == null || typeof (obj) != "object")
		return false;
	var length = 0;
	var length1 = 0;
	for (var ele in $this) {
		length++;
	}
	for (var ele in obj) {
		length1++;
	}
	if (length != length1)
		return false;
	if (obj.constructor == $this.constructor) {
		for (var ele in $this) {
			if ( typeof ($this[ele]) == "object") {
				if (!$this[ele].equals(obj[ele]))
					return false;
			} else if ( typeof ($this[ele]) == "function") {
				if (!$this[ele].toString().equals(obj[ele].toString()))
					return false;
			} else if ($this[ele] != obj[ele])
				return false;
		}
		return true;
	}
	return false;
};
/**
 *验证是否为微信浏览器
 */
function isWeiXin() {
	var ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
}

/***根据屏幕的height和width得到对象的heigth和width***/
;(function($) {
	var GetSize = function(ele, opt) {
		this.$element = ele, this.defaults = {
			"width" : "auto",
			"minWidth" : "auto",
			"height" : "auto",
			"minHeight" : "auto",
		};
		this.options = $.extend({}, this.defaults, opt);
	};

	GetSize.prototype = {
		getSziefy : function() {
			return this.$element.css({
				"width" : window.screen.width * this.options.width,
				"min-width" : window.screen.width * this.options.minWidth,
				"height" : window.screen.height * this.options.height,
				"min-height" : window.screen.height * this.options.minHeight,
			});
		}
	};

	$.fn.getSizeByScreen = function(options) {

		var getSize = new GetSize(this, options);
		return getSize.getSziefy();
	};

})(jQuery);

/*
 * URL转义
 */
function URLDecode(zipStr) {

	/*
	 var uzipStr="";
	 for(var i=0;i<zipStr.length;i++){
	 var chr = zipStr.charAt(i);
	 if(chr == "+"){
	 uzipStr+=" ";
	 }else if(chr=="%"){
	 var asc = zipStr.substring(i+1,i+3);
	 if(parseInt("0x"+asc)>0x7f){
	 uzipStr+=decodeURI("%"+asc.toString()+zipStr.substring(i+3,i+9).toString());
	 i+=8;
	 }else{
	 uzipStr+=AsciiToString(parseInt("0x"+asc));
	 i+=2;
	 }
	 }else{
	 uzipStr+= chr;
	 }
	 }  */

	return decodeURIComponent(zipStr);
}
