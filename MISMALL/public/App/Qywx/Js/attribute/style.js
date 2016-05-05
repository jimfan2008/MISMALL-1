/**
 * @author 柯斌
 * @desc 样式属性设置
 */

define(function(require, exports, module) {
	var formJson = require("../formJson.js"), undoRedo = require("../undoRedo.js?h=1"), showcolor = "", setSlideFlag, singleFlag, setColorFlag, ctrlObj, ctrlId, ctrlType, bgObjId, setList;
	var style = {

		//显示属性的菜单父容器对象,在ezSite中为弹出的菜单对象$("#subContextMenu")
		panalObj : isObjNull($("#subContextMenu")) || $("body"),
		style : function(ctrl) {
			initSettings(ctrl);
		}
	};
	/**
	 * 面板属性列表加载完成时，绑定（文字对齐，颜色选择器，滑块等）
	 * @param     string     ctrlType     控件类型
	 * @param     object     ctrlObj	  控件对象
	 */
	function initSettings(ctrl) {
		//调用按钮点击颜色事件
		ctrlObj = $(".ctrlSelected");
		ctrlId = ctrlObj.attr("ctrlid");
		ctrlType = ctrlObj.attr("ctrl-type");
		setSlideFlag = singleFlag = setColorFlag = true;
		if (ctrl["attrs"] != undefined) {
			var styleList = ctrl["attrs"]["style"];
			if (!ctrl["attrs"]["style"])
				return false;
			for (var i = 0; i < styleList.length; i++) {
				if (objIsnull(setFun[styleList[i]])) {
					setFun[styleList[i]](ctrlObj, ctrlType, ctrlId);
				} else {
					//console.error(styleList[i]);
				}
			}
			showadVal();
		}

	}

	var setFun = {

		/**
		 * @desc 更换图片
		 */
		changeImg : function() {
			$(".changeBackgroundImg").unbind("click").click(function() {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/changeImage.js", function(e) {
					e.changeImg();
				});
			});
		},
		
		/**
		 * 将定位栏设置为导航栏 
		 */
		fixedColbox : function() {
			//固定在头部
			$("#fixedTop").unbind("click").click(function() {
				$("#fixedTop").css({
					"color":"white",
					"background":"#0099FF"
				});
				$("#fixedBottom").css({
					"color":"black",
					"background":"white"
				});
				//$(".ctrlSelected").removeClass("ctrlSelected");
				$(".topNavWraper").show();
				ezCommon.Obj.appendTo($(".topNavWraper"));
				//设置页面顶部或底部的导航菜单
				ezCommon.setNav();
				
				ezCommon.resetFormHeight();
				navColInnerSortable(ezCommon.Obj.find(".colInner"));				
			});
			//固定在底部
			$("#fixedBottom").unbind("click").click(function() {
				$("#fixedBottom").css({
					"color":"white",
					"background":"#0099FF"
				});
				$("#fixedTop").css({
					"color":"black",
					"background":"white"
				});
				$(".bottomNavWraper").show();
				ezCommon.Obj.appendTo($(".bottomNavWraper"));
				//设置页面顶部或底部的导航菜单
				require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.js", function() {
					require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.css");
					ezCommon.setNav();
				});
				
				ezCommon.resetFormHeight();
				navColInnerSortable(ezCommon.Obj.find(".colInner"));	
			});
		},
		
		/**
		 * @desc 边框颜色
		 */
		borderColor : function() {
			setColor();
		},

		/**
		 * @desc 文字颜色
		 */
		textColor : function() {
			setColor();
		},
		/**
		 * @desc 图片宽度
		 */
		pictureWidth : function() {
			setSlide();
			setSpinnerSingle();
		},

		/**
		 * @desc
		 */
		changeImage : function() {

		},

		/**
		 * @desc 边框 圆角 外边距 内边距 切换
		 */
		fourChangeStyle : function() {
			//基本属性处边框大小等四项样式切换事件
			$("#sliderSpring li").click(function() {
				var nowValue = $(this).attr("value");
				$(".borderWidthStyle,.borderRadiusStyle,.marginStyle,.paddingStyle").hide();
				$("." + nowValue).show();
				$("#sliderSpring li").css("background", "white");
				$(this).css("background", "#EEEEEE");
			});
		},

		/**
		 * @desc 边框宽度
		 */
		borderWidth : function() {
			setSlide();
		},

		/**
		 * @desc 边框
		 */
		borderSingle : function() {
			setSpinnerSingle();
		},

		/**
		 * @desc 内边距
		 */
		padding : function() {
			setSlide();
		},

		/**
		 * @desc
		 */
		paddingSingle : function() {
			setSpinnerSingle();
		},

		/**
		 * @desc 外边距
		 */
		margin : function() {
			setSlide();
		},

		/**
		 * @desc
		 */
		marginSingle : function() {
			setSpinnerSingle();
		},

		/**
		 * @desc 圆角
		 */
		borderRadius : function() {
			setSlide();
		},

		borderRadiusSingle : function() {
			setSpinnerSingle();
		},

		/**
		 * @desc
		 */
		shuiping : function() {
			publicShadow("shuiping");

		},

		/**
		 * @desc
		 */
		chuizhi : function() {
			publicShadow("chuizhi");
		},

		/**
		 * @desc
		 */
		bianhua : function() {
			publicShadow("bianhua");
		},

		/**
		 * @desc
		 */
		chicun : function() {
			publicShadow("chicun");
		},

		/**
		 * @desc
		 */
		yanse : function() {

		},

		/**
		 * 设置背景颜色
		 */
		bgColor : function() {
			setColor();
		},

		/**
		 *设置字体大小
		 */
		fontSize : function() {
			setSlide();
			setSpinnerSingle();
		},

		/**
		 *设置行距
		 */
		lineHeight : function() {
			setSlide();
			setSpinnerSingle();
		},

		/**
		 *设置按钮宽度
		 */
		btnWidthChange : function() {
			setSlide();
			setSpinnerSingle();
		},

		/**
		 *设置按钮位置
		 */
		buttonAlign : function() {
			setButtonAlign();
		},

		/**
		 *设置字体
		 */
		fontFamily : function() {
			$(".font-family option", style.panalObj).unbind("click").on("click", function() {
				$('[ctrlid=' + ctrlId + ']').css("font-family", $(this).attr("value"));
			});
		},

		/**
		 *设置字体加粗
		 */
		fontWeight : function() {
			//文字加粗
			var isFontWeight = ezCommon.Obj.attr("isFontWeight");
			var $dynamic = ezCommon.Obj;
			isFontWeight = !(isFontWeight == "false" || !isFontWeight);
			$("[name='isFontWeight']").bootstrapSwitch({
				state : isFontWeight
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				var oldFontWeight = ctrlObj.css("font-weight");
				if (state) {
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("font-weight", "bold");
					} else {
						$(".ctrlSelected").css("font-weight", "bold");
					}
					ctrlObj.attr("isFontWeight", true);
				} else {
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("font-weight", "normal");
					} else {
						$(".ctrlSelected").css("font-weight", "normal");
					}
					ctrlObj.attr("isFontWeight", false);
				}
				var newFontWeight = ctrlObj.css("font-weight");
				var fontWeightLogoId = $(".selectedForm").parent().attr("id");
				if (oldFontWeight != newFontWeight) {
					undoRedo.fontWeightUndo($("[name='isFontWeight']"), $(".ctrlSelected"), oldFontWeight, newFontWeight, fontWeightLogoId);

				}
			});
		},

		/**
		 *设置字体位置
		 */
		textAlign : function() {
			settingFontAlign();
		},

		/**
		 *@desc 页面背景图片
		 */
		changepageImg : function() {
			$(".changeBackgroundImg").unbind("click").click(function() {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/changeImage.js", function(e) {
					e.changeImg();
				});
			});

			//页面属性取消背景图片属性
			$(".removeBgImg").unbind("click").click(function(e) {
				//标识是否已修改了JSON，以判断是否需要保存当前页面
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
				$(".selectedForm").parent().removeAttr("backgroundimage");
				$(".selectedForm").parent().css("background", "url()");
				$(".removeBgImg").attr("disabled", "disabled");
				$(".removeBgImg").css("background", "#ccc");
			});

			if (ctrlId == undefined) {
				if ($(".selectedForm").parent().attr("backgroundimage") && $(".selectedForm").parent().attr("backgroundimage") != "none") {
					$(".removeBgImg").removeAttr("disabled");
					$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
				} else {
					$(".removeBgImg").attr("disabled", "disabled");
					$(".removeBgImg").css("background", "#ccc");
				}
			}
		},

		/**
		 *@desc 表单数据录入方式切换
		 */
		formInputType : function() {
			$("#formInputType").change(function() {
				$(".ctrlValue").show();
				var $selectedForm = $(".selectedForm");
				$formCtrl = $(".ctrl.imFormCtrl", $selectedForm);
				if (this.value == "slide") {
					var $slider = $('<div class = "inputPanel"><div class = "ipTitleWrap"><span class = "ipBack ipp">返回</span><span class = "ipTitle ipp">编辑内容</span><span class = "ipSave ipp">保存</span></div><div class = "ipEditBox"><textarea></textarea></div></div>');
					$(".inputPanel").remove();
					$selectedForm.addClass("slideInputForm").after($slider);
					$(".ctrlValue", $selectedForm).show();

					$(".ipBack").click(function() {
						$slider.animate({
							"right" : "-100%",
						}, 300).hide();
					});
					$(".ipSave").click(function() {
						var $input = $(".ipEditBox textarea"), value = "";
						if ($input.length) {
							value = $input.val();
						} else {
							$slider.find(".itemLabel.onChecked").each(function() {
							var itemValue = $(this).find("span").text();
								value += itemValue + "，";
							});
							value = value.substring(0, value.length - 1);
						}
						var $ctrl = $slider.data("ctrl");
						$ctrl.find(".ctrlValue").html(value).show();
						//设置选项的value值
						$ctrl.find('[isbasectrl="true"]').val(value);
						$slider.animate({
							"right" : "-100%"
						}, 300).hide();
					});
					$formCtrl.not(".ctrl[ctrl-type='IMAGE']").addClass("slideOutInput").find(".fieldTitle").show().css({
						"padding-bottom" : "8px",
						"padding-left" : "5px",
					});
					$formCtrl.find(".formInputArrow,.ctrlValue").show();
				} else {
					$selectedForm.removeClass("slideInputForm").find(".inputPanel").remove();
					$formCtrl.each(function() {
						var $this = $(this);
						var value = $this.find(".ctrlValue").text();
						$this.find(".fieldTitle").css({
							"text-align" : "center",
							"padding-left" : "0",
						});
						$this.find('[isbasectrl="true"]').val(value);
					});

					$formCtrl.removeClass("slideOutInput").find(".formInputArrow,.ctrlValue").hide();
				}
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			});
		},

		/**
		 *设置定位栏宽度
		 */
		boxWidth : function() {
			setSlide();
			setSpinnerSingle();

		},

		/**
		 *设置分栏
		 */
		colsSetting : function(ctrlObj, ctrlType, ctrlId) {
			setCols(ctrlObj);
		},

		/**
		 * @desc 隐藏组件标题
		 */
		isTitleElse : function() {
			if (ctrlType == "compLogic" || ctrlObj.hasClass("thisisField")) {
				var flag = ctrlObj.attr("FieldShow") ? true : false;
				$("[name='isTitleElse']").bootstrapSwitch({
					state : flag
				}).on('switchChange.bootstrapSwitch', function(event, state) {
					if (state) {
						$('[ctrlid=' + ctrlName + ']').find(".fieldDataTitle").hide();
						$('[ctrlid=' + ctrlName + ']').attr("FieldShow", "true");
					} else {
						$('[ctrlid=' + ctrlName + ']').find(".fieldDataTitle").show();
						$('[ctrlid=' + ctrlName + ']').removeAttr("FieldShow");
					}
				});
			} else {
				$(".hideOrShowTitle").hide();
			}
		}
	};

	/**
	 * @desc 颜色设置
	 */
	function setColor() {
		if (setColorFlag) {
			$(".setColor").each(function() {
				bgObjId = $(this).attr("id");
				setList = getBgObjListById(ctrlType, bgObjId, ctrlObj, ctrlId);
				settingColor(bgObjId, setList, ctrlType, ctrlObj, ctrlId);
			});
			setColorFlag = false;
		}
	}

	/**
	 * @desc
	 */
	function setSlide() {
		if (setSlideFlag) {
			//滑块
			$(".setSlide").each(function() {
				var slideObj = $(this);
				getSetSlide(slideObj, ctrlObj, ctrlId, ctrlType, false);
			});
			setSlideFlag = false;
		}
	}

	/**
	 * @desc
	 */
	function setSpinnerSingle() {
		if (singleFlag) {
			$(".setSpinnerSingle").each(function() {
				getSetSlide($(this), ctrlObj, ctrlId, ctrlType, false);
			});
			singleFlag = false;
		}
	}

	/**
	 *设置容器和分栏设置对象
	 *
	 */
	function setBox($ctrlObj, $byValObj, $sliderId, $spinnerId, ctrlId) {
		//$ctrlObj = ctrlId ? $("[ctrlId='" + ctrlId + "']") : $ctrlObj;
		if ($ctrlObj.attr("ctrl-type") == "ctrl-colBox" || $ctrlObj.attr("ctrl-type") == "ctrl-box") {
			if ($sliderId.match(/margin/g) || $spinnerId.match(/margin/g)) {
				$byValObj = $ctrlObj;
				return $byValObj;
			} else {
				var selector = "";
				style.panalObj.find("#colBoxList .colBoxList").each(function() {
					if ($(this).attr("checkFlag") == "true") {
						selector += ":nth-child(" + $(this).attr("colBoxNum") + "),";
					}

				});
				if (selector == "") {
					//$byValObj = $ctrlObj.children().children();
					$byValObj = $ctrlObj;
				} else {
					//selector = selector.substr(0, selector.length - 1);
					//$byValObj = $ctrlObj.children(selector).children();
					$byValObj = $ctrlObj;
				}
				return $byValObj;
			}
		}

		return $byValObj;
	}

	/**
	 * @author
	 * 控件类型不一样，颜色属性设置可能不一样，根据颜色类型和控件类型区分设置
	 * 需要添加颜色的标签加上属性如pure-bg-color="true"=背景
	 */
	function getBgObjListById(ctrlType, bgObjId, ctrlObj, ctrlId) {
		var list = {}, bgObjList, setType, attrType, addType, cObj;
		//ctrlObj = ctrlId ? $("[ctrlId='" + ctrlId + "']") : ctrlObj;
		switch(bgObjId) {
			case "pure-bg-color":
				//背景
				if (ctrlType == "ctrl-navigation") {//导航特殊处理，添加多个背景
					cObj = $(".pageNavigation", ctrlObj), $(".navbar-header", ctrlObj);
				} else {
					cObj = $(".pure-bg-color", ctrlObj).size() ? $(".pure-bg-color", ctrlObj) : ctrlObj;

				}
				setType = "background-color", attrType = "data-bgColor", addType = "css";
				break;
			case "drop-color":
				cObj = $(".dropdown-menu", ctrlObj);
				setType = "background", attrType = "data-dropBgColor", addType = "css";
				break;
			case "text-color":
				if (ctrlType == "ctrl-navigation") {
					cObj = $(".pageNavigation li a", ctrlObj);
				} else {
					cObj = ctrlObj.find('[text-color="true"]').size() ? ctrlObj.find('[text-color="true"]') : ctrlObj;
				}
				setType = "color", attrType = "data-textColor", addType = "css";
				break;
			case "hover-bg-color":
				cObj = ctrlObj.find('[hover-bg-color="true"]').size() ? ctrlObj.find('[hover-bg-color="true"]') : ctrlObj;
				setType = "data-hoverColor", attrType = "data-hoverColor", addType = "attr";
				break;
			case "select-bg-color":
				cObj = ctrlObj.find('[select-bg-color="true"]').size() ? ctrlObj.find('[select-bg-color="true"]') : ctrlObj;
				setType = "data-selectBgColor", attrType = "data-selectBgColor", addType = "attr";
				break;
			case "border-bg-color":
				cObj = $(".border-bg-color", ctrlObj).size() ? $(".border-bg-color", ctrlObj) : ctrlObj;
				setType = "border-color", attrType = "data-borderBgColor", addType = "css";
				break;
			case "button-click-color":
				cObj = ctrlObj.find('[button-click-color="true"]').size() ? ctrlObj.find('[button-click-color="true"]') : ctrlObj;
				setType = "background-color", attrType = "data-clickcolor", addType = "css";
				break;
			case "shadow-color":
				cObj = ctrlObj.find('[shadow-color="true"]').size() ? ctrlObj.find('[shadow-color="true"]') : ctrlObj;
				setType = "shadcolor", attrType = "data-shadowcolor", addType = "css";
				break;
		}

		bgObjList = [cObj];
		if (bgObjList && setType && attrType && addType) {
			list["bgObjList"] = bgObjList;
			list["setType"] = setType;
			list["attrType"] = attrType;
			list["addType"] = addType;
		}
		return list;
	}

	/*
	 * 按钮点击颜色事件
	 */
	function buttonClickEvent() {
		$("body").find(".ctrlSelected,.right-menu").click(function() {
			var $preClick = $('body').find("[clickFlag='true']");
			var clickColor = $(".ctrlSelected").attr("data-clickcolor");
			$preClick.find("input.ctrlBtn").css("background", $preClick.attr("data-bgcolor"));
			$(this).find("input.ctrlBtn").css("background", clickColor);
			$('body').find("[ctrl-type='BUTTON']").removeAttr("clickFlag");
			$(".ctrlSelected").attr("clickFlag", true);
		});
	}

	/**
	 * 拾色器
	 * @param     string     bgObjId      拾色文本框ID
	 * @param     []         setList      (bgObjList,setType,beforeColor,addType)数组
	 * @param     object     ctrlObj      控件对象
	 * @param     object     bgObjList    颜色赋值可能存在多个
	 * @param     string     setType      属性类型（background,color...）
	 * @param     string     attrType     属性类型值attr
	 */
	function settingColor(bgObjId, setList, ctrlType, ctrlObj, ctrlId) {
		var bgObjList = setList["bgObjList"];
		var setType = setList["setType"];

		var attrType = setList["attrType"];
		var addType = setList["addType"];
		var defaultColor = "";
		if (ctrlType == undefined) {
			defaultColor = $("#myWeb").find(".selectedForm").parent().css("background-color");
		} else {
			defaultColor = bgObjList[0].attr(attrType) || ctrlObj.attr(attrType);
		}
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/attrComm.js", function(e) {
			e.SetColor($("#" + bgObjId), defaultColor, true, function(color, colors) {
				if (String(color).indexOf("hsl") == 0) {
					var ctrlType = ctrlObj.attr("ctrl-type");
					$.each(bgObjList, function(key, value) {
						if (ctrlObj.hasClass("wxqyPage")) {
							value = ctrlObj;
							$("#myWeb").css(setType, color);
						} else {
							if (ctrlObj.hasClass("pageFigure")) {//层切换组件
								ctrlObj.css("background", "");
							}
							value = setBox(ctrlObj, value, "", "", ctrlId);
						}
						if (addType == "css") {
							if (ctrlType == "BUTTON") {
								if (attrType != "data-clickcolor") {
									if ($(".ctrlSelected").length == 1) {
										var ctrlId = $(".ctrlSelected").attr("ctrlId");
										var value = $('[ctrlid=' + ctrlId + ']');
										value.find("input.ctrlBtn").css(setType, color);
									} else {
										value.find("input.ctrlBtn").css(setType, color);
									}
									var oldFontColor = null;
									var oldBgColor = null;
									var btnColorLogoId = $(".selectedForm").parent().attr("id");
									if (setType == "color") {
										oldFontColor = value.attr("data-textcolor");
										if (oldFontColor != color) {
											undoRedo.btnColorUndo(setType, value, oldFontColor, color, btnColorLogoId);
										}
									} else {
										oldBgColor = value.attr("data-bgcolor");
										if (oldBgColor != color) {
											undoRedo.btnColorUndo(setType, value, oldBgColor, color, btnColorLogoId);
										}
									}

								}
							} else if (ctrlType == undefined) {
								//页面背景颜色设置
								var oldColor = $("#myWeb").find(".selectedForm").parent().css("background-color");
								var pageBgColorLogoId = $(".selectedForm").parent().attr("id");
								if (oldColor != color) {
									undoRedo.pageBgColorUndo($(".selectedForm"), oldColor, color, pageBgColorLogoId);
								}
								$(".selectedForm").parent().css("background", color);
								$(".selectedForm").parent().attr("backgroundColor", color);
								$(".pageTopTitle").attr("colorNow", color);
							} else if (ctrlType == "IMAGEBOX") {
								if (attrType == "data-shadowcolor") {
									var showcolor = color;
									chColor(showcolor);
								} else {
									var oldImgBox = $(".ctrlSelected").attr("data-borderColor");
									if (!objIsnull(ezCommon.Obj.find("img"))) {
										value.find(".glyphicon").css("color", color);
									} else if ($(".ctrlSelected").length == 1) {
										var ctrlId = $(".ctrlSelected").attr("ctrlId");
										var value = $('[ctrlid=' + ctrlId + ']');
										value.css(setType, color);
									} else {
										value.css(setType, color);
									}
									var imgBoxLogoId = $(".selectedForm").parent().attr("id");
									if (oldImgBox != color) {
										undoRedo.imgBoxUndo(value, oldImgBox, color, imgBoxLogoId);
									}
									$(".ctrlSelected").attr("data-borderColor", color);
								}
								//判断是否为浏览翻页
							} else if (ctrlType == "systemCp") {
								if (value.attr("syscomtype") == "pageBrowse") {
									value.find(".swiper-slide-active").css("background", color);
									value.find(".swiper-slide-active").attr("backgroundColor", color);
								}
							} else {
								var oldFontColor = null;
								var oldBgColor = null;
								var oldBoderColor = null;
								if ($(".ctrlSelected").length == 1) {
									var ctrlId = $(".ctrlSelected").attr("ctrlId");
									var value = $('[ctrlid=' + ctrlId + ']');
									value.css(setType, color);
								} else {
									value.css(setType, color);
								}
								var ColorLogoId = $(".selectedForm").parent().attr("id");
								if (setType == "color") {
									oldFontColor = value.attr("data-textcolor");
									if (oldFontColor != color) {
										undoRedo.ColorUndo(setType, value, oldFontColor, color, ColorLogoId);
									}
								} else if (setType == "background-color") {
									oldBgColor = value.attr("data-bgcolor");
									if (oldBgColor != color) {
										undoRedo.ColorUndo(setType, value, oldBgColor, color, ColorLogoId);
									}
								} else {
									oldBoderColor = value.attr("data-borderbgcolor");
									if (oldBoderColor != color) {
										undoRedo.ColorUndo(setType, value, oldBoderColor, color, ColorLogoId);
									}
								}
							}
						} else {
							value.attr(setType, color);
						}
						ctrlObj.attr(attrType, color);
					});

				} else {
					if ($(".ctrlSelected").length == 1) {
						var ctrlId = $(".ctrlSelected").attr("ctrlId");
						var $ctrls = $('[ctrlid=' + ctrlId + ']'), type = $ctrls.attr("ctrl-type");
					} else {
						var $ctrls = $(".ctrlSelected"), type = $ctrls.attr("ctrl-type");
					}
					if (type == "IMAGEBOX") {
						$ctrls.find("img").attr("style", color);
						$ctrls.attr("style", colors);
					} else if (type == "BUTTON") {
						$ctrls.find("input").attr("style", color);
						$ctrls.attr("style", colors);
					} else {
						$ctrls.attr("style", color);
					}
				}
				//ctrlObj = ctrlId ? $("[ctrlId='" + ctrlId + "']") : ctrlObj;
				//bgObjList = getBgObjListById(ctrlType, bgObjId,ctrlObj,ctrlId)["bgObjList"];
				//COMPONENT.modifyDynaComp(ctrlObj);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			});
		});

	}

	/**
	 * 获取 spinnerObj和sliderObj
	 * spinnerObj和sliderObj可能所有控件对象都一样，如果不一样，可根据ctrlObj判断控件类型再赋值spinnerObj和sliderObj
	 * min和max可能所有控件都一样，如果不一样，可根据ctrlObj判断控件类型再赋值min和max;
	 * 属性 byCtrlBorder=true对应设置边框大小的滑块  byCtrlradius=true对应设置圆角的滑块  byCtrlSize=true对应设置字体大小的滑块
	 */
	function getSetSlide(slideObj, ctrlObj, ctrlId, ctrlType, flag) {
		//console.log(ctrlObj+"::::::"+ctrlId+":::::::"+ctrlType+"::::::::"+flag+"**************");
		var spinnerObj, sliderObj, min = 0, max, beforeSlider, byValObj, sizeList = {};
		sliderId = slideObj.attr("id");
		spinnerId = slideObj.parent().find(".setSpinner").attr("id");

		if (sliderId == "size-slider") {
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 8, max = 30, beforeSlider = ctrlObj.attr("data-textSize");
		} else if (sliderId == "btn-width-slider") {
			// var outContainer = Math.floor(ctrlObj.find(".ctrlWraper").width());
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 10, max = 338, beforeSlider = ctrlObj.find("input.ctrlBtn").attr("btn-width");
		} else if (sliderId == "btn-round-slider") {
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 0, max = 10, beforeSlider = ctrlObj.find("input.ctrlBtn").attr("btn-round");
		} else if (sliderId == "pictureSize-slider") {
			var outContainer = Math.floor(ctrlObj.width());
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 10, max = 100, beforeSlider = ctrlObj.find("img").attr("data-pictureSize");
		} else if (sliderId == "radius-slider") {
			byValObj = $(".byCtrlRadius", ctrlObj).size() ? $(".byCtrlRadius", ctrlObj) : ctrlObj;
			max = byValObj.width() < byValObj.height() ? byValObj.width() / 2 : byValObj.height() / 2;
			beforeSlider = ctrlObj.attr("data-radius");
			//定位栏宽度
		} else if (sliderId == "colbox-slider") {
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 5, max = 336;
			beforeSlider = ctrlObj.attr("data-width");
		} else if (sliderId == "lineheight-slider") {
			byValObj = $(ctrlObj).find('[byCtrlSize="true"]').size() ? $(ctrlObj).find('[byCtrlSize="true"]') : ctrlObj;
			min = 17, max = 50, beforeSlider = ctrlObj.attr("data-lineheight");
		} else if (sliderId == "border-slider") {
			max = 15;
			byValObj = $(".byCtrlBorder", ctrlObj).size() ? $(".byCtrlBorder", ctrlObj) : ctrlObj;
			beforeSlider = ctrlObj.attr("data-border");
		} else if (sliderId == "margin-slider") {
			max = 100;
			min = -100;
			byValObj = $(".byCtrlMargin", ctrlObj).size() ? $(".byCtrlMargin", ctrlObj) : ctrlObj;
			beforeSlider = ctrlObj.attr("data-margin");
		} else if (sliderId == "padding-slider") {
			max = 100;
			byValObj = $(".byCtrlPadding", ctrlObj).size() ? $(".byCtrlPadding", ctrlObj) : ctrlObj;
			beforeSlider = ctrlObj.attr("data-padding");
		} else if (sliderId == "setImgW-slider") {
			byValObj = ctrlObj.find("img").size() ? ctrlObj.find("img") : ctrlObj;
			max = ctrlObj.parent().width();
			beforeSlider = byValObj.width();
		} else if (sliderId == "setImgH-slider") {
			byValObj = ctrlObj.find("img").size() ? ctrlObj.find("img") : ctrlObj;
			max = ctrlObj.parent().height();
			beforeSlider = byValObj.height();
		} else {
			sliderId = "";
			spinnerId = slideObj.attr("id");
			if (spinnerId.match(/border/g)) {
				max = 15;
				byValObj = $(ctrlObj).find('[byCtrlBorder="true"]').size() ? $(ctrlObj).find('[byCtrlBorder="true"]') : ctrlObj;
			} else if (spinnerId.match(/padding/g)) {
				max = 100;
				byValObj = $(".byCtrlPadding", ctrlObj).size() ? $(".byCtrlPadding", ctrlObj) : ctrlObj;
			} else if (spinnerId.match(/margin/g)) {
				max = 100;
				min = -100;
				byValObj = $(".byCtrlMargin", ctrlObj).size() ? $(".byCtrlMargin", ctrlObj) : ctrlObj;
			} else if (spinnerId.match(/radius/g)) {
				byValObj = $(ctrlObj).find('[byCtrlRadius="true"]').size() ? $(ctrlObj).find('[byCtrlRadius="true"]') : ctrlObj;
				max = byValObj.width() + parseInt(byValObj.css("padding-left")) + parseInt(byValObj.css("border-left-width")) < byValObj.height() + parseInt(byValObj.css("padding-top")) + parseInt(byValObj.css("border-top-width")) ? byValObj.width() / 2 + parseInt(byValObj.css("padding-left")) + parseInt(byValObj.css("border-left-width")) : byValObj.height() / 2 + parseInt(byValObj.css("padding-top")) + parseInt(byValObj.css("border-top-width"));
			} else if (spinnerId.match(/setImg/g)) {
				byValObj = ctrlObj.find("img").size() ? ctrlObj.find("img") : ctrlObj;
			}

			switch(spinnerId) {
				case  "borderLeft-spinner" :
					beforeSlider = parseInt(byValObj[0].style.borderLeftWidth);
					break;
				case  "borderRight-spinner" :
					beforeSlider = parseInt(byValObj[0].style.borderRightWidth);
					break;
				case  "borderTop-spinner" :
					beforeSlider = parseInt(byValObj[0].style.borderTopWidth);
					break;
				case  "borderBottom-spinner" :
					beforeSlider = parseInt(byValObj[0].style.borderBottomWidth);
					break;
				case  "radiusLeft-spinner" :
					beforeSlider = parseInt(ctrlObj.css("border-top-left-radius"));
					$("#radiusSetting .radiusTopLeft").css({
						"border-top-left-radius" : beforeSlider + "px",
						"overflow" : "hidden"
					});
					break;
				case  "radiusRight-spinner" :
					beforeSlider = parseInt(ctrlObj.css("border-top-right-radius"));
					$("#radiusSetting .radiusBottomLeft ").css({
						"border-top-right-radius" : beforeSlider + "px",
						"overflow" : "hidden"
					});
					break;
				case  "radiusTop-spinner" :
					beforeSlider = parseInt(ctrlObj.css("border-bottom-left-radius"));
					$("#radiusSetting .radiusTopRight ").css({
						"border-bottom-left-radius" : beforeSlider + "px",
						"overflow" : "hidden"
					});
					break;
				case  "radiusBottom-spinner" :
					beforeSlider = parseInt(ctrlObj.css("border-bottom-right-radius"));
					$("#radiusSetting .radiusBottomRight").css({
						"border-bottom-right-radius" : beforeSlider + "px",
						"overflow" : "hidden"
					});
					break;
				case "marginLeft-spinner" :
					beforeSlider = parseInt(ctrlObj.css("margin-left"));
					break;
				case "marginRight-spinner" :
					beforeSlider = parseInt(ctrlObj.css("margin-right"));
					break;
				case "marginTop-spinner" :
					beforeSlider = parseInt(byValObj.css("margin-top"));
					break;
				case "marginBottom-spinner" :
					beforeSlider = parseInt(ctrlObj.css("margin-bottom"));
					break;
				case "paddingLeft-spinner" :
					beforeSlider = parseInt(ctrlObj.css("padding-left"));
					break;
				case "paddingRight-spinner" :
					beforeSlider = parseInt(ctrlObj.css("padding-right"));
					break;
				case "paddingTop-spinner" :
					beforeSlider = parseInt(ctrlObj.css("padding-top"));
					break;
				case "paddingBottom-spinner" :
					beforeSlider = parseInt(ctrlObj.css("padding-bottom"));
					break;
				case  "btn-width-slider" :
					beforeSlider = pareFloat(ctrlObj.css("width"));
					max = 100, min = 20;
					break;
				case  "btn-round-slider" :
					beforeSlider = pareFloat(ctrlObj.css("border-radius"));
					max = 10, min = 0;
					break;
				case "setImgH-spinner" :
					max = ctrlObj.parent().height();
					beforeSlider = byValObj.height();
					break;

				case "setImgW-spinner" :
					max = ctrlObj.parent().width();
					beforeSlider = byValObj.width();
					break;

			}
		}

		if (flag) {
			return byValObj;
		} else {
			beforeSlider = (beforeSlider != undefined && beforeSlider > 0) ? beforeSlider : 0;
			sizeList["min"] = parseInt(min);
			sizeList["max"] = parseInt(max);
			sizeList["beforeSlider"] = beforeSlider;
			settingSlide(spinnerId, sliderId, ctrlObj, sizeList, byValObj, ctrlId, ctrlType);
		}
	}

	/**
	 * 滑动(边框, 圆角, 字体大小)
	 * @param     object      byValObj       传值对象
	 */
	function settingSlide(spinnerId, sliderId, ctrlObj, sizeList, byValObj, ctrlId, ctrlType) {
		//	console.log(spinnerId+"-------"+sliderId+"---------"+ctrlObj+"-------"+sizeList+"--------"+byValObj+"---------"+ctrlId+"----------------"+ctrlType);
		var minBorder = sizeList["min"], maxBorder = sizeList["max"], beforeSlider = sizeList["beforeSlider"];
		//	console.log(minBorder+"-------"+maxBorder+"---------"+beforeSlider);
		var spinnerObj = $("#" + spinnerId), sliderObj = $("#" + sliderId);
		spinnerObj.spinner({
			min : minBorder,
			max : maxBorder,
			"numberFormat" : "N",
			spin : function(event, ui) {
				backSpin(event, ui, ctrlId);
				sliderObj.slider("value", ui.value);
			},
		}).spinner("value", beforeSlider);

		sliderObj.slider({
			orientation : "horizonal",
			range : "min",
			step : 1,
			min : minBorder,
			max : maxBorder,
			value : beforeSlider,
			slide : function(event, ui) {
				backSpin(event, ui, ctrlId);
				spinnerObj.spinner("value", ui.value);
			},
		});

		function backSpin(event, ui, ctrlId) {
			if (sliderId == "") {
				sliderId = spinnerId;
			}
			// if (ctrlId) {
			// ctrlObj = $("[ctrlId='" + ctrlId + "']");
			// }
			// if (!objIsnull(ctrlObj)) {
			// ctrlObj = $("[fieldname='" + ctrlId + "']");
			// }
			//var byValObj = getSetSlide($("#" + sliderId), ctrlObj, ctrlId, true);
			//byValObj = setBox(ctrlObj, byValObj, sliderId, spinnerId);
			switch(sliderId) {
				case "size-slider" :
					//byValObj.css("font-size", ui.value);
					//ctrlObj.attr("data-textSize", ui.value);
					var oldfontSize = $('[ctrlid=' + ctrlId + ']').attr("data-textSize");
					if ($(".ctrlSelected").length == 1) {
						if (ctrlType == "BUTTON") {
							var oldfontSize = $('[ctrlid=' + ctrlId + ']').attr("data-textSize");
							$('[ctrlid=' + ctrlId + ']').attr("data-textSize", ui.value);
							$('[ctrlid=' + ctrlId + ']').find("input.ctrlBtn").css("font-size", ui.value);
							var btnfontSizeLogoId = $(".selectedForm").parent().attr("id");
							if (oldfontSize != ui.value) {
								undoRedo.btnfontSizeUndo($('[ctrlid=' + ctrlId + ']'), oldfontSize, ui.value, btnfontSizeLogoId);
							}
						} else {
							var oldfontSize = $('[ctrlid=' + ctrlId + ']').attr("data-textSize");
							$('[ctrlid=' + ctrlId + ']').attr("data-textSize", ui.value);
							$('[ctrlid=' + ctrlId + ']').css("font-size", ui.value);
							var fontSizeLogoId = $(".selectedForm").parent().attr("id");							if (oldfontSize != ui.value) {
								undoRedo.fontSizeUndo(byValObj, $('[ctrlid=' + ctrlId + ']'), oldfontSize, ui.value, fontSizeLogoId);
							}
						}

					} else {
						var oldfontSize = ctrlObj.attr("data-textSize");
						byValObj.css("font-size", ui.value);
						ctrlObj.attr("data-textSize", ui.value);
						var fontSizeLogoId = $(".selectedForm").parent().attr("id");
						if (oldfontSize != ui.value) {
							undoRedo.fontSizeUndo(byValObj, ctrlObj, oldfontSize, ui.value, fontSizeLogoId);
						}
					}

					break;
				//行高
				case "lineheight-slider" :
					//ctrlObj.css("line-height", ui.value + "px");
					var oldlineheight = ctrlObj.attr("data-lineheight");
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("line-height", ui.value + "px");
						$('[ctrlid=' + ctrlId + ']').attr("data-lineheight", ui.value);
					} else {
						ctrlObj.css("line-height", ui.value + "px");
						ctrlObj.attr("data-lineheight", ui.value);
					}
					var lineheightLogoId = $(".selectedForm").parent().attr("id");
					if (oldlineheight != ui.value) {
						undoRedo.lineheightUndo(ctrlObj, oldlineheight, ui.value, lineheightLogoId);
					}
					break;

				//图片大小设置
				case "pictureSize-slider" :
					//判断当前是图片还是字体图标
					if ($(".ctrlSelected").length == 1) {
						if (objIsnull(byValObj.find("img"))) {
							var oldPictureSize = $('[ctrlid=' + ctrlId + ']').find("img").attr("data-pictureSize");
							$('[ctrlid=' + ctrlId + ']').find("img").css("width", ui.value + "%");
							$('[ctrlid=' + ctrlId + ']').find("img").css("height", ui.value + "%");
							$('[ctrlid=' + ctrlId + ']').find("img").attr("data-pictureSize", ui.value);
							var pictureSizeLogoId = $(".selectedForm").parent().attr("id");
							if (oldPictureSize != ui.value) {
								undoRedo.pictureSizeUndo($('[ctrlid=' + ctrlId + ']'), oldPictureSize, ui.value, pictureSizeLogoId);
							}

						} else {
							$('[ctrlid=' + ctrlId + ']').find(".glyphicon").css("font-size", ui.value);
							$('[ctrlid=' + ctrlId + ']').find("glyphicon").attr("data-pictureSize", ui.value);
						}
					} else {
						if (objIsnull(byValObj.find("img"))) {
							var oldPictureSize = byValObj.find("img").attr("data-pictureSize");
							byValObj.find("img").css("width", ui.value + "%");
							byValObj.find("img").css("height", ui.value + "%");
							byValObj.find("img").attr("data-pictureSize", ui.value);
							var pictureSizeLogoId = $(".selectedForm").parent().attr("id");
							if (oldPictureSize != ui.value) {
								undoRedo.pictureSizeUndo(byValObj, oldPictureSize, ui.value, pictureSizeLogoId);
							}
						} else {
							byValObj.find(".glyphicon").css("font-size", ui.value);
							byValObj.find("glyphicon").attr("data-pictureSize", ui.value);
						}
					}
					break;
				case "colbox-slider" :
					//ctrlObj.width(ui.value + "%");
					var oldcolboxWidth = $('[ctrlid=' + ctrlId + ']').width();
					$('[ctrlid=' + ctrlId + ']').width(ui.value);
					$('[ctrlid=' + ctrlId + ']').attr("data-width", ui.value);
					var colboxWidthLogoId = $(".selectedForm").parent().attr("id");
					if (oldcolboxWidth != ui.value) {
						undoRedo.colboxWidthUndo($('[ctrlid=' + ctrlId + ']'), oldcolboxWidth, ui.value, colboxWidthLogoId);
					}
					break;
				//边框设置
				case "border-slider" :
					var borderColor = ctrlObj.attr("data-borderBgColor") ? ctrlObj.attr("data-borderBgColor") : "#000000";
					//byValObj.css("border", ui.value + "px solid " + borderColor);
					//ctrlObj.attr("data-border", ui.value);
					if ($(".ctrlSelected").length == 1) {
						var oldborderWidth = $('[ctrlid=' + ctrlId + ']').attr("data-border");
						$('[ctrlid=' + ctrlId + ']').css("border", ui.value + "px solid " + borderColor);
						$('[ctrlid=' + ctrlId + ']').attr("data-border", ui.value);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "border";
						if (oldborderWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, $('[ctrlid=' + ctrlId + ']'), oldborderWidth, ui.value, borderWidthLogoId);
						}

					} else {
						var oldborderWidth = ctrlObj.attr("data-border");
						ctrlObj.css("border", ui.value + "px solid " + borderColor);
						ctrlObj.attr("data-border", ui.value);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "border";
						if (oldborderWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, ctrlObj, oldborderWidth, ui.value, borderWidthLogoId);
						}
					}

					$("#borderLeft-spinner").spinner("value", ui.value);
					$("#borderRight-spinner").spinner("value", ui.value);
					$("#borderTop-spinner").spinner("value", ui.value);
					$("#borderBottom-spinner").spinner("value", ui.value);
					break;
				case "borderLeft-spinner" :
					var borderColor = ctrlObj.attr("data-borderBgColor") ? ctrlObj.attr("data-borderBgColor") : "#000000";
					//byValObj.css("border-left", ui.value + "px solid " + borderColor);
					if ($(".ctrlSelected").length == 1) {
						var oldborderLeftWidth = $('[ctrlid=' + ctrlId + ']').css("border-left-width");
						$('[ctrlid=' + ctrlId + ']').css("border-left", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderLeft";
						if (oldborderLeftWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, $('[ctrlid=' + ctrlId + ']'), oldborderLeftWidth, ui.value, borderWidthLogoId);
						}

					} else {
						var oldborderLeftWidth = byValObj.css("border-left-width");
						byValObj.css("border-left", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderLeft";
						if (oldborderLeftWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, byValObj, oldborderLeftWidth, ui.value, borderWidthLogoId);
						}
					}
					break;
				case "borderRight-spinner" :
					var borderColor = ctrlObj.attr("data-borderBgColor") ? ctrlObj.attr("data-borderBgColor") : "#000000";
					//byValObj.css("border-right", ui.value + "px solid " + borderColor);
					if ($(".ctrlSelected").length == 1) {
						var oldborderRightWidth = $('[ctrlid=' + ctrlId + ']').css("border-right-width");
						$('[ctrlid=' + ctrlId + ']').css("border-right", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderRight";
						if (oldborderRightWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, $('[ctrlid=' + ctrlId + ']'), oldborderRightWidth, ui.value, borderWidthLogoId);
						}
					} else {
						var oldborderRightWidth = byValObj.css("border-right-width");
						byValObj.css("border-right", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderRight";
						if (oldborderRightWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, byValObj, oldborderRightWidth, ui.value, borderWidthLogoId);
						}
					}
					break;
				case "borderTop-spinner" :
					var borderColor = ctrlObj.attr("data-borderBgColor") ? ctrlObj.attr("data-borderBgColor") : "#000000";
					//byValObj.css("border-top", ui.value + "px solid " + borderColor);
					if ($(".ctrlSelected").length == 1) {
						var oldborderTopWidth = $('[ctrlid=' + ctrlId + ']').css("border-top-width");
						$('[ctrlid=' + ctrlId + ']').css("border-top", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderTop";
						if (oldborderTopWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, $('[ctrlid=' + ctrlId + ']'), oldborderTopWidth, ui.value, borderWidthLogoId);
						}
					} else {
						var oldborderTopWidth = byValObj.css("border-top-width");
						byValObj.css("border-top", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderTop";
						if (oldborderTopWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, byValObj, oldborderTopWidth, ui.value, borderWidthLogoId);
						}
					}
					break;

				case "borderBottom-spinner" :
					var borderColor = ctrlObj.attr("data-borderBgColor") ? ctrlObj.attr("data-borderBgColor") : "#000000";
					//byValObj.css("border-bottom", ui.value + "px solid " + borderColor);
					if ($(".ctrlSelected").length == 1) {
						var oldborderBottomWidth = $('[ctrlid=' + ctrlId + ']').css("border-bottom-width");
						$('[ctrlid=' + ctrlId + ']').css("border-bottom", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderBottom";
						if (oldborderBottomWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, $('[ctrlid=' + ctrlId + ']'), oldborderBottomWidth, ui.value, borderWidthLogoId);
						}
					} else {
						var oldborderBottomWidth = byValObj.css("border-bottom-width");
						byValObj.css("border-bottom", ui.value + "px solid " + borderColor);
						var borderWidthLogoId = $(".selectedForm").parent().attr("id");
						var borderType = "borderBottom";
						if (oldborderBottomWidth != ui.value) {
							undoRedo.borderWidthUndo(borderType, byValObj, oldborderBottomWidth, ui.value, borderWidthLogoId);
						}
					}
					break;
				//外边距设置
				case "margin-slider" :
					//byValObj.css("margin", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldmargin = $('[ctrlid=' + ctrlId + ']').attr("data-margin");						$('[ctrlid=' + ctrlId + ']').css("margin", ui.value);
						$('[ctrlid=' + ctrlId + ']').attr("data-margin", ui.value);
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "margin";
						if (oldmargin != ui.value) {							undoRedo.marginUndo(marginType, $('[ctrlid=' + ctrlId + ']'), oldmargin, ui.value, marignLogoId);
						}
					} else {
						var oldmargin = byValObj.attr("data-margin");
						byValObj.css("margin", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "margin";
						if (oldmargin != ui.value) {
							undoRedo.marginUndo(marginType, byValObj, oldmargin, ui.value, marignLogoId);
						}
					}
					$("#marginLeft-spinner").spinner("value", ui.value);
					$("#marginRight-spinner").spinner("value", ui.value);
					$("#marginTop-spinner").spinner("value", ui.value);
					$("#marginBottom-spinner").spinner("value", ui.value);
					break;
				case "marginLeft-spinner" :
					//byValObj.css("margin-left", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldmarginleft = $('[ctrlid=' + ctrlId + ']').css("margin-left");
						$('[ctrlid=' + ctrlId + ']').css("margin-left", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginLeft";
						if (oldmarginleft != ui.value) {
							undoRedo.marginUndo(marginType, $('[ctrlid=' + ctrlId + ']'), oldmarginleft, ui.value, marignLogoId);
						}
					} else {
						var oldmarginleft = byValObj.css("margin-left");
						byValObj.css("margin-left", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginLeft";
						if (oldmarginleft != ui.value) {
							undoRedo.marginUndo(marginType, byValObj, oldmarginleft, ui.value, marignLogoId);
						}
					}
					break;
				case "marginRight-spinner" :
					//byValObj.css("margin-right", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldmarginRight = $('[ctrlid=' + ctrlId + ']').css("margin-right");
						$('[ctrlid=' + ctrlId + ']').css("margin-right", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginRight";
						if (oldmarginRight != ui.value) {
							undoRedo.marginUndo(marginType, $('[ctrlid=' + ctrlId + ']'), oldmarginRight, ui.value, marignLogoId);
						}
					} else {
						var oldmarginRight = byValObj.css("margin-right");
						byValObj.css("margin-right", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginRight";
						if (oldmarginRight != ui.value) {
							undoRedo.marginUndo(marginType, byValObj, oldmarginRight, ui.value, marignLogoId);
						}

					}
					break;
				case "marginTop-spinner" :
					//byValObj.css("margin-top", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldmarginTop = $('[ctrlid=' + ctrlId + ']').css("margin-top");
						$('[ctrlid=' + ctrlId + ']').css("margin-top", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginTop";
						if (oldmarginTop != ui.value) {
							undoRedo.marginUndo(marginType, $('[ctrlid=' + ctrlId + ']'), oldmarginTop, ui.value, marignLogoId);
						}
					} else {
						var oldmarginTop = byValObj.css("margin-top");
						byValObj.css("margin-top", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginTop";
						if (oldmarginTop != ui.value) {
							undoRedo.marginUndo(marginType, byValObj, oldmarginTop, ui.value, marignLogoId);
						}
					}
					break;
				case "marginBottom-spinner" :
					//byValObj.css("margin-bottom", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldmarginBottom = $('[ctrlid=' + ctrlId + ']').css("margin-bottom");
						$('[ctrlid=' + ctrlId + ']').css("margin-bottom", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginBottom";
						if (oldmarginBottom != ui.value) {
							undoRedo.marginUndo(marginType, $('[ctrlid=' + ctrlId + ']'), oldmarginBottom, ui.value, marignLogoId);
						}
					} else {
						var oldmarginBottom = byValObj.css("margin-bottom");
						byValObj.css("margin-bottom", ui.value + "px");
						var marignLogoId = $(".selectedForm").parent().attr("id");
						var marginType = "marginBottom";
						if (oldmarginBottom != ui.value) {
							undoRedo.marginUndo(marginType, byValObj, oldmarginBottom, ui.value, marignLogoId);
						}
					}
					break;
				//内边距设置
				case "padding-slider" :
					//byValObj.css("padding", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldpadding = $('[ctrlid=' + ctrlId + ']').attr("data-padding");
						$('[ctrlid=' + ctrlId + ']').attr("data-padding", ui.value);
						$('[ctrlid=' + ctrlId + ']').css("padding", ui.value);
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "padding";
						if (oldpadding != ui.value) {
							undoRedo.paddingUndo(paddingType, $('[ctrlid=' + ctrlId + ']'), oldpadding, ui.value, paddingLogoId);
						}
					} else {
						var oldpadding = byValObj.attr("data-padding");
						byValObj.css("padding", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "padding";
						if (oldpadding != ui.value) {
							undoRedo.paddingUndo(paddingType, byValObj, oldpadding, ui.value, paddingLogoId);
						}
					}
					$("#paddingLeft-spinner").spinner("value", ui.value);
					$("#paddingRight-spinner").spinner("value", ui.value);
					$("#paddingTop-spinner").spinner("value", ui.value);
					$("#paddingBottom-spinner").spinner("value", ui.value);
					break;
				case "paddingLeft-spinner" :
					//byValObj.css("padding-left", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldpaddingLeft = $('[ctrlid=' + ctrlId + ']').css("padding-left");
						$('[ctrlid=' + ctrlId + ']').css("padding-left", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingLeft";
						if (oldpaddingLeft != ui.value) {
							undoRedo.paddingUndo(paddingType, $('[ctrlid=' + ctrlId + ']'), oldpaddingLeft, ui.value, paddingLogoId);
						}
					} else {
						var oldpaddingLeft = byValObj.css("padding-left");
						byValObj.css("padding-left", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingLeft";
						if (oldpaddingLeft != ui.value) {
							undoRedo.paddingUndo(paddingType, byValObj, oldpaddingLeft, ui.value, paddingLogoId);
						}
					}
					break;
				case "paddingRight-spinner" :
					//byValObj.css("padding-right", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldpaddingRight = $('[ctrlid=' + ctrlId + ']').css("padding-right");
						$('[ctrlid=' + ctrlId + ']').css("padding-right", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingRight";
						if (oldpaddingRight != ui.value) {
							undoRedo.paddingUndo(paddingType, $('[ctrlid=' + ctrlId + ']'), oldpaddingRight, ui.value, paddingLogoId);
						}
					} else {
						var oldpaddingRight = byValObj.css("padding-right");
						byValObj.css("padding-right", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingRight";
						if (oldpaddingRight != ui.value) {
							undoRedo.paddingUndo(paddingType, byValObj, oldpaddingRight, ui.value, paddingLogoId);
						}
					}
					break;
				case "paddingTop-spinner" :
					//byValObj.css("padding-top", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldpaddingTop = $('[ctrlid=' + ctrlId + ']').css("padding-top");
						$('[ctrlid=' + ctrlId + ']').css("padding-top", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingTop";
						if (oldpaddingTop != ui.value) {
							undoRedo.paddingUndo(paddingType, $('[ctrlid=' + ctrlId + ']'), oldpaddingTop, ui.value, paddingLogoId);
						}
					} else {
						var oldpaddingTop = byValObj.css("padding-top");
						byValObj.css("padding-top", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingTop";
						if (oldpaddingTop != ui.value) {
							undoRedo.paddingUndo(paddingType, byValObj, oldpaddingTop, ui.value, paddingLogoId);
						}
					}
					break;
				case "paddingBottom-spinner" :
					//byValObj.css("padding-bottom", ui.value + "px");
					if ($(".ctrlSelected").length == 1) {
						var oldpaddingBottom = $('[ctrlid=' + ctrlId + ']').css("padding-bottom");
						$('[ctrlid=' + ctrlId + ']').css("padding-bottom", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingBottom";
						if (oldpaddingBottom != ui.value) {
							undoRedo.paddingUndo(paddingType, $('[ctrlid=' + ctrlId + ']'), oldpaddingBottom, ui.value, paddingLogoId);
						}
					} else {
						var oldpaddingBottom = byValObj.css("padding-bottom");
						byValObj.css("padding-bottom", ui.value + "px");
						var paddingLogoId = $(".selectedForm").parent().attr("id");
						var paddingType = "paddingBottom";
						if (oldpaddingBottom != ui.value) {
							undoRedo.paddingUndo(paddingType, byValObj, oldpaddingBottom, ui.value, paddingLogoId);
						}
					}
					break;
				//圆角设置
				case "radius-slider" :
					if ($(".ctrlSelected").length == 1) {
						var oldborderRadius = $('[ctrlid=' + ctrlId + ']').attr("data-radius");
						$('[ctrlid=' + ctrlId + ']').css({
							"border-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						$('[ctrlid=' + ctrlId + ']').attr("data-radius", ui.value);
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadius";
						if (oldborderRadius != ui.value) {
							undoRedo.borderRadiusUndo(setType, $('[ctrlid=' + ctrlId + ']'), oldborderRadius, ui.value, borderRadiusLogoId);
						}

					} else {
						var oldborderRadius = ctrlObj.attr("data-radius");
						byValObj.css({
							"border-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						ctrlObj.attr("data-radius", ui.value);
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadius";
						if (oldborderRadius != ui.value) {
							undoRedo.borderRadiusUndo(setType, ctrlObj, oldborderRadius, ui.value, borderRadiusLogoId);
						}
					}
					$("#radiusLeft-spinner").spinner("value", ui.value);
					$("#radiusRight-spinner").spinner("value", ui.value);
					$("#radiusTop-spinner").spinner("value", ui.value);
					$("#radiusBottom-spinner").spinner("value", ui.value);
					break;
				case "radiusLeft-spinner" :
					if ($(".ctrlSelected").length == 1) {
						var oldradiusLeft = $('[ctrlid=' + ctrlId + ']').css("border-top-left-radius");
						//byValObj.css({
						$('[ctrlid=' + ctrlId + ']').css({
							"border-top-left-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusLeft";
						if (oldradiusLeft != ui.value) {
							undoRedo.borderRadiusUndo(setType, $('[ctrlid=' + ctrlId + ']'), oldradiusLeft, ui.value, borderRadiusLogoId);
						}
					} else {
						var oldradiusLeft = byValObj.css("border-top-left-radius");
						byValObj.css({
							"border-top-left-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusLeft";
						if (oldradiusLeft != ui.value) {
							undoRedo.borderRadiusUndo(setType, byValObj, oldradiusLeft, ui.value, borderRadiusLogoId);
						}
					}
					$("#radiusSetting .radiusTopLeft").css({
						"border-top-left-radius" : ui.value + "px",
						"overflow" : "hidden"
					});

					break;
				case "radiusTop-spinner" :
					//byValObj.css({
					if ($(".ctrlSelected").length == 1) {
						var oldradiusTop = $('[ctrlid=' + ctrlId + ']').css("border-top-right-radius");
						$('[ctrlid=' + ctrlId + ']').css({
							"border-top-right-radius" : ui.value + "px",
							"overflow" : "hidden",
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusTop";
						if (oldradiusTop != ui.value) {
							undoRedo.borderRadiusUndo(setType, $('[ctrlid=' + ctrlId + ']'), oldradiusTop, ui.value, borderRadiusLogoId);
						}
					} else {
						var oldradiusTop = byValObj.css("border-top-right-radius");
						byValObj.css({
							"border-top-right-radius" : ui.value + "px",
							"overflow" : "hidden",
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusTop";
						if (oldradiusTop != ui.value) {
							undoRedo.borderRadiusUndo(setType, byValObj, oldradiusTop, ui.value, borderRadiusLogoId);
						}
					}
					$("#radiusSetting .radiusBottomLeft ").css({
						"border-top-right-radius" : ui.value + "px",
						"overflow" : "hidden"
					});
					break;
				case "radiusRight-spinner" :
					if ($(".ctrlSelected").length == 1) {
						var oldradiusRight = $('[ctrlid=' + ctrlId + ']').css("border-bottom-left-radius");
						//byValObj.css({
						$('[ctrlid=' + ctrlId + ']').css({
							"border-bottom-left-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusRight";
						if (oldradiusRight != ui.value) {
							undoRedo.borderRadiusUndo(setType, $('[ctrlid=' + ctrlId + ']'), oldradiusRight, ui.value, borderRadiusLogoId);
						}
					} else {
						var oldradiusRight = byValObj.css("border-bottom-left-radius");
						byValObj.css({
							"border-bottom-left-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusRight";
						if (oldradiusRight != ui.value) {
							undoRedo.borderRadiusUndo(setType, byValObj, oldradiusRight, ui.value, borderRadiusLogoId);
						}

					}
					$("#radiusSetting .radiusTopRight ").css({
						"border-bottom-left-radius" : ui.value + "px",
						"overflow" : "hidden"
					});
					break;
				case "radiusBottom-spinner" :
					if ($(".ctrlSelected").length == 1) {
						var oldradiusBottom = $('[ctrlid=' + ctrlId + ']').css("border-bottom-right-radius");
						$('[ctrlid=' + ctrlId + ']').css({
							"border-bottom-right-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusBottom";
						if (oldradiusBottom != ui.value) {
							undoRedo.borderRadiusUndo(setType, $('[ctrlid=' + ctrlId + ']'), oldradiusBottom, ui.value, borderRadiusLogoId);
						}
					} else {
						var oldradiusBottom = byValObj.css("border-bottom-right-radius");
						byValObj.css({
							"border-bottom-right-radius" : ui.value + "px",
							"overflow" : "hidden"
						});
						var borderRadiusLogoId = $(".selectedForm").parent().attr("id");
						var setType = "borderRadiusBottom";
						if (oldradiusBottom != ui.value) {
							undoRedo.borderRadiusUndo(setType, byValObj, oldradiusBottom, ui.value, borderRadiusLogoId);
						}
					}
					$("#radiusSetting .radiusBottomRight").css({
						"border-bottom-right-radius" : ui.value + "px",
						"overflow" : "hidden"
					});
					break;
				//宽度
				case  "btn-width-slider" :
					if ($(".ctrlSelected").length == 1) {
						var $btn = $('[ctrlid=' + ctrlId + ']').find("input.ctrlBtn"), dataAlign = $btn.attr("data-align");
					} else {
						var $btn = ctrlObj.find("input.ctrlBtn"), dataAlign = $btn.attr("data-align");
					}
					var oldbtnWidth = $btn.css("width");
					var btnWidthLogoId = $(".selectedForm").parent().attr("id");
					if (oldbtnWidth != ui.value) {
						undoRedo.btnWidthUndo(ctrlObj, oldbtnWidth, ui.value, btnWidthLogoId);
					}
					$btn.css("width", ui.value).attr("btn-width", ui.value);
					break;
				case  "btn-round-slider" :
					if ($(".ctrlSelected").length == 1) {
						var $btn = $('[ctrlid=' + ctrlId + ']').find("input.ctrlBtn");
					} else {
						var $btn = ctrlObj.find("input.ctrlBtn");
					}
					$btn.css("border-radius", ui.value + "px").attr("btn-round", ui.value);

					break;
				case "setImgW-slider" :
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("width", ui.value + "px");
					} else {
						byValObj.css("width", ui.value + "px");
					}
					break;
				case "setImgW-spinner" :
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("width", ui.value + "px");
					} else {
						byValObj.css("width", ui.value + "px");
					}
					break;
				case "setImgH-slider" :
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("height", ui.value + "px");
					} else {
						byValObj.css("height", ui.value + "px");
					}
					break;
				case "setImgH-spinner" :
					if ($(".ctrlSelected").length == 1) {
						$('[ctrlid=' + ctrlId + ']').css("height", ui.value + "px");
					} else {
						byValObj.css("height", ui.value + "px");
					}
					break;
			}

		}


		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addNeedSavePage();
		});

	}

	/**
	 *文字对齐
	 */
	function settingFontAlign() {
		if ($(".ctrlSelected").length == 1) {
			var byCtrlAlign = $('[ctrlid=' + ctrlId + ']').find(".byCtrlAlign").size() ? $('[ctrlid=' + ctrlId + ']').find(".byCtrlAlign") : $('[ctrlid=' + ctrlId + ']');
		} else {
			var byCtrlAlign = ctrlObj.find(".byCtrlAlign").size() ? ctrlObj.find(".byCtrlAlign") : ctrlObj;
		}
		var $main_text_align = byCtrlAlign.css("text-align");
		$("#main-text-align-left", style.panalObj).attr("checked", "checked");
		if ($main_text_align) {
			$("#main-text-align-" + $main_text_align, style.panalObj).attr("checked", "checked");
		}
		$("#main-text-align").buttonset();
		var textAlignLogoId = $(".selectedForm").parent().attr("id");
		var positionOld = byCtrlAlign.css("text-align");
		var positionNew = null;
		$("#main-text-align-left", style.panalObj).bind("click", function() {
			if (byCtrlAlign.hasClass('CCTextBoxCover')) {
				byCtrlAlign.attr("Isleft", "true");
				byCtrlAlign.css("left", "");
			} else {
				byCtrlAlign.attr("Isleft", "false");
				byCtrlAlign.css("text-align", "left");
			}
			positionNew = "left";
			if (positionOld != positionNew) {
				undoRedo.textAlignUndo(byCtrlAlign, positionOld, positionNew, textAlignLogoId, style.panalObj);
			}
		});
		$("#main-text-align-right", style.panalObj).bind("click", function() {
			if (byCtrlAlign.hasClass('CCTextBoxCover')) {
				byCtrlAlign.css("left", "622px");
			} else {
				byCtrlAlign.css("text-align", "right");
			}
			positionNew = "right";
			if (positionOld != positionNew) {
				undoRedo.textAlignUndo(byCtrlAlign, positionOld, positionNew, textAlignLogoId, style.panalObj);
			}
		});

		$("#main-text-align-center", style.panalObj).bind("click", function() {
			byCtrlAlign.css("text-align", "center");
			positionNew = "center";
			if (positionOld != positionNew) {
				undoRedo.textAlignUndo(byCtrlAlign, positionOld, positionNew, textAlignLogoId, style.panalObj);
			}
		});
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addNeedSavePage();
		});

	}

	/**
	 *按钮对齐
	 */
	function setButtonAlign() {
		if ($(".ctrlSelected").length == 1) {
			var byCtrlAlign = $('[ctrlid=' + ctrlId + ']');
		} else {
			var byCtrlAlign = ctrlObj;
		}
		var $main_text_align = byCtrlAlign.find(".ctrlWraper").css("text-align");
		$("#main-text-align-left", style.panalObj).attr("checked", "checked");
		if ($main_text_align) {
			$("#main-text-align-" + $main_text_align, style.panalObj).attr("checked", "checked");
		}
		var btnAlignLogoId = $(".selectedForm").parent().attr("id");
		var positionOld = byCtrlAlign.css("text-align");
		var positionNew = null;
		$("#main-text-align").buttonset();
		var itemObj = byCtrlAlign.find(".ctrlWraper");
		$("#main-text-align-left", style.panalObj).bind("click", function() {
			itemObj.css({
				"text-align" : "left"
			});
			positionNew = "left";
			if (positionOld != positionNew) {
				undoRedo.btnAlignUndo(itemObj, positionOld, positionNew, btnAlignLogoId, style.panalObj);
			}
		});
		$("#main-text-align-right", style.panalObj).bind("click", function() {
			itemObj.css({
				"text-align" : "right"
			});
			positionNew = "right";
			if (positionOld != positionNew) {
				undoRedo.btnAlignUndo(itemObj, positionOld, positionNew, btnAlignLogoId, style.panalObj);
			}
		});
		$("#main-text-align-center", style.panalObj).bind("click", function() {
			itemObj.css({
				"text-align" : "center"
			});
			positionNew = "center";
			if (positionOld != positionNew) {
				undoRedo.btnAlignUndo(itemObj, positionOld, positionNew, btnAlignLogoId, style.panalObj);
			}
		});

		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addNeedSavePage();
		});

	}

	/**
	 *图片对齐
	 */
	function settingPictureAlign(pictureAlignobj, ctrlObj) {
		var byCtrlAlign = ctrlObj.find(".byCtrlAlign").size() ? ctrlObj.find(".byCtrlAlign") : ctrlObj;
		var $main_picture_align = byCtrlAlign.find('img').css("float");

		$("#main-picture-align-left", style.panalObj).attr("checked", "checked");
		if ($main_picture_align) {
			$("#main-picture-align-" + $main_picture_align, style.panalObj).attr("checked", "checked");
		}
		$("#main-picture-align").buttonset();
		$("#main-picture-align-left", style.panalObj).bind("click", function() {
			if (byCtrlAlign.hasClass('CCTextBoxCover')) {
				byCtrlAlign.attr("Isleft", "true");
				byCtrlAlign.find('img').css("left", "");
			} else {
				byCtrlAlign.attr("Isleft", "false");
				byCtrlAlign.find('img').css("float", "left");
			}

		});
		$("#main-picture-align-right", panalObj).bind("click", function() {
			if (byCtrlAlign.hasClass('CCTextBoxCover')) {
				byCtrlAlign.css("left", "622px");
			} else {
				byCtrlAlign.find('img').css("float", "right");
			}

		});
		$("#main-picture-align-center", style.panalObj).bind("click", function() {
			if (byCtrlAlign.hasClass('CCTextBoxCover')) {
				byCtrlAlign.css("left", "311px");
			} else {
				byCtrlAlign.find('img').css("float", "");
			}
		});
	}

	/**
	 * 设置分栏栏位数目
	 * @param   $container  当前选中容器
	 */
	function setCols($container) {
		/**
		 * @param  cols 最终列数
		 */
		var slider = function(cols, colsData) {
			switch(cols) {
				case "1":
					$("#cols-slider").remove();
					if (divIndex == 1) {
						$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
					} else if (divIndex == 2) {
						$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
						$container.find("> div:eq(1)").hide();
					} else if (divIndex == 3) {
						$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
						$container.find("> div:eq(1)").hide();
						$container.find("> div:eq(2)").hide();
					}
					break;
				case "2":
					if ($container.attr("colsFisrt")) {
						var colsFisrt = "col-xs-" + $container.attr("colsFisrt"), colsSend = "col-xs-" + (12 - $container.attr("colsFisrt"));
						var closxsFisrt = "col-xs-" + $container.attr("colsFisrt"), closxsSend = "col-xs-" + (12 - $container.attr("colsFisrt"));
						if ($container.attr("colsFisrt") == 0) {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsFisrt).attr("cols", colsFisrt).hdie();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsSend).attr("cols", colsSend).show();

						} else if ($container.attr("colsFisrt") == 12) {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsFisrt).attr("cols", colsFisrt).show();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsSend).attr("cols", colsSend).hide();
						} else {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsFisrt).addClass(closxsFisrt).attr("cols", colsFisrt).show();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsSend).addClass(closxsSend).attr("cols", colsSend).show();
						}

					} else {

						if (divIndex == 1) {
							$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-6").attr("cols", "col-xs-6").show();
							var clone = $container.find("> div:first").clone();
							ezCommon.setColInnerId(clone.find(".colInner"));
							clone.find("> div").empty();
							$container.find("> div:first").after(clone);
							//由一列变为两列

							clone.find(".colInner").sortable({
								distance : "10",
								placeholder : "ui-state-highlight",
								connectWith : ".selectedForm , .colInner",
								tolerance : "pointer",
								cursor : "crosshair",
								//containment : clone.find(".colInner").closest('[ctrl-type="CTRLDYNAMIC"]'),
								scroll : false
							});

						} else if (divIndex == 2) {
							$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-6").attr("cols", "col-xs-6").show();
							$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-6").attr("cols", "col-xs-6").show();
						} else if (divIndex == 3) {
							$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-6").attr("cols", "col-xs-6").show();
							$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-6").attr("cols", "col-xs-6").show();
							$container.find("> div:eq(2)").hide();
						}
					}
					$("#cols-slider").remove();
					$(".colsSlider").append('<div id="cols-slider" class="slider" data-role="slider"></div>');
					$("#cols-slider").slider({
						range : "min",
						min : 0,
						max : 12,
						value : colsData,
						slide : function(event, ui) {
							value = ui["value"];
							var colsFisrt = "col-xs-" + value;
							var colsSend = "col-xs-" + (12 - value);
							//栏位改变之后从新计算栏位的多少
							divIndex = $container.find(">div").not(".ctrlIconWraper").not(".dyna-handle").length;
							if (divIndex == 2) {
								if (value == 0) {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
								} else if (value == 12) {
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
								} else {
									$container.find("> div:eq(0)").removeAttr("class").addClass(colsFisrt).attr("cols", colsFisrt).show();
									$container.find("> div:eq(1)").removeAttr("class").addClass(colsSend).attr("cols", colsSend).show();
								}
							} else if (divIndex == 3) {
								if (value == 0) {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(2)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
								} else if (value == 12) {
									$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(2)").hide();
								} else {
									$container.find("> div:eq(0)").removeAttr("class").addClass(colsFisrt).attr("cols", colsFisrt).show();
									$container.find("> div:eq(1)").removeAttr("class").addClass(colsSend).attr("cols", colsSend).show();
									$container.find("> div:eq(2)").hide();
								}
							}
							$container.attr("colsFisrt", value).removeAttr("colsOne").removeAttr("colsTow");
							isHiddenBorder($container);
						}
					});

					break;
				case "3":
					if ($container.attr("colsOne") || $container.attr("colsTow")) {
						var colsLeft, colsCent, colsRight;
						colsLeft = "col-xs-" + $container.attr("colsOne");
						colsCent = "col-xs-" + ($container.attr("colsTow") - $container.attr("colsOne"));
						colsRight = "col-xs-" + (12 - $container.attr("colsTow"));
						if ($container.attr("colsOne") == 0) {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).hide();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
							$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();
						} else if ($container.attr("colsOne") == $container.attr("colsTow")) {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).hide();
							$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();
						} else if ($container.attr("colsTow") == 12) {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
							$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).hide();
						} else {
							$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
							$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
							$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();
						}
					} else {
						if (divIndex == 1) {

							$container.find("> div:first").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
							var clone1 = $container.find("> div:first").clone(), clone2 = $container.find("> div:first").clone();
							ezCommon.setColInnerId(clone1.find(".colInner"));
							ezCommon.setColInnerId(clone2.find(".colInner"));

							clone1.find("> div").empty();
							clone2.find("> div").empty();
							$container.find("> div:first").after(clone1).after(clone2);
							//由一列变成三列

							clone1.find(".colInner").sortable({
								distance : "10",
								placeholder : "ui-state-highlight",
								connectWith : ".selectedForm , .colInner",
								tolerance : "pointer",
								cursor : "crosshair",
								//containment : clone.find(".colInner").closest('[ctrl-type="CTRLDYNAMIC"]'),
								scroll : false
							});

							clone2.find(".colInner").sortable({
								distance : "10",
								placeholder : "ui-state-highlight",
								connectWith : ".selectedForm , .colInner",
								tolerance : "pointer",
								cursor : "crosshair",
								//containment : clone.find(".colInner").closest('[ctrl-type="CTRLDYNAMIC"]'),
								scroll : false
							});

						} else if (divIndex == 2) {
							$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
							var clone = $container.find("> div:first").clone();
							ezCommon.setColInnerId(clone.find(".colInner"));
							clone.find("> div").empty();
							$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
							$container.find("> div:eq(1)").after(clone);
							//由两列变成三列
							clone.find(".colInner").sortable({
								distance : "10",
								placeholder : "ui-state-highlight",
								connectWith : ".selectedForm , .colInner",
								tolerance : "pointer",
								cursor : "crosshair",
								//containment : clone.find(".colInner").closest('[ctrl-type="CTRLDYNAMIC"]'),
								scroll : false
							});
						} else if (divIndex == 3) {
							$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
							$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
							$container.find("> div:eq(2)").removeAttr("class").addClass("col-xs-4").attr("cols", "col-xs-4").show();
						}
					}
					$("#cols-slider").remove();
					$(".colsSlider").append('<div id="cols-slider" class="slider" data-role="slider"></div>');
					$("#cols-slider").slider({
						range : true,
						values : [colsData["colsOne"], colsData["colsTow"]],
						min : 0,
						max : 12,
						slide : function(event, ui) {
							var colsLeft, colsCent, colsRight;
							colsLeft = "col-xs-" + ui.values["0"];
							colsCent = "col-xs-" + (ui.values["1"] - ui.values["0"]);
							colsRight = "col-xs-" + (12 - ui.values["1"]);
							if (ui.values["0"] == 0) {
								if (ui.values["1"] == 0) {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(2)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
								} else if (ui.values["1"] == 12) {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
									$container.find("> div:eq(2)").hide();
								} else {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
									$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();
								}

							} else if (ui.values["1"] == 12) {
								if (ui.values["0"] == 0) {
									$container.find("> div:eq(0)").hide();
									$container.find("> div:eq(1)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
									$container.find("> div:eq(2)").hide();
								} else if (ui.values["0"] == 12) {
									$container.find("> div:eq(0)").removeAttr("class").addClass("col-xs-12").attr("cols", "col-xs-12").show();
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(2)").hide();
								} else {
									$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
									$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
									$container.find("> div:eq(2)").hide();
								}
							} else {
								if (ui.values["0"] == ui.values["1"]) {
									$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
									$container.find("> div:eq(1)").hide();
									$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();

								} else {
									$container.find("> div:eq(0)").removeAttr("class").addClass(colsLeft).attr("cols", colsLeft).show();
									$container.find("> div:eq(1)").removeAttr("class").addClass(colsCent).attr("cols", colsCent).show();
									$container.find("> div:eq(2)").removeAttr("class").addClass(colsRight).attr("cols", colsRight).show();
								}

							}

							$container.attr({
								"colsOne" : ui.values["0"],
								"colsTow" : ui.values["1"]
							}).removeAttr("colsFisrt");

							isHiddenBorder($container);
						},
					});
					break;
			}

		};

		var isHiddenBorder = function($container) {
			if ($container.find("> div:eq(0)").is(":hidden") && !$container.find("> div:eq(1)").is(":hidden")) {
				$container.find("> div:eq(1)").css({
					"border-left" : "none"
				});
			} else if ($container.find("> div:eq(0)").is(":hidden") && $container.find("> div:eq(1)").is(":hidden")) {
				$container.find("> div:eq(2)").css({
					"border-left" : "none"
				});
			} else {
				$container.find("> div:eq(1)").css({
					//"border-left" : "1px solid #ccc"
				});
			}
		};

		var divIndex = $container.find(">div").not(".ctrlIconWraper").not(".dyna-handle").length;
		var colsData = {};
		if ($container.attr("rownum")) {
			var rownum = $container.attr("rownum");
			var eqnum = rownum - 1;
			$(".colsPreList span").removeClass("selectCols");
			$(".colsPreList span:eq(" + eqnum + ")").addClass("selectCols");
			if (rownum == 1) {
				slider(rownum, "");
			} else if (rownum == 2) {
				var colsFisrt = $container.attr("colsFisrt");
				colsFisrt ? colsFisrt : colsFisrt = 6;

				slider(rownum, colsFisrt);
			} else if (rownum == 3) {
				if ($container.attr("colsOne") || $container.attr("colsTow")) {
					colsData["colsOne"] = $container.attr("colsOne");
					colsData["colsTow"] = $container.attr("colsTow");
				} else {
					colsData["colsOne"] = 4;
					colsData["colsTow"] = 8;
				}
				slider(rownum, colsData);
			}
		} else {
			slider("1", "");
		}
		$(".colsPreList span").off("click").on("click", function() {
			var cols = $(this).find("i").attr("cols");
			$(this).parent().find(".selectCols").removeClass("selectCols");
			$(this).addClass("selectCols");
			$container.attr("rowNum", cols);
			$container.removeAttr("colsone").removeAttr("colstow").removeAttr("colsfisrt");
			//每单击一次计算一下容器中div的长度
			divIndex = $container.find(">div").not(".ctrlIconWraper").not(".dyna-handle").length;
			if (cols == 1) {
				slider(cols, "");
			} else if (cols == 2) {
				slider(cols, 6);
			} else if (cols == 3) {
				colsData["colsOne"] = 4;
				colsData["colsTow"] = 8;
				slider(cols, colsData);
			}
			$container.find(">div").not(".ctrlIconWraper").not(".dyna-handle").not(":first").css({
				//"border-left" : "1px solid #ccc"
			});

			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				ezCommon.Obj.find(".colInner").each(function() {
				});
			});
		});
	}

	/*
	 * 阴影设置
	 */
	function publicShadow(key) {
		onValueChange($("#"+key)[0], function() {
			if ($(".ctrlSelected").length == 1) {
				vale = $('[ctrlid=' + ctrlId + ']');
			} else {
				vale = $(".ctrlSelected");
			}
			var oldShadowColor = $(".ctrlSelected").attr("data-shadowColor");
			var oldLevel = $(".ctrlSelected").attr("data-level");
			var oldVertical = $(".ctrlSelected").attr("data-vertical");
			var oldSize = $(".ctrlSelected").attr("data-size");
			var oldChange = $(".ctrlSelected").attr("data-change");
			$.each(vale, function(k, v) {
				//vale = ezCommon.Obj.find("img");
				var level = $("#shuiping").val();
				var vertical = $("#chuizhi").val();
				var size = $("#chicun").val();
				var change = $("#bianhua").val();
				var showcolor = $(".shadow-color .sp-preview-inner").css("background-color");

				var newLevel = $("#shuiping").val();
				var newVertical = $("#chuizhi").val();
				var newSize = $("#bianhua").val();
				var newChange = $("#bianhua").val();

				$(".ctrlSelected").attr("data-level", newLevel);
				$(".ctrlSelected").attr("data-vertical", newVertical);
				$(".ctrlSelected").attr("data-size", newSize);
				$(".ctrlSelected").attr("data-change", newChange);

				var ShadowElementLogoId = $(".selectedForm").parent().attr("id");
				if (oldLevel != newLevel || oldVertical != newVertical || oldSize != newSize || oldChange != newChange) {
					undoRedo.ShadowElementUndo($(".ctrlSelected"), oldShadowColor, oldLevel, oldVertical, oldSize, oldChange, newLevel, newVertical, newSize, newChange, ShadowElementLogoId);
				}

				$(v).find("img").css("box-shadow", level + "px " + vertical + "px " + size + "px " + change + "px " + showcolor);
			});

		});
	}

	function shadowColor() {
		publicShadow("shuiping");
		publicShadow("chuizhi");
		publicShadow("chicun");
		publicShadow("bianhua");
	}

	function chColor(showcolor) {
		//vale = ezCommon.Obj.find("img");
		if ($(".ctrlSelected").length == 1) {
			vale = $('[ctrlid=' + ctrlId + ']');
		} else {
			vale = $(".ctrlSelected");
		}
		var oldShadowColor = $(".ctrlSelected").attr("data-shadowColor");
		var oldLevel = $(".ctrlSelected").attr("data-level");
		var oldVertical = $(".ctrlSelected").attr("data-vertical");
		var oldSize = $(".ctrlSelected").attr("data-size");
		var oldChange = $(".ctrlSelected").attr("data-change");
		$.each(vale, function(k, v) {
			var level = $("#shuiping").val();
			var vertical = $("#chuizhi").val();
			var size = $("#chicun").val();
			var change = $("#bianhua").val();
			var imgBoxShadowLogoId = $(".selectedForm").parent().attr("id");
			if (oldShadowColor != showcolor) {
				undoRedo.imgBoxShadowColorUndo($(".ctrlSelected"), oldShadowColor, showcolor, oldLevel, oldVertical, oldSize, oldChange, imgBoxShadowLogoId);
			}
			$(".ctrlSelected").attr("data-shadowColor", showcolor);
			$(v).find("img").css("box-shadow", level + 'px ' + vertical + 'px ' + size + 'px ' + change + 'px ' + showcolor);
		});

	}

	function showadVal() {
		//vale = ezCommon.Obj.find("img");
		//vale = vale = $(".ctrlSelected");
		if ($(".ctrlSelected").length == 1) {
			vale = $('[ctrlid=' + ctrlId + ']');
		} else {
			vale = $(".ctrlSelected");
		}
		$.each(vale, function(k, v) {
			var showVal = $(v).find("img").css("box-shadow");
			if ((showVal == 'none') || (showVal == undefined)) {
				return false;
			} else {
				var re = /\-?\d+/g;
				var shadowVal = showVal.match(re);
				var shuiping = shadowVal[6];
				var chuizhi = shadowVal[5];
				var bianhua = shadowVal[4];
				var juli = shadowVal[3];
				$("#shuiping").val(juli);
				$("#chuizhi").val(bianhua);
				$("#bianhua").val(shuiping);
				$("#chicun").val(chuizhi);
			}
		});
	}

	/**
	 * 设置分栏是否响应式布局
	 */
	function setResponseLayOut() {
		$(".setResponse").click(function() {
			var $_this = $(this);
			var input = $(this).find("input")[0];
			if (input.getAttribute("checked")) {
				input.removeAttribute("checked");
			} else {
				input.setAttribute("checked", "checked");
			}
			ezCommon.Obj.find("div[cols]").each(function() {
				var classItem = $(this).attr("class").split(" ");
				var responseClass = "";
				for (var i = 0; i < classItem.length; i++) {
					if (classItem[i].indexOf("col-xs-") >= 0) {
						responseClass = classItem[i];
						break;
					}
				}
				var colNum = responseClass.substring(7);

				if (input.getAttribute("checked")) {
					$(this).addClass("col-xs-" + colNum);
				} else {
					$(this).removeClass("col-xs-" + colNum);
				}
				var cols = "";
				var newClassItem = $(this).attr("class").split(" ");
				for (var j = 0; j < newClassItem.length; j++) {
					if (newClassItem[j].indexOf("col-") >= 0) {
						cols += newClassItem[j] + " ";
					}
				}
				$(this).attr("cols", cols);
			});
			//modifyComp();
		});

	}
	
	/**
	 * 头部和底部导航栏内部可添加元素
	 */
	function navColInnerSortable($colInner){
		$colInner.sortable({
			distance : "10",
			placeholder : "ui-state-highlight",
			tolerance : "pointer",
			connectWith : ".selectedForm , .colInner,.delMainTop",
			cursor : "crosshair",
			//containment : $colInner.closest('[ctrl-type="CTRLDYNAMIC"]'),
			scroll : false,
			axis : "y",
			start : function(e, ui) {
				var $dragger = ui.item;
				//拖动一开始，即设置当前拖动的元素为选中状态
				//ezCommon.setCtrlSelected($dragger);
				// var typeLogo = $dragger[0].tagName;
				// if (typeLogo == "DIV") {
					// $(".delMainTop").show();
					// $(".realMaintop").hide();
				// }
			},
			stop : function(e, ui) {
				var $this = ui.item;
				var thisId = $this.attr("ctrlId");
				var iden = null, method = "";
				if ($this.prev().length) {
					iden = $this.prev().attr("ctrlId");
					method = "after";
				} else if ($this.next().length) {
					iden = $this.next().attr("ctrlId");
					method = "before";
				} else {
					var $parentCol = $("[ctrlid = '" + thisId + "']", $colInner).parent();
					iden = $parentCol.attr("ctrlid") || $parentCol.attr("columnidx");
					method = "append";
				}
				if ($this.parent().hasClass("delMainTop")) {
					var deleteId = $this.attr("ctrlId");
					$this.remove();
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						e.deleteCtrlJson(deleteId);
					});
				}
				$colInner.closest('[ctrl-type="compLogic"]').find(".colInner").not($colInner).not("[columnidx]").each(function() {
					var $temp = $("[ctrlid = '" + thisId + "']", $(this)).clone();
					var $parent = $("[ctrlid = '" + iden + "']", $(this));
					$parent = $parent.length ? $parent : $("[columnidx = '" + iden + "']", $(this));
					//容器对象
					$("[ctrlid = '" + thisId + "']", $(this)).remove();
					$parent[method]($temp);
				});
			}
		});
	}


	module.exports = style;
});
