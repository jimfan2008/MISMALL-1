/**
 *  @desc 更新数据
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class= "upataDataContent"></div>';
	var componentUpdateData = {
		action : function(actionIdx) {
			var currControl = $("#myForm").find(".ctrlSelected");
			var currControlName = currControl.find(".fieldTitle").html();
			var currControlType = currControl.attr("ctrltype");
			var actionId = actionIdx ? actionIdx : "componentUpdateData" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			var $selectedForm = $(".selectedForm", $("#myWeb"));
			var $dynamic = $("[ctrl-type='ctrl-dynamic']:visible", $selectedForm);
			var dynamicSelect = '<div class="row" style="margin-top:10px"><div class="col-md-3" style="margin:8px 0px">选择表单</div><div style="padding:0px" class="dynamicDataName col-md-8"><select class="form-control input-sm dynamicList">';
			var $form = ezCommon.getFormListData();
			if (objIsnull($form)) {
				$.each($form, function(key, value) {
					if (value["ID"] != -1) {
						dynamicSelect += '<option tableName="' + value["tableName"] + '" queryId ="' + value["ID"] + '" title="' + value["tableTitle"] + '">' + value["tableTitle"] + '</option>';
					}
				});
			} else {
				dynamicSelect += '<option ctrlId="" queryId ="_blank" title="">-----</option>';
			}
			dynamicSelect += '</select><div class="action-caret form-caret"></div></div></div> <div class="row" style="margin-top:10px"><div class="col-md-3">选择字段</div><div style="padding:0px" class="dynamicField col-md-4"></div><div style="padding-right:0px" class="dynamicValue col-md-4"><input type="text" class="form-control input-sm" placeholder="请输入填充值"></div></div><div style="margin:15px 0px;padding:10px 0px;border-top:1px solid #f0f0f0;border-bottom:1px solid #f0f0f0" class="row"><div class="col-md-3"  style="padding-left:0px"><button class="btn btn-default input-sm addCondition">添加条件</button></div></div><div class="whereUpdata row" style="display:none"><div style="margin-top:6px;text-align:right" class="col-md-2">条件</div><div class="col-md-4 whereField"></div><div class="col-md-2" style="padding:0px"><select class="form-control input-sm"><option value="eq">等于</option></select><div class="action-caret deng-caret"></div></div><div class="col-md-4"><input type="text" class="whereFieldValue form-control input-sm" placeholder="请输入条件值"></div></div>';
			$actionHtml.find(".upataDataContent").append(dynamicSelect);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			var firstQueryId = $actionHtml.find(".dynamicDataName select option:first").attr("queryId");
			var filedSelect = '<select class="form-control input-sm">';
			if (firstQueryId == "_blank") {
				filedSelect += '<option tableName="" value="" title="">-----</option>';
			} else {
				var fieldForm = ezCommon.getFormFieldsData(firstQueryId);

				$.each(fieldForm, function(key, value) {
					filedSelect += '<option  value="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
				});
				if (objIsnull(fieldForm)) {
					filedSelect += '<option  value="ID" title="ID">ID</option>';
				}
			}

			filedSelect = filedSelect + '</select><div class="action-caret field-caret"></div>';
			$actionHtml.find(".dynamicField:first").html(filedSelect);
			$actionHtml.find(".whereField").html(filedSelect);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "componentUpdateData"
			});
			$actionHtml.find(".actionTitle").text("更新数据");
			bindEvent($actionHtml);
			return $actionHtml;
		},
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			console.log($actionObj);
			$actionObj.find(".upataDataContent").each(function() {
				var $thisOption = $(this).find(".dynamicDataName select option:selected"), 
				    $input = $(this).find(".dynamicValue input"),
				    $select = $(this).find(".dynamicField select option:selected"),
				    queryId = $thisOption.attr("queryId"),
				    ctrlId = $thisOption.attr("ctrlId"),
				    updataField = $select.val(), 
				    dynamicFieldTitle = $select.html(), 
				    tableName = $thisOption.attr("tableName"), 
				    updataFieldValue = $input.val(), 
				    dataType = $input.attr("dataType"), 
				    whereJson = [];
				if($(this).find(".whereUpdata").is(":visible")){
					$(this).find(".whereUpdata").each(function() {
						var whereField = $(this).find(".whereField select option:selected").attr("value");
						var whereValue = $(this).find(".whereFieldValue").val(),
						 whereDataType = $(this).find(".whereFieldValue").attr("dataType"),
						  whereValueType = $(this).find(".whereFieldValue").attr("valueType");
						if (whereDataType == "form") {
							var inputCtrlId = whereValueType, inputCtrlType = whereValueType.replace(/\d/g, '');
							whereJson.push('{"inputCtrlId":"');
							whereJson.push(inputCtrlId);
							whereJson.push('","inputCtrlType":"');
							whereJson.push('","whereField":"');
							whereJson.push(whereField);
							whereJson.push('","whereValue":"');
							whereJson.push(whereValue);
							whereJson.push('","whereDataType":"');
							whereJson.push(whereDataType);
							whereJson.push('","whereValueType":"');
							whereJson.push(whereValueType);
							whereJson.push('"}');
							
						} else {
							whereJson.push('{"whereField":"');
							whereJson.push(whereField);
							whereJson.push('","whereValue":"');
							whereJson.push(whereValue);
							whereJson.push('","whereDataType":"');
							whereJson.push(whereDataType);
							whereJson.push('","whereValueType":"');
							whereJson.push(whereValueType);
							whereJson.push('"}');
						}
					});
						whereJson = whereJson.join("");
				}
				if (queryId != "_blank") {
					if ((updataFieldValue.split("-").length > 0 || updataFieldValue.split("+") > 0) && (dataType == "zizeng" || dataType == "zijian")) {
						updataFieldValue = updataFieldValue[1];
					}
					if (dataType == "form") {
						var inputCtrlId = $input.attr("valueType"), inputCtrlType = inputCtrlId.replace(/\d/g, '');
						ctrlJson += '"' + ctrlId + '" : {"inputCtrlId":"' + inputCtrlId + '","inputCtrlType":"' + inputCtrlType + '", "valueType" : "' + dataType + '","queryId" : "' + queryId + '","ctrlId" : "' + ctrlId + '","dynamicFieldTitle" : "' + dynamicFieldTitle + '","updataField" : "' + updataField + '","updataFieldValue" : "' + updataFieldValue + '","tableName" : "' + tableName + '","whereJson":[' + whereJson + ']},';
					} else {
						ctrlJson += '"' + ctrlId + '" : { "valueType" : "' + dataType + '","queryId" : "' + queryId + '","ctrlId" : "' + ctrlId + '","dynamicFieldTitle" : "' + dynamicFieldTitle + '","updataField" : "' + updataField + '","updataFieldValue" : "' + updataFieldValue + '","tableName" : "' + tableName + '","whereJson":[' + whereJson + ']},';
					}
				}

			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"componentUpdateData","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = componentUpdateData.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				var $obj = $actionHtml.find("option[queryId='" + value["queryId"] + "']");
				if ($obj.size() > 0) {
					$obj.attr("selected", "selected");
					var queryId = value["queryId"];
					var filedSelect = '';
					var fieldForm = ezCommon.getFormFieldsData(queryId);
					$.each(fieldForm, function(k, v) {
						if (v["fieldName"] == value["updataField"]) {
							filedSelect += '<option  value="' + v["fieldName"] + '" title="' + v["fieldTitle"] + '" selected="selected">' + v["fieldTitle"] + '</option>';
						} else {
							filedSelect += '<option  value="' + v["fieldName"] + '" title="' + v["fieldTitle"] + '">' + v["fieldTitle"] + '</option>';
						}

					});
					if (objIsnull(fieldForm)) {
						filedSelect += '<option  value="ID" title="ID">ID</option>';
					}

					$actionHtml.find(".whereField select").html(filedSelect);
					$actionHtml.find(".dynamicField select").html(filedSelect);
					$actionHtml.find(".dynamicValue input").val(value["updataFieldValue"]);
					$actionHtml.find(".dynamicValue input").attr("dataType", value["valueType"]);

					$.each(value["whereJson"], function(ks, vs) {
						$actionHtml.find(".whereField select option[value='" + vs["whereField"] + "']").attr("selected", "selected");
						$actionHtml.find(".whereUpdata").show();
						$actionHtml.find(".whereFieldValue").val(vs["whereValue"]).attr({
							"dataType" : vs["whereDataType"],
							"valueType" : vs["whereValueType"]
						});
					});
					addPananl($actionHtml.find(".whereFieldValue"), "ACTION2");
				}
			});
			
			return $actionHtml;
		},
	};
	function bindEvent($obj) {
		$obj.find(".dynamicList").change(function() {
			var $soption = $(this).find("option:selected"), queryId = $soption.attr("queryId"), ctrlId = $soption.attr("ctrlId");
			var filedSelect = '<select class="form-control input-sm">';
			var fieldForm = ezCommon.getFormFieldsData(queryId);
			$.each(fieldForm, function(key, value) {
				filedSelect += '<option  value="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			});
			if (objIsnull(fieldForm)) {
				filedSelect += '<option  value="ID" title="ID">ID</option>';
			}
			filedSelect = filedSelect + '</select><div class="action-caret field-caret"></div>';
			$obj.find(".dynamicField:first").html(filedSelect);
			$obj.find(".whereField").html(filedSelect);
			$obj.find(".dynamicValue input").val(null);
		});
		
		$obj.off("click").on("click", ".addCondition", function() {
			if($obj.find(".whereUpdata").is(":visible")){
				$obj.find(".whereUpdata").hide();
				$(this).html("新增条件");
			}else{
				$obj.find(".whereUpdata").show();
				$(this).html("取消条件");
			    addPananl($obj.find(".whereFieldValue"), "ACTION2");
			}
			
			
		});
		addPananl($obj.find(".dynamicValue input"), "ACTION2");
	};

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = componentUpdateData;
});
