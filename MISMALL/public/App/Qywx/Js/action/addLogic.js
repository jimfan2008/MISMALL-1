/**
 * @desc 添加逻辑处理
 * @author 柯斌
 * @date 2015-11-30
 */

define(function(require, exports, module) {
	var htmlStr = '<div class="row"><div class="col-md-2"></div><div class="col-md-8"><button class="addLogic btn btn-default" style="background:#00ccff;color:#ffffff;cursor: pointer;border:0px;border-radius:0px;margin:5px;width:100%">设计逻辑处理</button></div><div class="col-md-2"></div>';
	var index = 1;
	var addLogic = {
		action : function(actionIdx) {
			var actionId = actionIdx ? actionIdx : "addLogic" + ezCommon.actionNameNum[ezCommon.formId];
			var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
			$("#ctrlActionList").append($actionHtml);
			ezCommon.actionClose($actionHtml);
			$actionHtml.attr({
				"actionId" : actionId,
				"actionType" : "addLogic"
			});
			$actionHtml.find(".actionTitle").text("逻辑处理");
			$(".addLogic", $actionHtml).click(function() {
				require.async(SITECONFIG.PUBLICPATH + "/Js/logic/logic.css" + SITECONFIG.VERSION, function() {
					require.async(SITECONFIG.PUBLICPATH + "/Js/logic/logic.js" + SITECONFIG.VERSION, function() {
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js" + SITECONFIG.VERSION, function(dataBase) {
							var logicJson = getActioJson(actionId), log = new Logic($("body"), dataBase, null, logicJson.actionList);
							log.init(logic, $actionHtml, logicJson.logicStr);
						});

					});
				});
			});
		},

		json : function($actionObj) {
			var actionId = $actionObj.attr("actionId"), ctrlJson = false, logicJson = getActioJson(actionId);

			if (objIsnull(addLogic.logicJson) && objIsnull(addLogic.actionList) && objIsnull(addLogic.logicStr)) {
				ctrlJson = '{"logicJson":' + addLogic.logicJson + ',"actionList" :' + addLogic.actionList + ',"logicStr" :"' + addLogic.logicStr + '"}';
			} else if (objIsnull(logicJson)) {
				ctrlJson = JSON.stringify(logicJson);
			}

			if (!ctrlJson) {
				return false;
			}
			var ctrlActionJson = '"' + actionId + '":{"type":"addLogic","ctrl":' + ctrlJson + '}';
			return ctrlActionJson;

		},

		restore : function(actionJson, actionName) {
			addLogic.action(actionName);
		}
	}, logic = {

		leftStruck : function($obj) {
			var $ctrl = $(".ctrlSelected"), ctrlType = $ctrl.attr("ctrl-type"), path = "controls/", s = [];
			ctrlType == "systemCp" ? "components/" : path;
			if (ctrlType == undefined) {
				ctrlType = "pageForm";
			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/" + path + ctrlType + ".js", function(ctrl) {
				var a = ctrl.get()["event"], eventType = $(".set-ctrl-operation .action-operation .selectedOperationType").attr("operationtype");
				if (objIsnull(a)) {
					if (objIsnull(a[eventType])) {
						var base = a[eventType]["action"]["base"], data = a[eventType]["action"]["data"], wx = a[eventType]["action"]["wx"];
						if (objIsnull(base)) {
							getStruck(base, "基本操作");
						} 
						if (objIsnull(data)) {
							getStruck(data, "数据操作");
						}
						if (objIsnull(wx)) {
							getStruck(wx, "微信对接");
						}
					}
				}

				function getStruck(param, name) {
					s.push("<div style='margin-top:10px;cursor:pointer'><p class='handleLogicType'>");
					s.push(name);
					s.push("</p><ul class='handleLogicList' style='display:none'>");
					$.each(param, function(k, v) {
						if (k != "addLogic") {
							s.push("<li actionType='");
							s.push(k);
							s.push("' class='handleLogic-content'>");
							s.push(v);
							s.push("</li>");
						}
					});
					s.push("</ul></div>");
				}

			});

			$s = $(s.join(""));
			$s.find("p").click(function() {
				var $next = $(this).next();
				if ($next.is(":hidden")) {
					$(".handleLogicList").slideUp("500");
					$next.slideDown(500);
				} else {
					$next.slideUp(500);
				}
			});
			return $s;
		},
		contextStruck : function($obj) {
			var actionType = $obj.attr("actionType");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js", function(action) {
				var $action = action.action(actionType + index);
				index++;
				$obj.replaceWith($action.addClass("handleLogic-content"));
			});
		},

		dataStruck : function() {

			return '';
		},
		setLogicRelust : function($obj, actionList) {
			var actionType = $obj.attr("actiontype"), actionId = $obj.attr("actionid"), actionJson = null;
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js", function(action) {
				actionJson = action.json($obj);
				console.log(actionJson);
				actionJson = "{" + actionJson + "}";
				ezCommon.savePageParam(actionId, actionJson, actionType);
				actionList[actionId] = JSON.parse(actionJson);
			});

			return {
				"type" : "content",
				"flag" : "true",
				"actionType" : actionType,
				"json" : JSON.parse(actionJson)
			};
		},

		save : function(logicJson, actionList) {
			var logicStr = $(".editorLogicDesign .right").html();
			addLogic.actionList = JSON.stringify(actionList);
			addLogic.logicJson = JSON.stringify(logicJson);
			addLogic.logicStr = logicStr.replace(/"/g, "'");
			$(".editorLogicDesign").hide();
			$("#actionSave").click();
		},

		restoreResult : function($obj, json) {
			var actionType = $obj.attr("actiontype"), actionId = $obj.attr("actionid");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js", function(action) {
				var $action = action.restore(json[actionId][actionId], actionId);
				$obj.replaceWith($action.addClass("handleLogic-content"));
				index++;
			});
		},

		setCondition : function($obj) {
			if ($obj.hasClass("arithmeticOperator") || $obj.hasClass("forLoop")) {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js" + SITECONFIG.VERSION, function(dataBase) {
					if ($obj.hasClass("forLoop")) {
						$obj.find(".conditionFor input").hover(function(){
							dataBase.init("LOGICFOR", $(this));
						},function(){
							
						});
						//dataBase.init("LOGICFOR", $obj.find(".conditionFor input"));
					} else {
						$(">.arithmeticLeft,>.arithmeticRight", $obj).hover(function() {
							dataBase.init("LOGIC", $(this));
						}, function() {

						});
						//dataBase.init("LOGIC", $obj.find(">.arithmeticRight"));
						//dataBase.init("LOGIC", $obj.find(">.arithmeticLeft"));
					}
				});
			}
		},

		getCondition : function($obj) {
			return {
				"type" : $obj.attr("dataType"),
				"valueType" : $obj.attr("valueType"),
				"value" : $obj.val(),
				"field" : $obj.attr("filed")
			};
		}
	};

	function getActioJson(actionId) {
		var ctrlId = $(".ctrlSelected").attr("ctrlId"), ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlId], logicJson = false;
		if (objIsnull(ctrlJson)) {
			if (objIsnull(ctrlJson["operations"])) {
				var actionJsonId = ctrlJson["operations"][$(".set-ctrl-operation .action-operation .selectedOperationType").attr("operationtype")];
				var actionJson = ezCommon.ctrlActionCache[actionJsonId];
				if (objIsnull(actionJson)) {
					if (objIsnull(actionJson["actionList"])) {
						if (objIsnull(actionJson["actionList"][actionId])) {
							logicJson = actionJson["actionList"][actionId];
							if (objIsnull(actionJson["actionList"][actionId])) {
								logicJson = actionJson["actionList"][actionId]["ctrl"];
							}
						}
					}
				}
			}
		}

		return logicJson;
	}


	module.exports = addLogic;
});
