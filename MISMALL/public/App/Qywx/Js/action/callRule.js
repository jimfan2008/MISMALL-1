/**
 *  @desc 规则调用
 *  @author 黄俊
 *  @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row selectRule">' + '<div class="col-md-2"><label class="col-md-12">调用</label></div><div class="col-md-4">' + '<select class="form-control  input-sm ruleArray"></select></div><div class="conditionVal"></div></div><div class="row actionRuleTableDiv"></div><div class="ruleToFiled"><div class = "aboutRule"><div class = "aboutRuleParaVal"></div><div class = "aboutRuleConVal"></div><div class="aboutRuleNext"></div></div>';
	var callRule = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "callRule" + ezCommon.actionNameNum[ezcommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "callRule"
			});
			$actionHtml.find(".actionTitle").text("调用规则");
			_commonAjax({
				url : APPPATH + "/Qywx/Rule/getlist",
				data : {
					'siteId' : SITEID,
				},
				async : false,
				dataType : "json",
				success : function(r) {
					var paraVal = [], getRuleId = "";
					if (r) {
						//判断有几条规则如果只有一条则直接呈现规则列表
						if (r.length > 1) {
							var selectRule = "<option value='selectRule'>请选择规则</option>";
							$.each(r, function(key, value) {
								var condRela = [], condVal = [];
								selectRule += '<option value="' + value["id"] + '">' + value["ruleName"] + '</option>';
							});
							$actionHtml.find(".ruleArray").append(selectRule);
							// 将规则表格添加到动作中
							$actionHtml.on("change", ".ruleArray", function() {
								$actionHtml.find(".actionRuleTableDiv").empty();
								ruleTable = "", ruleTr = "", titleTd = "";
								//切换规则时清空数据
								getRuleId = $(this).find("option:selected").attr("value");
								ruleTable = callRule.getRuleTable(r, getRuleId);
								$actionHtml.find(".actionRuleTableDiv").append(ruleTable);
								$actionHtml.find(".aboutRuleParaVal").empty();
								$actionHtml.find(".aboutRuleConVal").empty();
								$actionHtml.find(".divReslutValue").remove();
								//当前选中行的参数
								callRule.ruleRadioClick(r, $actionHtml, getRuleId);

							});
						} else {
							$.each(r, function(key, value) {
								var condRela = [], condVal = [];
								$actionHtml.find(".ruleArray").append('<option value="' + value["id"] + '">' + value["ruleName"] + '</option>');
								callRule.ruleRadioClick(r, $actionHtml, value["id"]);
							});

						}
						//添加方式
						$actionHtml.on("click", ".addNewResult", function() {
							var divReslut = $(this).closest(".divReslutValue").clone();
							$actionHtml.find(".divReslutValue:last").after(divReslut);
							//当有多个结果值时现实删除符号
							if ($actionHtml.find(".divReslutValue ").length > 0) {
								$(this).parents(".actionPanel").find(".deleteNewResult").show();
							}
						});

						//删除方式
						$actionHtml.on("click", ".deleteNewResult", function() {
							//当结果值只剩一个时隐藏删除符号
							if ($actionHtml.find(".divReslutValue ").length == 2) {
								$(this).parents(".actionPanel").find(".deleteNewResult").hide();
							}
							if ($actionHtml.find(".divReslutValue ").length < 2) {
								return;
							} else {
								$(this).closest(".divReslutValue").remove();
							}
						});

						//添加结果值
						$actionHtml.on("click", ".addNewAction", function() {
							var $condihtml = $(this).closest(".selectCon").clone();
							$(this).closest(".divReslutValue ").find(">div:last").after($condihtml);
							if ($(this).closest(".divReslutValue ").find(".selectCon").length > 0) {
								$(this).closest(".divReslutValue").find(".selectCon").find(".action-autofill-del").show();
							}
						});

						//删除结果值
						$actionHtml.on("click", ".close", function() {
							if ($(this).closest(".divReslutValue ").find(".selectCon").length == 2) {
								$(this).closest(".divReslutValue").find(".selectCon").find(".action-autofill-del").hide();
							}
							if ($(this).closest(".divReslutValue ").find(".selectCon").length < 2) {
								return;
							} else {
								$(this).closest(".selectCon").remove();
							}
						});

					}
				}
			});
			callRule.event($actionHtml);
			return $actionHtml;
		},
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			//ruleJson 参数json , equationJson 结果json ,
			var ctrlJson = '', equationJson = '', conditionJson = '';
			var ruleId = $actionObj.find(".ruleArray >option:selected").attr("value");
			//filedVal 执行哪一行规则
			var filedVal = $actionObj.find(".actionRuleTable [name=ruleRadio]:checked").attr("trnum");
			ctrlJson = '"' + ruleId + '":{"fieldValue":"' + filedVal + '"},';

			//循环条件值
			var $aboutRuleParaVal = $actionObj.find(".aboutRuleParaVal");
			var aboutRuleConVal = $actionObj.find(".aboutRuleConVal");
			$aboutRuleParaVal.find(".paraVal").each(function(key, val) {
				var paracon = $(this).attr("con");
				var paraTableName = $(this).find(".divSelectTable select >option:selected").attr("tablename");
				//表单
				var paraField = $(this).find(".divSelectConstol select >option:selected").attr("field");
				//字段
				conditionJson += '{"paraVal" :"' + paraTableName + '.' + paraField + '",';
				aboutRuleConVal.find(".paraVal").each(function(k, v) {
					var conval = $(this).attr("con");
					if (paracon == conval) {
						var value = "", type = '';
						var symbol = $(this).find("strong").attr("thisrale");
						var tableName = $(this).find(".divSelectTable select >option:selected").attr("tablename");
						//表单
						var field = $(this).find(".divSelectConstol select >option:selected").attr("field");
						//字段
						if (tableName == 0 || tableName == "") {
							value = $(this).find("strong").text();
							type = 'constant';
						} else {
							value = tableName + "." + field;
							type = 'variable';
						}
						conditionJson += '"condRela":"' + symbol + '","condVal":{"type" :"' + type + '", "value": "' + value + '" }},';
					}

				});
			});

			var $divReslutValue = $actionObj.find(".divReslutValue");
			var reuleCalType = '', fieldTable = '', filedTableContorl = '', fileTableContorlVal = '', equationValueJson = [];

			//循环结果值
			$divReslutValue.each(function(key, val) {
				reuleCalType = $(this).find(".selectType select >option:selected").attr("value");
				fieldTable = $(this).find(".divSelectTable select >option:selected").attr("tablename");
				//循环每个条件的结果值
				var fileSelectVal = [];
				$(this).find(".selectCon").each(function(key, val) {
					filedTableContorl = $(this).find("select >option:selected").attr("field");
					fileTableContorlVal = $(this).find("input").val();
					fileSelectVal += '{"fieldName":"' + filedTableContorl + '","fieldValue":"' + fileTableContorlVal + '"},';
				});
				fileSelectVal = fileSelectVal.substr(0, fileSelectVal.length - 1);
				equationValueJson += '{"reuleCalType":"' + reuleCalType + '","fieldTable":"' + fieldTable + '","fields":[' + fileSelectVal + ']},';
			});
			equationValueJson = equationValueJson.substr(0, equationValueJson.length - 1);
			//去掉条条件Json 的最后一个",";
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			conditionJson = conditionJson.substr(0, conditionJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"callRule","ctrl":{' + ctrlJson + '},"conditionJson":[' + conditionJson + '],"equationValueJson":[' + equationValueJson + ']}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), action = actionJson["ctrl"], $actionHtml = callRule.action(actionName), $rowFirst = $actionHtml.find(".row:first"), conditionJson = actionJson["conditionJson"], ruleJson = actionJson["ruleJson"], equationValueJson = actionJson["equationValueJson"], fieldValue = '', $divParamValue = $actionHtml.find(".divParamValue");
			// getRuleId 规则Id , fieldValue 当前规则的第几行
			var getRuleId = "", fieldValue = "";
			$.each(action, function(k, v) {
				$actionHtml.find(".ruleArray > option[value	=" + k + "]").attr("selected", "selected");
				getRuleId = k;
				fieldValue = v["fieldValue"];
			});
			_commonAjax({
				url : APPPATH + "/Qywx/Rule/getlist",
				data : {
					'siteId' : SITEID,
				},
				async : false,
				dataType : "json",
				success : function(r) {
					ruleTable = callRule.getRuleTable(r, getRuleId);
					$actionHtml.find(".actionRuleTableDiv").append(ruleTable);
					callRule.ruleRadioClick(r, $actionHtml, getRuleId);
					$actionHtml.find("[ name=ruleRadio]:eq(" + fieldValue + ") ").click();
					$.each(conditionJson, function(key, value) {
						var cfieldValue = value["paraVal"].split(".");
						$.each($actionHtml.find(".aboutRuleParaVal").children(), function() {
							if (key == $(this).attr("con")) {
								$(this).find(".divSelectTable").find(".formList > option[tablename=" + cfieldValue[0] + "]").attr("selected", "selected");
								var queryId = $(this).find(".divSelectTable >select >option[tablename=" + cfieldValue[0] + "]").attr("queryid");
								var fieldList = $(addNewData.getFieldList(queryId, $actionHtml)).find("select");
								$(this).find(".divSelectConstol").empty().append(fieldList);
								$(this).find(".divSelectConstol").find(".formField > option[field=" + cfieldValue[1] + "]").attr("selected", "selected");
							}
						});

						var conType = value["condVal"]["type"];
						var contableId = "", confield = "";
						if (conType == "variable") {
							var condVal = value["condVal"]["value"].split(".");
							contableId = condVal[0];
							confield = condVal[1];
						} else {
							contableId = 0;
						}
						$.each($actionHtml.find(".aboutRuleConVal").children(), function() {
							if (key == $(this).attr("con")) {
								$(this).find(".divSelectTable").find(".formList > option[tablename=" + contableId + "]").attr("selected", "selected");
								if (conType == "variable") {
									var queryId = $(this).find(".divSelectTable >select >option[tablename=" + contableId + "]").attr("queryid");
									var fieldList = $(addNewData.getFieldList(queryId, $actionHtml)).find("select");
									$(this).find(".divSelectConstol").empty().append(fieldList);
									$(this).find(".divSelectConstol").find(".formField > option[field=" + confield + "]").attr("selected", "selected");
								}
							}
						});

					});
				}
			});

			// 自动点击下一步
			$actionHtml.find(".aboutRuleNext").find("input").click();
			//还原结果值中的操作方式和表单值
			var $divReslutValue = $actionHtml.find(".divReslutValue:eq(0)").clone();
			// 获取表中控件集合
			var $selectCon = $divReslutValue.find(".selectCon").clone();
			var $divReslutT = "";
			$actionHtml.find(".divReslutValue").remove();
			//还原结果值
			$.each(equationValueJson, function(k, v) {
				var $divReslutHtml = "", $selectConT = "";
				$divReslutValue.find(".selectType select>option").removeAttr("selected");
				$divReslutValue.find(".divSelectTable select>option").removeAttr("selected");
				$divReslutValue.find(".selectType >select >option[value=" + v["reuleCalType"] + "]").attr("selected", "selected");
				$divReslutValue.find(".divSelectTable >select >option[tablename=" + v["fieldTable"] + "]").attr("selected", "selected");
				var queryId = $divReslutValue.find(".divSelectTable >select >option[tablename=" + v["fieldTable"] + "]").attr("queryid");
				var fieldList = $(addNewData.getFieldList(queryId, $divReslutValue)).find("select");
				$selectCon.find("select").remove();
				// 还原控件和文本中的值
				$.each(v["fields"], function(key, val) {
					var $selectConHtml = "";
					$selectCon.find(".divSelectConstol").append(fieldList);
					$selectCon.find("select>option").removeAttr("selected");
					$selectCon.find("select option[field =" + val['fieldName'] + "]").attr("selected", "selected");
					$selectCon.find("input").attr("value", val["fieldValue"]);
					$selectConHtml = $selectCon.wrap("<div/>").parent().html();
					$selectConT += $selectConHtml;
				});
				$divReslutValue.find(".selectCon").remove();
				$divReslutValue.append($selectConT);
				$divReslutHtml = $divReslutValue.wrap("<div/>").parent().html();
				$divReslutT += $divReslutHtml;
			});
			$actionHtml.find(".aboutRule").append($divReslutT);
			
			return $actionHtml;
		}
	};
	/*获取 paraVal参数
	 * @param {JSON} r 规则json
	 * @param {string} getRuleId 当前选择的规则Id
	 */
	function getParaVal(r, getRuleId) {
		var paraVal = [];
		$.each(r, function(key, value) {
			if (getRuleId == value["id"]) {
				$.each(value["ruleData"], function(k, v) {
					$.each(v["condition"], function(p, q) {
						if (k == 0) {
							paraVal.push({
								"paraVal" : q["paraVal"]
							});
						}
					});

				});
			}

		});
		return paraVal;
	};
	/*将字符串绑定到字段
	 * @param {JSON} r 规则json
	 * @param {object} $actionHtml 当前规则容器
	 * @param {string} getRuleId 当前选择的规则Id
	 */
	function ruleRadioClick(r, $actionHtml, getRuleId) {
		var condRela = $actionHtml.find(".filedList >option:selected").attr("condRela");
		var resultVal = $actionHtml.find(".resultVal").text();
		var $formList = $(addNewData.getFormList($actionHtml)).children();
		var nullValue = '<option tablename = "0">为常量</option>';
		$formList.find("option:last").after(nullValue);
		// 选择规则子行数改变时
		var fileList = function(paraVal, condRela, thisConVal) {
			if ($actionHtml.find(".aboutRuleParaVal").children().size() < 1) {
				$actionHtml.find(".aboutRule >.aboutRuleParaVal").children().remove();

				$.each(paraVal, function(key, value) {
					$actionHtml.find(".aboutRule >.aboutRuleParaVal").append("<div class='row paraVal' con = " + key + "><div class='col-md-4'>将<strong value = " + 1 + ">" + value["paraVal"] + "</strong>绑定到</div><div class='col-md-4 divSelectTable'></div><div class='col-md-4 divSelectConstol'></div></div>");
				});
			}
			if ($actionHtml.find(".divReslutValue").find("div").size() < 1) {
				$actionHtml.find(".aboutRule > .aboutRuleNext").empty().append('<input type="button" value="下一步" class="btn btn-next input-sm btn-block" style="width: 30%;background-color: #3385ff;border-color: #4cae4c;color: #fff;margin-left: 34%;">');
			}
			$actionHtml.find(".aboutRule >.aboutRuleConVal").children().remove();

			$.each(thisConVal, function(p, q) {
				$actionHtml.find(".aboutRule > .aboutRuleConVal").append("<div class='row paraVal' con=" + p + "><div class='col-md-4'>将<strong value = " + 1 + " thisRale = " + q["thisRale"] + ">" + q["thisConVal"] + "</strong>绑定到</div><div class='col-md-4 divSelectTable'></div><div class='col-md-4 divSelectConstol'></div></div>");
			});

		};

		/* 将参数绑定要字段放到新的页面*/
		var paraToHtml = function() {
			if ($actionHtml.find(".aboutRuleParaVal").find(".divSelectTable").children().length == 0) {
				$actionHtml.find(".aboutRuleParaVal").find(".divSelectTable").append($formList.clone());
				$actionHtml.find(".divReslutValue").find(".divSelectTable").append($formList.clone());
			}
			$actionHtml.find(".aboutRuleConVal").find(".divSelectTable").append($formList.clone());
			var queryId = $actionHtml.find(".formList:first option:first").attr("queryId");
			var fieldList = $(addNewData.getFieldList(queryId, $actionHtml)).find("select");
			if ($actionHtml.find(".aboutRuleParaVal").find(".divSelectConstol").children().length == 0) {
				$actionHtml.find(".aboutRuleParaVal").find(".divSelectConstol").empty().append(fieldList.clone());
			}
			$actionHtml.find(".aboutRuleConVal").find(".divSelectConstol").empty().append(fieldList.clone());

			/* 单击下一步选择结果值*/
			$actionHtml.find(".aboutRuleNext").unbind("click").on("click", "input[type=button]", function() {
				$(this).parents(".aboutRuleNext").empty();
				$actionHtml.find(".aboutRule").append("<div class='divReslutValue row' style ='border: 1px dashed #ccc'><div class='row' style='background-color:#d9edf7;'><span class='addNewResult action-autofill-add' title='继续添加结果值'></span><span class='deleteNewResult close action-autofill-del' title='删除' style='display:none'></span></div><div class='col-md-4'>那么结果值</div><div class='col-md-4 selectType'><select class='form-control' style='border:1px solid #bbb'><option value ='addResult'>新增数据</option><option value ='updateResult'>更新数据</option></select></div><div class='col-md-4 divSelectTable'></div><div class='selectCon row' ><div class='col-md-4'><span class='addNewAction action-autofill-add' title='继续添加字段'></span><span class='close action-autofill-del' style='display:none' title='删除'></span></div><div class='col-md-4 divSelectConstol'></div><div class='col-md-4'><input class='form-control input-sm'></div></div>");
				$actionHtml.find(".divReslutValue").find(".divSelectTable").append($formList.clone());
				$actionHtml.find(".selectCon").find(".divSelectConstol").empty().append(fieldList.clone());
			});

		};
		if ($actionHtml.find(".actionRuleTable").find("[name=ruleRadio]").size() == 1) {
			var thisConVal = [];
			$actionHtml.find(".actionRuleTable").find("[name=ruleRadio]").click();
			$.each($actionHtml.find(".actionRuleTable").find(".condVal"), function(key, value) {
				thisConVal.push({
					"thisConVal" : $(this).text(),
					"thisRale" : $(this).attr("thisRale")
				});
			});
			var paraVal = callRule.getParaVal(r, getRuleId);
			fileList(paraVal, condRela, thisConVal);
			paraToHtml();
		} else {
			$actionHtml.find(".actionRuleTable").unbind("click").on("click", "[name=ruleRadio]", function() {
				var thisConVal = [];
				$.each($(this).parents("tr").find(".condVal"), function(key, value) {
					thisConVal.push({
						"thisConVal" : $(this).text(),
						"thisRale" : $(this).attr("thisRale")
					});
				});
				var paraVal = callRule.getParaVal(r, getRuleId);
				fileList(paraVal, condRela, thisConVal);
				paraToHtml();
			});
		}
	};
	/* 获取所有规则 返回比规则表格
	 * @param   getRuleId 当前选中的规则  设置的规则JSON
	 * */
	function getRuleTable(r, getRuleId) {
		var ruleTable = "", ruleTr = "", titleTd = "<th>选择</th>";
		$.each(r, function(key, value) {
			var conRelaFont = "";
			if (getRuleId == value["id"]) {
				$.each(value["ruleData"], function(k, v) {
					ruleTr += "<tr><td><input type='radio' name='ruleRadio' trNum=" + k + "></td>";
					$.each(v["condition"], function(p, q) {
						if (k == 0) {
							titleTd += '<th>' + q["paraVal"] + '</th>';
						}
						switch(q["condRela"]) {
							case "eq" :
								conRelaFont = "等于";
								break;
							case "neq" :
								conRelaFont = "不等于";
								break;
							case "gt" :
								conRelaFont = "大于";
								break;
							case "lt" :
								conRelaFont = "小于";
								break;
							case "elt" :
								conRelaFont = "小于等于";
								break;
							case "egt" :
								conRelaFont = "大于等于";
								break;
							case "in" :
								conRelaFont = "包含";
								break;
							case "notin" :
								conRelaFont = "不包含";
								break;
							case "like" :
								conRelaFont = "匹配";
								break;
							case "notlike" :
								conRelaFont = "不匹配";
								break;
						}
						ruleTr += '<td><span class="condRela">' + conRelaFont + '</span><span class="condVal" thisRale ="' + q["condRela"] + '">' + q["condVal"]["value"] + '</span></td>';
					});
					$.each(v["result"], function(m, n) {
						ruleTr += '<td>' + n + '</td>';
					});
					ruleTr += "</tr>";
				});
			}

		});
		titleTd += '<th>结果</th>';
		ruleTable = '<table class="actionRuleTable" style="width:100%"><tr>' + titleTd + '</tr>' + ruleTr + '</table>';
		return ruleTable;
	}

	function event($obj) {
		$obj.on("change", ".formList", function() {
			var queryId = $(this).find("option:selected").attr("queryId");
			$obj.find(".fieldList .row:not(:first)").remove();
			var fieldList = $(addNewData.getFieldList(queryId, $obj)).find("select");
			$(this).closest(".row").find(".divSelectConstol").empty().append(fieldList);
		});

	}


	module.exports = callRule;
});
