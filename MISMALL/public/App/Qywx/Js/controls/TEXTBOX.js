/**
 * @author 陈毅
 * @desc 文本框控件
 * @date 2015-05-04
 */

define(function(require, exports, module) {
	
	//文本框控件对外接口
	var TEXTBOX = {
		
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
				$obj.find(".ctrlValue,.formInputArrow").click(function(){
					if ($selectedForm.hasClass("slideInputForm")){
						var fieldTitle =  $(this).parent().find(".fieldTitle").html(),
							ctrlValue = $(this).find(".ctrlValue").html(),
							$inputPanel = $selectedForm.next(".inputPanel"),
							$ipEditBox = $inputPanel.find(".ipEditBox");
						//缓存当前点击的控件到滑出面板中
						$inputPanel.data("ctrl",$obj);
						$inputPanel.find('.ipTitle').html("编辑"+fieldTitle);
						$ipEditBox.empty().append("<textarea></textarea>");
						$ipEditBox.find("textarea").val(ctrlValue);
						if ($selectedForm.hasClass("slideInputForm")) {
							$selectedForm.next(".inputPanel").show().animate({
								"right" : 0
							},300,function(){
								$(".inputPanel textarea").focus();
						});
					} else {
						
					}
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
			getFormList($("#selectTable"));
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
			var formId = $("#selectTable").find("option:selected").attr("queryId");
			getFieldList(formId, $("#selectCtrl"));
			//表单列表切换
			$("#selectTable").on("change", function() {
				var queryId = $(this).find("option:selected").attr("queryId");
				getFieldList(queryId, $("#selectCtrl"));
			});
		}
		
	};
	function getFormList($obj) {
		//获取当前项目所有表单
		var $form = ezCommon.getFormListData();
		var formStr =null; 
		if ($form.length) {
			$.each($form, function(key, value) {
				if (value["ID"] != -1) {
					formStr += '<option queryId="' + value["ID"] + '" tableName="' + value["tableName"] + '" title="' + value["tableTitle"] + '">' + value["tableTitle"] + '</option>';
				}
			});
		}
 		$obj.append(formStr);
		return formStr;
	};
	//获取指定表单字段
	function getFieldList(formId, $obj) {
		var fieldForm = ezCommon.getFormFieldsData(formId);
		var fieldStr = null;
		if (fieldForm.length) {
			$.each(fieldForm, function(key, value) {
				fieldStr += '<option field="' + value["fieldName"] + '" title="' + value["fieldTitle"] + '">' + value["fieldTitle"] + '</option>';
			});
		}
		if(formId!=undefined){
		  $obj.find("option:not(:first)").remove();
		  $obj.append(fieldStr);
		}
		return fieldStr;
	};
	var ctrl = {
		html : '<div class="row ctrl imFormCtrl" ctrl-type="TEXTBOX"><label class="control-label fieldTitle col-xs-3">文本框1</label><div class="ctrlWraper col-xs-8 input-group"><input type="text" isbasectrl="true" class="ctrlisrdonly form-control"><span style="display:none;" class="input-group-addon unit"></span></div><span class="help-block ctrlproInfo" style="margin-left:90px;"></span><div class = "ctrlValue"></div><div class = "formInputArrow">&gt;</div><div class = "ctrlIconWraper"></div></div>',
		cName : '文本框',
		attrs : {
			General : ["title", "unit", "proInfo", "placeholder", "isHidden",  "isBorder", "isRdOnly","isTitle"],
			Validate : ["qequired","uniqueness","minLength", "maxLength", "textFormat","selectTable","selectCtrl"],
			Data : ["defaultValue"],
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
						"componentUpdate" : "数据更新",
						"componentUpdateData" : "组件数据更新",
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
						"componentUpdate" : "数据更新",
						"componentUpdateData" : "组件数据更新",
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
	
	module.exports = TEXTBOX;
});
