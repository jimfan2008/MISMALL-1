/**
 * @desc 新增数据
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class= "addNewData"><div class="setFormList"></div></div>';
	var addNewData = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "addNewData" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "addNewData"
			});
			$actionHtml.find(".actionTitle").text("新增数据");
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
			
			var $selectForm = $actionObj.find(".addNewData .formList option:selected"), 
				formId = $selectForm.attr("queryId"), 
				tableName = $selectForm.attr("tableName"), 
				field = '';
			
			$actionObj.find(".chooseField > .row").each(function() {
				var $_this = $(this), 
					$selectField = $_this.find(".formField option:selected"), 
					fieldName = $selectField.attr("field"), 
					fieldTitle = $selectField.attr("title"), 
					$input = $_this.find(".paramVal"), 
					dataType = $input.attr("dataType"), 
					valueType = $input.attr("valueType"), 
					inputVal = $input.val();
					
				if (dataType == "constant") {
					valueType = $input.val();
				}
				field += '{"fieldName" :"' + fieldName + '","fieldTitle":"' + fieldTitle + '","dataType" :"' + dataType + '","valueType":"' + valueType + '","inputVal":"' + inputVal + '"},';
			});
			field = field.substr(0, field.length - 1);
			ctrlJson += '{"formId" :"' + formId + '","tableName":"' + tableName + '","field":[' + field + ']},';
				
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"addNewData","ctrl":[' + ctrlJson + ']}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = addNewData.action(actionName),
			    num = 0;
			
			$.each(actionJson["ctrl"], function(key, value) {
				var queryId = value["formId"], tableName = value["tableName"];
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
		}
	};
	function getFormList($obj) {
		//获取当前项目所有表单
		var $form = ezCommon.getFormListData();
		var formStr = '<div class="addNewData"><div class="setFormList"><div class="row"><div class="col-md-3" style="padding-top:8px">选择表单</div><div class="col-md-9"><select class="formList form-control"><option>请选择表单</option>';
		if ($form.length) {
			$.each($form, function(key, value) {
				if (value["ID"] != -1) {
					formStr += '<option queryId="' + value["ID"] + '" tableName="' + value["tableName"] + '" title="' + value["tableTitle"] + '">' + value["tableTitle"] + '</option>';
				}
			});
		}
		formStr += '</select><div class="action-caret form-caret"></div></div></div><div style="border-top:1px solid #ccc;margin:15px;padding-top:15px" class="row"><button style="width:80px;background:#00ccff;border:0px;border-radius:0px;color:#ffffff" class="btn btn-default input-sm addNewField">添加</button></div><div class="chooseField"></div></div></div>';
		$obj.find(".actionWarp").append(formStr);
		return formStr;
	};
	//获取指定表单字段
	function getFieldList(formId, $obj) {
		var fieldForm = ezCommon.getFormFieldsData(formId);
		var fieldStr = '<div class="row cfield" style="margin-bottom:10px"><div style="text-align:center;padding:8px 0px;" class="col-md-2">控件</div><div class="col-md-4" style="margin:0px;padding:0px"><select class="formField form-control"><option>请选择字段</option>';
		if (fieldForm.length) {
			$.each(fieldForm, function(key, value) {
				fieldStr += '<option field="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			});
		}
		fieldStr += '</select><div class="action-caret field-caret"></div></div><div class="col-md-1" style="margin-top:10px;padding:0px;text-align:center">=</div><div class="col-md-4" style="margin:0px;padding:0px"><input type="text" class="form-control paramVal" datatype="constant"></div><div class="col-md-1"><span class="action-addData-del" style="float:right;cursor: pointer;margin:-5px 0px 0px 0px;font-size:30px" title="删除">-</span></div></div>';
		$obj.find(".chooseField").empty().append(fieldStr);
		return fieldStr;
	};
	function event($obj) {
		if($obj.find(".chooseField .row").length>1){
			$(".action-addData-del", $obj).show();
		}else{
			$(".action-addData-del", $obj).hide();
		}
		
		//删除字段
		$obj.on("click", ".action-addData-del", function() {
			var $row = $(this).closest(".row");
			$row.remove();
			if ($obj.find(".chooseField>.row").length <= 1) {
				$(".action-addData-del", $obj).hide();
			}
		});
		
		
		//表单列表切换
		$obj.on("change", ".formList", function() {
			var queryId = $(this).find("option:selected").attr("queryId");
			$obj.find(".chooseField .row:not(:first)").remove();
			getFieldList(queryId, $obj);
			addPananl($obj.find(".paramVal:first"),"ACTION2");
		});
		
		/**
		 *新增字段 
		 */
		$(".addNewField",$obj).unbind("click").click(function(){
			var $row = $obj.find(".chooseField .row:first").clone();
			$row.find(".paramVal").val(null);
			$obj.find(".chooseField").append($row);
			addPananl($obj.find(".paramVal:last"),"ACTION2");
			$(".action-addData-del", $obj).show();
		});
	}

	function addPananl($obj,array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = addNewData;
});
