/**
 * @desc 扫一扫
 * @author 黄向腾
 * @date 2016-04-10
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="richScan"><div class="row content-zdtc"><div class="col-md-6" style="line-height:30px">接收返回扫描结果控件</div><div class="col-md-6 action-zdtc"><select class="form-control  input-sm ctrlArray"></select><div class="action-caret formCtrl-caret"></div></div></select></div>';
	var richScan = {
			action : function(actionIdx) {
				var actionId = actionIdx ? actionIdx : "richScan" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "richScan"
			});
			ezCommon.actionClose($actionHtml);
			$actionHtml.find(".actionTitle").text("扫一扫");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"], ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
				if (ctrlType == "TEXTBOX" || ctrlType == "REMARK" || ctrlType == "RADIO") {
					$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
			});
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			var calcClrfirst = $actionObj.find(".action-zdtc:first").find("select:first").val();
			//ctrlJson += '"' + calcClrfirst + '"';
			var ctrlJson = '{"valueType" :"' + calcClrfirst + '"}';
			if (ctrlJson == "")
				return ctrlJson;
				var ctrlActionJson = '"' + actionId + '":{"type":"richScan","ctrl":' + ctrlJson + '}';
				console.log(ctrlActionJson)
				return ctrlActionJson;
			
				
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), 
			action = actionJson["ctrl"], 
			$actionHtml = richScan.action(actionName),
			$rowFirst = $actionHtml.find(".content-zdtc:first");
			$.each(action, function(k, v) {	
						$rowFirst.find("select >option[value =" + v + "]").attr("selected", "selected");
			});
			return $actionHtml;
				
	}
	};	
	module.exports = richScan;
});
