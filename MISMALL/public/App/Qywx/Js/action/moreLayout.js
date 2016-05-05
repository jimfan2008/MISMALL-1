/**
 * @desc 绑定制作层
 * @author 黄俊
 * @date 2015-6-27
 */
define(function(require,exports,module){
		var htmlStr='<div class="moreLayout row"></div>';
		var moreLayout ={
				    action : function(actionIdx) {
									var actionId = actionIdx ? actionIdx : "moreLayout" + ezCommon.actionNameNum[ezcommon.formId];
									var layOut = $("body").find("div[syscomtype='editor-layer-switch']");
									var $actionHtml = ezCommon.getActionSetHtml(htmlStr);
									$("#ctrlActionList").append($actionHtml);
									ezCommon.actionClose($actionHtml);
									$actionHtml.attr({
											"actionId" : actionId,
											"actionType" : "moreLayout"
									});
									$actionHtml.find(".actionTitle").text("绑定制作层");
									var i = 0, option = "<div class='col-md-4'><select class='form-control choseData'><option value='__blank'>选择数据源</option>";
									var layOutData = ezCommon.getAllFlowQuerier();
									if (layOutData) {
											$.each(layOutData, function() {
													option += '<option value="' + this["ID"] + '">' + this["querierName"] + '</option>';
											});
									}
									$actionHtml.find(".moreLayout").append(option + "</select></div><div class='col-md-4'><select class='form-control choseField'><option value='__blank'>选择字段</option></select></div><div class='col-md-4'><button class='btn btn-info addData' style='font-size:11px;height:33px; line-height:8px;font-weight:600;widht:110;margin-left:8px'><span class='glyphicon-plus '></span>&nbsp;新增数据源</button></div>");
									$actionHtml.find(".choseData").on("change", function() {
											var queryId = $(this).val();
											if (queryId != '__blank') {
													$actionHtml.find(".choseField").empty().append(Field(queryId));
											} else {
													$actionHtml.find(".choseField").empty().append("<option value='__blank'>选择字段</option>");
											}
									});
									$actionHtml.find(".addData").unbind("click").click(function() {
											var url = ROOTPATH + "/Qywx/Query/dataFilter?flowid=" + FLOWID + "&attrSet=111";
											$("#panelWin").remove();
											var $htmWindowForNewForm = $('<div id="panelWin"><iframe class="iframe-responsive-item" src="' + url + '" style="width:100%;height:100%;"></iframe></div>');
											$htmWindowForNewForm.appendTo($(document.body));
									});
									return $actionHtml;
				},
				json : function($actionObj) {
							var actionId = $actionObj.attr("actionId"), layId = $actionObj.find(".choseData option:selected").attr("value"), field = $actionObj.find(".choseField option:selected").attr("value");
							ctrlJson = '"' + $(".selectedForm").parent().attr("id") + '":{"queryId":"' + layId + '","field":"' + field + '"}';
							if (ctrlJson == "")
									return ctrlJson;
							var ctrlActionJson = '"' + actionId + '":{"type":"moreLayout","ctrl":{' + ctrlJson + '}}';
							return ctrlActionJson;
		
				},
				restore : function(actionJson, actionName) {
							var $actionHtml = moreLayout.action(actionName);
							var layId = "";
							$.each(actionJson["ctrl"], function(key, value) {
									layId = value["queryId"];
									if (layId != '__blank') {
										$actionHtml.find(".choseField").empty().append(Field(layId));
									}
									$actionHtml.find(".choseData option[value='" + layId + "']").attr("selected", "selected");
									$actionHtml.find(".choseField option[value='" + value["field"] + "']").attr("selected", "selected");
							});
							
							return $actionHtml;
				}
		};
		    function Field(queryId) {
				var fieldList = ezCommon.getQueryField(queryId);
				var fieldOption = [];
				if (objIsnull(fieldList)) {
						if (objIsnull(fieldList["querierData"])) {
								if (objIsnull(fieldList["querierData"]["selectFields"])) {
										$.each(fieldList["querierData"]["selectFields"], function(key, value) {
											fieldOption.push("<option value='");
											fieldOption.push(value["tableName"]);
											fieldOption.push("_");
											fieldOption.push(value["fieldId"]);
											fieldOption.push("'>");
											fieldOption.push(value["fieldTitle"]);
											fieldOption.push("</option>");
										});
									}
						}
				}
				return fieldOption.join("");
			};
			module.exports = moreLayout;
});
