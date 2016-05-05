/**
 * @desc 
 * @author 
 * @date 
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row" style="margin:10px line-height:10px"><div class="col-md-5" style="line-height:30px">选择组件：</div><div class="col-md-6 "><select class="form-control input-sm ctrlArray"></select></div><div class="col-md-5" style="line-height:30px">选择控件：</div><div class="col-md-6 "><select class="form-control input-sm compArray"></select></div><div class="col-md-5" style="line-height:30px">运算条件：</div><div class="col-md-6 "><select class="form-control input-sm aluArray"><option class="operate" type="jia" value="相加">相加</option><option class="operate" type="cheng" value="相乘">相乘</option></select></div><div class="col-md-5" style="line-height:30px">赋值给：</div><div class="col-md-6 "><select class="form-control input-sm resultArray"></select></div></div>';
	var ComponentOperation = {
		action: function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "ComponentOperation" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			$actionHtml.attr({
				"actionId": actionId,
				"actionType": "ComponentOperation"
			});
			ezCommon.actionClose($actionHtml);
			$actionHtml.find(".actionTitle").text("值运算");
			
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"], ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
				if (ctrlType == "TEXTBOX" || ctrlType == "REMARK" || ctrlType == "RADIO") {
				$actionHtml.find(".resultArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
				if (ctrlType == "compLogic") {
					if(ctrlTitle=="自定义组件模板"){
					   //$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + "未绑定数据集" + '</option>');	
					}
					else{
						$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
					}
				}
				
			
			
			});
			
			var updateCompArray = function(ctrlArrayVal) {
				var ctrlArrayVal = $actionHtml.find(".ctrlArray option:selected").val();
				var $compLogic = $("[ctrlId="+ctrlArrayVal+"]");
				$actionHtml.find(".compArray").find("option").remove();
				if($compLogic.length > 0) {
					 $thisisField = $compLogic.find(".thisisField");
					var optionHTML = '<option class="field"></option>';
					$actionHtml.find(".compArray").empty();
					$.each($thisisField, function(index, that) {
						var $optionHTML = $(optionHTML), $that = $(that);
						var fielName = $that.attr("fieldname"), fieldTitle = $that.attr("fieldTitle")
						$optionHTML.attr({"key":fielName,"value":fieldTitle}).text(fieldTitle);
						$actionHtml.find(".compArray").append($optionHTML);
					
					});
				}
			};
			updateCompArray();
			$actionHtml.find(".ctrlArray").unbind("change").change(function(){
			    updateCompArray();
			});
			return $actionHtml;
		},
		//json
		json: function($actionObj) {
			
			var actionId = $actionObj.attr("actionId"), ctrlJson = '';
			var ctrlName = $actionObj.find(".ctrlArray").find("option:selected").val();
			var compName = $actionObj.find(".compArray").find("option:selected").attr("key");
			var aluName =$actionObj.find(".aluArray").find("option:selected").attr("value");
			var resultName= $actionObj.find(".resultArray").val();
			var ctrlJson = '{"ctrlName" :"' + ctrlName + '","compName" :"' + compName + '","aluName" :"' + aluName + '","resultName" :"' + resultName + '"}';
			if (ctrlJson == "")
				return ctrlJson;
			var ctrlActionJson ='"' + actionId + '":{"type":"ComponentOperation","ctrl":' + ctrlJson + '}';
				console.log(ctrlActionJson);
				return ctrlActionJson;
		},
		//还原
		restore: function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), 
			action = actionJson["ctrl"],
			$actionHtml = ComponentOperation.action(actionName);
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			var $ctrlName = action["ctrlName"];
			var $compName = action["compName"];
			var $aluName = action["aluName"];
			var $resultName = action["resultName"];
			$(".ctrlArray").find("option[value ="+$ctrlName+"]").attr("selected", "selected");
			$(".compArray").find("option[key ="+$compName+"]").attr("selected", "selected");
			$(".aluArray").find("option[value ="+$aluName+"]").attr("selected", "selected");
			$(".resultArray").find("option[value ="+$resultName+"]").attr("selected", "selected");
			return $actionHtml;
		},


	};
	module.exports = ComponentOperation;
});