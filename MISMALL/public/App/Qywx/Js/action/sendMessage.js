/**
 * @desc 发送消息
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require,exports,module){
	var htmlStr='<div class="row" style="margin-bottom:5px"><div class="col-md-3">消息类型</div><div class="col-md-9"><select class="form-control" id="messageType"><option>粉丝消息</option><option>待处理通知</option></select></div></div><div class="setMessage"><div class="row" style="margin-bottom:5px"><div class="col-md-3">联系人</div><div class="col-md-9"><input type="text" class="form-control sendToName" placeholder="选择联系人"></div></div><div class="row"><div class="col-md-3">消息内容</div><div class="col-md-9"><textarea isbasectrl="true" class="sendMessageTextarea form-control" name="CCRemark4"></textarea></div></div></div>';
   var  sendMessage={
   	         action : function(actionIdx) {
						var actionId = actionIdx ? actionIdx : "sendMessage" + ezCommon.actionNameNum[ezCommon.formId];
						var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
						$("#ctrlActionList").append($actionHtml);
						ezCommon.actionClose($actionHtml);
						$actionHtml.attr({
							"actionId" : actionId,
							"actionType" : "sendMessage"
						});
						$actionHtml.find(".actionTitle").text("发送消息");
						var ctrlLists = ezCommon.controlLists[ezCommon.formId];
						addPananl($(".sendToName"),"ACTION2");
						return $actionHtml;
		},
			json : function($actionObj) {
					var actionId = $actionObj.attr("actionId"), currControl = $("body").find(".ctrlSelected");
					var ctrlJson = '';
					//var pageId = $actionObj.find(".innerPage option:selected").val();
					var content = $actionObj.find(".sendMessageTextarea").val();
					var sendToName = $actionObj.find(".sendToName").val(), dataType = $actionObj.find(".sendToName").attr("dataType"), valueType = $actionObj.find(".sendToName").attr("valueType");
					var ctrlName = $(currControl.find("button")).attr("name");
					ctrlJson += '"' + ctrlName + '":{"content":"' + content + '","sendToName":"' + sendToName + '","dataType":"' + dataType + '","valueType":"' + valueType + '"}';
		
					if (ctrlJson == "")
						return ctrlJson;
					var ctrlActionJson = '"' + actionId + '":{"type":"sendMessage","ctrl":{' + ctrlJson + '}}';
		
					return ctrlActionJson;
					//return ctrlActionJson;
		},
		restore : function(actionJson, actionName) {
				var $actionHtml = sendMessage.action(actionName);
				$.each(actionJson["ctrl"], function(key, value) {
					$actionHtml.find(".sendMessageTextarea").val(value['content']);
					var nameObj = $actionHtml.find(".sendToName");
					nameObj.val(value['sendToName']);
					nameObj.attr("dataType", value['dataType']);
					nameObj.attr("valueType", value['valueType']);
					//$actionHtml.find(".innerPage option[value='"+value+"']").attr("selected","selected");
				});
				
				return $actionHtml;
		},
   };
   
   function addPananl($obj, array) {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js", function(e) {
			e.init(array, $obj, false);
		});
	}
   module.exports =sendMessage;
});
