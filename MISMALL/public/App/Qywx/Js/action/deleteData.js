/**
 * @desc 删除数据
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class= "deleteData"><div class="setFormList"></div></div>';
	var deleteData = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "deleteData" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "deleteData"
			});
			$actionHtml.find(".actionTitle").text("删除数据");
			getFormList($actionHtml);
			var formId = $actionHtml.find(".formList option:first").attr("queryId");
			getFieldList(formId, $actionHtml);
			addPananl($actionHtml.find(".paramVal:first"),"ACTION2");
			event($actionHtml);
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = '';
			$actionObj.find(".deleteData >.row").each(function() {
				var $this = $(this), $selectForm = $this.find(".formList option:selected"), formId = $selectForm.attr("queryId"), tableName = $selectForm.attr("tableName"), field = '';
				$this.find(".chooseField >.row").each(function() {
					var $_this = $(this), $selectField = $_this.find(".formField option:selected"), fieldName = $selectField.attr("field"), fieldTitle = $selectField.attr("title"), $input = $_this.find(".paramVal"), dataType = $input.attr("dataType"), valueType = $input.attr("valueType"), inputVal = $input.val();
					if (dataType == "constant") {
						valueType = $input.val();
					}
					field += '{"fieldName" :"' + fieldName + '","fieldTitle":"' + fieldTitle + '","dataType" :"' + dataType + '","valueType":"' + valueType + '","inputVal":"' + inputVal + '"},';
				});
				field = field.substr(0, field.length - 1);
				ctrlJson += '{"formId" :"' + formId + '","tableName":"' + tableName + '","field":[' + field + ']},';
			});

			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"deleteData","ctrl":[' + ctrlJson + ']}';
			return ctrlActionJson;

		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$actionHtml.attr({
				"actionId" : actionName,
				"actionType" : "deleteData"
			});
			$("#ctrlActionList").append($actionHtml);
			var num = 0;
			ezCommon.actionClose($actionHtml);
			$.each(actionJson["ctrl"], function(key, value) {
				var queryId = value["formId"], tableName = value["tableName"];
				var formStr = getFormList($actionHtml);
				var fieldStr = getFieldList(queryId, $actionHtml);
				$actionHtml.find(".formList option[queryid='" + queryId + "']").attr("selected", "selected");
				$.each(value["field"], function(k, v) {
					var fieldName = v["fieldName"], dataType = v["dataType"], valueType = v["valueType"], inputVal = v["inputVal"];
					if (num == 0) {
						$actionHtml.find(".formField option[field='" + fieldName + "']").attr("selected", "selected");
						$actionHtml.find(".paramVal").attr({
							"dataType" : dataType,
							"valueType" : valueType
						}).val(inputVal);
						addPananl($actionHtml.find(".paramVal:first"),"ACTION2");
					} else {
						var $fields = $(fieldStr);
						$fields.find(".formField option").removeAttr("selected");
						$fields.find(".formField option[field='" + fieldName + "']").attr("selected", "selected");
						$fields.find(".paramVal").attr({
							"dataType" : dataType,
							"valueType" : valueType
						}).val(inputVal);
						$actionHtml.find(".chooseField").append($fields);
						addPananl($fields.find(".paramVal:first"),"ACTION2");
					}
					num++;
				});

			});
			event($actionHtml);
			if ($actionHtml.find(".chooseField>.row").length > 1) {
				$(".glyphicon-minus", $actionHtml).show();
			}
			
			return $actionHtml;
		},
	};
	function getFormList($obj) {
		//获取当前项目所有表单
		var $form = ezCommon.getFormListData();
		var formStr = '<div style="margin:10px 0px" class="row"><div style="margin:8px 0px;padding:0px" class="col-md-2">选择表单</div><div class="col-md-10"><select class="formList form-control">';
		if ($form.length) {
			$.each($form, function(key, value) {
				if (value["ID"] != -1) {
					formStr += '<option queryId="' + value["ID"] + '" tableName="' + value["tableName"] + '" title="' + value["tableTitle"] + '">' + value["tableTitle"] + '</option>';
				}
			});
		}
		formStr += '</select><div class="action-caret form-caret"></div></div></div><div class="chooseField"></div>';
		$obj.find(".deleteData .setFormList").append(formStr);

		return formStr;
	}

	//获取指定表单字段
	function getFieldList(formId, $obj) {
		var fieldForm = ezCommon.getFormFieldsData(formId);
		var fieldStr = '<div class="row" style="margin:10px 0px"><div  style="margin:8px 0px;padding:0px" class="col-md-2">条件</div><div class="col-md-4"><select class="formField form-control"><option field="ID" title="ID">ID</option>';
		if (fieldForm.length) {
			$.each(fieldForm, function(key, value) {
				fieldStr += '<option field="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			});
		}
		fieldStr += '</select><div class="action-caret field-caret"></div></div><div class="col-md-2"  style=" padding:0px"><select class="flag form-control" style=" padding:0px"><option value="eq">=</option></select><div class="action-caret deng-caret"></div></div><div class="col-md-4"><input type="text" class="form-control paramVal" datatype="constant"></div></div>';
		$obj.find(".chooseField").empty().append(fieldStr);
		return fieldStr;
	}

	function event($obj) {
		//添加 删除字段
		$obj.on("click", ".del-add", function() {
			var $row = $(this).closest(".row"), $newNow = $row.clone();
			if ($(this).hasClass("action-addData-add")) {
				$row.after($newNow);
				var num = $obj.find(".chooseField >.row").length - 1;
				addPananl($obj.find(".paramVal:eq(" + num + ")"),"ACTION2");
				$(".action-addData-del", $obj).show();
			} else if ($(this).hasClass("action-addData-del")) {
				$row.remove();
				if ($obj.find(".chooseField>.row").length <= 1) {
					$(".action-addData-del", $obj).hide();
				}
			}
		});
		//表单列表切换
		$obj.on("change", ".formList", function() {
			var queryId = $(this).find("option:selected").attr("queryId");
			$obj.find(".chooseField .row:not(:first)").remove();
			getFieldList(queryId, $obj);
			addPananl($obj.find(".paramVal:first"),"ACTION2");
		});
	}

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = deleteData;
});
