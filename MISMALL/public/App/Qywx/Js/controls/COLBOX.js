/**
 * @author 陈川
 * @desc 定位栏
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//定位栏控件对外接口
	var COLBOX = {

		get : function() {
			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {
			var oldPosition = "";
			$obj.draggable({
				containment : "parent",
				zIndex : 9999,
				start : function(e, ui) {
					var $dragger = ui.helper;
					ezCommon.Obj = $dragger;
					// ezCommon.setCtrlSelected($dragger);
					//选中头部时去除红色虚线框
					// $dragger.click();
					// $(".selectedForm").parent().css("outline", "none");
					// $("#myWeb").css("border", "none");
					oldPosition = ezCommon.Obj.css("top");
				},
				stop : function(e, ui) {
					var colboxMoveParentLogoId = $(".selectedForm").parent().attr("id");
					var newPosition = ezCommon.Obj.css("top");
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
						e.colboxMoveUndo(ezCommon.Obj, oldPosition, newPosition, colboxMoveParentLogoId);
					});
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						e.addNeedSavePage();
					});
				}
			});
			var oldNextId = "";
			var colInnerObj = "";
			var colInnerType = "";
			$obj.find(".colInner").sortable({
				distance : "10",
				placeholder : "ui-state-highlight",
				connectWith : ".colInner,.delMainTop,.selectedForm",
				tolerance : "pointer",
				cursor : "crosshair",
				scroll : true,
				scrollSensitivityType : 30,
				scrollSpeedType : 40,
				axis : "y",
				start : function(e, ui) {
					var $dragger = ui.item;
					ezCommon.setCtrlSelected($dragger);
					var $nextCtrl = $dragger.next().next();
					if ($nextCtrl.length) {
						oldNextId = $nextCtrl.attr("ctrlId");
					}
					if ($dragger.parent().hasClass("colInner")) {
						var colunmID = $dragger.parent(".colInner").attr("columnidx");
						if (colunmID) {
							colInnerObj = colunmID;
							colInnerType = "column";
						} else {
							colInnerObj = $dragger.parent(".colInner");
							colInnerType = "colbox";
						}
					}
					// var typeLogo = $dragger[0].tagName;
					// if (typeLogo == "DIV") {
						// $(".delMainTop").show();
						// $(".realMaintop").hide();
					// }

				},
				sort : function(e, ui) {
				},
				stop : function(e, ui) {
					//如果是控件排序，则不需要执行添加的逻辑
					var isSorting = ui.item.hasClass("ctrl");
					var newNextId = ui.item.next().attr("ctrlId");
					var colboxSortableParentLogoId = $(".selectedForm").parent().attr("id");
					var $this = ui.item;
					if (isSorting) {
						if ($this.parent().hasClass("delMainTop")) {
							var deleteId = $this.attr("ctrlId");
							$this.remove();
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
								e.deleteCtrlJson(deleteId);
							});
							$(".right-menu").hide();
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.deleteCtrlUndo(colInnerType, colInnerObj, $this, oldNextId, colboxSortableParentLogoId);
							});
						} else {
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.colboxSortableUndo($obj, $this, oldNextId, newNextId, colboxSortableParentLogoId);
							});
						}
						// $(".realMaintop").show();
						// $(".delMainTop").hide();
						return;
					}
					//拖动添加控件
					var ctrlType = ui.item.attr("ctrl-type"), isComponent = ui.item.hasClass("sys-comp");
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js", function(e) {
						if (isComponent) {
							e.loadComponent(ctrlType, ui.item);
						} else {
							e.loadCtrls(ctrlType, ui.item);
						}
					});
				}
			});
		},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function() {
		},

		/**
		 * 加载控件属性
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAttrs(ctrl);
			});
		},

		/**
		 * 加载控件动作
		 */
		loadAction : function(ctrlType) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.loadAction(ctrlType);
			});
		},

		/**
		 * 设置控件属性
		 */
		setAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				e.setAttrs(ctrl);
			});
		}
	};

	var ctrl = {

		html : '<div class="row ctrl" isbasectrl="true" ctrl-type="COLBOX" pure-bg-color="true" byctrlradius="true" byCtrlSize="true" border-bg-color="true" byctrlborder="true" data-border="0" data-margin="0" data-padding="0" data-radius="0" data-width="336" data-bgColor="white" data-borderBgColor="black" style="border-width:0px"><label class="control-label fieldTitle col-xs-3" style="display:none"></label><div data-padding="true" data-margin="true" text-color="true" class="colInner byCtrlPadding colInne-cent"></div><div class="dyna-handle" title = "拖动定位栏">| | |</div><div class = "ctrlIconWraper"></div></div>',
		cName : '定位栏',
		attrs : {
			General : ["title", "isHidden"],
			style : ["bgColor", "borderColor", "boxWidth", "fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle"]
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {

					},
					"data" : {

					},
					"wx" : {

					}
				}
			},
		}
	};

	module.exports = COLBOX;
});
