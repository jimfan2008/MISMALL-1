/**
 * @author 陈毅
 * @desc 多文本
 * @time 2015-05-04
 */

define(function(require, exports, module) {
	
	//文本框控件对外接口
	var REMARK = {
		
		get : function(){
			
			return ctrl;
		},
		
		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {},
		
		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj){
			var $selectedForm = $(".selectedForm");
			$obj.click(function(){
				ezCommon.Obj = $obj;
				
				var $inputPanel = $selectedForm.next(".inputPanel");
				$inputPanel.find("textarea").val(fieldTitle);
				if ($selectedForm.hasClass("slideInputForm")) {
					$selectedForm.next(".inputPanel").show().animate({
						"right" : 0
					},300,function(){
						$(".inputPanel textarea").focus();
					});
				} else {
					
				}
			});
		},
		
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
		
		html : '<div class="row ctrl imFormCtrl" data-type="controls" ctrl-type="REMARK"><div class = "col-md-12"><div byctrlalign="true">您的数据会显示在这</div></div><div class = "ctrlIconWraper"></div></div>',
		cName : '多文本',
		attrs : {
			General : ["title", "proInfo", "placeholder", "layout", "isRdOnly", "isHidden"],
			Validate : ["qequired", "minLength", "maxLength"],
			Data : ["defaultValue"],
		},
		DataAttr : ["dataSource", "systemParam", "pageParamItem", "clear"],
		event : {
			click : {
				title : "单击",
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
				},
			},
			
		}
	};
	
	module.exports = REMARK;
});
