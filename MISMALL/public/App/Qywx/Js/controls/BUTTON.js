/**
 * @author 陈川
 * @desc 按钮控件
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//按钮框控件对外接口
	var BUTTON = {

		get : function() {

			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {

		},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function() {
		},

		/**
		 * 按钮在添加时，判断是否需要自动转换为提交按钮
		 */
		onDropped : function($obj) {
			var hasFormCtrl = $(".selectedForm .imFormCtrl").length;
			var submitBtnLen = $(".selectedForm [issubmit = 'true']").length;
			if (hasFormCtrl && !submitBtnLen) {
				toBeSubmitBtn($obj);
			}
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

	/**
	 * 让按钮成为提交按钮
	 */
	function toBeSubmitBtn($btn) {
		var $tempBtn = $btn.find("input.ctrlBtn").clone();
		$btn.find("input.ctrlBtn").replaceWith($tempBtn);
		$tempBtn.attr("issubmit", "true").val("提 交");
		$btn.find(".submit_tipWrap").remove();
		$btn.append('<div class="submit_tipWrap"><div class="submitTip"><span class="text_font">是否确认提交数据？</span></div><div class="submitBtnWraper"><input id="yes"type="button"class="btn btn-primary btn-sm"value="确认"/>&nbsp;&nbsp;&nbsp;<input id="no"type="button"class="btn btn-primary btn-sm"value="取消"/></div></div>');
	}

	var ctrl = {
		// 这里的类名 ctrlBtn 用于标识作为控件的按钮，区别于其他input
		html : '<div class="row ctrl ctrlSelected" ctrl-type="BUTTON" data-border="0" data-radius="0" data-margin="0" data-padding="0" data-textSize="13" data-bgColor="#2795d0" data-textColor="white"><div class="ctrlWraper"><input type = "button"  btn-round="0" byCtrlSize = "true" byCtrlRadius="true" btn-width="338"  value="按钮"  isBaseCtrl="true" style="background:#2795D0;width:100%;color: rgb(255, 255, 255);" class="btn ctrlBtn fieldTitle byCtrlPadding"/></div><div title="拖动排序" class="dyna-handle">| | |</div><div class = "ctrlIconWraper"></div></div>',
		cName : '按钮',
		attrs : {
			General : ["title", "isHidden", "isEnabled", "isSubmit", "formDataUpdate"],
			style : ["buttonAlign", "bgColor", "textColor", "fontSize", "btnWidthChange", "fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle"]
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
						"ComponentOperation":"组件运算",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "组件数据更新",
						"layerSwitchDataUpdate" : "层切换数据更新",
						"formDataUpdate" : "修改表单数据",
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
						"setWXNotice" : "微信通知",
						"richScan" : "扫一扫"

					}
				}
			},
			/*
			 load : {
			 title : "页面加载",
			 action : {
			 "base" : {
			 "autoCalc" : "自动运算",
			 "autoFill" : "自动填充",
			 "callRule" : "调用规则",
			 "ctrlHideOrShow" : "控件显示隐藏",
			 "oneTouchDial" : "一键拨号",
			 "pageJump" : "页面跳转",
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
			 },*/
			dataSave : {
				title : "数据提交后",
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
						"ComponentOperation":"组件运算",
					},
					"data" : {
						"addNewData" : "新增数据",
						"componentUpdate" : "组件数据更新",
						"layerSwitchDataUpdate" : "层切换数据更新",
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
						"setWXNotice" : "微信通知",
						"richScan" : "扫一扫"

					}
				}

			}
		}
	};

	module.exports = BUTTON;
});
