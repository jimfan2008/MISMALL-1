/**
 * @desc 动态组件数据查询
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="dynamicContent"></div>';
	var componentUpdate = {
		action : function(actionIdx) {
			var currControl = $("#myForm").find(".ctrlSelected");
			var currControlName = currControl.find(".fieldTitle").html();
			var currControlType = currControl.attr("ctrltype");
			var actionId = actionIdx ? actionIdx : "componentUpdate" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			var ul = '<div class="row"><div class="col-md-4 dynamicList"><select class="form-control  input-sm ctrlArray"><option value="blank">选择组件</option>';
			$(".selectedForm").find("div[ctrl-type='compLogic']").each(function() {
				var mycompname =ezCommon.controlLists[ezCommon.formId][$(this).attr("ctrlId")]["attrs"]["general"]["ctrlTitle"];
				ul += '<option value="' + $(this).attr("formId") + '" ctrlId="' + $(this).attr("ctrlId") + '" queryName="' + $(this).attr("queryName") + '">' + mycompname+ '</option>';
			});
			//ul += '</select></div><div class="col-md-2"><label class="col-md-12">等于</label></div><div class="col-md-4"><input class="form-control input-sm queryDynamicData" readOnly="true"/></div><div class="col-md-2"><button class="close" type="button"><span style="display:none" aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>';
			ul += '</select></div><div class="col-md-2"><label class="col-md-12">等于</label></div><div class="col-md-4 condition"><select class="form-control  input-sm  "><option>--请先选组件--</option></select></div><div class="col-md-2"><button class="close" type="button"><span style="display:none" aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>';

			$actionHtml.find(".dynamicContent").append(ul);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "componentUpdate"
			});
			$actionHtml.find(".actionTitle").text("组件数据更新");
			bindEvent($actionHtml);
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var currControl = $("body").find(".ctrlSelected");
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			$actionObj.find(".row").each(function() {
				var $thisOption = $(this).find(".dynamicList select option:selected");
				var queryId = $(this).find(".condition select option:selected").attr("queryId");
				var queryName = $thisOption.attr("queryName");
				var ctrlId = $thisOption.attr("ctrlId");
				var mycompname = $thisOption.html();
				ctrlJson += '"' + ctrlId + '" : { "queryId" : "' + queryId + '","ctrlId" : "' + ctrlId + '","queryName" : "' + queryName + '", "mycompname" : "' + mycompname + '"},';
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"componentUpdate","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = componentUpdate.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				var $obj = $actionHtml.find("option[ctrlid='" + value["ctrlId"] + "']");
				if ($obj.size() > 0) {
					getDynamicField($actionHtml, value["ctrlId"], value["queryId"]);
					$obj.closest(".row").find(".condition select option[queryId='" + value["queryId"] + "']").attr("selected", "selected");
					$obj.attr("selected", "selected");
				}
			});
			
			return $actionHtml;
		},
	};
	function getQuery($obj, queryId, field) {
		var qSelect = '<select class="form-control  input-sm  ">';
		var allQuerier = ezCommon.getSameDataSourceList(queryId, field);
		if (allQuerier) {
			$.each(allQuerier, function(key, value) {
				qSelect += '<option queryId="' + value["ID"] + '" title="' + value["querierName"] + '"><label>' + value["querierName"] + '</label></option>';
			});
		}
		qSelect += '</select>';
		$obj.find(".condition").html(qSelect);
	};
	function getDynamicField($actionHtml, ctrlId, queryId) {
		var currDynamic = $(".selectedForm").find("[ctrlId='" + ctrlId + "'] [rowunit='n']:first").find("[fieldname]");
		var field = [];
		$.each(currDynamic, function() {
			var fieldName = $(this).attr("fieldname").split("_");
			var fieldId = fieldName[2], tableName = fieldName[0] + "_" + fieldName[1];
			field.push({
				"fieldId" : fieldId,
				"tableName" : tableName
			});
		});
		if (queryId != "blank") {
			getQuery($actionHtml, queryId, field);
		}
	};
	function bindEvent($actionHtml) {
		$actionHtml.find(".dynamicList select").on("change", function() {
			var $thisOption = $(this).find("option:selected");
			var queryId = $thisOption.attr("value");
			var queryName = $thisOption.attr("queryName");
			var ctrlId = $thisOption.attr("ctrlId");
			getDynamicField($actionHtml, ctrlId, queryId);
			$(this).closest(".row").find(".condition select option[queryId='" + queryId + "']").attr("selected", "selected");

		});
	}


	module.exports = componentUpdate;
});
