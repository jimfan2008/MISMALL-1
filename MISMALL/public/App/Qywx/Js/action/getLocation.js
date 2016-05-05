/**
 * @desc 获取地理位置
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="getLocation"></div>';
	var getLocation = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "getLocation" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$actionHtml.find(".actionTitle").text("获取地理位置");
			ezCommon.actionClose($actionHtml);
			$actionHtml.find(".getLocation").append("<div class='col-md-3' style='padding:3px auto'><span>填充位置</span></div><div class='col-md-6'><input type='text' class='fillLocation form-control input-sm' readonly='readonly'/></div>");
			$("#ctrlActionList").append($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "getLocation"
			});
			addPananl($actionHtml.find(".fillLocation"), "ACTION2");
			return $actionHtml;
		},
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = [], ctrlName = $(".ctrlSelected").attr("ctrlId");

			$.each($actionObj.find(".fillLocation"), function(key, value) {
				var $this = $(this), dataType = $this.attr("dataType"), valueType = $this.attr("valueType"), value = $this.val();
				var cJson = '{"dataType" :"' + dataType + '","valueType" :"' + valueType + '", "value" :"' + value + '"}';
				ctrlJson.push(cJson);
			});

			if (ctrlJson.length <= 0)
				return ctrlJson;
			var ctrlActionJson = '"' + actionId + '":{"type":"getLocation","ctrl":{"' + ctrlName + '":' + ctrlJson.join("") + '}}';
			return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
			var $actionHtml = getLocation.action(actionName);
			$.each(actionJson["ctrl"], function(key, value) {
				$actionHtml.find(".fillLocation").attr({
					"dataType" : value["dataType"],
					"valueType" : value["valueType"],
					"value" : value["value"]
				});
			});
			
			return $actionHtml;
		}
	};

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = getLocation;
});
