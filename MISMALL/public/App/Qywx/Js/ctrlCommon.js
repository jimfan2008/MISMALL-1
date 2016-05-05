/**
 * @author 陈毅
 * @desc 控件相关的公共方法。在控件添加后被引用
 * @time 23015-05-07
 */
define(function(require, exports, module) {

	var CTRLCOMMON = {

		/**
		 * @desc 加载控件和页面属性
		 */
		loadAttrs : function(ctrl) {
			ezCommon.deBug("开始加载[" + ctrl.cName + "]控件属性", "public/Js/Qywx/ctrlCommon", 18);
			//加载控件属性在属性设置界面的显示结构（属性结构库）
			require.async("attrLib", function() {
				var CtrlName = ctrl.cName;
				$("#container").find(".right-menu").show();
				var attrs = ctrl.attrs;
				var arr = [], styleApp = [], selectArr = [], arrNew = [];
				var settingPanel = $(".basicElementView");
				settingPanel.find(".attrDtlPanel").hide();
				//去除数组重复元素
				function unique(arr) {
					var result = [], hash = {};
					for (var i = 0, elem; ( elem = arr[i]) != null; i++) {
						if (!hash[elem]) {
							result.push(elem);
							hash[elem] = true;
						}
					}
					return result;
				}

				//加载控件
				if (CtrlName != "pageDesign") {
					ctrle = $(".ctrlSelected").attr(("ctrl-type"));
					if (ctrle == "compLogic") {
						var ctrType = "components";
					} else if (ctrle == "systemCp") {
						var ctrType = "components";
						ctrle = $(".ctrlSelected").attr(("syscomtype"));
					} else {
						var ctrType = "controls";
					}
					if (ezCommon.sty.length > 1) {
						$.each(ezCommon.sty, function(k, v) {
							arr.push(v);
						});
						var arr1 = unique(arr);
						for (var i = 0; i < arr1.length; i++) {
							var tue;
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/" + ctrType + "/" + arr1[i] + ".js", function(e) {
								ctrTyp = e.get()["attrs"]["style"];
								if (ctrTyp == undefined) {
									styleApp = [];
									tue = true;
								} else {
									styleApp.push(ctrTyp);
								}
							});
							if (tue == true) {
								break;
							}
						}
						selectArr = styleApp.toString().split(",");
						var temp = "";
						var count = 0;
						for (var i = 0; i < selectArr.length; i++) {
							if (selectArr[i] != -1) {
								temp = selectArr[i];
								for (var j = 0; j < selectArr.length; j++) {
									if (temp == selectArr[j]) {
										count++;
										selectArr[j] = -1;
									}
								}
								if (count == arr1.length) {
									arrNew.push(temp);
								}
								count = 0;
							}
						}
						settingPanel.find(".styleAttr").find(".setAttrs").empty();
						for (var i = 0; i < arrNew.length; i++) {
							settingPanel.find(".styleAttr").show();
							settingPanel.find(".styleAttr .setAttrs").append(ATTRLIB["style"][arrNew[i]]);
						}
					} else {
						for (var attrType in attrs) {
							var $attrclass = settingPanel.find("." + attrType + "Attr");
							$attrclass.show();
							$attrclass.find(".setAttrs").empty();
							for (var i = 0, len = attrs[attrType].length; i < len; i++) {
								if (ATTRLIB[attrType]) {
									if (attrType == 'Data') {
										var $attrclass = $(".data").find(".DataAttr");
										$attrclass.show();
										$(".commonValue,.remove").show();
										$attrclass.find(".setAttrs").empty();
										$(".data").find(".DataAttr .setAttrs").append(ATTRLIB[attrType][attrs[attrType][i]]);
									} else if (attrType == "General") {
										$(".commonValue,.remove").hide();
										$(".data").find(".DataAttr").find(".setAttrs").empty();
										if (ATTRLIB[attrType][attrs[attrType][i]]) {
											settingPanel.find(".GeneralAttr .setAttrs").append(ATTRLIB[attrType][attrs[attrType][i]]);
										}
										//如果第三方插件有自定义属性时直接获取属性的HTML
										if ($(".ctrlSelected").hasClass(("thirdpartyPlugin"))) {
											settingPanel.find(".GeneralAttr .setAttrs").append(ctrl["attrList"][attrs[attrType][i]]);
										}
									} else {
										$(".commonValue,.remove").hide();
										$(".data").find(".DataAttr").find(".setAttrs").empty();
										settingPanel.find("." + attrType + "Attr .setAttrs").append(ATTRLIB[attrType][attrs[attrType][i]]);
									}
								}

							}
						}
						//	}
					}
				} else {
					//加载页面属性
					//ezCommon.sty.splice(0,ezCommon.str.length);
					var attrs = ctrl.attrs;
					for (var attrType in attrs) {
						var $attrclass = settingPanel.find("." + attrType + "Attr");
						$attrclass.show();
						$attrclass.find(".setAttrs").empty();
						for (var i = 0, len = attrs[attrType].length; i < len; i++) {
							if (ATTRLIB[attrType]) {
								$(".data").find(".DataAttr").find(".setAttrs").empty();
								$(".commonValue,.remove").hide();
								var $attrHtml = $(ATTRLIB[attrType][attrs[attrType][i]]);
								settingPanel.find("." + attrType + "Attr .setAttrs").append($attrHtml);
								if (attrs[attrType][i] == "formInputType" && $(".selectedForm").hasClass("slideInputForm")) {
									$attrHtml.find("#formInputType").val("slide");
								}
							}

						}
					}

				}
			});
		},

		/**
		 * @desc 加载控件动作
		 */
		loadAction : function(ctrlType, uri) {
			uri = uri ? uri : "controls";
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/" + uri + "/" + ctrlType + ".js", function(ctrl) {
				ezCommon.deBug("开始加载[" + ctrl.get().cName + "]控件动作", "public/Js/Qywx/ctrlCommon", 57);
				var action = ctrl.get().event;
				var i = 0, j = 0;
				var option = ["<option value='__blank'>---请选择---</option>"], actionStr = [];
				if (objIsnull(action)) {
					$.each(action, function(key, value) {
						if (j === 0) {
							actionStr.push("<div class='operationType selectedOperationType' operationType='");
							++j;
						} else {
							actionStr.push("<div class='operationType' operationType='");
						}

						actionStr.push(key);
						actionStr.push("'style='margin-top:10px;'>");
						actionStr.push(value.title);
						actionStr.push("</div>");
						$.each(value["action"], function(k, v) {
							if (i == 0) {
								$.each(v, function(m, n) {
									option.push("<option value='");
									option.push(m);
									option.push("'>");
									option.push(n);
									option.push("</option>");
								});
								++i;
							}
						});

					});
					$("#set-ctrl-operation").show();
				} else {
					$("#set-ctrl-operation").hide();
					$("#set-ctrl-basic").css("width", "100%");
				}
				$(".right-menu .set-ctrl-operation .action-operation").empty().append(actionStr.join(""));
				$(".right-menu .actionList .select-content .action-list").empty().append(option.join(""));
				if (ctrlType == "BUTTON") {
					if (ezCommon.Obj.find("[name]").attr("issubmit") == "true") {
						$(".right-menu .set-ctrl-operation .action-operation [operationtype='click']").hide();
						$(".right-menu .set-ctrl-operation .action-operation [operationtype='dataSave']").addClass("selectedOperationType").show();
					} else {
						$(".right-menu .set-ctrl-operation .action-operation [operationtype='click']").addClass("selectedOperationType").show();
						$(".right-menu .set-ctrl-operation .action-operation [operationtype='dataSave']").hide();
					}

				}
				$("#ctrlActionList").empty();
			});
		},

		/**
		 * @desc 设置控件属性
		 */
		setAttrs : function(ctrl) {
			require("jqueryUI");
			require("./attribute/attrComm.js");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/data.js", function(e) {
				e.data(ctrl);
			});
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/general.js", function(e) {
				e.general(ctrl);
			});
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/item.js?h=2", function(e) {
				e.item(ctrl);
			});
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/validate.js", function(e) {
				e.validate(ctrl);
			});
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/style.js", function(e) {
				e.style(ctrl);
			});
		},

		/**
		 * @desc 还原属性设置
		 * @param ctrlId 当前操作的控件对象的ctrlid
		 */
		restoreGeneral : function(ctrlId) {
			require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/restore.js", function(e) {
				$.each(ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"], function(k, v) {
					switch(k) {
						case"general" :
							e.general(v);
							break;
						case"validate" :
							e.validate(v);
							break;
						case"item" :
							e.item(v, ctrlId);
							break;
						case"data" :
							e.data(v);
							break;
					}
				});
			});
		},

		/**
		 * 显示“数据”属性栏
		 */
		showDataSetting : function() {
			$("#set-ctrl-data").show().css({
				"background-color" : "#cccccc",
				"color" : "#ffffff"
			});
			$("#set-ctrl-basic,#set-ctrl-operation").css("width", "131.66");
			$("#set-ctrl-basic").click();
		},

		/**
		 * 隐藏“数据”属性栏
		 */
		hideDataSetting : function() {
			$("#set-ctrl-data,.set-ctrl-data").hide();
			$("#set-ctrl-basic,#set-ctrl-operation").css("width", "200");
			$("#set-ctrl-basic").click();
		},

		/**
		 * @desc 还原动作设置
		 * @param ctrlId String 当前操作的控件对象的ctrlid
		 * @param eventType String 事件类型
		 */
		restoreAction : function(ctrlId, eventType) {
			//	restoreAction : function( eventType) {
			//清空动作设置面板
			$("#ctrlActionList").empty();
			// var	ctrlId=$(".ctrlSelected").attr("ctrlId");
			var ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlId];
			if (ctrlJson && ctrlJson["operations"] != undefined) {
				var operations = ctrlJson["operations"];
				$.each(operations, function(key, value) {
					if (key == eventType) {
						var actionId = value;
						if (actionId != "delete") {
							var actionJson = ezCommon.getActionJson(actionId);
							//如果actionJson不为空
							if (actionJson) {
								var actionList = actionJson["actionList"];
								$.each(actionJson["sort"], function(k, v) {
									var json = actionList[v], actionType = json["type"];
									require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js" + SITECONFIG.VERSION, function(e) {
										e.restore(json, v);
									});
								});

							}
						}
					}
				});
			}
		},

		/**
		 * 滑出面板里选项的单击事件绑定
		 */
		inputPanelItemClick : function($itemLabel) {
			$itemLabel.click(function(e) {
				preventDefault(e);
				stopEventBubble(e);
				var $this = $(this);
				var $inputPanel = $this.closest(".inputPanel");
				var $ctrl = $inputPanel.data("ctrl");

				var ctrlName = $ctrl.attr("ctrlId");
				var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
				var $selectedItem = $inputPanel.find(".itemLabel.onChecked");
				if (selectLimit == "1") {
					$inputPanel.find(".itemLabel").removeClass("onChecked");
					//单选或复选按钮选中时,移出选中的类(class)
					$this.addClass("onChecked");
				} else if ($selectedItem.length < selectLimit) {
					if ($this.hasClass("onChecked")) {
						$this.removeClass("onChecked");
					} else {
						$this.addClass("onChecked");
					}
				} else if ($this.hasClass("onChecked")) {
					$this.removeClass("onChecked");
				}

			});
		}
	};

	module.exports = CTRLCOMMON;
});
