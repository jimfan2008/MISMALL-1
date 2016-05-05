/**
 * @author 陈川
 * @desc 下拉框控件
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//下拉框控件对外接口
	var DROPDOWN = {

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
		init : function($obj) {
			var $selectedForm = $(".selectedForm");
			$obj.find(".ctrlValue,.formInputArrow").click(function() {
				if ($selectedForm.hasClass("slideInputForm")) {
					var fieldTitle = $(this).parent().find(".fieldTitle").html();
					var $inputPanel = $selectedForm.next(".inputPanel");
					var $ipTitle = $inputPanel.find(".ipTitle");
					var $ipEditBox = $inputPanel.find(".ipEditBox");
					var itemLabel = "";
					$ipTitle.html("选择" + fieldTitle);
					$obj.find("option").each(function() {
						var optVal = $(this).attr("value");
						itemLabel += '<label class="itemLabel buttonType" isbasectrl="true"><span>' + optVal + '</span></label>';
					});
					$ipEditBox.empty().append(itemLabel);
					//绑定滑出式输入面板中选项的单击事件
					var ctrlName = $obj.attr("ctrlId");
					ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit = "1";
					ezCommon.inputPanelItemClick($ipEditBox.find(".itemLabel"));
					$inputPanel.data("ctrl", $obj);
					if ($selectedForm.hasClass("slideInputForm")) {
						$selectedForm.next(".inputPanel").show().animate({
							"right" : 0
						}, 300);
					}
				}
			});
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

		html : '<div class="row ctrl imFormCtrl" ctrl-type="DROPDOWN"><label class="control-label fieldTitle col-xs-3">下拉框</label><div class="ctrlWraper col-xs-9"><select isbasectrl="true" style="margin-left:0px;" class="form-control ctrlIsedit"><option value="选项1">选项1</option><option value="选项2">选项2</option></select><span style="display:none;" class="input-group-addon unit"></span></div><span class="help-block ctrlproInfo"></span><div class="ctrlValue"></div><div class = "formInputArrow">&gt;</div><div class = "ctrlIconWraper"></div></div>',
		cName : '下拉框',
		attrs : {
			General : ["title", "proInfo", "isHidden", "addChoose"],
			Item : ["items", "addItem"],
			Validate : ["qequired"],
			Data : ["dataBind"],
			StyleAttr : []
		},
		event : {
			change : {
				title : "值改变",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
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

			/*
			 load : {
			 title : "页面加载",
			 action : {
			 "base" : {
			 "pageJump" : "页面跳转",
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
			 }*/

		}
	};

	module.exports = DROPDOWN;
});
