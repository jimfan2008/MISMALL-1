/**
 * @author 陈川
 * @desc 单选框控件
 * @time 2015-06-26
 */

define(function(require, exports, module) {

	//单选框控件对外接口
	var RADIO = {

		get : function() {

			return ctrl;
		},

		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {},
		
		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function(){},

		/**
		 * 加载控件属性
		 */
		loadAttrs : function(){
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js",function(e){
				e.loadAttrs(ctrl);
			});
		},
		
		/**
		 * 加载控件动作
		 */
		loadAction : function(ctrlType){
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js",function(e){
				e.loadAction(ctrlType);
			});
		},
		
		/**
		 * 设置控件属性
		 */
		setAttrs : function(){
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js",function(e){
				e.setAttrs(ctrl);
			});
		}
	};

	var ctrl = {

		html : '<div class="row ctrl imFormCtrl" ctrl-type="RADIO"><label class="control-label fieldTitle col-xs-3">单选框</label><div class="ctrlWraper col-xs-9"><label class="radio-inline itemLabel radioImg"><input type="radio" value="选项1" isbasectrl="true" name="CCRadio6"><span>选项1</span></label><label class="radio-inline itemLabel radioImg"><input type="radio" value="选项2" isbasectrl="true" name="CCRadio6"><span>选项2</span></label><span style="display:none;" class="input-group-addon unit"></span></div><span class="help-block ctrlproInfo"></span></div>',
		cName : '单选框',
		attrs : {
			General : ["title", "proInfo", "isHidden"],
			style : ['selectedView'],
			Item : ["arrangement","addItem" ,"items"],
			Validate : ["qequired"]
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
			}
		}
	};

	module.exports = RADIO;
});
