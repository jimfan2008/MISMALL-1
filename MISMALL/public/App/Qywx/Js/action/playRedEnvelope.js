/**
 * @desc 发红包动作
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	
	var htmlStr = '<div class="playRedEnvelope"><div class="row" style="margin-bottom:5px"><div class="col-md-4"><span>提供方名称 :</span></div><div class="col-md-6"><input type="text" class="form-control input-sm nick_name"></div></div><div class="row"  style="margin-bottom:5px"><div class="col-md-4"><span>红包发送者 :</span></div><div class="col-md-6"><input type="text" class="form-control input-sm send_name"></div></div><div class="row"  style="margin-bottom:5px"><div class="col-md-4"><span>红包接收用户:</span></div><div class="col-md-6"><input type="text" class="form-control input-sm re_openid"></div></div><div class="row"  style="margin-bottom:5px" ><div class="col-md-4"><span>红包金额 :</span></div><div class="col-md-6"><input type="text" class="form-control input-sm total_amount"></div></div><div class="row"  style="margin-bottom:5px"><div class="col-md-4"><span>红包祝福语:</span></div><div class="col-md-6"><input type="text" class="form-control input-sm wishing"></div></div><div class="row"  style="margin-bottom:5px"><div class="col-md-4"><span>活动名称 :</span></div><div class="col-md-6"><input type="text" class="form-control input-sm act_name"></div></div><div class="row"  style="margin-bottom:5px"><div class="col-md-4"><span>备注信息:</span></div><div class="col-md-6"><input type="text" class="form-control input-sm remark"></div></div></div>';
	var playRedEnvelope = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "playRedEnvelope" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "playRedEnvelope"
			});
			$actionHtml.find(".actionTitle").text("发红包");
			$actionHtml.find(".re_openid").hover(function() {
				var $rowThis = $(this);
				addPananl($rowThis,"ACTION2");
			}, function() {
				$('span[aria-hidden="true"]', $(this)).hide();
			});
			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionid"), ctrlJson = '';
			/*
			 * @param nick_name: 红包提供方名称
			 * @send_name :红包发送者名称
			 * @re_openid： 接受红包用户
			 * @total_amount ：付款金额
			 * @wishing:红包祝福语
			 * @act_name：活动名称
			 * @remark：备注信息
			 * */
			var nick_name = $actionObj.find(".nick_name").val(), send_name = $actionObj.find(".send_name").val(), total_amount = $actionObj.find(".total_amount").val(), wishing = $actionObj.find(".wishing").val(), act_name = $actionObj.find(".act_name").val(), remark = $actionObj.find(".remark").val();
			var $_obj = $actionObj.find(".re_openid");
			var dataType = $_obj.attr("dataType") ? $_obj.attr("dataType") : "constant";
			var value = $_obj.val();
			var valueType = $_obj.attr("valueType");
			var re_openidJsonStr = "";
			if (dataType == "systemParam") {
				re_openidJsonStr += '{"dataType":"systemParam","valueType":"' + valueType + '","inputVal":"' + value + '"}';
			} else if (dataType == "dataSource") {
				var filed = $_obj.attr("filed");
				re_openidJsonStr += '{"dataType":"dataSource","valueType":"' + valueType + '","filed":"' + filed + '","inputVal":"' + value + '"}';
			} else if (dataType == "form") {
				re_openidJsonStr += '{"dataType":"form","valueType":"' + valueType + '","inputVal":"' + value + '"}';
			} else {
				re_openidJsonStr += '{"dataType":"constant","inputVal":"' + value + '"}';
			}
			ctrlJson += '"nick_name":"' + nick_name + '","send_name":"' + send_name + '","re_openid":' + re_openidJsonStr + ',"total_amount":"' + total_amount + '","wishing":"' + wishing + '","act_name":"' + act_name + '","remark":"' + remark + '"';
			if (ctrlJson == "") {
				return ctrlJson;
			}
			var ctrlActionJson = '"' + actionId + '":{"type":"playRedEnvelope","ctrl":{' + ctrlJson + '}}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionHtml = playRedEnvelope.action(actionName), nick_name = "", send_name = "", total_amount = "", wishing = "", act_name = "", remark = "";
			nick_name = actionJson["ctrl"]["nick_name"];
			send_name = actionJson["ctrl"]["send_name"];
			re_openidJsonStr = actionJson["ctrl"]["re_openid"];
			total_amount = actionJson["ctrl"]["total_amount"];
			wishing = actionJson["ctrl"]["wishing"];
			act_name = actionJson["ctrl"]["act_name"];
			remark = actionJson["ctrl"]["remark"];
			var $_obj = $actionHtml.find(".re_openid");
			var dataType = re_openidJsonStr["dataType"];
			var inputVal = re_openidJsonStr["inputVal"];
			if (dataType == "dataSource") {
				var filed = re_openidJsonStr["filed"];
				var valueType = re_openidJsonStr["valueType"];
				$_obj.attr({
					"dataType" : "dataSource",
					"filed" : filed,
					"valueType" : valueType
				});
			} else if (dataType == "systemParam") {
				var valueType = re_openidJsonStr["valueType"];
				$_obj.attr({
					"dataType" : "systemParam",
					"valueType" : valueType
				});
			} else if (dataType == "form") {
				var valueType = re_openidJsonStr["valueType"];
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

			$actionHtml.find(".nick_name").val(nick_name);
			$actionHtml.find(".send_name").val(send_name);
			$actionHtml.find(".total_amount").val(total_amount);
			$actionHtml.find(".wishing").val(wishing);
			$actionHtml.find(".act_name").val(act_name);
			$actionHtml.find(".remark").val(remark);
			
			return $actionHtml;
		},
	};

	function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}


	module.exports = playRedEnvelope;
});
