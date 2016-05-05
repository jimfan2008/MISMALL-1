/**
 * @desc 添加逻辑处理
 * @author 柯斌
 * @date 2015-11-30
 */

define(function(require, exports, module) {
	var htmlStr = '<div class="row"><div class="col-md-12 " ><label class="col-md-4">修改表单数据</label><div class="col-md-6 button-position"><div class="switch ctrl-css-switch" data-animated="false"><input data-size="mini" data-on-color="info" type="checkbox" name="formDataUpdate" flag = "true"/></div></div></div>';
	var index = 1;
	var formDataUpdate = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "formDataUpdate" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "formDataUpdate"
			});
			$actionHtml.find(".actionTitle").text("修改表单数据");
			$("[name='formDataUpdate']", $actionHtml).bootstrapSwitch({
				state : true
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				$("[name='formDataUpdate']", $actionHtml).attr("flag", state);
			});

			return $actionHtml;
		},

		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = false;
			ctrlJson = '{"flag":' + $("[name='formDataUpdate']", $actionObj).attr("flag") + '}';
			if (!ctrlJson) {
				return false;
			}
			var ctrlActionJson = '"' + actionId + '":{"type":"formDataUpdate","ctrl":' + ctrlJson + '}';
			return ctrlActionJson;

		},

		restore : function(actionJson, actionName) {
			var $actionHtml = formDataUpdate.action();
			$("[name='formDataUpdate']", $actionHtml).bootstrapSwitch({
				state : actionJson["ctrl"]["flag"]
			});
			return $actionHtml;
		}
	};

	module.exports = formDataUpdate;
});
