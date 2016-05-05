/**
 * @desc 控件隐藏与显示
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="showHide"></div>';
	var ctrlHideOrShow = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "ctrlHideOrShow" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "ctrlHideOrShow"
			});
			$actionHtml.find(".actionTitle").text("控件隐藏显示");
			var ctrlDynamic = $(".selectedForm").find(".ctrl");
			var ctrlForm = $(".selectedForm").find(".ctrl");
			//<option title="文本框1" ctrltype="TEXTBOX" ctrlid="TEXTBOX1">文本框1</option>
			var option = '<div class = "shUnit" style = "margin-top:5px;padding:5px;"><div class = "row" style = "margin:0;"><div class="col-md-3" style="margin-top:6px;">选择控件</div><div class="col-md-5" style="padding:0px;margin:0px"><select class="form-control  input-sm CtrlList">';
			$.each(ctrlDynamic, function() {
				var $this = $(this), ctrlId = $this.attr("ctrlId"), ctrlType = $this.attr("ctrlType") || $this.attr("ctrl-type"), ctrlName = $this.attr("mycompname") || $this.attr("fieldtitle") || $this.find(".dynamicName:first").text() || $this.find(".fieldTitle:first").text();
				if (ctrlType == "BUTTON") {
					ctrlName = $this.find("input").attr("value");
				}
				option += '<option ctrlId="' + ctrlId + '" ctrlType = "' + ctrlType + '" title = "' + ctrlName + '">' + ctrlName + '</option>';
			});
			option += '</select><div class="action-caret formCtrl-caret"></div></div><div class="col-md-4" style="padding:0px;margin:0px"><div class="switch ctrl-css-switch-lock" data-animated="false"><input data-size="small" data-on-color="info" type="checkbox" name="' + actionId + '" value="hide"/></div></div></div><div class = "row" style="margin:15px 0 5px;border-top:1px solid #ccc;padding-top: 15px;"><button class="btn btn-default input-sm addCondition" style = "border-radius:0;background:#ccc;">添加条件</button></div><div class="condition"></div>';
			$actionHtml.find(".showHide").append(option);
			var num = 0;
			$actionHtml.find(".addNewAction").unbind("click").click(function() {
				num++;
				var row = $(option);
				row.find("input[type='check']").attr("name", actionId + num + "s");
				$(row.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionId + num + "s" + '" value="hide"/>');
				$actionHtml.find(".showHide").append(row);
				eventSwitch(false, row.closest(".showHide"));
			});
			eventSwitch(false, $actionHtml.find(".showHide"));
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId");
			var ctrlJson = '';
			$actionObj.find(".shUnit").each(function(i) {
				var $jThis = $(this);
				var ctrlName = $jThis.find(".CtrlList option:selected").attr("ctrlId"), css = $jThis.find("input[type='checkbox']").attr("value");
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
			var ctrlActionJson = '"' + actionId + '":{"type":"ctrlHideOrShow","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), action = actionJson["ctrl"], $actionHtml = ctrlHideOrShow.action(actionName), $rowFirst = $actionHtml.find(".showHide>.col-md-12:first");
			//var ctrlLists = ezCommon.controlLists[formId];
			var ctrlLists = $(".selectedForm").find("[ctrl-type ='ctrl-dynamic'],.formCtrl");
			var num = 0, htmlStr = '', rowStr = $rowFirst.wrap().parent().html();
			$actionHtml.find(".showHide>.col-md-12:first").remove();
			$.each(action, function(k, v) {
				var $rowStr = $(rowStr);
				$actionHtml.find(".showHide").append($rowStr);
				if (v["css"] == "hide") {
					$($rowStr.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionName + num + "s" + '" value="hide"/>');
					eventSwitch(false, $rowStr);
				} else {
					$($rowStr.find(".ctrl-css-switch-lock")).html('<input data-size="small" data-on-color="info" type="checkbox" name="' + actionName + num + "s" + '" value="show"/>');
					eventSwitch(true, $rowStr);
				}
				$rowStr.find(".CtrlList option[ctrlId='" + k + "']").attr("selected", "selected");
				if (v["dataType"]) {
					var queryId = v["queryId"];
					getQuery($rowStr);
					getFields(queryId, $rowStr);
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
			$obj.find(".UnlockQueryField:first").html(filedSelect + "</select><div class='action-caret field-caret'>");
			addPananl($obj.find(".conValue"), "ACTION1");
			$obj.find(".UnlockQueryField .conValue").val(null).removeAttr("queryId dataType");
		});
	}

	function getQuery($obj) {
		var qSelect = '<div style="margin-top:15px;margin-bottom:15px" class="row"><div style="text-align:right;padding:0px;margin:6px 0 0;" class="col-md-2">动态数据</div><div class="UnlockQuery col-md-8"><select class="form-control  input-sm  ">';
		_commonAjax({
			url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
			data : {
				'flowId' : 1,
				'siteId' : SITECONFIG.SITEID
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
	}

	function eventSwitch(flag, $obj) {
		$("[type='checkbox']", $obj).bootstrapSwitch({
			state : flag,
			onText : "显示",
			offText : "隐藏",
		}).unbind('switchChange.bootstrapSwitch').on('switchChange.bootstrapSwitch', function(event, state) {
			preventDefault(event);
			stopEventBubble(event);
			state ? $(this).attr("value", "show") : $(this).attr("value", "hide");
		});

		$obj.find(">.shUnit").hover(function() {
			var $rowThis = $(this);
			$('span[aria-hidden="true"]', $obj.find(".content>.col-md-12")).hide();
			$('span[aria-hidden="true"]', $rowThis).show();
			if ($(this).find(".conValue").length > 0) {
				addPananl($(this).find(".conValue"), "ACTION1");
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
	}

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = ctrlHideOrShow;
});
