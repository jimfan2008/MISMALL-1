/**
 * @desc 支付
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="setPay"></div>';
	var setPay = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "setPay" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "setPay"
			});
			//<option value="zhifubao">支付宝支付</option>
			var payType = '<div class="payType row"  style="margin-bottom:5px;"><div class="col-md-12"><div class="col-md-4"><span>支付方式:</span></div><div class="col-md-6"><select class="form-control input-sm"><option value="weixin">微信支付</option></select></div></div></div>';
			var queryId = $(".ctrlSelected").closest("[ctrl-type='ctrl-dynamic']").attr("formid"), option = "";
			/*
			 if (queryId) {
			 var queryField = ezCommon.getQueryField(queryId);
			 var querierData = queryField["querierData"];
			 if (objIsnull(querierData)) {
			 $.each(querierData["selectFields"], function(key, value) {
			 if (value["tableName"]) {
			 option += '<option tableName="' + value["tableName"] + '" value="' + value["tableName"] + "_" + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			 } else {
			 option += '<option tableName="' + value["tableName"] + '" ctrlId="' + value["fieldId"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			 }
			 });
			 }
			 }*/

			$.each($(".selectedForm").find(".formCtrl,[ctrl-type='ctrl-text']"), function() {
				var ctrlId = $(this).attr("ctrlId") || $(this).attr("fieldname"), ctrlName = $(this).find(".fieldTitle").text() || $(this).find(".fieldDataTitle").text();
				if ($(this).attr("ctrlId")) {
					option += '<option ctrlId="' + ctrlId + '" title="' + ctrlName + '" value="' + ctrlId + '">' + ctrlName.replace(":", "") + '</option>';
				} else {
					option += '<option ctrlId="' + ctrlId + '" title="' + ctrlName + '" value="' + ctrlId + '" tableName = "' + ctrlId.split("_")[0] + "_" + ctrlId.split("_")[1] + '">' + ctrlName.replace(":", "") + '</option>';
				}
			});

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

			// var productsPrice = '<div class="productsPrice row"><div class="col-md-3"><span>商品价格:</span></div><div class="col-md-6"><select class="form-control input-sm">' + option + '</select></div></div>';
			// var productsName = '<div class="productsName row"><div class="col-md-3"><span>商品名称:</span></div><div class="col-md-6"><select class="form-control input-sm">' + option + '</select></div></div>';
			// var jumpPage = '<div class="jumpPage row"><div class="col-md-3"><span>选择跳转页面:</span></div><div class="col-md-6"><select  class="form-control input-sm">' + optionHtml + '</select></div><div class="col-md-3" style="display:none"><button style="line-height:2px;margin-bottom:10px;" type="button" class="btn btn-default btn input-sm"><span class="glyphicon-plus"></span>添加参数</button></div></div>';
			// var ordanNum = '<div class="orderNum row"><div class="col-md-3"><span>订单号:</span></div><div class="col-md-6"><select class="form-control input-sm">' + option + '</select></div></div>';

			var productsPrice = '<div class="productsPrice row"  style="margin-bottom:5px;"><div class="col-md-4"><span>商品价格<span style="color:red"> *</span></span></div><div class="col-md-6"><input class="form-control input-sm"/></div></div>';
			var productsName = '<div class="productsName row"  style="margin-bottom:5px;"><div class="col-md-4"><span>商品名称<span style="color:red"> *</span></span></div><div class="col-md-6"><input class="form-control input-sm"/></div></div>';
			var jumpPage = '<div class="jumpPage row"  style="margin-bottom:5px;"><div class="col-md-4"><span>选择跳转页面:</span></div><div class="col-md-6"><select  class="form-control input-sm"><option value="__blank">选择跳转页面</option>' + optionHtml + '</select></div><div class="col-md-3 addParamButton" style="display:none"><button style="line-height:2px;margin-bottom:10px;" type="button" class="btn btn-default btn input-sm"><span class="glyphicon-plus"></span>添加参数</button></div></div><div class="pageParam"></div>';
			var ordanNum = '<div class="orderNum row"  style="margin-bottom:5px;"><div class="col-md-4"><span>订单号<span style="color:red;display:none"> *</span></span></div><div class="col-md-6"><input class="form-control input-sm"/></div></div>';

			$actionHtml.find(".actionTitle").text("支付设置");
			$actionHtml.find(".setPay").append(payType + productsName + productsPrice + ordanNum + jumpPage);
			addPananl( $actionHtml.find(".setPay .productsPrice input"),"ACTION3");
			addPananl( $actionHtml.find(".setPay .productsName input"),"ACTION3");
			addPananl( $actionHtml.find(".setPay .orderNum input"),"ACTION3");
			bindEvent($actionHtml);
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"),
			// tableName = $actionObj.find(".productsName select option:selected").attr("tableName"),
			// productsPrice = $actionObj.find(".productsPrice select option:selected").attr("value"),
			// productsName = $actionObj.find(".productsName select option:selected").attr("value"),
			// ctrlIdPrice = $actionObj.find(".productsPrice select option:selected").attr("ctrlId"),
			// ctrlIdName = $actionObj.find(".productsName select option:selected").attr("ctrlId"),
			// productsOrder = $actionObj.find(".orderNum select option:selected").attr("value"),
			// ctrlIdOrder = $actionObj.find(".orderNum select option:selected").attr("ctrlId"), pageId = $actionObj.find(".jumpPage select option:selected").attr("value"),
			// shanghuName = $actionObj.find(".shanghuName").val(),
			// shanghuPass = $actionObj.find(".shanghuPass").val(),

			productsPrice = $actionObj.find(".productsPrice input").val(), productsName = $actionObj.find(".productsName input").val(), productsOrder = $actionObj.find(".orderNum input").val(), ctrlIdPrice = $actionObj.find(".productsPrice input").attr("filed") || $actionObj.find(".productsPrice input").attr("valueType"), ctrlIdName = $actionObj.find(".productsName input").attr("filed") || $actionObj.find(".productsName input").attr("valueType"), ctrlIdOrder = $actionObj.find(".orderNum input").attr("filed") || $actionObj.find(".orderNum input").attr("valueType"), pageId = $actionObj.find(".jumpPage select option:selected").attr("value"), tableName = "undefined", payType = $actionObj.find(".payType select option:selected").attr("value");
			if (ctrlIdName) {
				if (ctrlIdName.split("_").length >= 3) {
					tableName = ctrlIdName.split("_")[0] + "_" + ctrlIdName.split("_")[1];
				}
			}

			var paramJson = '', toPageId = "";
			var pageId = $actionObj.find(".jumpPage select option:selected").val();
			if (pageId && pageId != "__blank") {
				toPageId = '"pageId":"' + pageId + '",';
				$actionObj.find(".pageParamItem").each(function() {
					var $paramKey = $(this).find(".paramName"), restore = $paramKey.attr("restore"), paramKey = $.trim($paramKey.val()), paramName = $paramKey.attr("paramname"), paramNameType = $paramKey.attr("dataType"), paramVal = $.trim($(this).find(".paramValue").val()), ctrlId = $(".ctrlSelected").attr("ctrlId");
					if (paramKey != "" && paramVal != "") {
						var paramType = $(this).find(".paramValue").attr("datatype");
						if (!paramName) {
							paramName = numRand();
						}
						if (paramType == "constant" || paramType == "currDataID") {
							paramJson += '{"restore":"' + restore + '","paramName" : "' + paramName + '","paramKey":"' + paramKey + '","paramValue" :{"' + ctrlId + '":{"paramNameType" : "' + paramNameType + '","paramType" : "' + paramType + '","paramVal" : "' + paramVal + '"}}},';
						} else if (paramType == "form" || paramType == "controls") {
							var valuetype = $(this).find(".paramValue").attr("valuetype");
							paramJson += '{"restore":"' + restore + '","paramName" : "' + paramName + '","paramKey":"' + paramKey + '","paramValue" :{"' + ctrlId + '":{"paramNameType" : "' + paramNameType + '","paramType" : "' + paramType + '","paramVal" : "' + paramVal + '","ctrl":"' + valuetype + '"}}},';
						}
					}
				});
				paramJson = paramJson.substring(0, paramJson.length - 1);
			}
			ctrlJson = '"' + $(".selectedForm").parent().attr("id") + '":{"ctrlIdOrder":"' + ctrlIdOrder + '","productsOrder":"' + productsOrder + '","productsPrice":"' + productsPrice + '","productsName":"' + productsName + '","tableName":"' + tableName + '","ctrlIdPrice":"' + ctrlIdPrice + '","ctrlIdName":"' + ctrlIdName + '" ,"payType":"' + payType + '","pageId":"' + pageId + '"}';
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"setPay","ctrl":{' + ctrlJson + '},' + toPageId + '"paramItem" : [' + paramJson + ']}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = setPay.action(actionName), productsPrice = "", pageId = "", productsName = "", payType = "";
			$.each(actionJson["ctrl"], function(key, value) {
				productsPrice = value["productsPrice"];
				productsName = value["productsName"];
				payType = value["payType"];
				pageId = value["pageId"];
				//$actionHtml.find(".orderNum select option[value='" + value["ctrlIdOrder"] + "']").attr("selected", "selected");
				$actionHtml.find(".orderNum input").val(value["productsOrder"]).attr("valueType", value["ctrlIdOrder"]);
				$actionHtml.find(".productsPrice input").val(value["productsPrice"]).attr("valueType", value["ctrlIdPrice"]);
				$actionHtml.find(".productsName input").val(value["productsName"]).attr("valueType", value["ctrlIdName"]);
			});

			if (actionJson["pageId"] != "__blank") {
				var ctrlId = $(".ctrlSelected").attr("ctrlId"), paramJson = ezCommon.panal(ctrlId, $(".selectedForm").parent().attr("id"), $actionHtml.find(".jumpPage select option:selected").attr("value"));
				$actionHtml.find(".addParamButton").show();
				$.each(actionJson["paramItem"], function(key, val) {
					var $paramItem = $('<div class="pageParamItem row"  style="margin-bottom:5px;"><div class="col-md-5"  style="padding-right:0px"><input type="text" class="form-control input-sm paramName"></div><div class="col-md-1" style="text-align: center;"><span>:</span></div><div class="col-md-5"  style="padding-left:0px"><input type="text" class="form-control input-sm paramValue"></div><div class="col-md-1"><button style="margin:2px 4px 0 0;" type="button" class="close removeParam"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');
					$actionHtml.find(".pageParam").append($paramItem);
					$paramItem.find(".paramName").val(val["paramKey"]).attr({
						"dataType" : val["paramValue"][ctrlId]["paramNameType"],
						"paramName" : val["paramName"],
						"restore" : "true"
					});
					var $paramVal = $paramItem.find(".paramValue");
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
					ezCommon.followPanal($paramItem.find(".paramName"), $("#followPanal"));
					addPananl( $paramItem.find(".paramValue"),"ACTION2");
				});
			}
			$actionHtml.find(".payType select option[value='" + payType + "']").attr("selected", "selected");
			$actionHtml.find(".jumpPage select option[value='" + pageId + "']").attr("selected", "selected");
			$actionHtml.find(".removeParam").off("click").on("click", function() {
				$(this).closest(".row").remove();
			});
			
			return $actionHtml;
			// $actionHtml.find(".productsPrice select option[value='" + productsPrice + "']").attr("selected", "selected");
			// $actionHtml.find(".productsName select option[value='" + productsName + "']").attr("selected", "selected");
		}
	};
	function bindEvent($actionHtml) {
		$actionHtml.find(".jumpPage select").on("change", function() {
			if ($(this).val() == "__blank") {
				$actionHtml.find(".addParamButton").hide();
				$actionHtml.find(".pageParam").empty();
			} else {
				$actionHtml.find(".addParamButton").show();
			}
		});

		$actionHtml.find(".addParamButton button").on("click", function() {
			var paramHtml = $('<div class="pageParamItem row"  style="margin-bottom:5px;"><div class="col-md-5"  style="padding-right:0px"><input type="text" class="form-control input-sm paramName"></div><div class="col-md-1" style="text-align: center;"><span>:</span></div><div class="col-md-5"  style="padding-left:0px"><input type="text" class="form-control input-sm paramValue"></div><div class="col-md-1"><button style="margin:2px 4px 0 0;" type="button" class="close removeParam"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');
			$actionHtml.find(".pageParam").append(paramHtml);
			$actionHtml.find(".removeParam").off("click").on("click", function() {
				$(this).closest(".row").remove();
			});
			var paramJson = ezCommon.panal($(".ctrlSelected").attr("ctrlId"), $(".selectedForm").parent().attr("id"), $actionHtml.find(".jumpPage select option:selected").attr("value"));
			ezCommon.followPanal(paramHtml.find(".paramName"), $("#followPanal"));
			addPananl( paramHtml.find(".paramValue"),"ACTION2");
		});
	};

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = setPay;
});
