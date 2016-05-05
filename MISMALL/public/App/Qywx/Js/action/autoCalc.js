/**
 * @desc 自动运算
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require, exports, module) {
	var htmlStr = '<div class="row" style="margin:10px 1px"><div class="action-zdys-operate"><span class="operate" type="jia">+</span><span class="operate" type="jian">-</span><span class="operate" type="cheng">×</span><span class="operate" type="chu">÷</span><span class="operate deng" type="deng">=</span><span class="clearclr">清除</span></div></div></div><div class="row content-zdtc"><div class="col-md-5 action-zdtc"><select class="form-control  input-sm ctrlArray"></select><div class="action-caret formCtrl-caret"></div></div><div class="text"></div></div>';
	var autoCalc = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "autoCalc" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "autoCalc"
			});
			ezCommon.actionClose($actionHtml);
			$actionHtml.find(".actionTitle").text("自动运算");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			if (!ctrlLists)
				return false;
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"], ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
				if (ctrlType == "TEXTBOX" || ctrlType == "REMARK" || ctrlType == "RADIO") {
					$actionHtml.find(".ctrlArray").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
			});
			//单击清除事件
			$actionHtml.find(".action-zdys-operate").find("span.clearclr").click(function() {
				var $clearAutoCalc = $(this).parents(".actionWarp");
				$clearAutoCalc.find(".action-zdtc:not(:first)").remove();
				$clearAutoCalc.find(".text:not(:first)").remove();
				$clearAutoCalc.find(".text:first").text("");
				$clearAutoCalc.find("span").removeClass("current");
			});
			//选中运算符号事件
			$actionHtml.find(".action-zdys-operate").find("span.operate").unbind("click").click(function() {
				var $this = $(this);
				$this.parent().find(".current").removeClass("current");
				$this.addClass("current");
				//  if ($actionHtml.find(".row > div").size() > 1) return;
				$this.parents(".actionWarp").find(".text:last").text($(this).text());
				$this.parents(".actionWarp").find(".text:last").after('<div class="col-md-5  action-zdtc"><select class="form-control  input-sm ctrlArray"></select><div class="action-caret formCtrl-caret"></div></div><div class="text"></div>');
				$.each(ctrlLists, function(key, value) {
					var ctrlType = value["ctrlType"], ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
					if (ctrlType == "TEXTBOX" || ctrlType == "REMARK" || ctrlType == "RADIO") {
						$this.parents(".actionWarp").find(".action-zdtc:last select").append('<option value="' + key + '">' + ctrlTitle + '</option>');
					}
				});
				$this.parents(".actionWarp").find(".action-zdtc:last select").append('<option value="cusnumber">自定义</option>');
				selectChange($actionHtml, ctrlLists);
			});

			return $actionHtml;
		},
		//json
		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = '';
			var calcClrfirst = $actionObj.find(".action-zdtc:first").find("select:first").val();
			ctrlJson += '{"' + calcClrfirst + '" : "' + "+" + '"},';
			// 第一个数字默认被 0  加上
			$actionObj.find('.content-zdtc >.text').each(function() {
				var calcClr;
				var fillType = $.trim($(this).text());
				if ($(this).text() == "")
					return;
				if ($(this).next().children().get(0).tagName == "SELECT"){
					calcClr = $(this).next().find("select:first").val();
				}else{
					calcClr = $(this).next().find("input").val();
				}
				ctrlJson += '{"' + calcClr + '": "' + fillType + '"},';
			});
			ctrlJson = ctrlJson.substr(0, ctrlJson.length - 1);
			if (ctrlJson == "")
				return;
			var ctrlActionJson = '"' + actionId + '":{"type":"autoCalc","ctrl":[' + ctrlJson + ']}';
			return ctrlActionJson;
		},
		//还原
		restore : function(actionJson, actionName) {
			var $actionList = $("#ctrlActionList"), action = actionJson["ctrl"], $actionHtml = autoCalc.action(actionName), $rowFirst = $actionHtml.find(".content-zdtc:first");
			var ctrlLists = ezCommon.controlLists[ezCommon.formId];
			var $newFirst = $rowFirst.clone();
			$newFirst.find("select").append('<option value="cusnumber">自定义</option>');
			$.each(action, function(k, v) {
				if (k == 0) {
					$.each(v, function(key, value) {
						$rowFirst.find("select >option[value =" + key + "]").attr("selected", "selected");
					});
				} else {
					$.each(v, function(key, value) {
						$actionHtml.find(".text:last").text(value);
						if (key.indexOf("TEXTBOX") != -1 || key.indexOf("REMARK") != -1 || key.indexOf("RADIO") != -1) {
							$newFirst.find("option").removeAttr("selected");
							$newFirst.find("select > option[value=" + key + "]").attr("selected", "selected");
							$actionHtml.find(".text:last").after($newFirst.html());
						} else {
							var $htmlStr = '<div class="col-md-5 action-zdtc"><div class="input-group" ><input class="form-control intnumb input-sm" value="' + key + '" maxlength=5 placeholder="数字"><div class="input-group-addon rollback" style="cursor: pointer">返回</div></div></div><div class="text"></div>';
							rollbackClick($actionHtml, ctrlLists);
							$actionHtml.find(".text:last").after($htmlStr);
						}
					});
				}

			});
			selectChange($actionHtml, ctrlLists);
			return $actionHtml;
		},
		
		
	};
	//回退事件
	function rollbackClick($actionHtml, ctrlLists) {
		$actionHtml.undelegate(".rollback", "click").delegate(".rollback", "click", function() {
			var $rallback = $(this).parents(".action-zdtc");
			$rallback.empty();
			$rallback.append('<select class="form-control  input-sm ctrlArray"></select><div class="action-caret formCtrl-caret"></div>');
			$.each(ctrlLists, function(key, value) {
				var ctrlType = value["ctrlType"], ctrlTitle = value["attrs"]["general"]["ctrlTitle"];
				if (ctrlType == "TEXTBOX" || ctrlType == "REMARK") {
					$rallback.find("select").append('<option value="' + key + '">' + ctrlTitle + '</option>');
				}
			});
			$rallback.find("select").append('<option value="cusnumber">自定义</option>');
			selectChange($actionHtml, ctrlLists);
		});
	}

	function selectChange($actionHtml, ctrlLists) {
		$actionHtml.find(".action-zdtc > select").on("change", function() {
			if ($(this).val() == "cusnumber") {
				$(this).after('<div class="input-group"><input class="form-control intnumb input-sm" maxlength=5 placeholder="数字"><div class="input-group-addon rollback" style="cursor: pointer">返回</div></div>');
				$(this).remove();
			}
			//numeral() 自定义函数， <input> 只能输入数字
			$actionHtml.find(".intnumb").numeral();
			rollbackClick($actionHtml, ctrlLists);
		});
	}


	module.exports = autoCalc;
});
