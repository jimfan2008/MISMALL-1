/**
 * @desc 一键拨号
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row"><div class="col-md-12"><span>拨打号码</span><input type="text"class="form-control phoneNumber"></div></div>';
	var oneTouchDial = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "oneTouchDial" + ezCommon.actionNameNum[ezCommon.formId];
			;
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "oneTouchDial"
			});
			$actionHtml.find(".actionTitle").text("一键拨号");
			//实现点击出现表单控件 点击事件 值改变事件 均在dataSet()方法中实现
			$actionHtml.find(".phoneNumber").hover(function() {
				var $rowThis = $(this);
				addPananl($rowThis,"ACTION2");
			}, function() {
				$('span[aria-hidden="true"]', $(this)).hide();
			});

			return $actionHtml;
		},
		json : function($actionObj) {
			var currControl = $("body").find(".ctrlSelected");
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			$actionObj.find(".row").each(function(i) {
				var $phone = $(".phoneNumber", $(this));
				var phoneNumber = $phone.val(), ctrlId = $phone.attr("valueType");
				var ctrlName = $(currControl.find("button")).attr("name");
				ctrlJson += '"' + ctrlName + '":{"phoneNumber":"' + phoneNumber + '","ctrlId" :"' + ctrlId + '"},';
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"oneTouchDial","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = oneTouchDial.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				$(".phoneNumber", $actionHtml).val(value["phoneNumber"]);
				$(".phoneInfo", $actionHtml).val(value["phoneInfo"]);
			});
			
			return $actionHtml;
		}
	};
	
	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}
	module.exports = oneTouchDial;
});
