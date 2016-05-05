/**
 * @desc 生成二维码
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="col-md-12"><span>二维码生成后返回的控件</span><input type="text"class="form-control returnControl"></div><div class="col-md-12"><span>*可以绑定展示图片</span></div><div class="row"><div class="col-md-6"><select class="innerPage form-control"></select></div><div class="col-md-6"><button class="btn btn-default input-sm addCondition">添加条件</button></div></div><div class="row condition"></div>';
	var generatedQrcode = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "generatedQrcode" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "generatedQrcode"
			});
			$actionHtml.find(".actionTitle").text("生成二维码");
			var optionHtml = "";
			$("#pageMgr").find(".pageList").not(".addStatus").each(function(key, item) {
				var pageId = $(this).attr("pageId"), pageName = $(this).find(".custom_page_name").text();
				optionHtml += '<option value="' + pageId + '">' + pageName + '</option>';
			});
			$.each(ezCommon.menuJson, function(i, v) {
				if ($.isEmptyObject(v.subMenu)) {
					optionHtml += '<option value="' + i + '">' + decodeURIComponent(v.menuName) + '</option>';
				} else {
					$.each(v.subMenu, function(m, n) {
						optionHtml += '<option value="' + m + '">' + decodeURIComponent(n.menuName) + '</option>';

					});
				}
			});
			$actionHtml.find(".innerPage").append(optionHtml);
			var $paramBtn = $('<button class="btn btn-default btn input-sm" type="button" style="margin-left:10px;line-height:2px;margin-bottom:10px;"><span class="glyphicon glyphicon-plus"></span>添加参数</button>');
			$actionHtml.append($paramBtn);
			var paramJson = ezCommon.panal($(".ctrlSelected").attr("ctrlId"), $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
			$paramBtn.unbind("click").click(function() {
				var $paramItem = $('<p class="setParamItem" style="margin-left:10px;"><span><input class="paramKey" type="text" placeholder="设置参数名称" style="border:1px solid #CCC;"></span><span> : </span><span><input class="paramVal" type="text" dataType="constant" style="border:1px solid #CCC;" placeholder="设置参数值"></span><span><button class="close" type="button" style="margin:2px 20px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></span></p>');
				$actionHtml.append($paramItem);
				$paramItem.find(".close").unbind("click").click(function() {
					$paramItem.remove();
				});
				var $paramVal = $paramItem.find(".paramVal");
				ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
				addPananl($paramVal, "ACTION3");
			});
			$(".addCondition", $actionHtml).unbind("click").click(function() {
				generatedQrcode.getQuery($actionHtml);
				var queryId = $actionHtml.find(".UnlockQuery select option:first").attr("queryId");
				generatedQrcode.getFields(queryId, $actionHtml);
				addPananl($actionHtml.find(".conValue"), "ACTION1");
			});
			$actionHtml.find(".returnControl").hover(function() {
				var $rowThis = $(this);
				addPananl($rowThis, "ACTION3");
			}, function() {
				$('span[aria-hidden="true"]', $(this)).hide();
			});
			return $actionHtml;
		},

		//json动作
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '', paramJson = '', TPJson = '';
			var currControl = $("body").find(".ctrlSelected");
			var pageId = $actionObj.find(".innerPage option:selected").val();
			if (pageId) {
				ctrlJson = '"pageId":"' + pageId + '"';
			}
			$actionObj.find(".row").each(function(i) {
				//var $phone = $(".returnControl", $(this));
				var returnControl = $(".returnControl").val(), ctrlId = $(".returnControl").attr("valuetype");
				//var ctrlName = $(currControl).attr("ctrl-type");
				//TPJson += '"' + ctrlName + '":{"returnControl":"' + returnControl + '","ctrlId" :"' + ctrlId + '"},';
				var formId = $("body").find(".selectedForm").attr("id");
				TPJson = '"' + formId + '":{"returnControl":"' + returnControl + '","ctrlId" :"' + ctrlId + '"},';
			});
			TPJson = TPJson.substr(0, TPJson.length - 1);
			if (TPJson == "")
				return TPJson;

			var whereJump = '"notwhere"';
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
					} else if (paramType == "form" || paramType == "controls") {
						var valuetype = $(this).find(".paramVal").attr("valuetype");
						paramJson += '{"restore":"' + restore + '","paramName" : "' + paramName + '","paramKey":"' + paramKey + '","paramValue" :{"' + ctrlId + '":{"paramNameType" : "' + paramNameType + '","paramType" : "' + paramType + '","paramVal" : "' + paramVal + '","ctrl":"' + valuetype + '"}}},';
					}
				}
			});
			paramJson = paramJson.substring(0, paramJson.length - 1);
			var ctrlActionJson = '"' + actionId + '":{"type":"generatedQrcode","ctrl":{' + ctrlJson + '},"TP":{' + TPJson + '},"paramItem":[' + paramJson + '],"whereJump":' + whereJump + '}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = generatedQrcode.action(actionName);
			ezCommon.actionClose($actionHtml);
			$.each(actionJson["ctrl"], function(key, value) {
				$actionHtml.find(".innerPage option[value='" + value + "']").attr("selected", "selected");
			});
			var ctrlId = $(".ctrlSelected").attr("ctrlId"), paramJson = ezCommon.panal(ctrlId, $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
			$.each(actionJson["paramItem"], function(key, val) {
				var $paramItem = $('<p class="setParamItem" style="margin-left:10px;"><span><input class="paramKey" type="text" placeholder="设置参数名称" style="border:1px solid #CCC;"></span><span> : </span><span><input class="paramVal" type="text" style="border:1px solid #CCC;" placeholder="设置参数值"></span><span><button class="close" type="button" style="margin:2px 20px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></span></p>');
				$actionHtml.append($paramItem);
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
				} else if (dataType == "form" || dataType == "controls") {
					$paramVal.attr({
						"dataType" : dataType,
						"valueType" : val["paramValue"][ctrlId]["ctrl"],
					});
				}
				$paramVal.val(val["paramValue"][ctrlId]["paramVal"]);
				ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
				addPananl($paramItem.find(".paramVal"), "ACTION1");
			});

			$.each(actionJson["TP"], function(key, value) {
				$(".returnControl", $actionHtml).val(value["returnControl"]);
			});

			if (actionJson["whereJump"] != "notwhere") {
				var queryId = actionJson["whereJump"]["queryId"];
				generatedQrcode.getQuery($actionHtml);
				generatedQrcode.getFields(queryId, $actionHtml);
				$actionHtml.find(".UnlockQuery select option[queryId='" + queryId + "']").attr("selected", "selected");
				$actionHtml.find(".UnlockQueryField select option[value='" + actionJson["whereJump"]["queryField"] + "']");
				$actionHtml.find(".conditionFlag option[value='" + actionJson["whereJump"]["conditionFlag"] + "']");
				$actionHtml.find(".conValue").val(actionJson["whereJump"]["conValue"]).attr({
					"dataType" : actionJson["whereJump"]["dataType"],
					"valueType" : actionJson["whereJump"]["valueType"],

				});
				addPananl($actionHtml.find(".conValue"), "ACTION1");
			}
			$actionHtml.find(".setParamItem .close").unbind("click").click(function() {
				$(this).closest(".setParamItem").remove();
			});
			
			return $actionHtml;
		}
	};

	function getFields(dataId, $obj) {
		var filedSelect = '<select class="form-control input-sm">';
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
		$obj.find(".UnlockQueryField:first").html(filedSelect + "</select>");

		$obj.find(".UnlockQuery").change(function() {
			var $soption = $(this).find("option:selected"), queryId = $soption.attr("queryId"), ctrlId = $soption.attr("ctrlId");
			var queryField = ezCommon.getQueryField(queryId);
			var filedSelect = '<select class="form-control input-sm">';
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
			$obj.find(".UnlockQueryField:first").html(filedSelect + "</select>");
			addPananl($obj.find(".conValue"), "ACTION1");
			$obj.find(".UnlockQueryField .conValue").val(null).removeAttr("queryId dataType");
		});
	}

	function getQuery($obj) {
		var qSelect = '<div class="UnlockQuery col-md-3"><select class="form-control  input-sm  ">';
		_commonAjax({
			url : ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				'flowId' : FLOWID,
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
		qSelect += '</select></div><div class="UnlockQueryField col-md-3"></div><div class="col-md-3"><select class="form-control  input-sm conditionFlag "><option value="=">等于</option><option value="!=">不等于</option></select></div><div class="col-md-3"><input type="text" class="form-control  input-sm conValue" dataType="constant"></div>';
		$obj.find(".condition").html(qSelect);

	}

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = generatedQrcode;
});
