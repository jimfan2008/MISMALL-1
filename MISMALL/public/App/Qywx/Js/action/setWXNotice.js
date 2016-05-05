/**
 * @desc 微信通知
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class=""><div class="row" style="margin-bottom: 5px;"><div class="col-md-3">通知类型</div><div class="col-md-9"><select class="form-control messageType"></select></div></div><div class="setMessage"></div>';
	var setWXNotice = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "setWXNotice" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			var $messageType = $actionHtml.find(".messageType");
			//var mTypeHtml = {
			//	"processed" : '<div class="col-md-12"><span>标题</span><input type="text" class="form-control proTitel" placeholder="标题"></div><div class="col-md-12"><span>通知内容</span><input type="text" class="form-control proContent" placeholder="通知内容"></div><div class="col-md-12"><span>通知人</span><input type="text" class="form-control proPeople" value="系统" placeholder="通知人"></div><div class="col-md-12"><span>接收人</span><input type="text" class="form-control proReceive" value="" placeholder="接收人"></div>' + '<span>详情链接</span><div class="col-md-12"><div class="col-md-12"><select class="innerPage form-control"></select></div></div><div class="row condition"></div>',
			//	};
			//根据获得的参数替换成相应的文本框
			var $setMessage = $actionHtml.find(".setMessage");
			_commonAjax({
				url : SITECONFIG.ROOTPATH + "/Qywx/Project/getWechatTemplateList",
				data : {
					siteId : SITECONFIG.SITEID
				},
				async : false,
				success : function(r) {
					var codeSn, title, messgeHtml = "";
						$.each(r, function(key, value) {
							messgeHtml += '<option value="' + value["codeSn"] + '">' + value["title"] + '</option>';
						});
						$messageType.append(messgeHtml);

				}
			});
			$("#ctrlActionList").append($actionHtml);
			$actionHtml.find(".actionTitle").text("微信通知提示");
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "setWXNotice"
			});
			mTypeHtml = getmTypeHtmlByTplId("OPENTM213722270");
			$actionHtml.find(".setMessage").append(mTypeHtml);
			messageOption($actionHtml);
			$messageType.on("change", function() {
				var tplId = $(this).val();
				var messageParam = "";
				$setMessage.empty();
				$actionHtml.find(".btn-default").remove();
				var mTypeHtml = getmTypeHtmlByTplId(tplId);
				$actionHtml.find(".setMessage").append(mTypeHtml);
				messageOption($actionHtml);
			});
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), currControl = ezCommon.Obj;
			var ctrlJson = '', nameArray = [];
			var messageType = $actionObj.find(".messageType").val();
			var $setMessage = $actionObj.find(".setMessage");
			var ctrlName = currControl.attr("ctrlId");
			if (messageType) {
				$.each($setMessage.find("input"), function() {
					nameArray.push($(this).attr("name"));
				});
				var dataJsonStr = "";
				$.each(nameArray, function(key, val) {
					var $_obj = $actionObj.find("input[name=" + val + "]");
					var dataType = $_obj.attr("dataType") ? $_obj.attr("dataType") : "constant";
					var value = $_obj.val();
					var valueType = $_obj.attr("valueType");
					if (dataType == "systemParam") {
						dataJsonStr += '"' + val + '":{"dataType":"systemParam","valueType":"' + valueType + '","inputVal":"' + value + '"},';
					} else if (dataType == "dataSource") {
						var filed = $_obj.attr("filed");
						valueType = $_obj.attr("queryId") ? $_obj.attr("queryId") : valueType;
						dataJsonStr += '"' + val + '":{"dataType":"dataSource","valueType":"' + valueType + '","filed":"' + filed + '","inputVal":"' + value + '"},';
					} else if (dataType == "form") {
						dataJsonStr += '"' + val + '":{"dataType":"form","valueType":"' + valueType + '","inputVal":"' + value + '"},';
					} else {
						dataJsonStr += '"' + val + '":{"dataType":"constant","inputVal":"' + value + '"},';
					}
				});
				dataJsonStr = dataJsonStr.substring(0, dataJsonStr.length - 1);
				if (dataJsonStr) {
					dataJsonStr = '{' + dataJsonStr + '}';
				}
				var paramJson = '', toPageId = "";
				var pageId = $actionObj.find(".innerPage option:selected").val();
				if (pageId && pageId != "0") {
					toPageId = '"pageId":"' + pageId + '",';
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
				} else {
					toPageId = '"pageId":"0",';
					//没有跳转的页面
				}
				ctrlJson += '"' + ctrlName + '":{"proType":"' + messageType + '","proJson":' + dataJsonStr + ',' + toPageId + '"paramItem":[' + paramJson + ']}';
			}
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"setWXNotice","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = setWXNotice.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				//$actionHtml.find(".proTitel").val(value["proTitel"]), $actionHtml.find(".proContent").val(value["proTitel"]), $actionHtml.find(".proPeople").val(value["proPeople"]);
				var proType = value["proType"], proJson = value["proJson"], paramItem = value["paramItem"], pageId = value["pageId"];
				mTypeHtml = getmTypeHtmlByTplId(proType);
				$actionHtml.find(".setMessage").empty().append(mTypeHtml);
				messageOption($actionHtml);
				$.each(proJson, function(k, v) {
					$actionHtml.find(".messageType>option[value='" + proType + "']").attr("selected", "selected");
					var $_obj = $actionHtml.find("input[name=" + k + "]");
					var dataType = v["dataType"];
					var inputVal = v["inputVal"];
					if (dataType == "dataSource") {
						var filed = v["filed"];
						var valueType = v["valueType"];
						$_obj.attr({
							"dataType" : "dataSource",
							"filed" : filed,
							"valueType" : valueType,
						});
					} else if (dataType == "systemParam") {
						var valueType = v["valueType"];
						$_obj.attr({
							"dataType" : "systemParam",
							"valueType" : valueType
						});
					} else if (dataType == "form") {
						var valueType = v["valueType"];
						$_obj.attr({
							"dataType" : "form",
							"valueType" : valueType
						});
					} else {
						$_obj.attr({
							"dataType" : "constant"
						});
					}
					$_obj.val(inputVal);
				});
				var ctrlId = ezCommon.Obj.attr("ctrlId"), paramJson = ezCommon.panal(ctrlId, $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
				$actionHtml.find(".innerPage option[value='" + pageId + "']").attr("selected", "selected");
				$.each(paramItem, function(key, val) {
					var $paramItem = $('<div class="row setParamItem" style="margin-bottom:8px"><div class="col-md-3" style="line-height:2.5;text-align: center;">链接参数</div><div class="col-md-4"><input type="text" placeholder="设置参数名称" class="paramKey form-control input-sm " style="border:1px solid #CCC;"/></div><div class="col-md-4"><input type="text" class="paramVal form-control input-sm " placeholder="设置参数值"  dataType="constant" style="border:1px solid #CCC;"/></div><div class="col-md-1"><button class="close" type="button" style="margin:2px 8px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');
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
							"valueType" : val["paramValue"][ctrlId]["ctrl"]
						});
					}
					$paramVal.val(val["paramValue"][ctrlId]["paramVal"]);
					ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
					addPananl($paramItem.find(".paramVal"),"ACTION2");
				});
			});
			
			return $actionHtml;
		}
	};
	function getmTypeHtmlByTplId(tplId) {
		var mTypeHtml = "";
		_commonAjax({
			url : SITECONFIG.ROOTPATH + "/Qywx/Project/getWechatTemplateInfo",
			data : {
				tplId : tplId,
				siteId : SITECONFIG.SITEID
			},
			async : false,
			success : function(r) {

					messageParam = "}} " + r["formatData"] + "<div class='row' style='margin-bottom: 5px;'><div class='col-md-3'>备注：</div>{{Remark.DATA}}</div><div class='row' style='margin-bottom: 5px;'><div class='col-md-3'> 接收人：</div>{{proReceive.DATA}}</div>";
					mTypeHtml = messageParam.replace(/}} (.*?)：/g, "}}<div class='row' style='margin-bottom: 5px;'><div class='col-md-3'><span>\$1 " + ':' + "</span></div>");
					mTypeHtml = mTypeHtml.replace(/{{(.*?).DATA}}/g, "<div class='col-md-9'><input type='text' class='form-control ' placeholder='' name='\$1' /></div></div>").replace("}}", "");
					mTypeHtml = '<div class="row" style="margin-bottom: 5px;"><div class="col-md-3">标题</div><div class="col-md-9"><input type="text"  class="form-control" name = "first"></div></div>' + mTypeHtml + '<div class="row" style="margin-bottom: 5px;"><div class="col-md-3">详情链接：</div><div class="col-md-9"><select class="innerPage form-control"></select></div></div>';
			}
		});
		return mTypeHtml;
	};
	function messageOption($actionHtml) {
		$actionHtml.find("input").hover(function() {
			var $rowThis = $(this);
			addPananl($rowThis,"ACTION1");
		}, function() {
			$('span[aria-hidden="true"]', $(this)).hide();
		});

		var optionHtml = "<option value='0'>--不设置--</option>";
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
		var selVal = $actionHtml.find(".innerPage").val();
		if (selVal == "0") {
			$paramBtn.hide();
			$actionHtml.find(".setParamItem").hide();
		}
		$actionHtml.find(".innerPage").change(function() {
			selVal = $(this).val();
			if (selVal == "0") {
				$paramBtn.hide();
				$actionHtml.find(".setParamItem").hide();
			} else {
				$paramBtn.show();
				$actionHtml.find(".setParamItem").show();
			}
		});
		var paramJson = ezCommon.panal($(".ctrlSelected").attr("ctrlId"), $(".selectedForm").parent().attr("id"), $actionHtml.find("select option:selected").attr("value"));
		$paramBtn.unbind("click").click(function() {
			var $paramItem = $('<div class="row setParamItem" style="margin-bottom:8px"><div class="col-md-3" style="line-height:2.5;text-align: center;">链接参数</div><div class="col-md-4"><input type="text" placeholder="设置参数名称" class="paramKey form-control input-sm " style="border:1px solid #CCC;"/></div><div class="col-md-4"><input type="text" class="paramVal form-control input-sm " placeholder="设置参数值"  dataType="constant" style="border:1px solid #CCC;"/></div><div class="col-md-1"><button class="close" type="button" style="margin:2px 8px 0 0;"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button></div></div>');
			var $paramVal = $paramItem.find(".paramVal");
			$actionHtml.append($paramItem);
			$paramItem.find(".close").unbind("click").click(function() {
				$paramItem.remove();
			});
			ezCommon.followPanal($paramItem.find(".paramKey"), $("#followPanal"));
			addPananl($paramVal,"ACTION2");
		});
	};
	function bindEvent($obj, actionId) {
		var $objs = $($obj.parents(".actionWarp")).find(">.row");
		$obj.find(".row").hover(function() {
			var $rowThis = $(this);
			var value = $(this).find("select option:selected").attr("value").replace(/\d/g, "");
			$('span[aria-hidden="true"]', $obj.find(".actionWarp>.row")).hide();
			if ($("[actionId=" + actionId + "]").find(".actionWarp>.row").size() > 1) {
				$('span[aria-hidden="true"]', $rowThis).show();
			}
			addPananl($rowThis.find("input"),"ACTION2");
		}, function() {
			$('span[aria-hidden="true"]', $(this)).hide();
		});
	}

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = setWXNotice;
});
