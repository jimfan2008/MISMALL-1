/**
 * @desc 数据源更新
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row"><div class="col-md-4"><select class="form-control  input-sm ctrlArray"></select></div><div class="col-md-2"><label class="col-md-12">等于</label></div><div class="col-md-4"><input readonly="true" class="form-control input-sm"></div><div class="col-md-2"><button type="button" class="close"><span aria-hidden="true" style="display:none">×</span><span class="sr-only">Close</span></button></div></div>';
	var dataSourceUpdate = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "dataSourceUpdate" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "dataSourceUpdate"
			});
			$actionHtml.find(".actionTitle").text("数据源更新");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			if (!ctrlLists)
				return false;
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"];
				if (ctrlType != "ctrl-dynamic") {
					var ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
					if (ctrlType == "CCDropDown") {
						$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
					}
				}
			});
			$(".sendToName").click(function() {
			});
			return $actionHtml;
		},
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			var pageId = $actionObj.find(".innerPage option:selected").val();
			if (pageId) {
				ctrlJson = '"pageId":"' + pageId + '"';
			}
			//return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = pageJump.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				//$actionHtml.find(".innerPage option[value='"+value+"']").attr("selected","selected");
			});
			
			return $actionHtml;
		},
	};
	module.exports = dataSourceUpdate;
});
