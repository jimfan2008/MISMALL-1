/**
 * @desc 层切换
 * @author 唐苗
 * @date 2016-4-14
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row"  style="margin-top:15px;"><div class="col-md-3" style="padding-top:7px">选择层</div><div class="col-md-9"><select class="innerPage form-control"></select><div class="action-caret page-caret"></div></div>';
	var layerSwitch = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "layerSwitch" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#container #ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "layerSwitch"
			});
			$actionHtml.find(".actionTitle").text("层切换");
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
			var paramJson = ezCommon.panal($(".ctrlSelected").attr("ctrlId"), $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
			$(".addLinkParam", $actionHtml).unbind("click").click(function() {
				var $paramItem = $('<div class="row setParamItem" style="margin-bottom:8px"><div class="col-md-3" style="line-height:2.5;text-align: center;">链接参数</div><div class="col-md-4"><input type="text" placeholder="设置参数名称" class="paramKey form-control input-sm " style="border:1px solid #CCC;"/></div><div class="col-md-4"><input type="text" class="paramVal form-control input-sm " placeholder="设置参数值"  dataType="constant" style="border:1px solid #CCC;"/></div><div class="col-md-1"><button class="close" type="button" style="margin:2px 8px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');

				$actionHtml.find(".linkParam").append($paramItem);
				$paramItem.find(".close").unbind("click").click(function() {
					$paramItem.remove();
				});
				var $paramVal = $paramItem.find(".paramVal");
				ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
				addPananl($paramVal, "ACTION3");
			});

			$(".addCondition", $actionHtml).unbind("click").click(function() {
				var flag = $(this).attr("flag");
				if (flag == "false") {
					getQuery($actionHtml);
					var queryId = $actionHtml.find(".UnlockQuery select option:first").attr("queryId");
					getFields(queryId, $actionHtml);
					addPananl($actionHtml.find(".conValue"), "ACTION3");
					$(this).attr("flag", "true").text("取消条件");
				} else if (flag == "true") {
					$(this).attr("flag", "false").text("新增条件");
					$actionHtml.find(".condition").empty();
				}
			});

			$(".link", $actionHtml).unbind("click").click(function() {
				var $this = $(this);
				if ($this.hasClass("selectLink"))
					return;
				$(".selectLink", $actionHtml).css({
					"background" : "#f5f5f5",
					"color" : "#ccc"
				}).removeClass("selectLink");
				$this.addClass("selectLink").css({
					"background" : "#00ccff",
					"color" : "#ffffff"
				});
				if ($this.hasClass("selectOuterLink")) {
					$(".outerLink", $actionHtml).show();
					$(".innerLink", $actionHtml).hide();
				} else {
					$(".outerLink", $actionHtml).hide();
					$(".innerLink", $actionHtml).show();
				}
			});
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = '', paramJson = '', whereJump = '"notwhere"';
			if ($(".selectLink", $actionObj).hasClass("selectOuterLink")) {
				ctrlJson = '"pageId":"' + $(".outLinkValue ").val() + '","linkType" : "outerLink"';
			} else {
				var pageId = $actionObj.find(".innerPage option:selected").val();
				var formId = $actionObj.find(".innerPage option:selected").attr("class");
				if (pageId) {
					ctrlJson = '"pageId":"' + pageId + '","formId":"' + formId + '","linkType" : "innerLink"';
				}
				var $condition = $actionObj.find(".condition");
				if ($condition.find(".UnlockQuery").length > 0) {
					var queryId = $actionObj.find(".UnlockQuery select option:selected").attr("queryId");
					var queryField = $actionObj.find(".UnlockQueryField select option:selected").attr("value");
					var conditionFlag = $actionObj.find(".conditionFlag option:selected").attr("value");
					var conValue = $actionObj.find(".conValue").val();
					var dataType = $actionObj.find(".conValue").attr("dataType");
					var valueType = $actionObj.find(".conValue").attr("valueType");
					whereJump = '{"queryId":"' + queryId + '","queryField":"' + queryField + '","conditionFlag":"' + conditionFlag + '","conValue":"' + conValue + '","dataType":"' + dataType + '","valueType":"' + valueType + '"}';
				}
				$actionObj.find(".setParamItem").each(function() {
					var $paramKey = $(this).find(".paramKey"), restore = $paramKey.attr("restore"), paramKey = $.trim($paramKey.val()), paramName = $paramKey.attr("paramname"), paramNameType = $paramKey.attr("dataType"), paramVal = $.trim($(this).find(".paramVal").val()), ctrlId = $(".ctrlSelected").attr("ctrlId");
					if (paramKey != "" && paramVal != "") {
						var paramType = $(this).find(".paramVal").attr("datatype");
						if (!paramName) {
							paramName = numRand();
						}
						if (paramType == "constant" || paramType == "currDataID") {
							paramJson += '{"restore":"' + restore + '","paramName" : "' + paramName + '","paramKey":"' + paramKey + '","paramValue" :{"' + ctrlId + '":{"paramNameType" : "' + paramNameType + '","paramType" : "' + paramType + '","paramVal" : "' + paramVal + '"}}},';
						} else if (paramType == "form" || paramType == "controls" || paramType.match(/compLogic/)) {
							var valuetype = $(this).find(".paramVal").attr("valuetype");
							paramJson += '{"restore":"' + restore + '","paramName" : "' + paramName + '","paramKey":"' + paramKey + '","paramValue" :{"' + ctrlId + '":{"paramNameType" : "' + paramNameType + '","paramType" : "' + paramType + '","paramVal" : "' + paramVal + '","ctrl":"' + valuetype + '"}}},';
						}
					}
				});
				paramJson = paramJson.substring(0, paramJson.length - 1);
			}
			var logicStruck = "";
			if (layerSwitch.logicJson) {
				logicStruck = ',"logic" : ' + layerSwitch.logicJson + ',"logicStr" : "' + layerSwitch.logicStr + '"';
			}
			var ctrlActionJson = '"' + actionId + '":{"type":"layerSwitch","ctrl":{' + ctrlJson + '},"paramItem":[' + paramJson + '],"whereJump":' + whereJump + logicStruck + '}';
			// console.log(ctrlActionJson,666);
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = layerSwitch.action(actionName), layerSwitchType = "", ctrl = actionJson["ctrl"];
			ezCommon.actionClose($actionHtml);
			layerSwitchType = ctrl["linkType"];
			if (layerSwitchType == "outerLink") {
				$(".outLinkValue ", $actionHtml).val(ctrl["pageId"]);
				$(".outerLink", $actionHtml).show();
				$(".innerLink", $actionHtml).hide();
				$(".selectLink", $actionHtml).css({
					"background" : "#f5f5f5",
					"color" : "#ccc"
				}).removeClass("selectLink");
				$(".selectOuterLink", $actionHtml).addClass("selectLink").css({
					"background" : "#00ccff",
					"color" : "#ffffff"
				});
			} else {
				$(".outerLink", $actionHtml).hide();
				$(".innerLink", $actionHtml).show();
				$actionHtml.find(".innerPage option[value='" + ctrl["pageId"] + "']").attr("selected", "selected");
				var ctrlId = ezCommon.Obj.attr("ctrlId"), paramJson = ezCommon.panal(ctrlId, $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
				$.each(actionJson["paramItem"], function(key, val) {
					var $paramItem = $('<div class="row setParamItem" style="margin-bottom:8px"><div class="col-md-3" style="line-height:2.5;text-align: center;">链接参数</div><div class="col-md-4"><input type="text" placeholder="设置参数名称" class="paramKey form-control input-sm " style="border:1px solid #CCC;"/></div><div class="col-md-4"><input type="text" class="paramVal form-control input-sm " placeholder="设置参数值"  dataType="constant" style="border:1px solid #CCC;"/></div><div class="col-md-1"><button class="close" type="button" style="margin:2px 8px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');
					$actionHtml.find(".linkParam").append($paramItem);
					$paramItem.find(".paramKey").val(val["paramKey"]).attr({
						"dataType" : val["paramValue"][ctrlId]["paramNameType"],
						"paramName" : val["paramName"],
						"restore" : "true"
					});
					var $paramVal = $paramItem.find(".paramVal");
					var dataType = val["paramValue"][ctrlId]["paramType"];
					if (dataType == "constant" || dataType == "currDataID") {
						$paramVal.attr({
							"dataType" : dataType
						});
					} else if (dataType == "form" || dataType == "controls" || dataType.match(/customComponent/)) {
						$paramVal.attr({
							"dataType" : dataType,
							"valueType" : val["paramValue"][ctrlId]["ctrl"],
						});
					}
					$paramVal.val(val["paramValue"][ctrlId]["paramVal"]);
					ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
					addPananl($paramItem.find(".paramVal"), "ACTION3");
				});

				if (actionJson["whereJump"] != "notwhere") {
					var queryId = actionJson["whereJump"]["queryId"];
					getQuery($actionHtml);
					getFields(queryId, $actionHtml);
					$actionHtml.find(".UnlockQuery select option[queryId='" + queryId + "']").attr("selected", "selected");
					$actionHtml.find(".UnlockQueryField select option[value='" + actionJson["whereJump"]["queryField"] + "']");
					$actionHtml.find(".conditionFlag option[value='" + actionJson["whereJump"]["conditionFlag"] + "']");
					$actionHtml.find(".conValue").val(actionJson["whereJump"]["conValue"]).attr({
						"dataType" : actionJson["whereJump"]["dataType"],
						"valueType" : actionJson["whereJump"]["valueType"],

					});
					addPananl($actionHtml.find(".conValue"), "ACTION3");
				}
				$actionHtml.find(".setParamItem .close").unbind("click").click(function() {
					$(this).closest(".setParamItem").remove();
				});

			}
			layerSwitch.actionName = actionJson["logicStr"];

			return $actionHtml;
		},

		logic : {

			leftStruck : function($obj) {
				return '<div class="handleLogic-content" funcName="layerSwitch" type="inner"><span>选择页面</span> <span style="border: 1px solid #ccc;display: inline-block;height: 25px;margin-left: 10px;padding: 3px 0 0;text-align: center;width: 119px;">-- 请选择 --</span></div><div class="handleLogic-content" funcName="layerSwitch" type="outer"><span>链接地址</span><span style="border: 1px solid #ccc;display: inline-block;height: 25px;margin-left: 10px;padding: 3px 0 0;text-align: center;width: 119px;">填写链接地址</span></div>';
			},
			contextStruck : function($obj) {
				var name = $obj.attr("funcName");
				return {
					inner : '<span>选择页面</span><select  style="color:#000000;margin-left:10px;width:50%;text-align:center;border:1px solid #ccc "><>' + $obj.find(".innerLink .innerPage").html() + '</select>',
					outer : '<span>填写链接地址</span><input type="text" placeholder="填写链接地址" style="border-radius:0;margin-left:10px">'
				};
			},
			init : function() {

			},

			dataStruck : function() {

				return '';
			},
			setLogicRelust : function($obj) {
				var value = $obj.find("input").val();
				if ($obj.attr("type") == "inner") {
					value = $obj.find("select option:selected").attr("value");
				}
				$obj.attr("restoreResult", value);

				return {
					"type" : "content",
					"flag" : "true",
					"funcName" : $obj.attr("funcName"),
					"value" : "'" + value + "'"
				};
			},

			restoreResult : function($obj) {
				var type = $obj.attr("type"), value = $obj.attr("restoreResult");
				if (type == "inner") {
					$obj.find("select option[value='" + value + "']").attr("selected", "selected");
				} else {
					$obj.find("input").val(value);
				}
			},
			save : function(logicJson, $action) {
				var logicStr = $(".editorLogicDesign .right").html();
				layerSwitch.logicJson = JSON.stringify(logicJson);
				layerSwitch.logicStr = logicStr.replace(/"/g, "'");
				$(".editorLogicDesign").hide();
			}
		}

	};

	function getFields(dataId, $obj) {

		var filedSelect = '	<div class="col-md-3" style="padding-top:5px">字段</div><div class="col-md-9"><select class="form-control input-sm">';
		if (dataId) {
			var queryField = ezCommon.getQueryField(dataId);
			var querierData = queryField["querierData"];
			if (objIsnull(querierData)) {
				$.each(querierData["selectFields"], function(key, value) {
					if (value["tableName"]) {
						filedSelect += '<option tableName="' + value["tableName"] + '" value="' + value["tableName"] + "_" + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
					} else {
						filedSelect += '<option tableName="' + value["tableName"] + '" value="' + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
					}
				});
			}
		} else {
			filedSelect += '<option tableName="" value="" title="">--------</option>';
		}
		$obj.find(".UnlockQueryField:first").html(filedSelect + "</select><div class='action-caret field-caret'></div></div>");

		$obj.find(".UnlockQuery").change(function() {
			var $soption = $(this).find("option:selected"), queryId = $soption.attr("queryId"), ctrlId = $soption.attr("ctrlId");
			var queryField = ezCommon.getQueryField(queryId);
			var filedSelect = '<div class="col-md-3" style="padding-top:5px">字段</div><div class="col-md-9"><select class="form-control input-sm">';
			var querierData = queryField["querierData"];
			if (objIsnull(querierData)) {
				$.each(querierData["selectFields"], function(key, value) {
					if (value["tableName"]) {
						filedSelect += '<option tableName="' + value["tableName"] + '" value="' + value["tableName"] + "_" + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
					} else {
						filedSelect += '<option tableName="' + value["tableName"] + '" value="' + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
					}
				});
			}
			$obj.find(".UnlockQueryField:first").html(filedSelect + "</select><div class='action-caret field-caret'></div></div>");
			addPananl($obj.find(".conValue"), "ACTION3");
			$obj.find(".UnlockQueryField .conValue").val(null).removeAttr("queryId dataType");
		});
	};
	function getQuery($obj) {

		var qSelect = '<div class="UnlockQuery col-md-12" style="padding:10px 0px;"><div style="padding-top:5px" class="col-md-3">动态数据</div><div class="col-md-9"><select class="form-control  input-sm">';
		_commonAjax({
			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				'flowId' : 1,
				"siteId" : SITECONFIG.SITEID
			},
			async : false,
			dataType : "json",
			success : function(r) {
				if (r) {
					$.each(r, function(key, value) {
						qSelect += '<option queryId="' + value["ID"] + '" title="' + value["querierName"] + '"><label>' + value["querierName"] + '</label></option>';
					});
				}
			}
		});
		qSelect += '</select><div class="action-caret dataSousce-caret"></div></div></div><div class="UnlockQueryField col-md-12" style="margin-bottom:5px;padding:0px;margin-top:5px"></div><div class="col-md-3"></div><div class="col-md-9" style="padding:0px"><div class="col-md-6"><select class="form-control  input-sm conditionFlag "><option value="=">等于</option><option value="!=">不等于</option></select><div class="action-caret deng-caret"></div></div><div class="col-md-6" style="padding-left:0px"><input type="text" class="form-control  input-sm conValue" dataType="constant" ></div></div>';
		$obj.find(".condition").html(qSelect);
	};

	function addPananl($obj, array) {
		$obj.hover(function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
				e.init(array, $obj, false);
			});
		}, function() {

		});
	}


	module.exports = layerSwitch;
});
