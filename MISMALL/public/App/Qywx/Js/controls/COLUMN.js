/**
 * @author 范文彬
 * @desc 分栏
 * @time 2015-08-03
 */

define(function(require, exports, module) {
	//撤销恢复需要用到的st
	var oldNextId = "";
	var parentObjId = "";
	var newParentObjId = "";
	//撤销恢复需要用到的ed
	//分栏控件对外接口
	var COLBOX = {

		get : function() {
			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {
			ezCommon.setColInnerId($obj.find(".colInner:first"));
			ezCommon.setColInnerId($obj.find(".colInner:last"));
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
					//父级元素的id 以及后一个控件的id
					//撤销恢复需要用到的st
					parentObjId = $dragger.parent(".colInner").attr("columnidx");
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
					//撤销恢复需要用到的ed
				},
				sort : function(e, ui) {
				},
				stop : function(e, ui) {
					//如果是控件排序，则不需要执行添加的逻辑
					var isSorting = ui.item.hasClass("ctrl");
					var $this = ui.item;
					//撤销恢复需要用到的st
					var newNextId = ui.item.next().attr("ctrlId");
					var columnSortableParentLogoId = $(".selectedForm").parent().attr("id");
					newParentObjId = $this.parent(".colInner").attr("columnidx");
					if (isSorting) {

						if ($this.parent().hasClass("delMainTop")) {
							var deleteId = $this.attr("ctrlId");
							$this.remove();
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
								e.deleteCtrlJson(deleteId);
							});
							$(".right-menu").hide();
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.deleteCtrlUndo(colInnerType, colInnerObj, $this, oldNextId, columnSortableParentLogoId);
							});
						} else {
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.columnSortableUndo(parentObjId, newParentObjId, $this, oldNextId, newNextId, columnSortableParentLogoId);
							});
						}
						// $(".realMaintop").show();
						// $(".delMainTop").hide();
						return;

					}
					//撤销恢复需要用到的ed
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
		html : '<div style="padding:0px;" pure-bg-color="true" data-border="0" data-radius="0" data-margin="0" data-padding="0" byctrlradius="true" border-bg-color="true" byctrlborder="true" ctrl-type="COLUMN" class="row ctrl" ctrlid="COLUMN9" rownum="2" data-bgColor="white" data-borderBgColor="black"><label class="control-label fieldTitle col-xs-3" style="display:none"></label><div cols="col-xs-6" class="col-xs-6"><div  data-padding="true" data-margin="true" text-color="true" class="colInner byCtrlPadding colInne-cent ui-sortable" columnidx="column510"></div></div><div cols="col-xs-6" class="col-xs-6""><div data-padding="true" data-margin="true" text-color="true" class="colInner byCtrlPadding colInne-cent ui-sortable" columnidx="column511"></div></div><div class="dyna-handle" title = "拖动分栏">| | |</div><div class = "ctrlIconWraper"></div></div>',
		cName : '分栏',
		attrs : {
			General : ["title", "isHidden"],
			style : ["colsSetting", "bgColor", "borderColor", "fixedColbox","fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle"]
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
						"layerSwitch" : "层切换",
						"addLogic" : "逻辑处理",
						"autoCalc" : "自动运算",
						"autoFill" : "自动填充",
						"callRule" : "调用规则",
						"ctrlHideOrShow" : "控件显示隐藏",
						"oneTouchDial" : "一键拨号",
						"setOperationMsgTip" : "操作提示",
						"unlockOrLocking" : "控件锁定解锁",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "组件数据更新",
						"componentUpdateData" : "数据更新",
						"dataSourceUpdate" : "数据源更新",
						"deleteData" : "删除数据",
						"moreLayout" : "绑定制作层",
					},
					"wx" : {
						"attention" : "关注公众号",
						"generatedQrcode" : "生成二维码",
						"getLocation" : "获取地理位置",
						"playRedEnvelope" : "发红包",
						"sendMessage" : "发送消息",
						"setPay" : "微信支付",
						"setWXNotice" : "微信通知"
					}
				}
			},
		}
	};

	module.exports = COLBOX;
});
