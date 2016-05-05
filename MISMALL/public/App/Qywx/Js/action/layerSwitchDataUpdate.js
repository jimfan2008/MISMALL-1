/**
 * @desc 层切换数据更新
 * @author 唐苗
 * @date 2016-4-18
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="layerContent"><div class="row"  style="margin-bottom:10px"><div class="col-md-3" style="padding-top:7px">选择页面</div><div class="col-md-9"><select class="innerPage form-control"><option value="blank">---选择页面--</option></select><div class="action-caret page-caret"></div></div></div>';
	var layerSwitchDataUpdate = {
		action : function(actionIdx) {
			var currControl = $("#myForm").find(".ctrlSelected");
			var currControlName = currControl.find(".fieldTitle").html();
			var currControlType = currControl.attr("ctrltype");
			var actionId = actionIdx ? actionIdx : "layerSwitchDataUpdate" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			//选择页面
			var optionHtml = "";
			$(".page-manag .page-total .link-page,.page-manag .page-total .backstage-manage-page .backstage-menu-list").find(".page-common").not(".addStatus").each(function(key, item) {
				var pageId = $(this).attr("pageId"), formId = $(this).attr("formId"), pageName = $(this).find(".custom_page_name").text();
				optionHtml += '<option value="' + pageId + '" class="' + formId + '">' + pageName + '</option>';
			});
			$.each(ezCommon.menuJson, function(i, v) {
				if ($.isEmptyObject(v.subMenu)) {
					optionHtml += '<option value="' + i + '" class="' + v.formId + '">' + decodeURIComponent(v.menuName) + '</option>';
				} else {
					$.each(v.subMenu, function(m, n) {
						optionHtml += '<option value="' + m + '" class="' + n.formId + '">' + decodeURIComponent(n.menuName) + '</option>';

					});
				}
			});
			$actionHtml.find(".innerPage").append(optionHtml);
			//选择页面之后再选择那个页面的组件
			var ul = '<div class="col-md-3 dynamicList" style="padding-top: 16px">选择组件</div><div class="col-md-9"  style="margin-top: 11px"><select class="form-control  input-sm ctrlArray"><option value="blank">--选择组件--</option></select></div>';
			$actionHtml.find(".layerContent .row").append(ul);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "layerSwitchDataUpdate"
			});
			$actionHtml.find(".actionTitle").text("层切换数据更新");
			bindCompEvent($actionHtml);
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var currControl = $("body").find(".ctrlSelected");
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			var pageId = $actionObj.find(".innerPage option:selected").val();
			var formId = $actionObj.find(".innerPage option:selected").attr("class");

			$actionObj.find(".row").each(function() {
				var $thisOption = $(this).find(".ctrlArray option:selected");
				var queryId = $thisOption.val();
				var queryName = $thisOption.attr("queryName");
				var ctrlId = $thisOption.attr("ctrlId");
				var mycompname = $thisOption.html();
				ctrlJson += '"' + ctrlId + '" : { "queryId" : "' + queryId + '","pageId" : "' + pageId + '","ctrlId" : "' + ctrlId + '","queryName" : "' + queryName + '", "mycompname" : "' + mycompname + '"},';
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"layerSwitchDataUpdate","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = layerSwitchDataUpdate.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				$actionHtml.find(".innerPage option[value='" + value["pageId"] + "']").attr("selected", "selected");
				var componentUl = "";
				var formId = value["queryId"];
				var fieldForm = ezCommon.getFormFieldsData(formId);
				var fieldStr = '<option value="blank">--选择组件--</option>';
				if (fieldForm.length) {
					$.each(fieldForm, function(key, value) {
						if (value["fieldTitle"] != "自定义组件模板" && value["controlType"] == "compLogic") {
							fieldStr += '<option value="' + formId + '" ctrlId="' + value["fieldName"] + '">' + value["fieldTitle"] + '</option>';
						}
					});
				}
				$(".layerContent .ctrlArray").empty().append(fieldStr);
				$(".layerContent .ctrlArray").find("option[ctrlId='" + value["ctrlId"] + "']").attr("selected", "selected");

			});

			return $actionHtml;
		},
	};
	function getQuery($obj, queryId, field) {
		var qSelect = '数据源标题<select class="form-control  input-sm  ">';
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
		var currDynamic = $("").find("[ctrlId='" + ctrlId + "'] [rowunit='n']:first").find("[fieldname]");

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
	function bindCompEvent($actionHtml) {
		$actionHtml.find(".layerContent .innerPage").on("change", function() {
			var $thisOption = $(this).find("option:selected");
			var formId = $thisOption.attr("class");
			var componentUl = "";
			var fieldForm = ezCommon.getFormFieldsData(formId);
			var fieldStr = '<option value="blank">--选择组件--</option>';
			if (fieldForm.length) {
				$.each(fieldForm, function(key, value) {
					if (value["fieldTitle"] != "自定义组件模板" && value["controlType"] == "compLogic") {
						fieldStr += '<option value="' + formId + '" ctrlId="' + value["fieldName"] + '">' + value["fieldTitle"] + '</option>';
					}
				});
			}
			$(".layerContent .ctrlArray").empty().append(fieldStr);
		});
	};

	module.exports = layerSwitchDataUpdate;
});
