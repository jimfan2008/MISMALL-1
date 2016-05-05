/**
 * @author 陈毅
 * @desc 文本标签
 * @time 2015-05-04
 */

define(function(require, exports, module) {

	//文本框控件对外接口
	var TEXT = {

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
			if ($obj.hasClass("thisisField")) {
				return;
			}
			$obj.unbind("dblclick").dblclick(function(e) {
				stopEventBubble(e);
				var $text = $obj.find("[name]"), $html = strReplace($text.html());
				var $tempTextArea = $("<textarea style = 'width:100%;padding:5px;'></textarea>");
				$tempTextArea.val($html);
				$tempTextArea.appendTo($text.empty());
				$tempTextArea.focus().select().blur(function() {
					var newVal = replaceStr($(this).val());
					$text.html(newVal);
				}).dblclick(function(e) {
					stopEventBubble(e);
				});
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

		html : '<div class="row ctrl" data-type="controls" ctrl-type="TEXT" data-radius="0" data-border="0" data-margin="0" data-padding="0" data-textSize="13"  data-lineheight="17" data-bgColor="white" isFontWeight="false" data-textColor="black" data-borderBgColor="black"><label class="control-label fieldTitle col-xs-3" style="display:none"></label><div byctrlalign="true" byCtrlSize="true" isbasectrl="true" style="word-break:break-all;">双击编辑文本</div><div class = "ctrlIconWraper"></div></div>',
		cName : '文本标签',
		attrs : {
			General : ["title", "addFiledTitle"],
			style : ["bgColor", "textColor", "borderColor", "fontSize", "lineHeight", "textAlign", "fontWeight", "isTitleElse", "fourChangeStyle", "borderWidth", "borderSingle", "padding", "paddingSingle", "margin", "marginSingle", "borderRadius", "borderRadiusSingle"]
		},
		event : {
			click : {
				title : "单击",
				action : {
					"base" : {
						"pageJump" : "页面跳转",
						"addLogic" : "逻辑处理",

					},
					"data" : {

					},
					"wx" : {

					}
				}
			}
		}
	};
	module.exports = TEXT;
});
