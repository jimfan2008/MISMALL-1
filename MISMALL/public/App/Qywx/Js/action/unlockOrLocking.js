/**
 * @desc 锁定解锁控件
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="content row"></div>';
	var unlockOrLocking = {
		action : function(actionIdx) {
			var currControl = $("body").find(".ctrlSelected");
			var currControlName = currControl.find(".fieldTitle").html();
			var currControlType = currControl.attr("ctrltype");
			var actionId = actionIdx ? actionIdx : "unlockOrLocking" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "unlockOrLocking"
			});

			$actionHtml.find(".actionTitle").text("锁定解锁控件");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			
			var optionCon = '<div class = "shUnit" style = "margin-top:5px;padding:5px;"><div class = "row" style = "margin:0;"><div class="col-md-3" style="margin-top:6px;">选择控件</div><div class="col-md-5" style="padding:0px;margin:0px"><select class="form-control  input-sm CtrlList">';
			$.each(ctrlLists, function(key, value) {
				if (key) {
					optionCon += '<option value="' + key + '">' + value["attrs"]["general"]["ctrlTitle"] + '</option>';
				}

			});
			optionCon += '</select><div class="action-caret formCtrl-caret"></div></div><div class="col-md-4" style="padding:0px;margin:0px"><div class="switch ctrl-css-switch-lock" data-animated="false"><input data-size="small" data-on-color="info" type="checkbox" name="' + actionId + '" value="hide"/></div></div></div><div class = "row" style="margin:15px 0 5px;border-top:1px solid #ccc;padding-top: 15px;"><button class="btn btn-default input-sm addCondition" style = "border-radius:0;background:#ccc;">添加条件</button></div><div class="condition"></div>';
			$actionHtml.find(".content").append(optionCon);
			var num = 0;
			$actionHtml.find(".addNewAction").unbind("click").click(function() {
				num++;
				var row = $(optionCon);
				row.find("input[type='check']").attr("name", actionId + num + "s");
				$(row.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionId + num + "s" + '" value="disabled"/>');
				$actionHtml.find(".content").append(row);

				eventSwitch(false, row);
			});

			eventSwitch(false, $actionHtml.find(".content>.shUnit"));
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			$actionObj.find(".shUnit").each(function(i) {
				var $jThis = $(this);
				var ctrlName = $jThis.find(".CtrlList option:selected").attr("value"), css = $jThis.find("input[type='checkbox']").attr("value");
				if ($jThis.find(".UnlockQuery").length) {
					var queryId = $jThis.find(".UnlockQuery option:selected").attr("queryId");
					var queryField = $jThis.find(".UnlockQueryField option:selected").attr("value");
					var $input = $jThis.find(".conValue"), queryValue = $input.val(), dataType = $input.attr("dataType"), valueType = $input.attr("valueType");
					ctrlJson += '"' + ctrlName + '":{ "dataType":"' + dataType + '","valueType":"' + valueType + '","css":"' + css + '","queryId" :"' + queryId + '","queryField": "' + queryField + '","queryValue":"' + queryValue + '"},';
				} else {
					ctrlJson += '"' + ctrlName + '":{ "css":"' + css + '"},';
				}
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"unlockOrLocking","ctrl":{' + ctrlJson + '}}';

			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), action = actionJson["ctrl"], $actionHtml = unlockOrLocking.action(actionName), $rowFirst = $actionHtml.find(".content>.shUnit:first");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			var num = 0, htmlStr = '', rowStr = $rowFirst.wrap().parent().html();
			$actionHtml.find(".content>.shUnit:first").remove();
			$.each(action, function(k, v) {
				var $rowStr = $(rowStr);
				$actionHtml.find(".content").append($rowStr);
				if (v["css"] == "enabled") {
					$($rowStr.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionName + num + "s" + '" value="enabled"/>');
					eventSwitch(true, $rowStr);
				} else {
					$($rowStr.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionName + num + "s" + '" value="disabled"/>');
					eventSwitch(false, $rowStr);
				}
				$rowStr.find(".CtrlList option[value='" + k + "']").attr("selected", "selected");
				if (v["dataType"]) {
					var queryId = v["queryId"];
					unlockOrLocking.getQuery($rowStr);
					unlockOrLocking.getFields(queryId, $rowStr);
					$(".addCondition", $rowStr).html("移除条件");
					$rowStr.find(".UnlockQuery select option[queryId='" + queryId + "']").attr("selected", "selected");
					$rowStr.find(".conValue").attr("dataType", v["dataType"]).val(v["queryValue"]);
					$rowStr.find(".UnlockQueryField select option[value='" + v["queryField"] + "']").attr("selected", "selected");
				}
				num++;
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
		$obj.find(".UnlockQueryField:first").html(filedSelect + "</select><div class='action-caret field-caret'></div>");

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
			$obj.find(".UnlockQueryField:first").html(filedSelect + "</select><div class='action-caret field-caret'></div>");
			$obj.find(".UnlockQueryField .conValue").val(null).removeAttr("queryId dataType");
			addPananl($obj.find(".conValue"),"ACTION1");
		});
	};

	function getQuery($obj) {
		var qSelect = '<div style="margin-top:15px;margin-bottom:15px" class="row"><div style="text-align:right;padding:0px;margin:6px 0 0;" class="col-md-2">动态数据</div><div class="UnlockQuery col-md-8"><select class="form-control  input-sm  ">';
		_commonAjax({

			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				'siteId' : SITECONFIG.SITEID,
				'flowId' : 1,
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
		qSelect += '</select><div class="action-caret dataSousce-caret"></div></div></div><div class="row"><div style="text-align:right;padding:0px;margin:6px 0 0;" class="col-md-2">字段</div><div class="UnlockQueryField col-md-8"></div></div><div class="row" style="margin-top:15px"><div class="col-md-2"></div><div class="condition col-md-3" style="text-align:center;padding-right:0px"><select class="form-control input-sm"><option>等于</option></select><div class="action-caret deng-caret"></div></div><div class="col-md-5"  ><input type="text" class="form-control  input-sm conValue" datatype="constant"></div></div>';
		$obj.find(".condition").html(qSelect);
	};
	function eventSwitch(flag, $obj) {
		$("[type='checkbox']", $obj).bootstrapSwitch({
			state : flag,
			onText : "启用",
			offText : "禁用",
		}).unbind('switchChange.bootstrapSwitch').on('switchChange.bootstrapSwitch', function(event, state) {
			preventDefault(event);
			stopEventBubble(event);
			state ? $(this).attr("value", "enabled") : $(this).attr("value", "disabled");
		});

		$($obj.parents(".content")).find(">.shUnit").hover(function() {
			var $rowThis = $(this);
			$('span[aria-hidden="true"]', $obj.find(".content>.shUnit")).hide();
			$('span[aria-hidden="true"]', $rowThis).show();
			if ($(this).find(".conValue").length > 0) {
				addPananl($(this).find(".conValue"),"ACTION1");
			}
			$(".close", $rowThis).unbind("click").on("click", function() {
				$rowThis.remove();
			});
		}, function() {
			$('span[aria-hidden="true"]', $(this)).hide();
		});

		$(".addCondition", $obj).click(function() {
			if ($obj.find(".UnlockQuery").length > 0) {
				$obj.find(".condition").empty();
				$(this).html("添加条件");
			} else {
				$(this).html("移除条件");
				getQuery($(this).closest(".shUnit"));
				var queryId = $obj.find(".UnlockQuery select option:first").attr("queryId");
				getFields(queryId, $obj);
			}
		});
	};

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array,$obj,false);
		});
	}


	module.exports = unlockOrLocking;
});
