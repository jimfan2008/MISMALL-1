/**
 * @author fwb
 */
define(function(require, exports, module) {
	var restore = {
		/**
		 *	属性还原
		 */
		general : function(attrJson, $obj) {
			$.each(attrJson, function(k, v) {
				switch(k) {
					case"activityName":
					case"unit":
					case"tip":
					case"InnerTip":
						$("#" + k).val(v);
						break;
					case"isRdOnly":
						$("[name='isRdOnly']").bootstrapSwitch('state', true);
						break;
					case"isHidden":
						$("[name='isHidden']").bootstrapSwitch('state', true);
						break;
					case"isCompressPic":
						$("[name='isCompressPic']").bootstrapSwitch('state', true);
						break;
					case"backgroundColor":
						$('#backgroundColor').next().find('.sp-preview-inner').css("background", v);
						$("body").find(".ctrlSelected").attr("data-bgColor", v);
						break;
					case"fontBackgroundColor":
						$('#fontBackgroundColor').next().find('.sp-preview-inner').css("background", v);
						break;
					case"ClickColor":
						$('#ClickColor').next().find('.sp-preview-inner').css("background", v);
						$("body").find(".ctrlSelected").attr("data-ClickColor", v);
						break;
					case"isSubmit":
						$("[name='isSubmit']").bootstrapSwitch('state', true);
						break;
					case"isTitleElse":
						$("[name='isTitleElse']").bootstrapSwitch('state', false);
						break;
					case"btnAlign":
						$("[name='btnAlign']").find(".btnAlign" + v).css({
							"background" : "#017AD2",
							"color" : "#fff"
						});
						break;
					case"DisEnabled":
						$("[name='DisEnabled']").bootstrapSwitch('state', true);
						break;
					case"isEdit":
						$("[name='isEdit']").bootstrapSwitch('state', true);
						break;
					case "btnRound" :
						$("body").find(".ctrlSelected").find("button").css("border-radius", v + "px").attr("btn-round", v);
						break;
					case "btnWidthChange" :
						$("body").find(".ctrlSelected").find("button").css("width", v + "%").attr("btn-width", v);
						break;
					case "btnImgChange" :
						$("body").find(".ctrlSelected").find("button").css("backgroundImage", "url(" + v + ")");
						break;
					case"isBorder":
						$("[name='isBorder']").bootstrapSwitch('state', false);
						break;
					case"addFiledTitle":
						$("[name='addFiledTitle']").bootstrapSwitch('state', false);
						break;
					case"lottery":
						$(".lotteryLimit").find("select option[value='" + v + "']").prop('selected', true);
						break;
					case"lotteryChance":
						$("#lotteryChance").val(v);
						break;
					case"isTitle":
						if (v == 0) {
							$(".ctrlSelected").find(".fieldTitle").css("display", "block");
							$(".inputStyle2").css("color", "#666");
							$(".inputStyle0").css({
								"color" : "#2f96b4",
								"border-right" : "1px solid #2f96b4"
							});
							$(".inputType0").css("border", "1px solid #2f96b4");
							$(".inputType1,.inputType2").css("border", "1px solid #666");
							$(".ctrlSelected").find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-8");
							$(".ctrlSelected").find(".fieldTitle").css({
								"border" : "1px solid #ccc",
								"border-right" : "0px",
								"margin-left" : "12px",
								"height" : "34px"
							});
						} else if (v == 1) {
							$(".ctrlSelected").find(".fieldTitle").css({
								"border" : "0px ",
								"margin-left" : "0px"
							});
							$(".inputStyle2").css("color", "#666");
							$(".inputStyle0").css({
								"color" : "#666",
								"border-right" : "1px solid #666"
							});
							$(".inputType1").css("border", "1px solid #2f96b4");
							$(".inputType0,.inputType2").css("border", "1px solid #666");
							$(".ctrlSelected").find(".fieldTitle").css("display", "none");
							$(".ctrlSelected").find(".col-xs-8").removeClass("col-xs-8").addClass("col-xs-12");
						} else if (v == 2) {
							$(".ctrlSelected").find(".fieldTitle").css({
								"border" : "0px ",
								"margin-left" : "0px"
							});
							$(".inputStyle2").css("color", "#2f96b4");
							$(".inputStyle0").css({
								"color" : "#666",
								"border-right" : "1px solid #666"
							});
							$(".inputType2").css("border", "1px solid #2f96b4");
							$(".inputType0,.inputType1").css("border", "1px solid #666");
							$(".ctrlSelected").find(".fieldTitle").css("display", "block");
							$(".ctrlSelected").find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-8");
						}
						break;
					case "addChoose":
						if (v == 1) {
							$("[name='addChoose']").bootstrapSwitch('state', true);
						}
						break;
					case "isFormData":
						$("[name='isFormData']").bootstrapSwitch('state', true);
						if (!v)
							return;
						var ctrlArray = v.split(".");
						var childrenListHtml = "", $selectChildrenTable = "";
						$("[name='isFormData']").parents(".setAttrs").find(".tabelItem > option[formid =" + ctrlArray[0] + "]").attr("selected", "selected");
						_commonAjax({
							type : "POST",
							processData : false,
							data : {
								"siteId" : SITEID,
								"formId" : ctrlArray[0]
							},
							url : SITECONFIG.APPPATH + "/FormData/getAFormFiledsInfo",
							dataType : 'json',
							async : false,
							success : function(r) {
								if (r) {
									$.each(r, function(k, v) {
										if (v["controlType"].indexOf("CCImage") >= 0) {
											childrenListHtml += '<option fieldname="' + v["fieldName"] + '" >' + v["fieldTitle"] + '</option>';
										}
									});
									$selectChildrenTable = $('<select class="tableChildrenItem form-control"><option>请选择</option>' + childrenListHtml + "</select>");
									$(".childrenTalbeItem").append($selectChildrenTable);
									$(".childrenTalbeItem").find(".tableChildrenItem > option[fieldname = " + ctrlArray[1] + "]").attr("selected", "selected");

								}
							}
						});
						break;
					case "isPoplayerInput":
						$("[name='isPoplayerInput']").bootstrapSwitch('state', true);
						break;
					case "isYesPoplayerInput":
						$("[name='isYesPoplayerInput']").bootstrapSwitch('state', true);
						break;
					case "uploadPictureSize":
						$("#uploadPictureSize").val(v);
						break;
					case "pictureUnit":
						$("#pictureUnit").val(v);
						break;
					case "frameWidth":
						$("#frameWidth").val(v);
						break;
					case "frameHeight":
						$("#frameHeight").val(v);
						break;
				}
			});
		},

		//验证
		validate : function(attrJson, $obj) {
			$.each(attrJson, function(k, v) {
				if (k == "isqequired") {
					$("[name='isQequired']").bootstrapSwitch('state', true);
				} else if (k == "uniqueness") {
					$("[name='unIqueness']").bootstrapSwitch('state', true);
				} else if (k == "minLength" || k == "maxLength" || k == "textFormat") {
					$("#" + k).val(v);
				} else if (k == "dateFormat") {
					$("#" + k).val(v.format);
					$("#startTime,#endTime").datetimepicker("remove").datetimepicker({
						language : "zh-CN", //汉化
						weekStart : 1,
						todayBtn : 1,
						autoclose : 1,
						format : v.format,
						todayHighlight : 1,
						startView : v.startView,
						minView : v.minView,
						maxView : v.maxView,
						forceParse : 0
					});
				} else if (k == "startTime" || k == "endTime") {
					$("#" + k).find("input").val(v);
				} else if (k == "selectTableCtrl") {
					$("#selectTable").find("option[queryId=" + v["formId"] + "]").attr("selected", "selected");
					var fieldForm = ezCommon.getFormFieldsData(v["formId"]);
					var fieldStr = null;
					if (fieldForm.length) {
						$.each(fieldForm, function(key, value) {
							fieldStr += '<option field="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
						});
					}
					if (v != undefined) {
						$("#selectCtrl").find("option:not(:first)").remove();
						$("#selectCtrl").append(fieldStr);
					}
					$("#selectCtrl").find("option[field=" + v["ctrlId"] + "]").attr("selected", "selected");
				}
			});
		},

		//选项
		item : function(attrJson, ctrlId) {
			var data = ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["data"];
			$.each(attrJson, function(k, v) {
				if (k == "items") {
					var $itemControlObj = $("#formSetting .itemControl"), ctrlName = $(".ctrlSelected").attr("ctrlid"), attrType = "item";
					$itemControlObj.empty();
					$.each(v, function(m, n) {
						var $itemAttrDiv = null;
						if (data) {
							if (data["dataBind"]["type"] == "dataSource") {
								var filedList = ezCommon.querySqlData(data["dataBind"]["value"]["sql"]);
								var filedHtml = '';
								$.each(filedList, function(key, value) {
									$.each(value, function(ks, vs) {
										if (vs) {
											filedHtml += '<div style="padding-left:0;padding-top:5px" class="col-md-6 itemDiv"><div class="input-group"><span class="input-group-addon"> <input type="checkbox"></span><input type="text" value="' + vs + '" class="form-control input-sm"><div class="deleteItem"></div></div></div>';
										}
									});
								});
								$itemAttrDiv = $(filedHtml);
							}
						} else {
							$itemAttrDiv = $('<div style="padding-left:0;padding-top:5px" class="col-md-6 itemDiv"><div class="input-group"><span class="input-group-addon"> <input type="checkbox"></span><div class="deleteItem"></div></div></div>');
							$itemAttrDiv.find("span").after('<input type="text" value="' + n['val'] + '" class="form-control input-sm">');

						}
						$itemControlObj.append($itemAttrDiv);
						/*require.async('./fd.ctrls', function(e) {
						 e.itemsEdit($itemAttrDiv.find("input[type='text']"), ctrlName, attrType);
						 if (data) {
						 $("#addItem").attr("disabled", "disabled");
						 $(".deleteItem", $itemControlObj).unbind("click");
						 $(".deleteItem", $itemControlObj).css("display", "none");
						 }
						 }); */
					});
				} else if (k == "checked") {

					if (!$.isEmptyObject(v)) {
						if ($(".ctrlSelected").attr("ctrl-type") == "CHECKBOX") {
							$.each(v, function(i, o) {
								$(".ctrlWraper").find(".checkbox-inline").eq(i).addClass("onChecked");
								$(".basicElementView").find(".itemDiv input[type='checkbox']").eq(i).attr("checked", "checked");
							});
						} else if ($(".ctrlSelected").attr("ctrl-type") == "DROPDOWN") {
							$.each(v, function(i, o) {
								var itemlist = $(".ctrlSelected").find(".ctrlWraper").find("option");
								itemlist.eq(i).attr("selected", "selected");
								$(".basicElementView").find(".itemDiv input[type='checkbox']").eq(i).attr("checked", "checked");
							});
						}
					}
				} else if (k == "itemRank") {
					if (v <= 4) {
						$("#itemRank").find("input[value='" + v + "']").click();
					}
				} else if (k == "selectLimit") {
					$(".ItemAttr .selectLimit").find("select option[value='" + v + "']").prop('selected', true);
				}
			});
		},

		//数据
		data : function(attrJson, $obj) {

			var getSysparam = function(sysParamType) {
				var sys = "";
				$.ajax({
					url : SITECONFIG.ROOTPATH + "/FormData/getSysParamValue ",
					type : "post",
					data : {
						"siteId" : SITECONFIG.SITEID,
						sysParamType : sysParamType,
					},
					dataType : "text",
					async : false,
					success : function(data) {
						sys = JSON.parse(data).data;
					}
				});
				return sys;
			};
			$.each(attrJson, function(key, value) {
				if (value["type"] == "systemParam") {
					value["value"]["value"] = getSysparam(value["value"]["id"]);
					$("#" + key).val(value["value"]["value"]);
				} else if (value["type"] == "date") {
					if (!value["value"]["value"])
						return;
					if (!value["value"]["dataformat"]) {
						value["value"]["dataformat"] = "yyyy-MM-dd HH:mm:ss";
					}
					switch(value["value"]["id"]) {
						case "assignDate":
							$("#" + key).val(value["value"]["value"]);
							break;
						case "currDate":
							var timeValue = new Date().format(value["value"]["dataformat"]);
							$("#" + key).val(timeValue);
							break;
						case "beforeDate":
							$("#" + key).val("当前系统时间前" + value["value"]["value"] + "天");
							break;
						case "afterDate":
							$("#" + key).val("当前系统时间后" + value["value"]["value"] + "天");
							break;
					}

				} else if (value["type"] == "pageParam") {
					var pageId = value["value"]["id"], val = value["value"]["value"];
					$("#" + key).val(val).attr({
						"valueType" : pageId,
						"dataType" : "pageParam",
						"toPageId" : value["value"]["toPageId"],
						"formPageId" : value["value"]["formPageId"]
					});
				} else if (value["type"] == "dataSource") {
					var valueType = value["value"]["id"], val = value["value"]["value"];
					$("#" + key).val(val).attr({
						"valueType" : valueType,
						"dataType" : "dataSource"
					});
				} else if (value["type"] == "randomNum") {
					var valueType = value["value"]["id"], val = value["value"]["value"];
					$("#" + key).val(val).attr({
						"valueType" : valueType,
						"dataType" : "randomNum"
					});
				} else {
					$("#" + key).val(value["value"]["value"]);
				}

			});

		},
	};
	module.exports = restore;
});
