/**
 * @author 范文彬
 * @desc 自定义组件相关事件
 * @time 2015-07-02
 */
define(function(require, exports, module) {
	var ctrlCommon = require("ctrlCommon"), ajaxData = require("../ajaxData");
	var compEvent = {

		/**
		 * 设置组件步骤
		 * compStatus  状态
		 */
		compStep : function() {
			//单击下一步
			$("#customcomponent").find(".next-btn").unbind("click").click(function() {
				var $customcomponentDown = $(this).parents(".customcomponent-down");
				var isFormInfoList = $customcomponentDown.find(".formInfoList > li").hasClass("fieldSelect");
				var isFieldlist = $customcomponentDown.find(".item-ul > li").hasClass("fieldSelect");
				var isCpType = $customcomponentDown.find(".cp-type-list > li").hasClass("fieldSelect");
				if (isFormInfoList && isFieldlist && isCpType) {
					$fieldlistObj = $(".fieldlist");
					var dataSetId = $(".formInfoList .fieldSelect").attr("dsid");
					var customType = $(".cp-type").find(".fieldSelect").attr("type");
					//$(".compSetModal").modal("show");
					compEvent.onCompleteBtnClickIng($fieldlistObj, customType, dataSetId);
					$(this).parents(".customcomponent-down").animate({
						"margin-left" : "-1900px"
					});
				} else if (!isFormInfoList) {
					alert("请选择数据源");
				} else if (!isFieldlist) {
					alert("请选择字段");
				} else if (!isCpType) {
					alert("请选择数据源类型");
				}
			});

			//单击上一步
			$(".customcomponent-down").find("input[name='pre-btn']").click(function() {
				$(this).parents(".customcomponent-down").animate({
					"margin-left" : "-950px"
				});
			});
		},

		/**
		 *  设置数据源
		 */
		setDataSourse : function() {
			var compStatus = $("#customcomponent").attr("compStatus");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				var formInfoDataHtml = e.getDataSourseList();
				var fomrId = ezCommon.Obj.attr("formid");
				$(".data-list").append(formInfoDataHtml);
				//如果是通过创建数据组件过来的 则表示新增，否则还原
				if (compStatus == "comp-add") {
					$(".data-list").find("li").removeClass("fieldSelect");
				} else {
					$(".data-list").find("[dsid =" + fomrId + "]").addClass("fieldSelect");
				}
			});

			$("#customcomponent").find(".set_addDataSource").unbind("click").click(function() {
				var url = SITECONFIG.APPPATH + "/Query/dataFilterNew?flowid=" + SITECONFIG.FLOWID + "&attrSet=1&siteId=" + SITECONFIG.SITEID;
				$("#panelWin").remove();
				var $htmWindowForNewForm = $('<div id="panelWin"><iframe class="iframe-responsive-item" src="' + url + '" style="width:100%;height:100%;"></iframe></div>');
				$htmWindowForNewForm.appendTo($(document.body));
			});
			$("#customcomponent").find(".set_externalInterface").unbind("click").click(function() {
				var url = SITECONFIG.APPPATH + "/Query/externalInterface?flowid=" + SITECONFIG.FLOWID + "&attrSet=1&siteId=" + SITECONFIG.SITEID;
				$("#panelWin").remove();
				var $htmWindowForNewForm = $('<div id="panelWin"><iframe class="iframe-responsive-item" src="' + url + '" style="width:100%;height:100%;"></iframe></div>');
				$htmWindowForNewForm.appendTo($(document.body));
			});
			$("#customcomponent").undelegate(".formInfoList > li", "click").delegate(".formInfoList > li", "click", function() {
				var isFormInfoList = $(this).parent().find("li").hasClass("fieldSelect");
				var newDsId = $(this).attr("dsId"), type = $(this).attr("type"), formName = $(this).text(), fieldname = [];
				fieldHtml = [], fieldsList = [];
				fieldData = ajaxData.getFormFieldInfo(newDsId, type);
				//有可能是外部api  加了type cc
				
				//fieldsList = fieldData["selectFields"];

				$(".fieldlist").empty();
				if (!$(this).hasClass("fieldSelect")) {
					$(this).parent().find("li").removeClass("fieldSelect");
					$(this).addClass("fieldSelect");
				}

				if ($(this).parent().find("li").hasClass("fieldSelect")) {

					$(this).parents(".customcomponent-down").animate({
						"margin-left" : "-950px"
					});
				}

				$(".data-op-name").find(".filed-name").text(formName + "列表字段").attr({
					"dsId" : newDsId
				});

				fieldHtml.push('<ul class="item-ul">');
				/*$.each(fieldsList, function(key, value) {
					var fieldName = value["tableName"] ? (value["tableName"] + '_' + value["fieldId"]) : value["fieldId"];
					fieldHtml.push('<li  fieldname="' + fieldName + '">' + value["fieldTitle"] + '</li>');
				});*/
				$.each(fieldData, function(key, value) {
					var selectedField = value["selectedField"];
					$.each(selectedField, function(k, val) {

						var fieldId =  val["fieldId"];
						fieldHtml.push('<li  fieldname="' + fieldId + '">' + val["fieldName"] + '</li>');
					});
				});
				fieldHtml.push('<br style="clear:both"/><ul/>');
				fieldHtml = fieldHtml.join("");
				$(".fieldlist").append(fieldHtml);
				if (compStatus == "comp-add") {
					$(".fieldlist").find("li").removeClass("fieldSelect");
				} else {
					$.each(ezCommon.Obj.find(".thisisField"), function(k, v) {
						fieldname.push($(this).attr("fieldname"));
					});
					$.each(fieldname, function(k, v) {
						$(".fieldlist").find("[fieldname = " + v + "]").addClass("fieldSelect");
					});
				}
				compEvent.fieldClick();
			});
			$(".back-formlist").click(function() {
				$(this).parents(".customcomponent-down").animate({
					"margin-left" : "0px"
				});
			});

			compEvent.compStep();

		},

		/**
		 * 选择字段 添加fieldSelect 事件
		 */
		fieldClick : function() {
			$(".item-ul,.cp-type-list").find("li").click(function() {
				if ($(this).parent().hasClass("cp-type-list")) {
					$(this).parent().find("li").removeClass("fieldSelect");
				}
				if ($(this).hasClass("fieldSelect")) {
					$(this).removeClass("fieldSelect");
				} else {
					$(this).addClass("fieldSelect");
				}
			});

		},
		/**
		 * 点击完成按钮事件
		 * @param $fieldlistObj 字段对象
		 * @param customType 自定义组件类型
		 * @param dataSetId 数据ID
		 * @param compStatus 状态
		 */
		onCompleteBtnClickIng : function($fieldlistObj, customType, dataSetId) {
			$(".setting-data").find("input[name='complete-btn']").unbind("click").click(function() {
				var componentname = html_encode($(".customcomponent-down-thr").find("input[name='componentname']").val()), $modalContent = $(this).parents(".customcomponent-down-thr");
				var componentId = "";
				if (ezCommon.Obj.attr("ctrl-type") == "compLogic") {
					componentId = ezCommon.Obj.attr("ctrlid");
				}
				if (componentname) {
					//验证组件名称是否重复
					var compNameStatus = ajaxData.IscompNameRepeat(componentname, componentId);
					console.log(compNameStatus);
					if (!compNameStatus) {
						$("#customcomponent").animate({
							width : "0"
						});
						$(".customcomponent-down,customcomponent-down-one").animate({
							"margin-left":"0px"
						});
						$("#theMaskLayer").fadeOut(500);
						compEvent.onCompleteBtnClickAfter($fieldlistObj, customType, dataSetId, componentname);
						$modalContent.find(".help-inline").remove();
						$(".dataImage").parent().remove();
						//保存组件名称
					} else {
						$modalContent.find(".help-inline").remove();
						$modalContent.find("input[name='componentname']").after('<span class="help-inline" style="color:#b94a48;padding-left: 7px;position:absolute">该名称以已存在</span>');

					}
				} else {
					$modalContent.find(".help-inline").remove();
					$modalContent.find("input[name='componentname']").after('<span class="help-inline" style="color:#b94a48;padding-left: 7px;position:absolute">名称不能为空</span>');
				}
			});

		},

		/**
		 * 点击完成按钮后的响应函数
		 * @param $fieldlistObj 字段对象
		 * @param customType 自定义组件类型
		 * @param dataSetId 数据ID
		 * @param componentname 组件名称
		 */
		onCompleteBtnClickAfter : function($fieldlistObj, customType, dataSetId, componentname) {
			var compStatus = $("#customcomponent").attr("compStatus"), selectFieldInfo = [], selectJson = {};
			$("#customcomponent").animate({
				width : "0"
			});
			$("#theMaskLayer").fadeOut(500);
			selectJson = {
				"form" : "",
				"type" : customType,
				"queryId" : dataSetId,
				"where" : "",
				"mask" : false,
				"limit" : 1
			}, componentData = ezCommon.curd(selectJson, 1, 0, "");
			// componentData 当前数据源的所有数据
			if (componentData["0"]) {
				$fieldlistObj.find(".fieldSelect").each(function() {
					selectFieldInfo.push({
						"fieldName" : $(this).attr('fieldname'),
						"fieldTitle" : $(this).text(),
						"data" : componentData["0"][$(this).attr('fieldname')]
					});
					//console.log($(this).attr('fieldname'),componentData["0"][$(this).attr('fieldname')]);
				});
			} else {
				$fieldlistObj.find(".fieldSelect").each(function() {
					selectFieldInfo.push({
						"fieldName" : $(this).attr('fieldname'),
						"fieldTitle" : $(this).text(),
						"data" : "没有任何数据"
					});
				});

			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				//var $compLogic = $(e.get().html);
				var $compLogic = ezCommon.Obj;
				customHtml = e.getComponentHtml(selectFieldInfo);
				if (compStatus == "comp-add") {
					$compLogic.find(".colInner").append(customHtml);
					$compLogic.attr("formId", dataSetId);
					$compLogic.find(".dynamicName").text(componentname);
					//$(".selectedForm").append($compLogic);
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js", function(e) {
						e.loadcustomComponent($compLogic);
						ajaxData.addCompName(componentname, $compLogic.attr("ctrlid"));
					});

				} else {
					ezCommon.Obj.find(".colInner").empty().append(customHtml).attr("compStatus", "modify");
					ezCommon.Obj.find(".dynamicName").text(componentname);
				}

			});
		},
		/**
		 * 点击修改按钮时的响应函数
		 * @param $customObj 字段对象
		 */

		modifiyDataBtn : function($customObj, ctrlId) {

		}
	};

	module.exports = compEvent;
});
