/**
 * @author 陈毅
 * @desc 文本框控件
 * @time 2015-05-04
 */

define(function(require, exports, module) {
	require("dateCss");
	require("date");
	require("iScroll");
	//文本框控件对外接口
	var TIME = {

		get : function() {

			return ctrl;
		},
		
		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {},
		
		/**
		 * 控件解析时的初始化（用于预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj){
			$obj.find('[isbasectrl]').date({
	            beginyear:1990,                 //日期--年--份开始
	            endyear:2020,                   //日期--年--份结束
	            beginmonth:1,                   //日期--月--份结束
	            endmonth:12,                    //日期--月--份结束
	            beginday:1,                     //日期--日--份结束
	            endday:31,                      //日期--日--份结束
	            beginhour:1,
	            endhour:12,
	            beginminute:00,
	            endminute:59,
	            curdate:false,                   //打开日期是否定位到当前日期
	           	theme : "datetime",                  //控件样式（1：日期，2：日期+时间）
	            mode:null,                       //操作模式（滑动模式）
	            event:"click",                    //打开日期插件默认方式为点击后后弹出日期 
	            show:true
	        });
	        $obj.find('.ctrlValue').date({
	            beginyear:1990,                 //日期--年--份开始
	            endyear:2020,                   //日期--年--份结束
	            beginmonth:1,                   //日期--月--份结束
	            endmonth:12,                    //日期--月--份结束
	            beginday:1,                     //日期--日--份结束
	            endday:31,                      //日期--日--份结束
	            beginhour:1,
	            endhour:12,
	            beginminute:00,
	            endminute:59,
	            curdate:false,                   //打开日期是否定位到当前日期
	           	theme : "datetime",                  //控件样式（1：日期，2：日期+时间）
	            mode:null,                       //操作模式（滑动模式）
	            event:"click",                    //打开日期插件默认方式为点击后后弹出日期 
	            show:true
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
		html : '<div class="row ctrl imFormCtrl" ctrl-type="TIME"><label class="control-label fieldTitle col-xs-3">日期</label><div class="ctrlWraper col-xs-8 input-group"><input type="text" isbasectrl="true" class="ctrlisrdonly form-control"><span style="display:none;" class="input-group-addon unit"></span></div><span class="help-block ctrlproInfo" style="margin-left:90px;"></span><div class="ctrlValue"></div><div class = "formInputArrow">&gt;</div><div class = "ctrlIconWraper"></div></div>',
		cName : '日期',
		attrs : {
			General : ["title", "proInfo", "isHidden"],
			Validate : ["qequired", "startTime", "endTime", "dateFormat"],
			Data : ["defaultValue"]
		},
		DataAttr : ["dataTime", "clear"],
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
				}
			},
			change : {
				title : "值改变",
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
			},
		}
	};

	module.exports = TIME;
});
