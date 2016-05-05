/**
 * @author 柯斌
 * @desc 规则调用
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var sendMessage = {
		/**
		 * 发送消息
		 */
		sendMessage : function($ctrlObj, cJson) {
			var str = "";
			var offSet = $ctrlObj.offset(), top = offSet.top, left = offSet.left, width = $ctrlObj.width(), height = $ctrlObj.height();
			if (!"undefined" == typeof openId) {
				$.each(cJson["ctrl"], function(key, value) {
					str = value['content'];
					//发送消息
					$.ajax({
						type : "POST",
						url : APPPATH + '/Wechat/Message/actionSendMessage',
						data : {
							"siteId" : SITEID,
							'openId' : openId,
							'content' : str,
							'type' : "text",
						},
						async : false,
						success : function(r) {

						}
					});
				});
				return true;
			} else {
				return true;
			}

		},
	};
	module.exports = sendMessage;
});
