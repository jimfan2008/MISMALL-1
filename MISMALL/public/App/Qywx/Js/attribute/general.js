/**
 * @author 柯斌
 * @desc 常规属性设置
 * @date 2015-06-29
 */
define(function(require, exports, module) {
	var formJson = require("../formJson.js");
	var undoRedo = require("../undoRedo.js");
	var setFun = {
		/**
		 * 设置标题
		 */
		title : function(selectObj, ctrlName, attrType, typeCtrl) {
			switch(typeCtrl) {
				case "BUTTON":
					$("#ctrlTitle").val(selectObj.find(".fieldTitle:first").val());
					break;
				case "compLogic":
					$("#ctrlTitle").val(selectObj.find(".dynamicName").text()).attr("disabled", "disabled");
					break;
				case "systemCp":
					$("#ctrlTitle").val(ezCommon.controlLists[ezCommon.formId][selectObj.attr('ctrlid')]["attrs"]["general"]["ctrlTitle"]);
					break;
				default :
					var text = selectObj.attr("fieldtitle") || selectObj.find(".fieldTitle:first").text();
					$("#ctrlTitle").val(text);
					break;
			}

			onValueChange($("#ctrlTitle")[0], function() {
				var ctrlTitle = "ctrlTitle", $ctrlTitle = $("#" + ctrlTitle), value = $ctrlTitle.val();
				var oldVal = selectObj.find(".fieldTitle:first").text();
				if (typeCtrl == "compLogic") {
					//selectObj.find(".dynamicName").text();
				} else {
					selectObj.find(".fieldTitle:first").text(value);
					selectObj.find(".fieldTitle:first").val(value);
				}
				var ctrlTitleLogoId = $(".selectedForm").parent().attr("id");
				if (oldVal != value) {
					undoRedo.ctrlTitleUndo(selectObj, ctrlTitle, oldVal, value, ctrlTitleLogoId);
				}
				formJson.update(ctrlName, attrType, ctrlTitle, value);
			});

		},
		/*
		 * 设置上传图片大小
		 */
		uploadPictureSize : function(selectObj, ctrlName, attrType, typeCtrl) {
			$("#uploadPictureSize").numeral();
			$("#pictureUnit").change(function() {
				var pictureUnit = "pictureUnit";
				var uploadPictureUnit = $("#pictureUnit").find("option:selected").text();
				selectObj.attr("pictureUnit", uploadPictureUnit);
				formJson.update(ctrlName, attrType, pictureUnit, uploadPictureUnit);
			});
			onValueChange($("#uploadPictureSize")[0], function() {
				var uploadPictureSize = "uploadPictureSize";
				var uploadPictureVal = $("#uploadPictureSize").val();
				selectObj.attr("uploadPictureSize", uploadPictureVal);
				formJson.update(ctrlName, attrType, uploadPictureSize, uploadPictureVal);
			});
		},
		/*
		 * 设置上传图片裁剪框尺寸
		 */
		setTheFrameSize : function(selectObj, ctrlName, attrType, typeCtrl) {
			$("#frameWidth").numeral();
			$("#frameHeight").numeral();
			onValueChange($("#frameWidth")[0], function() {
				var frameWidth = "frameWidth";
				var frameWidthVal = $("#frameWidth").val();
				selectObj.attr("frameWidth", frameWidthVal);
				formJson.update(ctrlName, attrType, frameWidth, frameWidthVal);
			});
			onValueChange($("#frameHeight")[0], function() {
				var frameHeight = "frameHeight";
				var frameHeightVal = $("#frameHeight").val();
				selectObj.attr("frameHeight", frameHeightVal);
				formJson.update(ctrlName, attrType, frameHeight, frameHeightVal);
			});
		},
		/*
		 * 修改表单数据
		 */
		formDataUpdate : function(selectObj, ctrlName, attrType, typeCtrl) {
			if (selectObj.closest("[ctrl-type='compLogic']").size()) {
				//$("[name='formDataUpdate']").closest(".col-md-12").show();
				var flag = selectObj.attr("formDataUpdate");
				setBootstrapSwitch("formDataUpdate", function(event, state) {
					state ? selectObj.attr("formDataUpdate", "true") : selectObj.attr("formDataUpdate", "false");
				}, flag);
			}

		},

		/**
		 * 设置活动名称
		 */
		activityName : function(selectObj, ctrlName, attrType, typeCtrl) {
			$("#activityName").val(ezCommon.controlLists[ezCommon.formId][selectObj.attr('ctrlid')]["attrs"]["general"]["ctrlTitle"]);
			onValueChange($("#activityName")[0], function() {
				var activityName = "activityName", $activityName = $("#" + activityName), value = $activityName.val();
				selectObj.find(".fieldTitle:first").text(value);
				selectObj.find(".fieldTitle:first").val(value);
				formJson.update(ctrlName, attrType, activityName, value);
			});
		},
		/**
		 * 设置是否隐藏
		 */
		isHidden : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否隐藏
			setBootstrapSwitch("isHidden", function(event, state) {
				var ctrlisHidden = "isHidden";
				var oldOpacity = selectObj.css("opacity");
				//state == true ? selectObj.css("opacity", "0.2") : selectObj.css("opacity", "1");
				state == true ? $('[ctrlid=' + ctrlName + ']').css("opacity", "0.2") : $('[ctrlid=' + ctrlName + ']').css("opacity", "1");
				var newOpacity = selectObj.css("opacity");
				var isHiddenLogoId = $(".selectedForm").parent().attr("id");
				if (oldOpacity != newOpacity) {
					undoRedo.isHiddenUndo(selectObj, ctrlisHidden, oldOpacity, newOpacity, isHiddenLogoId);
				}
				formJson.update(ctrlName, attrType, ctrlisHidden, state == true ? 1 : "@default@");
			});
		},
		/**
		 * 设置是否禁用
		 */
		isEnabled : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否被禁用
			$("[name='DisEnabled']").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
				var ctrlDisEnabled = "DisEnabled";
				var oldstate = selectObj.find(".btn").attr("disabled");
				state == true ? $('[ctrlid=' + ctrlName + ']').find(".btn").attr("disabled", "disabled") : $('[ctrlid=' + ctrlName + ']').find(".btn").removeAttr("disabled");
				var newstate = selectObj.find(".btn").attr("disabled");
				var isEnabledLogoId = $(".selectedForm").parent().attr("id");
				if (oldstate != newstate) {
					undoRedo.isEnabledUndo(selectObj, ctrlDisEnabled, oldstate, newstate, isEnabledLogoId);
				}
				formJson.update(ctrlName, attrType, ctrlDisEnabled, state == true ? 1 : "@default@");
			});
		},

		/**
		 * 设置是否为提交按钮
		 */
		isSubmit : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否为提交按钮
			setBootstrapSwitch("isSubmit", function(event, state) {
				var ctrlisSubmit = "isSubmit";
				if (state == true) {//切换到提交按钮
					/*var $tempBtn = selectObj.find("input.ctrlBtn").clone();
					 selectObj.find("input.ctrlBtn").replaceWith($tempBtn);
					 $tempBtn.attr("issubmit", "true");//.val("提交");
					 $('[ctrlid=' + ctrlName + ']').find(".ctrlBtn ").val("提交");
					 selectObj.find(".submit_tipWrap").remove();*/
					$("input.ctrlBtn").attr("issubmit", "true");
					$('[ctrlid=' + ctrlName + ']').find(".ctrlBtn ").val("提交");
					selectObj.find(".submit_tipWrap").remove();
					selectObj.append('<div class="submit_tipWrap"><div class="submitTip"><span class="text_font">是否确认提交数据？</span></div><div class="submitBtnWraper"><input id="yes"type="button"class="btn btn-primary btn-sm"value="确认"/>&nbsp;&nbsp;&nbsp;<input id="no"type="button"class="btn btn-primary btn-sm"value="取消"/></div></div>');
				} else {//切换到普通按钮

					selectObj.find(".submit_tipWrap").remove();
					/*var $tempBtn = selectObj.find("input.ctrlBtn").clone();
					 selectObj.find("input.ctrlBtn").replaceWith($tempBtn);
					 var buttonText = $tempBtn.attr("oldTitleValue");
					 $tempBtn.attr("issubmit", "false");*/
					selectObj.find("input.ctrlBtn").attr("issubmit", "false");
					$('[ctrlid=' + ctrlName + ']').find(".ctrlBtn ").val("按钮");
				}
				formJson.update(ctrlName, attrType, ctrlisSubmit, state == true ? 1 : "@default@");

			}, selectObj.find("[issubmit='true']").size() ? true : false);
		},

		/**
		 * 设置按钮单击颜色
		 */
		isClickColor : function(selectObj, ctrlName, attrType, typeCtrl) {

		},

		/**
		 * 设置按钮宽度改变
		 */
		btnWidthChange : function(selectObj, ctrlName, attrType, typeCtrl) {

		},

		/**
		 * 奖项数量设置
		 */
		lotteryNumber : function(selectObj, ctrlName, attrType, typeCtrl) {
			$(".lotteryLimit select").unbind("change").on("change", function() {
				var lottery = "lottery";
				var lotteryNumber = $(this).val();
				var imageUrl = SITECONFIG.PUBLICPATH + "/App/Qywx/Images/lottery" + lotteryNumber + ".png";
				selectObj.find("#lotteryImg").attr("src", imageUrl);
				formJson.update(ctrlName, attrType, lottery, lotteryNumber);
			});
		},

		/**
		 * 抽奖机会设置
		 */
		lotteryChance : function(selectObj, ctrlName, attrType, typeCtrl) {
			//最短字符
			$("#lotteryChance").numeral();
			//  只能输入数字
			onValueChange($("#lotteryChance")[0], function() {
				var lotteryChance = "lotteryChance";
				var lotteryChanceVal = $("#lotteryChance").val();
				formJson.update(ctrlName, attrType, lotteryChance, lotteryChanceVal);
			});
		},

		/**
		 * 设置单位
		 */
		unit : function(selectObj, ctrlName, attrType, typeCtrl) {
			//$("#unit").val(selectObj.find(".unit").text());
			onValueChange($("#unit")[0], function() {
				var unit = "unit";
				var oldVal = selectObj.find(".unit").text();
				var ctrlUnit = $("#unit").val();
				if (ctrlUnit == "") {
					//selectObj.find(".ctrlWraper").find(">div:first").removeClass("input-group").find(">span").css("display", "none");
					selectObj.find(".ctrlWraper").find(">span").css("display", "none");
				} else {
					//	selectObj.find(".ctrlWraper").find(">div").addClass("input-group").find(">span").removeAttr("style");
					selectObj.find(".ctrlWraper").find(">span").removeAttr("style");
				}
				var isUnitLogoId = $(".selectedForm").parent().attr("id");
				if (oldVal != ctrlUnit) {
					undoRedo.isUnitUndo(selectObj, unit, oldVal, ctrlUnit, isUnitLogoId);
				}
				selectObj.find(".unit").text(ctrlUnit);
				formJson.update(ctrlName, attrType, unit, ctrlUnit);
			});
		},

		/**
		 * 设置框外提示
		 */
		proInfo : function(selectObj, ctrlName, attrType, typeCtrl) {
			//提示信息
			//$("#tip").val(selectObj.find(".ctrlproInfo").text());
			onValueChange($("#tip")[0], function() {
				var ctrlInfo = "tip";
				var oldVal = selectObj.find(".ctrlproInfo").text();
				var ctrlInfoolen = $("#tip").val();
				selectObj.find(".ctrlproInfo").text(ctrlInfoolen);
				var ctrlInfoLogoId = $(".selectedForm").parent().attr("id");
				if (oldVal != ctrlInfoolen) {
					undoRedo.ctrlInfoUndo(selectObj, ctrlInfo, oldVal, ctrlInfoolen, ctrlInfoLogoId);
				}
				formJson.update(ctrlName, attrType, ctrlInfo, ctrlInfoolen);
			});
		},

		/**
		 * 设置框内提示
		 */
		placeholder : function(selectObj, ctrlName, attrType, typeCtrl) {
			//内部提示
			//$("#InnerTip").val(selectObj.find(".ctrlisrdonly ").attr("placeholder"));
			onValueChange($("#InnerTip")[0], function() {
				var ctrlInfo = "InnerTip";
				var oldVal = selectObj.find("input").attr("placeholder") || selectObj.find("textarea").attr("placeholder");
				var ctrlInfoolen = $("#InnerTip").val();
				var ctrlInnerLogoId = $(".selectedForm").parent().attr("id");
				if (oldVal != ctrlInfoolen) {
					undoRedo.ctrlInnerUndo(selectObj, ctrlInfo, oldVal, ctrlInfoolen, ctrlInnerLogoId);
				}
				selectObj.find("input").attr("placeholder", ctrlInfoolen);
				selectObj.find("textarea").attr("placeholder", ctrlInfoolen);
				formJson.update(ctrlName, attrType, ctrlInfo, ctrlInfoolen);
			});
		},

		/**
		 * 设置是否有边框
		 */
		isBorder : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否有边框
			setBootstrapSwitch("isBorder", function(event, state) {
				var ctrlisEdit = "isBorder";
				state == false ? selectObj.find("input").css("border", "none") : selectObj.find("input").css("border", "1px solid #ccc");
				formJson.update(ctrlName, attrType, ctrlisEdit, state == false ? 1 : "@default@");
			});
		},

		/**
		 * 设置是否为只读
		 */
		isRdOnly : function(selectObj, ctrlName, attrType, typeCtrl) {
			setBootstrapSwitch("isRdOnly", function(event, state) {
				var ctrlrdOnly = "isRdOnly";
				var oldstate = selectObj.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled");
				state == true ? selectObj.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled", "disabled") : selectObj.find(".ctrlWraper input,.ctrlWraper textarea").removeAttr("disabled");
				var newstate = selectObj.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled");
				var isRdOnlyLogoId = $(".selectedForm").parent().attr("id");
				if (oldstate != newstate) {
					undoRedo.isRdOnlyUndo(selectObj, ctrlrdOnly, oldstate, newstate, isRdOnlyLogoId);
				}
				formJson.update(ctrlName, attrType, ctrlrdOnly, state == true ? 1 : "@default@");
			});
		},

		/**
		 * 设置形状
		 */
		isTitle : function(selectObj, ctrlName, attrType, typeCtrl) {
			$(".inputSet a").unbind("click").on("click", function() {
				$(".inputSet a").css("border", "1px solid #666");
				$(this).css("border", "1px solid #2f96b4");

				var ctrlisTitle = "isTitle";
				var mark;
				if ($(this).hasClass("inputType0")) {
					mark = 0;
				} else if ($(this).hasClass("inputType1")) {
					mark = 1;
				} else {
					mark = 2;
				}
				if (mark == 0) {
					selectObj.find(".fieldTitle").css("display", "block");
					$(".inputStyle2").css("color", "#666");
					$(".inputStyle0").css({
						"color" : "#2f96b4",
						"border-right" : "1px solid #2f96b4"
					});
					selectObj.find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-8");
					selectObj.find(".fieldTitle").css({
						"border" : "1px solid #ccc",
						"border-right" : "0px",
						"margin-left" : "12px",
						"height" : "34px"
					});
				} else if (mark == 1) {
					selectObj.find(".fieldTitle").css({
						"border" : "0px ",
						"margin-left" : "0px"
					});
					$(".inputStyle2").css("color", "#666");
					$(".inputStyle0").css({
						"color" : "#666",
						"border-right" : "1px solid #666"
					});
					selectObj.find(".fieldTitle").css("display", "none");
					selectObj.find(".col-xs-8").removeClass("col-xs-8").addClass("col-xs-12");

				} else {
					selectObj.find(".fieldTitle").css({
						"border" : "0px ",
						"margin-left" : "0px"
					});
					$(".inputStyle2").css("color", "#2f96b4");
					$(".inputStyle0").css({
						"color" : "#666",
						"border-right" : "1px solid #666"
					});

					selectObj.find(".fieldTitle").css("display", "block");
					selectObj.find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-8");
				}

				formJson.update(ctrlName, attrType, ctrlisTitle, state = mark);

			});
		},

		/**
		 * 设置添加选择
		 */
		addChoose : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否添加请选择
			$("[name='addChoose']").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
				var ctrlisEdit = "addChoose";
				if (state) {
					if (selectObj.find("select option[value='__blank']").length <= 0) {
						var option = '<option value="__blank" selected = "selected">---请选择---</option>';
						if (selectObj.find("select option").length > 0) {
							selectObj.find("select option:first").before(option);
						} else {
							selectObj.find("select").append(option);
						}
					}
				} else {
					selectObj.find("option[value='__blank']").remove();
				}

				formJson.update(ctrlName, attrType, ctrlisEdit, state == true ? 1 : 0);
			});
		},

		/**
		 * 设置数据组件标题显示或者隐藏
		 */
		addFiledTitle : function(selectObj, ctrlName, attrType, typeCtrl) {
			setBootstrapSwitch("addFiledTitle", function(event, state) {
				var addFiledTitle = "addFiledTitle";
				var $isDropInComp = selectObj.closest("[ctrl-type='compLogic']");
				var $colUnit = selectObj.closest("[colUnit]");
				$isDropInComp.find("[colunit]").each(function() {
					var ctrlId = selectObj.attr("ctrlId");
					var $tempCtrl = $(this).find("[ctrlId = '" + ctrlId + "']");
					var $tempCtrlTitle = $tempCtrl.find(".fieldDataTitle");
					if (state) {
						$tempCtrlTitle.show();
					} else {
						$tempCtrlTitle.hide();
					}
				});
				formJson.update(ctrlName, attrType, addFiledTitle, state == false ? 1 : "@default@");
			});
		},

		/**
		 * 设置组件列数
		 */
		setDynaCols : function(selectObj, ctrlName, attrType, typeCtrl) {
			//设置组件列数
			$(".setDynaCols").change(function() {
				if (selectObj.attr("ctrl-type") == "compLogic") {
					var colNum = $(this).val();
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
						e.setDynaCols(colNum);
					});
				}
			});
		},

		/**
		 * 组件是否首次加载数据
		 */
		is_firstloaddata : function(selectObj, ctrlName, attrType, typeCtrl) {
			var firstloaddata = selectObj.attr("firstloaddata");
			firstloaddata = !(firstloaddata == "false" || !firstloaddata);
			$("[name='firstloaddata']").bootstrapSwitch({
				state : firstloaddata
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				if (state) {
					selectObj.attr("firstloaddata", true);
				} else {
					selectObj.attr("firstloaddata", false);
				}

			});
		},

		/**
		 * 勾选数据
		 */

		checkedData : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否勾选
			var checkedData = selectObj.attr("checkedData");
			var $dynamic = selectObj;
			checkedData = (checkedData == "false" || !checkedData) ? false : true;
			$("[name='checkedData']").bootstrapSwitch({
				state : checkedData
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				$dynamic.find(".checked").remove();
				if (state) {
					$dynamic.find("[colunit] >.colInner").addClass("col-md-11 col-xs-11").css({
						"width" : "91.6667%",
					}).before('<div class="col-md-1 checked"><input type="checkbox" value=""  name="checke"></div>');
					selectObj.attr("checkedData", true);
				} else {
					selectObj.attr("checkedData", false);
					$dynamic.find(".checked").remove();
					$dynamic.find("[colunit] >.colInner").css("width", "100%").removeClass("col-md-11 col-xs-11").addClass("col-md-12");

				}

			});
		},

		/**
		 * 修改组件数据
		 */
		modifyDataBtn : function(selectObj, ctrlName, attrType, typeCtrl) {
			//修改当前选中动态组件
			$(".modifyDataBtn").unbind("click").click(function() {
				var ptlHeight = $(window).height();
				var compStatus = $(this).attr('class'), ctrlId = ezCommon.Obj.attr("ctrlid");
				var formId = ezCommon.Obj.attr("formid"), fieldname = [];
				var customName = ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["general"]["ctrlTitle"];
				$("#theMaskLayer").fadeIn(500);
				if(formId){
					$("#customcomponent").attr("compStatus", "modify");
					$("#customcomponent").height(ptlHeight).animate({
						width : "950"
					}, 500, function() {
						$(".ptlMenu,.pageTplListWrap").fadeIn(300);
						$(this).find("input[name='componentname']").val(customName);
					});
					$.each($(this).find(".thisisField"), function(k, v) {
						fieldname.push($(this).attr("fieldname"));
					});
				}else{
					$("#customcomponent").attr("compStatus", "comp-add");
					$("#customcomponent").height(ptlHeight).animate({
						width : "950"
					}, 500, function() {
						//$(".ptlMenu,.pageTplListWrap").fadeIn(300);
						//$(this).find("input[name='componentname']").val(customName);
					});
				}

				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/events/compEvent.js", function(e) {
					e.setDataSourse(compStatus);
				});

			});
		},

		isEdit : function(selectObj, ctrlName, attrType, typeCtrl) {
			//是否可编辑
			var isEdit = selectObj.attr("isEdit");
			isEdit = !(isEdit == "true" || isEdit);
			$("[name='isEdit']").bootstrapSwitch({
				state : isEdit
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				if (state) {
					selectObj.attr("isEdit", true);
				} else {
					selectObj.attr("isEdit", false);
				}

			});
		},

		refreshData : function(selectObj, ctrlName, attrType, typeCtrl) {
			//设置动态组件是否自动刷新
			var autorefresh = selectObj.attr("autorefresh") ? true : false;
			$("[name='refreshData']").bootstrapSwitch({
				state : autorefresh
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				if (state) {
					$(".setRefreshData").show();
					selectObj.attr("autorefresh", 3);
					$("#dynaFreshTime").val(3);
				} else {
					$(".setRefreshData").hide();
					selectObj.removeAttr("autorefresh");
				}

			});

			var isAppendData = selectObj.attr("isAppendData") ? false : true;
			$("[name='isAppendData']").bootstrapSwitch({
				state : isAppendData,
				onText : "是",
				offText : "否"
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				if (state) {
					selectObj.removeAttr("isAppendData");
				} else {
					selectObj.attr("isAppendData", "true");
				}
			});

			//设置动态组件数据排序方式
			var sortData = selectObj.attr("sortData") == "ASC" ? true : false;
			$("[name='sortData']").bootstrapSwitch({
				state : sortData,
				onText : "升序",
				offText : "降序",
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				if (state) {
					selectObj.attr("sortData", "ASC");
				} else {
					selectObj.attr("sortData", "DESC");
				}

			});

			//还原组件数据是否自动刷新
			if (autorefresh) {
				$(".setRefreshData").show();
				$("#dynaFreshTime").val(ctrlObj.attr("autorefresh"));
			} else {
				$(".setRefreshData").hide();
			}

			//设置动态组件数据自动刷新间隔时间
			onValueChange($("#dynaFreshTime")[0], function() {
				ctrlObj.attr("autorefresh", $("#dynaFreshTime").val());
			});
		}
	};
	var general = {
		general : function(ctrl) {
			if (!ctrl)
				return;
			if (!objIsnull(ctrl["attrs"]) || !objIsnull(ctrl["attrs"]["General"]))
				return;
			if (objIsnull($(".validsuccess"))) {
				$(".validsuccess").remove();
			}
			if (objIsnull($(".error"))) {
				$("label[class='error']").remove();
			}

			//var selectObj = ezCommon.Obj;
			var selectObj =$(".selectedForm ").find(".ctrlSelected");
			var ctrlName = selectObj.attr("ctrlId"), attrType = "general";
			var typeCtrl = selectObj.attr("ctrl-type");

			$.each(ctrl["attrs"]["General"], function(k, v) {
				if (objIsnull(setFun[v])) {
					setFun[v](selectObj, ctrlName, attrType, typeCtrl);
				} else {
					//alert();
					console.error("此常规属性没有对应的处理方法，请添加处理方法" + v);
				}
			});
		},
		general1 : function(ctrl) {
			if (!ctrl)
				return;

			if (objIsnull($(".validsuccess"))) {
				$(".validsuccess").remove();
			}
			if (objIsnull($(".error"))) {
				$("label[class='error']").remove();
			}

			var selectObj = ezCommon.Obj;
			var ctrlName = selectObj.attr("ctrlId"), attrType = "general";
			var typeCtrl = selectObj.attr("ctrl-type");

			setBootstrapSwitch("isTitleElse", function(event, state) {
				var ctrlisTitleElse = "isTitleElse";
				if (state == false) {
					selectObj.find(".fieldTitle").css("display", "none");
					selectObj.find(".col-xs-9").removeClass("col-xs-9").addClass("col-xs-12");
				} else {
					selectObj.find(".fieldTitle").css("display", "block");
					selectObj.find(".col-xs-12").removeClass("col-xs-12").addClass("col-xs-9");
				}
				formJson.update(ctrlName, attrType, ctrlisTitleElse, state == false ? 1 : "@default@");
			});

			//是否可编辑
			setBootstrapSwitch("isEdit", function(event, state) {
				var ctrlisEdit = "isEdit";
				state == false ? selectObj.find(".ctrlIsedit").attr("readonly", "readonly") : selectObj.find(".ctrlIsedit").removeAttr("readonly");
				formJson.update(ctrlName, attrType, ctrlisEdit, state == true ? 1 : "@default@");
			});

			//是否有弹出输入层
			$("[name='isYesPoplayerInput']").bootstrapSwitch().unbind("switchChange.bootstrapSwitch").on('switchChange.bootstrapSwitch', function(event, state) {
				var ctrlisYesPoplayerInput = "isYesPoplayerInput", ctrlisPoplayerInput = "isPoplayerInput";
				if (state == true) {
					$("[name='isPoplayerInput']").parents(".col-md-12").show();
					//是否打开弹出输入层
					$("[name='isPoplayerInput']").bootstrapSwitch().unbind("switchChange.bootstrapSwitch").on('switchChange.bootstrapSwitch', function(event, poplayerInputState) {
						if (poplayerInputState == true && !selectObj.parent().next().hasClass("poplayer-in") && !selectObj.parent().next().hasClass("poplayer-out")) {
							var poplayerInput = '<div class="poplayer-in colInner"></div>';
							selectObj.parent().after(poplayerInput);
						}
						if (poplayerInputState == true) {
							//selectObj.parent().next().show();
							selectObj.parent().next().removeClass("poplayer-out").addClass("poplayer-in");
						}
						if (poplayerInputState == false && selectObj.parent().next().hasClass("poplayer-in")) {
							//selectObj.parent().next().hide();
							selectObj.parent().next().removeClass("poplayer-in").addClass("poplayer-out");
						}
						formJson.update(ctrlName, attrType, ctrlisPoplayerInput, poplayerInputState == true ? 1 : "@default@");
					});

				} else {
					$("[name='isPoplayerInput']").parents(".col-md-12").hide();
					$("[name='isPoplayerInput']").bootstrapSwitch('state', false);
					formJson.update(ctrlName, attrType, ctrlisPoplayerInput, poplayerInputState = "@default@");
				}
				formJson.update(ctrlName, attrType, ctrlisYesPoplayerInput, state == true ? 1 : "@default@");
			});

			//是否压缩
			$("[name='isCompressPic']").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
				var ctrlisCompress = "isCompressPic";
				//state == true ? selectObj.css("opacity", "0.2") : selectObj.css("opacity", "1");
				formJson.update(ctrlName, attrType, ctrlisCompress, state == true ? 1 : "@default@");
			});

			//是否指定图片路径
			$("[name='isFormData']").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {

				var ctrlisFormData = "isFormData";
				var $_this = "", $that = $(this), ImageFormId = "", CCImageName = "";
				if (state) {
					var formListJson = null, tableListHtml = "";
					if ($(this).parents(".col-md-12").find(" > div:not(:first)").length < 0) {
						$(this).parents(".col-md-12").find(" > div:not(:first)").show();
					} else {
						var flowId = 1;
						_commonAjax({
							type : "POST",
							url : SITECONFIG.APPPATH + "/Query/getFlowDataTable",
							data : {
								"siteId" : SITECONFIG.SITEID,
								"flowId" : flowId
							},
							processData : false,
							dataType : 'json',
							async : false,
							success : function(result) {

								if (result)
									$.each(result, function(key, value) {

										if (!(value["tableTitle"] == "粉丝列表" || value["tableTitle"] == "微信分享详情" || value["tableTitle"] == "制作层数据" || value["tableTitle"] == "订单信息")) {

											tableListHtml += '<option formid="' + value["ID"] + '" formName = "' + value["tableName"] + '">' + value["tableTitle"] + '</option>';
										}

									});
								var $selectTable = $('<div class = "col-md-6" style="margin-top:2px"><select class="tabelItem form-control"><option>请选择</option>' + tableListHtml + '</select><div class="childrenTalbeItem"></div></div>');
								$that.parents(".col-md-12").append($selectTable);
								$selectTable.find(".tabelItem").on("change", function() {
									var childrenListHtml = "";
									$_this = $(this);
									ImageFormId = $_this.find("option:selected").attr("formid");
									_commonAjax({
										type : "POST",
										processData : false,
										data : {
											"siteId" : SITECONFIG.SITEID,
											"formId" : ImageFormId
										},
										url : SITECONFIG.ROOTPATH + "/FormData/getAFormFiledsInfo",
										dataType : 'json',
										async : false,
										success : function(r) {
											if (r) {
												$.each(r, function(k, v) {
													if (v["controlType"].indexOf("IMAGE") >= 0) {
														childrenListHtml += '<option fieldname="' + v["fieldName"] + '" >' + v["fieldTitle"] + '</option>';
													}
												});
												$selectChildrenTable = $('<select class="tableChildrenItem form-control"><option>请选择</option>' + childrenListHtml + "</select>");
												CCImageName = $selectChildrenTable.parent().find("option:selected").attr("fieldname");
												$_this.parent().find(".childrenTalbeItem").empty().append($selectChildrenTable);
												$selectChildrenTable.parent().find(".tableChildrenItem").on("change", function() {
													CCImageName = $selectChildrenTable.parent().find("option:selected").attr("fieldname");
													formJson.update(ctrlName, attrType, ctrlisFormData, state == true ? ImageFormId + "." + CCImageName : "@default@");
												});
											}
										}
									});
								});

							}
						});

					}
				} else {
					$(this).parents(".col-md-12").find(" > div:not(:first)").hide();
					formJson.update(ctrlName, attrType, ctrlisFormData, state == "@default@");
				}

			});

			//选择单选框样式
			$("#formSetting .radioset a").unbind("click").on("click", function() {
				var ctrlselectedView = "selectedView";
				var mark;
				if ($(this).hasClass("radioType0")) {
					mark = 0;
				} else if ($(this).hasClass("radioType1")) {
					mark = 1;
				} else {
					mark = 2;
				}

				$("#formSetting .radioset a").css("border", "1px solid #fafafa");
				$(this).css("border", "1px solid #2f96b4");
				var itemObj = selectObj.find(".ctrlWraper .itemLabel");
				var state = false;

				if (mark == 0) {
					if (!itemObj.hasClass("radioImg")) {
						state = false;
						selectObj.find(".ctrlWraper").removeClass("btnRadio circleRadio").addClass("initRadio");
						itemObj.removeClass("buttonType radioImgOval").addClass("radioImg");
					}
				} else if (mark == 1) {
					if (!itemObj.hasClass("buttonType")) {
						state = true;
						selectObj.find(".ctrlWraper").removeClass("initRadio circleRadio").addClass("btnRadio");
						itemObj.removeClass("radioImg radioImgOval").addClass("buttonType");
					}
				} else if (mark == 2) {
					if (!itemObj.hasClass("radioImgOval")) {
						state = true;
						selectObj.find(".ctrlWraper").removeClass("initRadio btnRadio").addClass("circleRadio");
						itemObj.removeClass("radioImg buttonType").addClass("radioImgOval");
					}
				}
				//state=true     button样式 false原始radio样式
				formJson.update(ctrlName, attrType, ctrlselectedView, state = mark);
			});

		},
	};

	/**
	 * @desc 设置属性滑动开关
	 * @param String name
	 * @param Function func
	 */
	function setBootstrapSwitch(name, func, flag) {
		$("[name='" + name + "']").bootstrapSwitch({
			state : flag
		}).on('switchChange.bootstrapSwitch', func);
	}


	module.exports = general;
});
