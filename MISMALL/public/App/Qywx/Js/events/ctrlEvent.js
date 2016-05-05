/**
 * @author 陈毅
 * @desc 控件相关的事件集合
 * @Date 2015-06-27
 */

define(function(require, exports, module) {
	//定义复制对象
	var $copyContent = null;
	var pasteFlag = 0;

	var ctrlEvent = {

		/**
		 * 初始化
		 */
		init : function() {
			ctrlSelected();
			submitBtnClick();
			deleteCtrl();
			textFlag();
			//键盘操作复制粘贴事件
			keyboardCopyPaste();
			//头部点击复制粘贴事件
			topCopyPaste();
			adjustPosition();
			//键盘delete快捷键删除事件
			keyBoardDelete();
		}
	};
	function keyBoardDelete() {
		//按键按下时事件
		$(document).keydown(function(e) {
			//复制键按下时
			if (pasteFlag == 1) {
				return;
			}
			if (objIsnull($(".ctrlSelected"))) {
				if (e.keyCode == 46) {
					var $ctrl = $(".ctrlSelected");
					var deleteId = $(".ctrlSelected").attr("ctrlId");
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						e.deleteCtrlJson(deleteId);
					});
					$(".right-menu").hide();

					//撤销恢复需要用到st
					var colInnerObj = "";
					var colInnerType = "";
					if ($ctrl.parent().hasClass("colInner")) {
						var colunmID = $ctrl.parent(".colInner").attr("columnidx");
						if (colunmID) {
							colInnerObj = colunmID;
							colInnerType = "column";
						} else {
							colInnerObj = $ctrl;
							colInnerType = "colbox";
						}
					}
					var nextObjId = $ctrl.next().attr("ctrlId");
					console.log($ctrl.next(), 111);
					var deleteParentLogoId = $(".selectedForm").parent().attr("id");
					if ($ctrl.attr("ctrl-type") != 'systemCp' && $ctrl.attr("ctrl-type") != 'compLogic') {
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
							e.deleteCtrlUndo(colInnerType, colInnerObj, $ctrl, nextObjId, deleteParentLogoId);
						});
					}
					//撤销恢复需要用到ed
					$ctrl.remove();

				}
			}
		});
	}

	function kongjian() {
		valu = $(".ctrlSelected");
		$.each(valu, function(k, v) {
			ezCommon.str.push($(v).attr("ctrlId"));
		});
		return ezCommon.sty;
	}

	/**
	 * 预绑定控件单击选中  (还原控件已设置的属性，动作)
	 */
	function ctrlSelected() {
		$("#myWeb").on("click", ".ctrl", function(e) {
			var $selectedForm = $(".selectedForm"), $this = $(this), ctrlType = $this.attr("ctrl-type"), ctrlId = $this.attr("ctrlId");

			/*if (ezCommon.Obj && (ezCommon.Obj.attr("ctrlId") == ctrlId)) {
			ezCommon.deBug("选择的是同一个控件", "ctrlEvent", 38);
			return;
			}*/
			// ezCommon.setCtrlSelected($this);//undefined

			var fieldTitle = $(this).find(".fieldTitle").html();
			if (isObjNull($(this).parents(".topNavWraper"))) {
				$("#fixedTop").css({
					"color" : "white",
					"background" : "#0099FF"
				});
				$("#fixedBottom").css({
					"color" : "black",
					"background" : "white"
				});
			}
			if (isObjNull($(this).parents(".bottomNavWraper "))) {
				$("#fixedBottom").css({
					"color" : "white",
					"background" : "#0099FF"
				});
				$("#fixedTop").css({
					"color" : "black",
					"background" : "white"
				});
			}
			if ($selectedForm.hasClass("slideInputForm") && $(this).hasClass("imFormCtrl") && $(this).attr("ctrl-type") != "IMAGE") {
				if ($(this).attr("ctrl-type") != 'TIME') {
					var $inputPanel = $selectedForm.next(".inputPanel");
					$inputPanel.show().animate({
						"right" : 0
					}, 600);
				}
			}///else {
			//控件单击选中时隐藏红色虚线框
			if (e.ctrlKey == true && ezCommon.Obj) {
				//按了ctrl键单击控件时
				var rest = true;
				ezCommon.setCtrlSelected($this, rest);
			} else {
				//单击控件时
				if (ezCommon.Obj && (ezCommon.Obj.attr("ctrlId") == ctrlId) && $(".ctrlSelected").length == 1) {
					ezCommon.deBug("选择的是同一个控件", "ctrlEvent", 38);
					return;
				} else {
					ezCommon.setCtrlSelected($this);
				}

			}

			//如果isInput = true 文本框或者文本域聚焦此时是粘贴文本内容  如果!isInput 实现控件复制粘贴
			var tagName = e.target.tagName, isInput = false;
			if (tagName == "INPUT" || tagName == "TEXTAREA") {
				isInput = true;
			}
			if (!isInput) {
				$("input, textarea").blur();
			}
			//显示头部复制粘贴
			$(".tool-menu").show();
			$("#formPreView").show();
			stopEventBubble(e);
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(e) {
				if (ctrlType == "TEXTBOX" || ctrlType == "TEXTAREA" || ctrlType == "DROPDOWN" || ctrlType == "TIME") {
					e.showDataSetting();
				} else {
					e.hideDataSetting();
				}
			});

			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js", function(e) {
				// 各自处理 自定义组件、系统组件、控件的逻辑
				switch(ctrlType) {
					case  "compLogic" :
						e.getCustomComponentAttrs(ctrlType, function(component) {
							component.loadAttrs();
							//加载控件动作
							component.loadAction(ctrlType);
							component.setAttrs();
						});
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(ctrlCommon) {
							//还原动作设置
							ctrlCommon.restoreAction(ctrlId, "click");
							//ctrlCommon.restoreAction( "click");
							//还原属性设置
							ctrlCommon.restoreGeneral(ctrlId);
							//ctrlCommon.restoreGeneral();
							$("#container .right-menu .set-ctrl-operation .basic-operate").click();
						});
						break;
					case  "systemCp" :
						var syscomtype = $this.attr("syscomtype");
						//如果是第三方组件
						if ($this.hasClass("thirdpartyPlugin")) {
							require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/" + syscomtype + "/editing.js", function(e) {
								//加载控件属性
								e.loadAttrs($this);
								//初始化属性设置
								e.setAttrs($this);
							});

						} else {
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + syscomtype + ".js", function(e) {
								//加载控件属性
								e.loadAttrs($this);
								//初始化属性设置
								e.setAttrs($this);
								e.loadAction(syscomtype);
							});
						}
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(ctrlCommon) {
							//还原属性设置
							ctrlCommon.restoreGeneral(ctrlId);
							//ctrlCommon.restoreGeneral();
						});
						break;
					default:
						e.getAttrs(ctrlType, function(ctrl) {
							//加载控件属性
							ctrl.loadAttrs(ctrl);
							//加载控件动作
							ctrl.loadAction(ctrlType);
							//初始化属性设置
							ctrl.setAttrs();
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js", function(ctrlCommon) {
								//还原动作设置
								ctrlCommon.restoreAction(ctrlId, "click");
								//ctrlCommon.restoreAction( "click");
								//还原属性设置
								ctrlCommon.restoreGeneral(ctrlId);
								//ctrlCommon.restoreGeneral();
							});
						});
						$("#container .right-menu .set-ctrl-operation .basic-operate").click();
						break;
				}

			});
			//}
		});
	}

	/**
	 *页面控件粘贴方法
	 */
	function paste(prevFormId) {
		var nowFormId = $(".selectedForm").attr("id");
		//判断复制对象是否存在,以及根据聚焦参数 判断到底复制粘贴是粘贴文本还是控件 如果聚焦参数等于1说明文本聚焦需要粘贴文本 故阻止其同时粘贴控件
		if (!$copyContent || pasteFlag == 1) {
			return;
		}
		kongjian();
		//每次点击粘贴时克隆一个复制对象（实现粘贴功能多次粘贴）
		$.each(ezCommon.str, function(k, v) {
			$copyContent = $('[ctrlid=' + v + ']').clone();
			//将新的复制对象加入当前页面的form中
			$(".selectedForm").append($copyContent);
			var copyContentType = $copyContent.attr("ctrl-type");
			//更新最外层控件序号
			ezCommon.updateCtrlIndex();
			var index = ezCommon.ctrlNameNum[ezCommon.formId], copyContentId = copyContentType + index;
			$copyContent.attr("ctrlid", copyContentId);
			var copyContentTitle = "";
			//根据控件类型加载对应控件文件，得到相应的控件标题（将控件存入formJson的时候需要）
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + copyContentType + ".js", function(e) {
				var title = e.get().cName;
				copyContentTitle = title + index;
			});
			//为文本标签加上点击编辑文本事件
			if (copyContentType == "TEXT") {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + copyContentType + ".js", function(e) {
					e.init($copyContent);
				});
			}
			//为定位栏绑定浮动拖动事件
			if (copyContentType == "COLBOX") {
				//使定位栏每次克隆一个新的都向下移动一定位置（避免重复叠加）
				var newTop = parseInt($copyContent.css("top")) + $copyContent.height() + 10 + "px";
				$copyContent.css("top", newTop);

				$copyContent.draggable({
					containment : "parent",
					zIndex : 9999,
					start : function(e, ui) {
						ezCommon.setCtrlSelected($(this));
					}
				});
			}
			//更新分栏中小分栏以及控件序号
			if (copyContentType == "COLUMN" || copyContentType == "COLBOX") {
				//更新分栏中的小分栏id（为分栏绑定拖动事件）
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
					$copyContent.find(".colInner").each(function() {
						ezCommon.setColInnerId($(this));
						e.colInnerSortable($(this));
					});
				});
				//更新分栏中的控件ID
				$copyContent.find(".ctrl").each(function() {
					ezCommon.updateCtrlIndex();
					var thisType = $(this).attr("ctrl-type");
					var index = ezCommon.ctrlNameNum[ezCommon.formId], thisId = thisType + index;
					//根据控件类型加载对应控件文件，得到相应的控件标题（将控件存入formJson的时候需要）
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + thisType + ".js", function(e) {
						var title = e.get().cName;
						thisTitle = title + index;
					});

					$(this).attr("ctrlid", thisId);
					//更新当前控件标题
					$(this).find(".fieldTitle").text(thisTitle);
					//每个控件（.ctrl）中的表单控件（如input select等）都有一个共同的属性:isbasectrl
					$(this).find("[isbasectrl]").attr("name", thisId);
					//为文本标签加上点击编辑文本事件
					if (thisType == "TEXT") {
						if ($(this).hasClass("thisisField")) {
							return;
						}
						$(this).dblclick(function() {
							var $text = $(this).find("[name]"), $html = strReplace($text.html());

							var $tempTextArea = $("<textarea style = 'width:100%;padding:5px;'></textarea>");
							$tempTextArea.val($html);
							$tempTextArea.appendTo($text.empty()).focus().select().blur(function() {
								var newVal = replaceStr($(this).val());
								$text.html(newVal);
							}).dblclick(function(e) {
								stopEventBubble(e);
							});
						});
					}
					//将新复制对象加入JSON
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						e.add(thisType, thisId, thisTitle, function(itemId1, itemId2) {
							$copyContent.find(".ctrlWraper .itemLabel:first").addClass(itemId1);
							$copyContent.find(".ctrlWraper .itemLabel:last").addClass(itemId2);
						});
					});
				});
			} else {
				$copyContent.find(".fieldTitle").text(copyContentTitle);
				//每个控件（.ctrl）中的表单控件（如input select等）都有一个共同的属性:isbasectrl
				$copyContent.find("[isbasectrl]").attr("name", copyContentId);
			}

			//将新复制对象加入JSON
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.add(copyContentType, copyContentId, copyContentTitle, function(itemId1, itemId2) {
					$copyContent.find(".ctrlWraper .itemLabel:first").addClass(itemId1);
					$copyContent.find(".ctrlWraper .itemLabel:last").addClass(itemId2);
				});
			});
			//标识是否已修改了JSON，以判断是否需要保存当前页面
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.addNeedSavePage();
			});
			var pageLogoId = $(".selectedForm").parent().attr("id");
			var nextObjId = $copyContent.next().attr("ctrlId");
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
				e.cloneCtrlUndo($copyContent, nextObjId, pageLogoId);
			});
		});

		//单击选中当前复制对象

		$(".ctrlSelected").removeClass("ctrlSelected");

	}

	/**
	 *页面控件键盘复制粘贴事件
	 */
	function keyboardCopyPaste() {
		var prevFormId = null;
		//按键按下时事件
		$(document).keydown(function(e) {
			//复制键按下时
			if (e.ctrlKey == true && e.keyCode == 67) {
				ezCommon.str.splice(0, ezCommon.str.length);
				//判断是否有选中控件,过滤掉页面和动态组件
				//console.log(ezCommon.str+"@@@@@@");
				if (!ezCommon.Obj || ezCommon.Obj.hasClass("myForm") || ezCommon.Obj.attr("ctrl-type") == "compLogic") {
					return;
				}
				//使用克隆方法达到复制一个与当前控件相同的新控件
				$copyContent = ezCommon.Obj.clone();
				prevFormId = $(".selectedForm").attr("id");
			}
			//粘贴键按下时
			if (e.ctrlKey == true && e.keyCode == 86) {
				paste(prevFormId);
			}
			//控件在鼠标移入时，显示拖动手柄
			ezCommon.ctrlMouseOver();
		});
	}

	/**
	 * 头部点击复制粘贴事件
	 */
	function topCopyPaste() {
		var prevFormId = null;

		//按键按下时事件
		$("#copyCtrl").click(function(e) {
			ezCommon.str.splice(0, ezCommon.str.length);
			//判断是否有选中控件,过滤掉页面和动态组件
			if (!ezCommon.Obj || ezCommon.Obj.hasClass("myForm") || ezCommon.Obj.attr("ctrl-type") == "compLogic") {
				alert("请先在当前页面选择你所需要复制的控件");
				return;
			}

			//使用克隆方法达到复制一个与当前控件相同的新控件
			$copyContent = ezCommon.Obj.clone();
			prevFormId = $(".selectedForm").attr("id");
		});
		$("#pasteCtrl").click(function(e) {
			paste(prevFormId);
			//$copyContent = null;
			//控件在鼠标移入时，显示拖动手柄
			ezCommon.ctrlMouseOver();
		});
	}

	/**
	 * 得到文本框以及文本域聚焦参数方法  聚焦pasteFlag = 1; 失去焦点pasteFlag = 0;
	 */
	function textFlag() {
		$(document).on("focus", "input, textarea", function() {
			pasteFlag = 1;
		});
		$(document).on("blur", "input, textarea", function() {
			pasteFlag = 0;
		});

	}

	/**
	 * 为提交按钮预绑定单击事件
	 */
	function submitBtnClick() {

		$("#myWeb").on("click", "input[issubmit='true']", function(e) {
			stopEventBubble(e);
			var form = $(this).closest(".myForm");
			var $submitTipWrap = $(this).closest(".ctrl").find(".submit_tipWrap");
			$submitTipWrap.show();
			$submitTipWrap.find("*").show();
			$submitTipWrap.find("input:eq(0)").attr("id", "yes");
			$submitTipWrap.find("input:eq(1)").attr("id", "no");
		});

		$("#myWeb").on("click", ".submit_tipWrap #yes", function() {
			var form = $(this).closest(".myForm");
			$(".submit_tipWrap").hide();
			require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
				require.async(SITECONFIG.PUBLICPATH + "/Js/vaildate/jquery.validate.js", function() {
					var isVal = form.validate(e.validateOpts);
					if (isVal && form.valid() && e.validateQueness(ezCommon.formId)) {
						//提交数据 loading
						$("#mask").show().find(".mas_img").show();
						$("#mask").find(".mas_text").show();
						form.submit();
					}
				});
			});
		});
		$("#myWeb").on("click", ".submit_tipWrap #no", function(e) {
			stopEventBubble(e);
			$(".submit_tipWrap").hide();
		});
		//点击除是否提交询问框之外的其他地方时隐藏提交询问框
		$(document).on("click", function(e) {
			var target = $(e.target);
			if (!(target.hasClass("setTtitleSelected") || target.hasClass("submitBtnWraper"))) {
				$(".submit_tipWrap").hide();
			}
		});
	}

	/**
	 * 控件删除
	 */
	function deleteCtrl() {
		$("#myWeb").on("click", ".ctrlIconWraper", function(e) {
			stopEventBubble(e);
			//隐藏分页
			if ($(this).parent().attr("ctrl-type") == "systemCp") {
				$("#app").hide();
			}
			$("textarea").blur();
			var $ctrl = $(this).closest(".ctrl"), ctrlId = $ctrl.attr("ctrlId");
			var isSelectedCtrl = $(".ctrlSelected").attr("ctrlId") === ctrlId;
			if (isSelectedCtrl) {
				$("#container").find(".right-menu").hide();
			}
			//如果被删除控件是组件里面，则组件的每个数据单元里的相同控件（一般是分栏控件）都要删除
			var $isDropInComp = $ctrl.parents("[ctrl-type='compLogic']");
			//如果被删除的是页面里的（不在组件里）分栏控件，且分栏控件里包含其他表单控件，则对应表单控件的JSON也要删除
			var formJson = require("../formJson.js");
			if ($ctrl.attr("ctrl-type") == "COLUMN" || $ctrl.attr("ctrl-type") == "COLBOX") {
				$ctrl.find(".ctrl").each(function() {
					var ctrlId = $(this).attr("ctrlid");
					formJson.deleteCtrlJson(ctrlId);
				});
			}
			formJson.deleteCtrlJson(ctrlId);
			//撤销恢复需要用到st
			var colInnerObj = "";
			var colInnerType = "";
			if ($ctrl.parent().hasClass("colInner")) {
				var colunmID = $ctrl.parent(".colInner").attr("columnidx");
				if (colunmID) {
					colInnerObj = colunmID;
					colInnerType = "column";
				} else {
					colInnerObj = $ctrl;
					colInnerType = "colbox";
				}
			}
			var nextObjId = $ctrl.next().attr("ctrlId");
			var deleteParentLogoId = $(".selectedForm").parent().attr("id");
			if ($ctrl.attr("ctrl-type") != 'systemCp' && $ctrl.attr("ctrl-type") != 'compLogic') {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
					e.deleteCtrlUndo(colInnerType, colInnerObj, $ctrl, nextObjId, deleteParentLogoId);
				});
			}

			//撤销恢复需要用到ed
			$isDropInComp.length ? $("[ctrlId='" + ctrlId + "']", $isDropInComp).remove() : $ctrl.remove();
		});
	};

	/**
	 * 显示“数据”属性栏
	 */
	function showDataSetting() {
		$("#set-ctrl-data").show().css({
			"background-color" : "#cccccc",
			"color" : "#ffffff"
		});
		$("#set-ctrl-basic,#set-ctrl-operation").css("width", "131.66");
		$("#set-ctrl-basic").click();
	}

	/**
	 * 隐藏“数据”属性栏
	 */
	function hideDataSetting() {
		$("#set-ctrl-data,.set-ctrl-data").hide();
		$("#set-ctrl-basic,#set-ctrl-operation").css("width", "200");
		$("#set-ctrl-basic").click();
	}

	/**
	 * 通过方向键微调定位栏位置
	 */
	function adjustPosition() {
		$(document).keydown(function(e) {
			if (ezCommon.Obj && ezCommon.Obj.attr("ctrl-type") == "COLBOX") {
				var keyCode = e.keyCode, attr = "", val = -1;
				switch(keyCode) {
					case 37 :
						attr = "left";
						break;
					case 38 :
						attr = "top";
						break;
					case 39 :
						attr = "left";
						val = 1;
						break;
					case 40 :
						attr = "top";
						val = 1;
						break;
				}
				var oldVal = parseInt(ezCommon.Obj.css(attr));
				var nowVal = (oldVal + val) + "px";
				ezCommon.Obj.css(attr, nowVal);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			}
		});
	}


	ctrlEvent.init();
	module.exports = ctrlEvent;
});
