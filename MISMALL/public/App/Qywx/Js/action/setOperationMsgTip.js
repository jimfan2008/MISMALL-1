/**
 * @desc 操作提示
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row"><div class="col-md-12"><span>标题</span><input type="text" class="form-control title" ></div><div class="col-md-12"><span>描述</span><input type="text" class="form-control des" ></div></div>';
	var setOperationMsgTip = {
		action : function(actionIdx) {
			var currControl = $("body").find(".ctrlSelected");
			var currControlName = currControl.find(".fieldTitle").html();
			var currControlType = currControl.attr("ctrltype");
			var actionId = actionIdx ? actionIdx : "setOperationMsgTip" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "setOperationMsgTip"
			});
			$actionHtml.find(".actionTitle").text("操作提示");
			$actionHtml.find(".actionImagePreview").unbind("click").click(function() {
				ezCommon.changeImage.changeImg($(this));
			});
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var currControl = $("body").find(".ctrlSelected");
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			$actionObj.find(".row").each(function(i) {
				var title = $(".title", $(this)).val(), des = $(".des", $(this)).val();
				var ctrlName = $(currControl.find("input[type='checkbox'],input[type='radio'],input[type='text'],button,img")).attr("name");
				var img = $(this).find(".actionImagePreview img").attr("src");
				ctrlJson += '"' + ctrlName + '":{"title":"' + title + '","des" :"' + des + '"},';
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"setOperationMsgTip","ctrl":{' + ctrlJson + '}}';

			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = setOperationMsgTip.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				$(".title", $actionHtml).val(value["title"]);
				$(".des", $actionHtml).val(value["des"]);
				$(".actionImagePreview img", $actionHtml).attr("src", value["img"]);
			});

			return $actionHtml;
		}
	};
	module.exports = setOperationMsgTip;
});
