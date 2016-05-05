/**
 * @author Administrator
 */
define(function(require, exports, module) {
	var formDataUpdate = {
		formDataUpdate : function($ctrlObj, cJson) {
			if (objIsnull(cJson)) {
				if (objIsnull(cJson["ctrl"])) {
					if (cJson["ctrl"]["flag"] == true) {
						var $that = $ctrlObj, rowId = $that.closest("[rowId]").attr("rowId"), queryId = $that.closest("[formid]").attr("formId");
						$.ajax({
							type : "post",
							url : SITECONFIG.ROOTPATH + "/Qywx/Query/getFormBykb",
							data : {
								"siteId" : SITECONFIG.SITEID,
								"queryId" : queryId,
								"rowId" : rowId
							},
							success : function(data) {
								if (!objIsnull(data))
									return;
								var r = JSON.parse(data), page = $(r["page"]), formInfo = r["info"]["controlLists"], dataList = r["data"];
								$("#myWeb").empty().append(page);
								$(".ctrl", page).hide();
								page.find("form").addClass("selectedForm");
								ezCommon.formId = r["formId"];
								ezCommon.controlLists[ezCommon.formId] = formInfo;
								$("title").html("修改数据");
								$("#siteContent .mainTop .pageTop-title").html("修改数据");
								initCtrl();
								itemCheck();
								$.each(dataList[0], function(key, value) {
									var $ctrl = $("[name='" + key + "']", page), ctrlType = $ctrl.closest(".ctrl").attr("ctrl-type");
									require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/attrResolve.js", function(e) {
										e.init($ctrl.closest(".ctrl"), formInfo[key]["attrs"]);
										switch(ctrlType) {
											case "IMAGE" :
												$ctrl.attr("src", value);
												break;
											case "TEXTBOX" :
												$ctrl.val(value);
												break;
											case "TEXTAREA" :
												$ctrl.val(value);
												break;
											case "DROPDOWN" :
												$ctrl.val(value);
												break;
											case "CHECKBOX" :
												var $itemLabel = $ctrl.find(".itemLabel");
												$itemLabel.removeClass("onChecked");
												$ctrl.find('input[type="checkbox"]').removeAttr("checked");
												var valueArr = ctrlValue.split(",");
												for (var i = valueArr.length - 1; i >= 0; i--) {
													$.each($itemLabel, function() {
														var $input = $(this).find("input");
														if ($input.attr("value") == valueArr[i]) {
															$(this).addClass("onChecked");
															$input.attr("checked", "checked");
														}
													});
												}
												break;
											case  "TIME" :
												break;
										}
									});

								});

								$("[ctrl-type='IMAGE'],[ctrl-type='TEXTBOX'],[ctrl-type='TEXTAREA'],[ctrl-type='DROPDOWN'],[ctrl-type='CHECKBOX'],[ctrl-type='TIME']").show();
								$(".selectedForm").children().eq(0).before("<div class='row modifyForm' style='margin:0;height:37px;background:#2f96b4'><div class='col-md-3'><input type='button' value='取消' class='cancel btn'></div><div class='col-md-6'></div><div class='col-md-3'><input type='button' value='确认' class='btn modifyData'></div></div>");
								$(".modifyData", $(".selectedForm")).click(function() {
									formDataSubmit(rowId);
								});

								$(".cancel", $(".selectedForm")).click(function() {
									window.location.reload(true);
								});
							}
						});
					}
				}
			}

			return true;
		}
	};
	function formDataSubmit(rowId) {
		var formId = $(".selectedForm").attr("id");
		require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
			require.async(SITECONFIG.PUBLICPATH + "/Js/vaildate/jquery.validate.js", function() {
				var isVal = $(".selectedForm").validate(e.validateOpts);
				if (isVal && $(".selectedForm").valid() && e.validateQueness(formId)) {
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ajaxData.js", function(e) {
						var flag = e.saveFormData(rowId);
						if (flag) {
							window.location.reload(true);
						}
					});
				}
			});
		});
	}

	function initCtrl() {
		$(".myForm .ctrl").each(function() {
			var $this = $(this), ctrlType = $this.attr("ctrl-type"), ctrlId = $(this).attr("ctrlId");
			switch(ctrlType) {
				case "compLogic" :
					break;
				case "systemCp":
					var syscomtype = $this.attr("syscomtype");
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + syscomtype + ".js", function(e) {
						e.init($this);
					});
					break;
				default :
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
						require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
							if (ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"])//给设置验证规则的控件添加验证
								e.validate(ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"], $this);
						});
						e.init($this);
					});
					break;
			}
		});
	}

	function itemCheck() {
		$(".selectedForm ").find(".itemLabel").removeClass("onChecked").find("input").removeAttr("checked");
		/**
		 * 页面中,   多选框 每个选项选中事件
		 * @param {Object} selectObj
		 * @param {string} length
		 */
		var ctrlCheckboxDom = $(".ctrlWraper .itemLabel");
		if ($.support.msie) {//适配IE浏览器
			ctrlCheckboxDom.click(function() {
				this.blur();
				this.focus();
			});
		} else {
			$(".itemLabel").unbind("click").click(function(e) {
				preventDefault(e);
				stopEventBubble(e);
				var ctrlName = $(this).parents(".ctrl").attr("ctrlId");
				var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
				var hasSelect = $(this).closest(".ctrlWraper").find(".onChecked").length;
				var $itemObj = $(this).closest(".ctrlWraper").find(".itemLabel");
				if (selectLimit == "1") {
					$(this).closest(".ctrlWraper").find(".itemLabel").removeClass("buttonChecked onChecked buttonOval");
					//单选或复选按钮选中时,移出选中的类(class)
					$(this).closest(".itemLabel").addClass("onChecked");
					$(this).closest(".ctrlWraper").find("input[type='checkbox']").removeAttr("checked");
					$(this).find("input[type='checkbox']").attr("checked", "checked");
				} else {
					var $itemLabel = $(this).closest(".ctrlWraper").find(".itemLabel");
					if ($(this).hasClass("onChecked")) {
						$(this).removeClass("onChecked");
						$(this).find("input[type='checkbox']").removeAttr("checked");
					} else {
						$(this).addClass("onChecked");
						$(this).find("input[type='checkbox']").attr("checked", "checked");
					}
				}
				if (selectLimit != "1") {

					if (hasSelect >= selectLimit) {
						$(this).removeClass("onChecked");
						$(this).find("input[type='checkbox']").removeAttr("checked");
						alert("选项控制已设置为最多选择" + selectLimit + "项");

					}
				}
			});
		}

	}


	module.exports = formDataUpdate;
});
