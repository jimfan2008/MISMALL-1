/**
 * @author 柯斌
 * @desc 规则调用
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var oneTouchDial = {
		
		/**
		 *一键拨号
		 */
		oneTouchDial : function($ctrlObj, cJson) {

			var ctrlIdName = "";
			var phoneNo = "";
			$.each(cJson["ctrl"], function(key, value) {
				if (value["ctrlId"] && value["ctrlId"] != "undefined") {
					//选取表单控件值
					ctrlIdName = value["ctrlId"];
					phoneNo = $(".selectedForm [ctrlId='" + ctrlIdName + "'] [name='" + ctrlIdName + "']").val();
				} else {
					//选取输入号码值
					phoneNo = value["phoneNumber"];
				}
			});
			window.location.href = 'tel:' + phoneNo;
			return true;
		},
	};
	module.exports = oneTouchDial;
});
