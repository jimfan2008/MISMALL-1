/**
 * @author 柯斌
 * @desc 关注公众号
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var attention = {
		/**
		 *关注公众号
		 */
		attention : function($ctrlObj, cJson) {
			$.each(cJson["ctrl"], function(key, value) {
				var gongZongHao = value["gongzhonghao"];
				window.location.href = "weixin://contacts/profile/" + gongZongHao;
			});
			return true;
		},
	};
	module.exports = attention;
});
