/**
 * @author 柯斌
 * @desc 操作提示
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var setOperationMsgTip = {
		/**
		 * 操作提示
		 */
		setOperationMsgTip : function($ctrlObj, cJson) {
			var str = '';
			$("#tipsId").remove();
			var offSet = $ctrlObj.offset(), top = offSet.top, left = offSet.left, width = $ctrlObj.width(), height = $ctrlObj.height();
			$.each(cJson["ctrl"], function(key, value) {
				str = '<div id="tipsId"><div class="tipsTitle"><span>' + value["title"] + '</span></div><div class="tipsContent">' + value["des"] + '</div><div style="display:none"><img src="' + value["img"] + '"></div></div>';
				$("body").append(str);
				$("#tipsId").css({
					"position" : "absolute",
					"top" : ($(window).height() / 2 - 100) + "px",
					"left" : ($(window).width() / 2 - 100) + "px",
					"width" : "200px",
					"height" : "200px",
					"backgroundImage" : "url(" + value["img"] + ")",
					"z-index" : "9999",
					"background-size" : "100% 100%"
				});

				setTimeout(function() {
					$("#tipsId").remove();
				}, "2000");
			});
			return true;
		},
	};
	module.exports = setOperationMsgTip;
});
