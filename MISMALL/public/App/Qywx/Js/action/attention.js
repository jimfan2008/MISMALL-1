/**
 * @desc 关注公共号
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module){
	 var htmlStr ='<div class="row  attention"><div class="col-md-3"><span>公众号</span></div><div class="gongzhonghao col-md-6"><input type="text" class="form-control  input-sm  wxValue"></div></div>';
     var  attention={
		   	action : function(actionIdx) {
					var actionId = actionIdx ? actionIdx : "attention" + ezCommon.actionNameNum[ezCommon.formId];
					var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
					$("#ctrlActionList").append($actionHtml);
					ezCommon.actionClose($actionHtml);
					$actionHtml.attr({
						"actionId" : actionId,
						"actionType" : "attention"
					});
					$actionHtml.find(".actionTitle").text("关注公众号");
					return $actionHtml;
		},
		json : function($actionObj) {
				var gongzhonghao = $actionObj.find(".wxValue").val();
				var actionId = $actionObj.attr("actionId");
				var ctrlJson = '';
				var ctrlName = $(".ctrlSelected").attr("ctrlId");
				ctrlJson += '"' + ctrlName + '":{"gongzhonghao":"' + gongzhonghao + '"}';
				if (ctrlJson == "")
					return ctrlJson;
				var ctrlActionJson = '"' + actionId + '":{"type":"attention","ctrl":{' + ctrlJson + '}}';
				return ctrlActionJson;
		},

		restore : function(actionJson, actionName) {
				var $actionHtml = attention.action(actionName);
				$.each(actionJson["ctrl"], function(key, value) {
					$(".wxValue", $actionHtml).val(value["gongzhonghao"]);
				});
				
				return $actionHtml;
		}
	};
	 module.exports= attention;
});
