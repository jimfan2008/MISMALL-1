/**
 * @author 范文彬
 * @desc 手机翻页
 * @time 2015-06-230
 */
define(function(require, exports, module) {

	var ctrlCommon = require("ctrlCommon"), ajaxData = require("../ajaxData");

	var layerSwitch = {

		get : function() {
			return component;
		},
		set : function(obj) {

		},
		/**
		 * 加载组件属性
		 */
		loadAttrs : function() {
			ctrlCommon.loadAttrs(component);
		},
		/**
		 * 设置组件属性
		 */
		setAttrs : function($component) {
			ctrlCommon.setAttrs($component);
		},

		/**
		 *层管理
		 */
		setLayerSwitch : function(obj) {
			layerSwitch.layDraggable();
			var cacheTemplate = null;
			//添加层
			$(".addPageLayer").unbind("click").click(function() {
				var data = null;
				$("#now").hide();
				if (!cacheTemplate) {
					data = ajaxData.getLayoutTplList(1);
					if (data && data != "null") {
						var $li_sys = "";
						cacheTemplate = data;
						$.each(data, function(i, v) {
							$li_sys += '<li class="tempItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.ROOTPATH + '' + v.imgurl + '"/><p>' + v.title + '</p></li>';

						});
						$(".sysPtlList #template").empty().append($li_sys);

					}
				}
				$(".sysPtlList #template").show();
				var ptlHeight = $(window).height();
				$("#pageTplLib").height(ptlHeight).animate({
					width : "950"
				}, 500, function() {
					$(".ptlMenu,.pageTplListWrap").fadeIn(300);
				});
				$(".sysPtlList #template").show();

			});

			/**
			 *层模板事件
			 */
			$("#pageTplLib").undelegate(".tempItem", "click").delegate(".tempItem", "click", function(e) {
				//$("#pageTplLib,#template").find(".tempItem").unbind("click").click(function(e) {
				preventDefault(e);
				stopEventBubble(e);
				$("#now").hide();
				$(".myComp,.formList,.pageListManage").find(".content").slideUp("fast");
				$(".ctrlList").find(".content").slideDown("fast");
				var len = $(".pageLayer").find("li").length;
				var num = len + 1;
				var $li = $('<li class="layer-item" value="' + num + '"><span class="layer_name">' + num + '</span><span class="delete_layer"></span></li>');
				$(".pageLayer").find("ul").append($li);
				$(".markLayer").find(".layer-item").removeClass("layerSelect");
				$li.addClass("layerSelect");
				var tempId = $(this).attr("tempId"), content = "", r = "";
				r = ajaxData.getPageTplContent(tempId);
				r ? content = r : r = false;
				$layer = $(content);
				obj.append($layer);
				obj.find(".pageFigureSelect").removeClass("pageFigureSelect").hide();
				$layer.addClass("pageFigureSelect");
				$layer.addClass("layer_" + num).attr("layerval", num);
				var value = $(this).attr("value");
				var ctrlType = $layer.parents(".editor-layer-switch,.layer-switch").attr("ctrl-type");
				$li.click(function(e) {
					layerSwitch.getCtrlAttr(ctrlType, $layer);
					layerSwitch._layerItem($(this), e);
				});
				$li.find(".delete_layer").click(function() {
					if (confirm("确定删除吗？")) {
						_deleteLayer($(this));
					} else {
						return false;
					}
				});
				$li.click();
				// 添加一个新层时初始化属性面板
				//关闭层模板选择面板
				$(".ptlMenu,.pageTplListWrap").fadeOut(300, function() {
					$("#pageTplLib").animate({
						width : "0"
					}, 500);
				});
				layerSwitch.formSortAble();
				layerSwitch.colInnerSortAble();
			});
			$(".markLayer").find(".pageLayer ul").empty();
			obj.find(".pageFigure").each(function(m) {
				var layerval = $(this).attr("layerval");
				if (layerval) {
					var $li = $('<li class="layer-item" value="' + layerval + '"><span class="layer_name">' + layerval + '</span><span class="delete_layer"></span></li>');
					$li.removeClass("layerSelect");
					if ($(this).hasClass("pageFigureSelect")) {
						$li.addClass("layerSelect");
					}
					$(".markLayer").find(".pageLayer ul").append($li);
				}
			});
			var _deleteLayer = function($that) {
				var value = $that.parent().attr("value");
				if (value) {
					$that.parent().remove();
					obj.find(".pageFigure[layerval='" + value + "']").remove();
					var n = 1;
					$(".pageLayer").find(".layer-item").each(function() {
						var hisVal = $(this).attr("value");
						$(this).attr("value", n).find(".layer_name").text(n);
						obj.find(".pageFigure[layerval='" + hisVal + "']").attr("layerval", n).removeClass("layer_" + hisVal).addClass("layer_" + n);
						n++;
					});
					if (value == 1) {
						$(".pageLayer").find(".layer-item").eq(0).addClass("layerSelect");
						$(".pageLayer").find(".layer-item").eq(0).click();
					} else {
						$(".pageLayer").find(".layer-item").eq(value - 2).addClass("layerSelect");
						$(".pageLayer").find(".layer-item").eq(value - 2).click();
					}
				}
			};

			$(".pageLayer").find(".layer-item").click(function(e) {
				var value = $(this).attr("value");
				var $thatLayer = $("body").find(".editor-layer-switch,.layer-switch").find(".layer_" + value + "");
				var ctrlType = $thatLayer.parents(".editor-layer-switch ,.layer-switch").attr("ctrl-type");
				layerSwitch.getCtrlAttr(ctrlType, $thatLayer);
				layerSwitch._layerItem($(this), e);
			});
			//删除层
			$(".pageLayer").find(".delete_layer").click(function(e) {
				if (confirm("确定删除吗？")) {
					_deleteLayer($(this));
				} else {
					return false;
				}
			});
		},

		/***
		 * 层菜单排序
		 */
		layDraggable : function() {
			$(".markLayer .pageLayer ul ").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				connectWith : ".layer-item",
				tolerance : "pointer",
				cursor : "move",
				//	items : "div.formCtrl,div.editCtrl",
				scroll : false,
				start : function() {
					$(".markLayer").find(".layer-item .delete_layer").hide();
				},
				sort : function() {

				},
				stop : function(e, ui) {
					var $dragger = ui.item, draggerValue = parseInt($dragger.attr("value")), prevValue = parseInt($dragger.prev().attr("value"));
					var $content = $(".ctrlSelected").find(".layer_" + draggerValue);
					$(".ctrlSelected").find(".layer_" + draggerValue).remove();
					if (prevValue) {
						$(".ctrlSelected").find(".layer_" + prevValue).after($content);
					} else {
						$(".ctrlSelected").find(".layer_1").before($content);
					}
					var i = 1;
					$.each($(".markLayer .pageLayer ul li"), function() {
						$(this).attr("value", i).find(".layer_name").html(i);
						i++;
					});
					var j = 1;
					$.each($(".ctrlSelected").find(".vgPage"), function() {
						var v = $(this).attr("layerval");
						$(this).attr("layerval", j).removeClass("layer_" + v).addClass("layer_" + j);
						j++;
					});
					$(".markLayer").find(".layer-item .delete_layer").show();

				}
			});

		},
		getCtrlAttr : function(ctrlType, $obj, ctrlId) {
			if (!ctrlType)
				return;
			var flag = $obj.closest("[ctrl-type='ctrl-dynamic']").length > 0 || $obj.attr("ctrl-type") == "ctrl-dynamic" ? true : false;
			var ctrlAttr = esCtrlLib[ctrlType]["attrSet"];
			var actionAttr = esCtrlLib[ctrlType]["actionSet"];
			if (ctrlType == "systemCp") {
				var syscomtype = $obj.attr("syscomtype");
				//给以前做的控制层添加"syscomtype" 属性值(由于之前的控制层没有添加 "syscomtype=editor-layer-switch")属性
				if (!syscomtype) {
					syscomtype = "editor-layer-switch";
				}
				ctrlAttr = esCtrlLib[ctrlType][syscomtype]["attrSet"];
				actionAttr = esCtrlLib[ctrlType][syscomtype]["actionSet"];
			}
			ctrlAttr = ctrlAttr ? ctrlAttr : "";
			$.each(ctrlAttr, function(key, value) {
				if (value.length > 0) {
					$("#ctrlAttrSetting ." + key).show();
					var strHtml = '';
					$.each(value, function(k, v) {
						if (((v[0].match(/margin/g) && v[1].match(/margin/g)) || (v[0].match(/border/g) && v[1].match(/border/g)) || v[0].match(/padding/g) && v[1].match(/padding/g)) && v.length == 2) {
							var str = "";
							$.each(v, function(ks, vs) {
								str += esAttrLib["subMenu"][vs];
							});
							str = '<div class="sliderSpring">' + str + "</div>";
							strHtml += str;
						} else {
							$.each(v, function(ks, vs) {
								//绑定数据源时 只有文本和图片控件才有隐藏标题的属性
								if (vs == "addFiledTitle") {
									if (flag && ($obj.hasClass("thisisField") || $obj.hasClass("img-responsive"))) {
										strHtml += esAttrLib["subMenu"][vs];
									} else if (value.length <= 1) {
										//$("#ctrlAttrSetting ." + key).hide();
									}
								} else {
									strHtml += esAttrLib["subMenu"][vs];
								}

							});

						}

					});

					$("#ctrlAttrSetting ." + key).find(".setAttrs").html(strHtml);
				} else {
					$("#ctrlAttrSetting ." + key).hide();
				}

			});
			if (objIsnull(actionAttr)) {
				var actionStr = '';
				for (var i = 0; i < actionAttr.length; i++) {
					actionStr += esAttrLib["actionStr"][actionAttr[i]];
				}

				$("#ctrlAttrSetting #ctrlConActionList").html(actionStr);

			} else {
				if (ctrlType != "setLayerStyle") {
					$("#ctrlAttrSetting #ctrlConActionList").html(null);
				}
			}
			require.async("esPanelEvent", function(e) {
				e.initSettings(ctrlType, $obj, ctrlId);
			});

			$("#ctrlAttr").addClass("setTtitleSelected");
			$("#ctrlAttrSetting").find(".ctrlAttr").show();
			$("#ctrlAction").removeClass("setTtitleSelected");
			$("#ctrlAttrSetting").find(".ctrlAction").hide();
			var $liderSpring = $("#ctrlAttrSetting");
			var selectLi = '<ul role="tablist" class="nav nav-tabs nav-justified" id="sliderSpring">';
			$.each($liderSpring.find(".sliderSpring"), function() {
				var subThis = $(this), t = subThis.find("span:first").html(), v = subThis.find("div:first").find("div:first").attr("id");
				selectLi += '<li role="presentation" value ="' + v + '"><a href="#">' + t + '</a></li>';
			});
			selectLi += '</ul>';
			if ($liderSpring.find(".sliderSpring").length > 1 && !$("#sliderSpring").length) {
				$liderSpring.find(".sliderSpring:first").show().before(selectLi);
				$liderSpring.find("#sliderSpring li:first").addClass("active");
			}
			$("#sliderSpring li").click(function() {
				var option = $(this).attr("value");
				$(".sliderSpring").hide();
				$("#" + option).closest(".sliderSpring").show();
				$("#sliderSpring li").removeClass("active");
				$(this).addClass("active");

			});

			//如果当前单击的是动态组件就展开数据源
			if (ctrlType == "ctrl-dynamic") {
				$("#ctrlConActionList .dyna-data").click();
			}

		},

		/**
		 *  手机翻页 选择与页码对应的页面
		 */
		_layerItem : function($that, e) {
			$(".pageLayer").find(".layer-item").removeClass("layerSelect");
			$that.addClass("layerSelect");
			if ($(".editor-layer-switch").find(".layer-item").length <= 1) {
				var obj = $(".layer-switch");
			} else {
				var obj = $(".editor-layer-switch");
			}
			var value = $that.attr("value");
			if (value) {
				obj.find(".pageFigure").removeClass("pageFigureSelect").css({
					"height" : "0px",
					"min-height" : "0px"
				}).hide();
				obj.find("[layerval='" + value + "']").addClass("pageFigureSelect").css({
					"height" : "100%",
					"min-height" : "390px"
				}).show();
			}
			ezCommon.Obj = $(".pageFigureSelect");
			//控制层是否可修改（与表单控件隐藏属性不同）
			var isHide = ezCommon.Obj.attr("Vishiden");
			isHide = !(isHide == "false" || !isHide);
			$("[name='isHide']").bootstrapSwitch({
				state : isHide
			}).on('switchChange.bootstrapSwitch', function(event, state) {
				var $currentLayer = ezCommon.Obj;
				if (state) {
					$currentLayer.css("opacity", "0.1");
					$currentLayer.attr("Vishiden", true);
				} else {
					$currentLayer.css("opacity", "1");
					$currentLayer.attr("Vishiden", false);
				}
			});
			//COMPONENT.getCtrlAttr("setLayerStyle", $(".pageFigureSelect"));
		},

		formSortAble : function() {
			var $dragObj = true;
			$(".selectedForm").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				connectWith : ".colInner,.poplayer-div",
				tolerance : "pointer",
				cursor : "crosshair",
				//	items : "div.formCtrl,div.editCtrl",
				scroll : false,
				start : function(e, ui) {
					var $dragger = ui.item;
					//拖动一开始，即设置当前拖动的元素为选中状态
					Global.ezQ.setCtrlSelected($dragger);
				},
				helper : function(e, ui) {
					if (ui.find(".formCtrl").attr("ctrltype") == "CCSubmit") {
						return '<div class = "sortIng_helper" style = "width:80px;height:50px;">' + ui.find("input").val() + '</div>';
					} else {
						var sortTitle = ui.find(".fieldTitle").html() || ui.attr("mycompname");
						return '<div class = "sortIng_helper" style = "width:80px;height:50px;">' + sortTitle + '</div>';
					}
				},
				sort : function(e, ui) {
					var l = e.clientX, t = e.clientY, $helper = ui.helper, scrollTop = $(document).scrollTop();
					$helper.offset({
						left : l - $helper.width() / 2,
						top : t - 10 + scrollTop
					});
				},
				over : function(e, ui) {
					//$("[ctrl-type = 'ctrl-box']").css("border-color", "#ccc");
					$("[ctrl-type = 'ctrl-box'] .dyna-handle").show();
				},
				out : function(e, ui) {
					//$("[ctrl-type = 'ctrl-box']").css("border-color", "transparent");
					$("[ctrl-type = 'ctrl-box'] .dyna-handle").hide();
				},
				stop : function(e, ui) {
					var $dragger = ui.item;
					var $selectForm = $("#phoneWrap").find(".selectedForm");
					var $that = $(this);
					if ($dragger.attr("original")) {//控件或组件添加时
						if ($dragger.hasClass("myTemp")) {
							require.async("fdMain", function(e) {
								if ($selectForm.length > 0) {
									var pageName = $dragger.attr("pageName");
									comHtml = ezCommon.getPageFile(SITEID, pageName);
									e.addCtrl($(comHtml), "drag", $("#myWeb .editArea .selectedForm:visible"), $dragger);
									Global[Global.ezType].Obj.removeClass("ctrlSelected").click();
								}
							});
						} else if ($dragger.hasClass("sysComCp")) {
							require.async("fdMain", function(e) {
								if ($selectForm.length > 0) {
									e.addCtrl($dragger, "drag", $("#myWeb .editArea .selectedForm:visible"), $dragger);
									Global[Global.ezType].Obj.removeClass("ctrlSelected").click();
									Global[Global.ezType].Obj.find(".markLayer li:first").click();
								}
							});
						} else if ($dragger.hasClass("ctrl-element")) {
							require.async("esCtrls", function(CTRL) {
								CTRL.addCtrl($dragger);

								if (Global[Global.ezType].Obj.attr("ctrl-type") == "ctrl-box" || Global[Global.ezType].Obj.attr("ctrl-type") == "ctrl-text" || Global[Global.ezType].Obj.attr("ctrl-type") == "ctrl-image") {
									var mycompname = Global[Global.ezType].ctrlNameNum[Global[Global.ezType].formId];
									if (!mycompname) {
										mycompname = Global[Global.ezType].ctrlNameNum[Global[Global.ezType].formId] = 1;
									}
									Global[Global.ezType].ctrlNameNum[Global[Global.ezType].formId]++;

									if (Global[Global.ezType].Obj.attr("ctrl-type") == "ctrl-box") {
										Global[Global.ezType].Obj.attr("mycompname", "分栏" + mycompname);
									} else if (Global[Global.ezType].Obj.attr("ctrl-type") == "ctrl-image") {
										Global[Global.ezType].Obj.attr("mycompname", "图片" + mycompname);
									} else {
										Global[Global.ezType].Obj.attr("mycompname", "标签" + mycompname);
									}

								}
								Global[Global.ezType].Obj.removeClass("ctrlSelected").click();
							});
						} else if ($dragger.hasClass("form-element")) {
							require.async("fdMain", function(e) {
								if ($selectForm.length > 0) {
									e.addCtrl($dragger, "drag", $that);
								}
							});
						}
						//COMPONENT.ctrlHover();
					} else if ($dragger.hasClass("fieldItem")) {
						$dragger.remove();
						$("#ctrlAttrSetting .selectedField").removeClass("selectedField");
					} else {//控件或组件排序时

						var isInDyna = !!$(this).closest('[colunit]').length;
						var connectWith = $(this).sortable('option', 'connectWith');
						if ($dragger.attr("ctrl-type") == "ctrl-dynamic" && isInDyna) {
							alert("组件嵌套");
						}
					}
					$dragger.removeClass("ctrlSelected");
					if ($dragger.find(">.formCtrl").length > 0) {
						$dragger.find(">.formCtrl").click();
					} else {
						$dragger.click();
					}
					$("#webSetting").show();
					$("#webSetting").find(".ctrlSetDtl:first").show();
				},
			});
		},

		colInnerSortAble : function() {
			$(".colInner").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				connectWith : ".selectedForm ,.colInner,.selectedPage",
				tolerance : "pointer",
				cursor : "crosshair",
				scroll : false,
				start : function(e, ui) {
					var $dragger = ui.item;
					//拖动一开始，即设置当前拖动的元素为选中状态
					Global.ezQ.setCtrlSelected($dragger);
				},
				helper : function(e, ui) {
					if (ui.find(".formCtrl").attr("ctrltype") == "CCSubmit") {
						return '<div class = "sortIng_helper" style = "width:80px;height:50px;">' + ui.find("input").val() + '</div>';
					} else {
						return '<div class = "sortIng_helper" style = "width:80px;height:50px;">' + ui.find(".fieldTitle").html() + '</div>';
					}
				},
				sort : function(e, ui) {
					var l = e.clientX, t = e.clientY, $helper = ui.helper, scrollTop = $(document).scrollTop();
					$helper.offset({
						left : l - $helper.width() / 2,
						top : t - 10 + scrollTop
					});
				},
				stop : function(e, ui) {
					var $draggers = ui.item;
					$draggers.removeClass("ctrlSelected");
					if ($draggers.find(">.formCtrl").length > 0) {
						$draggers.find(">.formCtrl").click();
					}
					if ($draggers.hasClass("fieldItem")) {
						$draggers.remove();
					} else {
						$draggers.click();
					}
					var isInDyna = $(this).closest('[colunit]');
					if (!!isInDyna.length) {
						var $dynaComp = $(this).closest('[ctrl-type="ctrl-dynamic"]');
						//COMPONENT.updateDynaComp($dynaComp, isInDyna);
					}

				},

				update : function(e, ui) {
					var $ctrl = Global[Global.ezType].Obj;
					var ctrlType = $ctrl.attr("ctrl-type");
					var $colUnit = $(this).closest('[colunit]');
					var bindflag = $ctrl.attr("bindflag");
					if ($colUnit.length) {
						var $dynaComp = $colUnit.closest('[ctrl-type="ctrl-dynamic"]');
						bindflag = bindflag ? bindflag : "false";
						if (ctrlType == "ctrl-image") {
							$ctrl.attr({
								"bindType" : "ccimage",
								"bindflag" : bindflag
							});
						} else if (ctrlType == "ctrl-text") {
							$ctrl.attr({
								"bindType" : "cctext",
								"bindflag" : bindflag
							});
						}
						if (!$dynaComp.hasClass("newTpl")) {
							//COMPONENT.updateDynaComp($dynaComp, $colUnit);
						}

					}
					var $draggers = ui.item;
					if ($draggers.hasClass("fieldItem")) {
						if ($(this).closest("[ctrl-type='ctrl-dynamic']").length > 0) {
							var fieldName = $draggers.attr("fieldname"), formId = $draggers.attr("formId"), fieldTitle = $draggers.attr("fieldTitle");
							var isImgField = fieldName.toLowerCase().indexOf("image") || fieldName.toLowerCase().indexOf("Photo");
							var replaceHtml = '';
							$draggers.remove();
							if (isImgField >= 0) {
								replaceHtml = '<div class = "thisisField" fieldName = "' + fieldName + '"><span class="fieldDataTitle">' + fieldTitle + '</span><img class="img-responsive editCtrl" data-type = "controls" ctrl-type="ctrl-image" fieldtitle="' + fieldTitle + '" fieldname="' + fieldName + '" fieldtype="ccimage" src=""/></div>';
							} else {
								replaceHtml = '<div class = "thisisField editCtrl" fieldType = "cctext" fieldtitle="' + fieldTitle + '"  fieldName = "' + fieldName + '" ctrl-type="ctrl-text"><span class="fieldDataTitle">' + fieldTitle + '</span><span class="fieldContent"></div>';
							}
							Global[Global.ezType].Obj = $(this).closest("[ctrl-type='ctrl-dynamic']");
							var oldFormId = Global[Global.ezType].Obj.attr("formId");
							if (oldFormId != formId) {
								$(".thisisField", Global[Global.ezType].Obj).remove();
								$(".subMenuWrap").find("[formid = '" + oldFormId + "'] input[type = 'checkbox']").prop("checked", "");
							}
							var $replaceHtml = $(replaceHtml);
							$(this).append($replaceHtml);
							var $dynamicNew = Global[Global.ezType].Obj.removeClass("newTpl").attr("formId", formId);
							var $dynamicNews = COMPONENT.loadPageComponentsData($dynamicNew);
							Global[Global.ezType].Obj.replaceWith($dynamicNews);
							COMPONENT.reSetHeight($dynamicNews);
							Global[Global.ezType].Obj = $dynamicNews;
							$("#ctrlAttrSetting .selectedField").find("input[type = 'checkbox']").prop("checked", "checked");
							COMPONENT.dataSetFieldSelectAll($("#ctrlAttrSetting .selectedField")[0]);
							$("#ctrlAttrSetting .selectedField").removeClass("selectedField");
						} else {
							$draggers.remove();
						}

					}

				}
			});
		},
	};

	var component = {
		html : '<div syscomtype="editor-layer-switch" fieldsum="true"class="row editCtrl editor-layer-switch"ctrl-type="systemCp"style="min-height:390px;padding:0;"><div class="vgPage layer-switch-page colInner pageFigure layer_1 ui-sortable pageFigureSelect" syscomtype="editor-layer-switch" style="background-image: url(/newmismall/public/App/Qywx/Images/weig001.jpg);display:block; min-height: 390px;"layerval="1"><div class="editImgBtn"><div class="bj-ele bj-upArrow-1"></div><div class="bj-ele bj-upArrow-2"></div><div class="bj-ele bj-upArrow-bottom1"></div><div class="bj-ele bj-upArrow-bottom2"></div></div></div><div class="editFooter"><div class="showEffect formCtrl" ctrlType="CCEffect"><div data-type="control" ctrlType="CCEffect" class="effect editor-layerContent " isBaseCtrl="true">发布</div></div></div><div class="markLayer"><div class="pageLayer"><ul><li class="layer-item layerSelect"value="1"><span class="layer_name">1</span><span class="delete_layer"></span></li></ul></div><div class="addPageLayer"><span class="glyphicon glyphicon-plus"></span></div><div class="setLayerStyle"></div><div class="subMenuWrap"></div></div><div class="ctrlIconWraper" title="删除"></div></div>',
		cName : '手机翻页',
		attrs : {
			General : ["title", "background", "isHidden"]
		},
	};

	module.exports = layerSwitch;
});
