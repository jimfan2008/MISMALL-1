/**
 * @desc 自动填充动作
 * @author 柯斌
 * @date 2015-06-26
 */
define(function(require, exports, module) {
	var htmlStr = '<button class="btn btn-default input-sm addNewAction" style="width:80px;margin:10px 0 0 12px;background:#00ccff;border:0px;border-radius:0px;color:#ffffff">添加</button><div style="margin:10px 0px" class="row"><div class ="col-md-2" style="margin: 6px 0px 0px; padding: 0px; text-align: center;">控件</div><div style="margin:0px 0px 0px; padding: 0px 10px 0px 0px;" class="col-md-4"><select class="form-control  input-sm ctrlArray"></select><div class="action-caret formCtrl-caret"></div></div><div class="col-md-1" style="margin: 8px 0px 0px; padding: 0px; text-align: center;">等于</div><div style="padding: 0px 0px 0px 10px" class="col-md-4"><input type="text" datatype="constant" class="form-control input-sm fillVal"></div><div class="col-md-1" style="padding:0px"><span class="close action-autofill-del">-</span></div></div>';
	var autoFill = {
		//设置
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "autoFill" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#container #ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "autoFill"
			});
			$actionHtml.find(".actionTitle").text("自动填充");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			if (!ctrlLists)
				return false;
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"];
				if (ctrlType == "TEXTBOX" || ctrlType == "DROPDOWN" || ctrlType == "TEXTAREA" ) {
					var ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
					$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
			});


			bindEvent($actionHtml, actionId);
			return $actionHtml;
		},

		//动作json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = '';
			$actionObj.find(".row").each(function() {
				var ctrlName = $(this).find(".ctrlArray").val(), $fill = $(this).find(".fillVal"), fillVal = $fill.val();
				var dataType = $fill.attr("dataType"), valueType = $fill.attr("valueType");
				var filed = $fill.attr("filed");
				if (dataType != "constant") {
					if (filed) {
						ctrlJson += '"' + ctrlName + '":{"dataType":"dataSource","value":"' + fillVal + '","filed" : "' + filed + '", "queryId":"' + valueType + '"},';
					} else {
						ctrlJson += '"' + ctrlName + '":{"dataType":"' + dataType + '", "valueType" :"' + valueType + '", "value":"' + fillVal + '"},';
					}
				} else {
					ctrlJson += '"' + ctrlName + '":{"dataType":"' + dataType + '","value":"' + fillVal + '"},';
				}
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);

			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"autoFill","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},

		//还原
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), action = actionJson["ctrl"], $actionHtml = autoFill.action(actionName), $rowFirst = $actionHtml.find(".row:first");
			$actionHtml.find(".row").remove();
			$.each(action, function(k, v) {
				var dataType = v["dataType"], $row = $rowFirst.clone(true);
				$actionHtml.find(".actionWarp").append($row);
				$row.find(".ctrlArray").val(k);
				$row.find(".fillVal").val(v["value"]);
				if (dataType == "dataSource") {
					$row.find(".fillVal").attr({
						"valueType" : v["queryId"],
						"dataType" : dataType,
						"filed" : v["filed"]
					});
				} else if (dataType == "systemParam") {
					$row.find(".fillVal").attr({
						"dataType" : dataType,
						"valueType" : v["valueType"]
					});
				}
				bindEvent($actionHtml, $actionHtml.attr("actionId"));
			});
			
			return $actionHtml;
		}
	};

	function bindEvent($obj, actionId) {
		var $objs = $($obj.parents(".actionWarp")).find(">.row");
		//继续
		$obj.find(".addNewAction").unbind("click").on("click", function() {
			var $row = $obj.find(".row:first").clone();
			//$actionHtml.find(".addNewAction").before($row);
			$obj.find(".row:last").after($row);
			$row.find(".ctrlArray option:first").attr("selected", "selected");
			$row.find(".fillVal").val("").attr("dataType", "constant");
			bindEvent($obj, actionId);
		});
		$obj.find(".action-autofill-del").unbind("click").on("click", function() {
			if ($obj.find(".row").length > 1) {
				$(this).closest(".row").remove();
			}
		});

		$obj.find(".row").hover(function() {
			var $rowThis = $(this);
			var value = $(this).find("select option:selected").attr("value").replace(/\d/g, "");
			$('span[aria-hidden="true"]', $obj.find(".actionWarp>.row")).hide();
			if ($("[actionId=" + actionId + "]").find(".actionWarp>.row").size() > 1) {
				$('span[aria-hidden="true"]', $rowThis).show();
			}
			$('span[aria-hidden="true"]', $rowThis).show();
			addPananl($rowThis.find("input"),value);
		}, function() {
			$('span[aria-hidden="true"]', $(this)).hide();
		});

	}
	
	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = autoFill;
});
