/**
 * @author 陈川
 * @desc 图片控件
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//图片控件对外接口
	var IMAGEBOX = {

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
				if (isObjNull(ezCommon.Obj.find("img"))) {
					$(".border-bg-color").find(".ez-left-align").text("边框");
				} else {
					$(".border-bg-color").find(".ez-left-align").text("颜色");
				}
			});
		}
	};
	var ctrl = {

		html : '<div class="row ctrl" data-border="0" data-level="0" data-vertical="0" data-size="0" data-change="0" data-shadowColor="black" data-borderColor="black" data-margin="0"  data-padding="0" ctrl-type="IMAGEBOX" style="padding:0px;"><label class="control-label fieldTitle col-xs-3" style="display:none"></label><div class="ctrlWraper col-xs-12" style="text-align:center;padding-left:0px;padding-right:0px;"><a href="javascript:;" class="ImagePreview"><img class="byCtrlRadius" byCtrlRadius="true" isbasectrl="true" byCtrlRadius="true" style="cursor:pointer;width:40%;" data-pictureSize="40" class="img_avatar" src="' + SITECONFIG.PUBLICPATH + '/App/Qywx/Images/imgBox.png" isbasectrl="true" data-radius="0"></a><span style="display:none;" class="input-group-addon unit"></span><span class="help-block ctrlproInfo"></span></div><div class = "ctrlIconWraper"></div></div>',
		cName : '图片展示',
		attrs : {
			General : ["title", "addFiledTitle"],
			style : ["isTitleElse","changeImg", "borderColor", "pictureWidth", "changeImage", "fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle", "shuiping", "chuizhi", "bianhua", "chicun", "yanse"]
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
						"setWXNotice" : "微信通知",
						"richScan" : "扫一扫"
					}
				}
			},
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
			keydown : {
				title : "回车",
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
			}
		}
	};

	module.exports = IMAGEBOX;
});
