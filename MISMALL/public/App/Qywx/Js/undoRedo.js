/**
 * @author 唐苗
 * @desc 撤销恢复相关方法
 * @date 2015-11-18
 */
define(function(require, exports, module) {
	var pageMgr = require("pageManage");
	var undoRedo = {

		/**************************************控件添加排序撤销恢复各类情况相关方法st********************************************/
		/*
		 *各个撤销恢复处理方法公共部分
		 */
		commonMethod : function($thisCtrl) {
			var ctrlType = $thisCtrl.attr("ctrl-type"), ctrlId = $thisCtrl.attr("ctrlId"), title = "";
			var strArr = /(.*[^\d])(\d+)$/.exec(ctrlId);
			var index = strArr[2];
			/***************************************************************************/
			//做以下各种情况分析是针对撤销恢复之后出现的控件重新添加到JSON中去以及控件绑定的一些事件加绑的
			//如果是单一控件则只需绑定上自带事件即可（拖动方法）
			//如果是分栏以及定位栏则除了重新绑定相应自带事件外，还需要遍历其中的控件将其加入JSON中，否则点击则会报错
			/***************************************************************************/

			//为文本标签加上点击编辑文本事件
			if (ctrlType == "TEXT") {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
					e.init($thisCtrl);
				});
			}
			//为定位栏绑定浮动拖动事件
			if (ctrlType == "COLBOX") {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
					e.set($thisCtrl);
				});
			}
			//为定位栏绑定浮动拖动事件
			if (ctrlType == "CHECKBOX") {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
					e.init($thisCtrl);
					e.set($thisCtrl);
				});
			}
			//更新分栏中小分栏以及控件序号
			if (ctrlType == "COLUMN" || ctrlType == "COLBOX") {
				//更新分栏中的小分栏id（为分栏绑定拖动事件）
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
					$thisCtrl.find(".colInner").each(function() {
						e.colInnerSortable($(this));
					});
				});
				//更新分栏中的控件ID
				$thisCtrl.find(".ctrl").each(function() {
					var thisType = $(this).attr("ctrl-type");
					var thisId = $(this).attr("ctrlId");
					var thisStrArr = /(.*[^\d])(\d+)$/.exec(thisId);
					var thisIndex = strArr[2];
					//根据控件类型加载对应控件文件，得到相应的控件标题（将控件存入formJson的时候需要）
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + thisType + ".js", function(e) {
						var titleChinese = e.get().cName;
						thisTitle = titleChinese + thisIndex;
					});
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
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
						e.add(thisType, thisId, thisTitle, function(itemId1, itemId2) {
							$thisCtrl.find(".ctrlWraper .itemLabel:first").addClass(itemId1);
							$thisCtrl.find(".ctrlWraper .itemLabel:last").addClass(itemId2);
						});
					});
				});
			}

			//根据控件类型加载对应控件文件，得到相应的控件标题（将控件存入formJson的时候需要）
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
				titleType = e.get().cName;
				title = titleType + index;
			});
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.add(ctrlType, ctrlId, title, function(itemId1, itemId2) {
					$(ctrlId).find(".ctrlWraper .itemLabel:first").addClass(itemId1);
					$(ctrlId).find(".ctrlWraper .itemLabel:last").addClass(itemId2);
				});
			});
			//控件在鼠标移入时，显示拖动手柄
			ezCommon.ctrlMouseOver();
			// $("textarea").blur();
			$(".ctrlSelected").removeClass("ctrlSelected");
		},
		/**
		 * 控件删除撤销恢复方法
		 */
		deleteCtrlUndo : function(colInnerType, colInnerObj, $ctrl, nextObjId, deleteParentLogoId) {
			var deleteCtrlCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.nextObjId = nextObjId;

				},
				execute : function() {
				},
				//撤销
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == deleteParentLogoId) {
						if (this.nextObjId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.nextObjId + "]"));
						} else {
							if (colInnerObj) {
								if (colInnerType == "column") {
									this.$ctrl.appendTo($("[columnIdx=" + colInnerObj + "]"));
								} else {
									this.$ctrl.appendTo(colInnerObj);
								}
							} else {
								this.$ctrl.appendTo($(".selectedForm"));
							}
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == deleteParentLogoId) {

						var deleteId = this.$ctrl.attr("ctrlId");
						this.$ctrl.remove();
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.deleteCtrlJson(deleteId);
						});
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[deleteParentLogoId].execute(new deleteCtrlCommand($ctrl));
		},
		/**
		 * 控件添加撤销恢复方法(将控件排序时调用)
		 */
		sortableUndo : function(colInnerType, colInnerObj, newColInnerType, newColInnerObj, $ctrl, newNextId, oldNextId, sortParentLogoId) {
			var sortableCtrlCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldNextId = oldNextId;
					this.newNextId = newNextId;
				},
				execute : function() {
				},
				//撤销
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == sortParentLogoId) {
						if (this.oldNextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.oldNextId + "]"));
						} else {
							if (colInnerObj) {
								if (colInnerType == "column") {
									this.$ctrl.appendTo($("[columnIdx=" + colInnerObj + "]"));
								} else {
									this.$ctrl.appendTo(colInnerObj);
								}
							} else {
								this.$ctrl.appendTo($(".selectedForm"));
							}
						}

						undoRedo.commonMethod(this.$ctrl);
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == sortParentLogoId) {
						if (this.newNextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.newNextId + "]"));
						} else {
							if (newColInnerObj) {
								if (newColInnerType == "column") {
									this.$ctrl.appendTo($("[columnIdx=" + newColInnerObj + "]"));
								} else {
									this.$ctrl.appendTo(newColInnerObj);
								}
							} else {
								this.$ctrl.appendTo($(".selectedForm"));
							}
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});
			ezCommon.pageIdURdo[sortParentLogoId].execute(new sortableCtrlCommand($ctrl));
		},
		/**
		 * 定位栏移动添加撤销恢复方法(将定位栏拖动时调用)
		 */
		colboxMoveUndo : function($ctrl, oldPosition, newPosition, colboxMoveParentLogoId) {
			var colboxMoveCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldPosition = oldPosition;
					this.newPosition = newPosition;
				},
				execute : function() {
				},
				//撤销
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxMoveParentLogoId) {
						this.$ctrl.css("top", this.oldPosition);
						undoRedo.commonMethod(this.$ctrl);
					}

				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxMoveParentLogoId) {
						this.$ctrl.css("top", this.newPosition);
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});
			ezCommon.pageIdURdo[colboxMoveParentLogoId].execute(new colboxMoveCommand($ctrl));
		},
		/**
		 * 定位栏内部元素排序添加撤销恢复方法
		 */
		colboxSortableUndo : function($parent, $ctrl, oldnextId, newnextId, colboxSortableParentLogoId) {
			var colboxSortableCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldnextId = oldnextId;
					this.newnextId = newnextId;
				},
				execute : function() {
				},
				//撤销
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxSortableParentLogoId) {
						if (this.oldnextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.oldnextId + "]"));
						} else {
							this.$ctrl.appendTo($parent.find(".colInner:first"));
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxSortableParentLogoId) {
						if (this.newnextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.newnextId + "]"));
						} else {
							this.$ctrl.appendTo($parent.find(".colInner:first"));
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});
			ezCommon.pageIdURdo[colboxSortableParentLogoId].execute(new colboxSortableCommand($ctrl));
		},
		/**
		 * 分栏内部元素排序添加撤销恢复方法
		 */
		columnSortableUndo : function(parentObjId, newParentObjId, $ctrl, oldNextId, newNextId, columnSortableParentLogoId) {
			var columnSortableCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.parentObjId = parentObjId;
					this.newParentObjId = newParentObjId;
					this.oldnextId = oldNextId;
					this.newnextId = newNextId;
				},
				execute : function() {
				},
				//撤销
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == columnSortableParentLogoId) {
						if (this.oldnextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.oldnextId + "]"));
						} else {
							this.$ctrl.appendTo($("[columnIdx=" + this.parentObjId + "]"));
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == columnSortableParentLogoId) {
						if (this.newnextId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.newnextId + "]"));
						} else {
							this.$ctrl.appendTo($("[columnIdx=" + this.newParentObjId + "]"));
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});
			ezCommon.pageIdURdo[columnSortableParentLogoId].execute(new columnSortableCommand($ctrl));
		},
		/**
		 * @desc 控件添加撤销恢复方法(将控件拖入编辑器时调用)
		 * @param {Object} $ctrl 控件对象
		 */
		addCtrlUndo : function(colInnerType, colInnerObj, $ctrl, nextObjId, pageLogoId) {
			var addCtrlCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.nextObjId = nextObjId;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = this.$ctrl.parents(".selectedForm").parent().attr("id");
					if (pageOldId == pageLogoId) {
						var deleteId = this.$ctrl.attr("ctrlId");
						this.$ctrl.remove();
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.deleteCtrlJson(deleteId);
						});
						$(".ctrlSelected").removeClass("ctrlSelected");
					}

				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pageLogoId) {
						if (this.nextObjId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.nextObjId + "]"));
						} else {
							if (colInnerObj) {
								if (colInnerType == "column") {
									this.$ctrl.appendTo($("[columnIdx=" + colInnerObj + "]"));
								} else {
									this.$ctrl.appendTo(colInnerObj);
								}
							} else {
								this.$ctrl.appendTo($(".selectedForm"));
							}
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});

			ezCommon.pageIdURdo[pageLogoId].execute(new addCtrlCommand($ctrl));
		},
		/**
		 * @desc 控件克隆撤销恢复方法(将控件拖入编辑器时调用)
		 * @param {Object} $ctrl 控件对象
		 */
		cloneCtrlUndo : function($ctrl, nextObjId, pageLogoId) {
			var cloneCtrlCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.nextObjId = nextObjId;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = this.$ctrl.parents(".selectedForm").parent().attr("id");
					if (pageOldId == pageLogoId) {
						var deleteId = this.$ctrl.attr("ctrlId");
						this.$ctrl.remove();
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.deleteCtrlJson(deleteId);
						});
						$(".ctrlSelected").removeClass("ctrlSelected");
					}

				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pageLogoId) {
						if (this.nextObjId) {
							this.$ctrl.insertBefore($("[ctrlId=" + this.nextObjId + "]"));
						} else {
							this.$ctrl.appendTo($(".selectedForm"));
						}
						undoRedo.commonMethod(this.$ctrl);
					}
				}
			});

			ezCommon.pageIdURdo[pageLogoId].execute(new cloneCtrlCommand($ctrl));
		},
		/**************************************控件添加排序撤销恢复各类情况相关方法ed********************************************/

		/**************************************控件属性撤销恢复各类情况相关方法（general）st********************************************/
		/*
		 * 标题属性
		 */
		ctrlTitleUndo : function($ctrl, ctrlTitle, oldVal, newVal, ctrlTitleLogoId) {
			var ctrlTitleCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldVal = oldVal;
					this.newVal = newVal;
					this.ctrlTitle = ctrlTitle;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlTitleLogoId) {
						this.$ctrl.find(".fieldTitle:first").text(this.oldVal);
						this.$ctrl.find(".fieldTitle:first").val(this.oldVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlTitle, this.oldVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlTitleLogoId) {
						this.$ctrl.find(".fieldTitle:first").text(this.newVal);
						this.$ctrl.find(".fieldTitle:first").val(this.newVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlTitle, this.newVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ctrlTitleLogoId].execute(new ctrlTitleCommand($ctrl));
		},
		/*
		 * 是否隐藏属性
		 */
		isHiddenUndo : function($ctrl, ctrlisHidden, oldOpacity, newOpacity, isHiddenLogoId) {
			var isHiddenCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldOpacity = oldOpacity;
					this.newOpacity = newOpacity;
					this.ctrlisHidden = ctrlisHidden;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isHiddenLogoId) {
						this.$ctrl.css("opacity", this.oldOpacity);
						var state = "";
						if (oldOpacity == 0.2) {
							state = true;
						} else {
							state = false;
						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisHidden, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isHiddenLogoId) {
						this.$ctrl.css("opacity", this.newOpacity);
						var state = "";
						if (newOpacity == 0.2) {
							state = true;
						} else {
							state = false;
						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisHidden, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[isHiddenLogoId].execute(new isHiddenCommand($ctrl));
		},
		/*
		 * 是否禁用属性
		 */
		isEnabledUndo : function($ctrl, ctrlisEnabled, oldstate, newstate, isEnabledLogoId) {
			var isEnabledCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldstate = oldstate;
					this.newstate = newstate;
					this.ctrlisEnabled = ctrlisEnabled;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isEnabledLogoId) {
						var state = "";
						if (oldstate == "disabled") {
							state = true;
							this.$ctrl.find(".btn").attr("disabled", this.oldstate);
						} else {
							state = false;
							this.$ctrl.find(".btn").removeAttr("disabled");

						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisEnabled, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isEnabledLogoId) {
						var state = "";
						if (newstate == "disabled") {
							state = true;
							this.$ctrl.find(".btn").attr("disabled", this.newstate);
						} else {
							state = false;
							this.$ctrl.find(".btn").removeAttr("disabled");
						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisEnabled, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[isEnabledLogoId].execute(new isEnabledCommand($ctrl));
		},
		/*
		 *单位属性
		 */
		isUnitUndo : function($ctrl, ctrlisUnit, oldVal, newVal, isUnitLogoId) {
			var isUnitCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldVal = oldVal;
					this.newVal = newVal;
					this.ctrlisUnit = ctrlisUnit;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isUnitLogoId) {
						if (this.oldVal == "") {
							this.$ctrl.find(".ctrlWraper").find(">span").css("display", "none");
						} else {
							this.$ctrl.find(".ctrlWraper").find(">span").removeAttr("style");
							this.$ctrl.find(".unit").text(this.oldVal);
						}
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisUnit, this.oldVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isUnitLogoId) {
						if (this.newVal == "") {
							this.$ctrl.find(".ctrlWraper").find(">span").css("display", "none");
						} else {
							this.$ctrl.find(".ctrlWraper").find(">span").removeAttr("style");
							this.$ctrl.find(".unit").text(this.newVal);
						}
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlisUnit, this.newVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[isUnitLogoId].execute(new isUnitCommand($ctrl));
		},
		/*
		 * 框外提示
		 */
		ctrlInfoUndo : function($ctrl, ctrlInfo, oldVal, newVal, ctrlInfoLogoId) {
			var ctrlInfoCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldVal = oldVal;
					this.newVal = newVal;
					this.ctrlInfo = ctrlInfo;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlInfoLogoId) {
						this.$ctrl.find(".ctrlproInfo").text(this.oldVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlInfo, this.oldVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlInfoLogoId) {
						this.$ctrl.find(".ctrlproInfo").text(this.newVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlInfo, this.newVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ctrlInfoLogoId].execute(new ctrlInfoCommand($ctrl));
		},
		/*
		 * 框内提示
		 */
		ctrlInnerUndo : function($ctrl, ctrlInner, oldVal, newVal, ctrlInnerLogoId) {
			var ctrlInnerCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldVal = oldVal;
					this.newVal = newVal;
					this.ctrlInner = ctrlInner;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlInnerLogoId) {
						this.$ctrl.find("input").attr("placeholder", this.oldVal);
						this.$ctrl.find("textarea").attr("placeholder", this.oldVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlInner, this.oldVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ctrlInnerLogoId) {
						this.$ctrl.find("input").attr("placeholder", this.newVal);
						this.$ctrl.find("textarea").attr("placeholder", this.newVal);
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlInner, this.newVal);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ctrlInnerLogoId].execute(new ctrlInnerCommand($ctrl));
		},
		/*
		 * 是否只读
		 */
		isRdOnlyUndo : function($ctrl, ctrlrdOnly, oldstate, newstate, isRdOnlyLogoId) {
			var isRdOnlyCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldstate = oldstate;
					this.newstate = newstate;
					this.ctrlrdOnly = ctrlrdOnly;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isRdOnlyLogoId) {
						var state = "";
						if (oldstate == "disabled") {
							state = true;
							this.$ctrl.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled", this.oldstate);
						} else {
							state = false;
							this.$ctrl.find(".ctrlWraper input,.ctrlWraper textarea").removeAttr("disabled");

						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlrdOnly, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == isRdOnlyLogoId) {
						var state = "";
						if (newstate == "disabled") {
							state = true;
							this.$ctrl.find(".ctrlWraper input,.ctrlWraper textarea").attr("disabled", this.newstate);
						} else {
							state = false;
							this.$ctrl.find(".ctrlWraper input,.ctrlWraper textarea").removeAttr("disabled");
						}
						var stateNow = (state == true ? 1 : "@default@");
						undoRedo.formJsonUpdateUndo(this.$ctrl, this.ctrlrdOnly, stateNow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[isRdOnlyLogoId].execute(new isRdOnlyCommand($ctrl));
		},
		/*
		 * 各类属性撤销恢复公共方法
		 */
		formJsonUpdateUndo : function($thisCtrl, thisCtrlProperty, thisValue) {
			var ctrlName = $thisCtrl.attr("ctrlId"), attrType = "general";
			var ctrlProperty = thisCtrlProperty;
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.update(ctrlName, attrType, ctrlProperty, thisValue);
			});
		},
		/**************************************控件属性撤销恢复各类情况相关方法(general)ed********************************************/

		/**************************************控件属性撤销恢复各类情况相关方法（style）st********************************************/
		pageBgColorUndo : function($ctrl, oldColor, newColor, pageBgColorLogoId) {
			//撤销恢复每一次需要点击三下才会还原的原因是点击取色面板进行了三步
			var pageBgColorCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldColor = oldColor;
					this.newColor = newColor;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pageBgColorLogoId) {
						this.$ctrl.parent().css("background", this.oldColor);
						this.$ctrl.parent().attr("backgroundColor", this.oldColor);
						$(".pageTopTitle").attr("colorNow", this.oldColor);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pageBgColorLogoId) {
						this.$ctrl.parent().css("background", this.newColor);
						this.$ctrl.parent().attr("backgroundColor", this.newColor);
						$(".pageTopTitle").attr("colorNow", this.newColor);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[pageBgColorLogoId].execute(new pageBgColorCommand($ctrl));
		},
		fontSizeUndo : function(byValObj, ctrlObj, oldFontSize, newFontSize, fontSizeLogoId) {
			var fontSizeCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.byValObj = byValObj;
					this.ctrlObj = ctrlObj;
					this.oldFontSize = oldFontSize;
					this.newFontSize = newFontSize;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == fontSizeLogoId) {
						this.ctrlObj.attr("data-textSize", this.oldFontSize);
						this.byValObj.css("font-size", this.oldFontSize + "px");
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == fontSizeLogoId) {
						this.ctrlObj.attr("data-textSize", this.newFontSize);
						this.byValObj.css("font-size", this.newFontSize);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[fontSizeLogoId].execute(new fontSizeCommand(ctrlObj));
		},
		changePicUndo : function(changeType, $ctrl, oldPagePic, newPagePic, changeImgLogoId) {
			var changePicCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldPagePic = oldPagePic;
					this.newPagePic = newPagePic;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == changeImgLogoId) {
						if (changeType == "page") {
							this.$ctrl.css("backgroundImage", this.oldPagePic);
							this.$ctrl.attr("backgroundImage", this.oldPagePic);
							this.$ctrl.css({
								"width" : "100%",
								"height" : "100%"
							});
							this.$ctrl.css("background-size", "100% 100%");
							this.$ctrl.css("background-repeat", "no");
							if (this.oldPagePic != "none") {
								$(".removeBgImg").removeAttr("disabled");
								$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
							} else {
								$(".removeBgImg").attr("disabled", "disabled");
								$(".removeBgImg").css("background", "rgb(204, 204, 204) none repeat scroll 0% 0%;");
							}
						} else if (changeType == "ctrl") {
							this.$ctrl.find("img").attr("src", this.oldPagePic);
							this.$ctrl.find("img").css({
								"width" : "100%",
								"height" : "auto",
								"background-size" : "100% 100%",
								"background-repeat" : "no"
							});
						}

					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == changeImgLogoId) {
						if (changeType == "page") {
							this.$ctrl.css("backgroundImage", "url(" + this.newPagePic + ")");
							this.$ctrl.attr("backgroundImage", this.newPagePic);
							this.$ctrl.css({
								"width" : "100%",
								"height" : "100%"
							});
							this.$ctrl.css("background-size", "100% 100%");
							this.$ctrl.css("background-repeat", "no");
							if (this.oldPagePic != "none") {
								$(".removeBgImg").removeAttr("disabled");
								$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
							} else {
								$(".removeBgImg").attr("disabled", "disabled");
								$(".removeBgImg").css("background", "rgb(204, 204, 204) none repeat scroll 0% 0%;");
							}
						} else if (changeType == "ctrl") {
							this.$ctrl.find("img").attr("src", this.newPagePic);
							this.$ctrl.find("img").css({
								"width" : "100%",
								"height" : "auto",
								"background-size" : "100% 100%",
								"background-repeat" : "no"
							});
						}
					}

				}
			});
			ezCommon.pageIdURdo[changeImgLogoId].execute(new changePicCommand($ctrl));
		},
		fontWeightUndo : function($btnObj, $ctrl, oldfontWeight, newfontWeight, fontWeightLogoId) {
			var fontWeightCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldfontWeight = oldfontWeight;
					this.newfontWeight = newfontWeight;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == fontWeightLogoId) {
						if (this.oldfontWeight == "400") {
							$btnObj.bootstrapSwitch("state", false);
							this.$ctrl.css("font-weight", "normal");
							this.$ctrl.attr("isFontWeight", false);
						} else {
							$btnObj.bootstrapSwitch("state", true);
							this.$ctrl.css("font-weight", "bold");
							this.$ctrl.attr("isFontWeight", true);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == fontWeightLogoId) {
						if (this.newfontWeight == "700") {
							$btnObj.bootstrapSwitch("state", true);
							this.$ctrl.css("font-weight", "bold");
							this.$ctrl.attr("isFontWeight", true);
						} else {
							$btnObj.bootstrapSwitch("state", false);
							this.$ctrl.css("font-weight", "normal");
							this.$ctrl.attr("isFontWeight", false);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}

				}
			});
			ezCommon.pageIdURdo[fontWeightLogoId].execute(new fontWeightCommand($ctrl));
		},
		btnfontSizeUndo : function($ctrl, oldFontSize, newFontSize, btnfontSizeLogoId) {
			var btnfontSizeCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldFontSize = oldFontSize;
					this.newFontSize = newFontSize;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnfontSizeLogoId) {
						this.$ctrl.find("input.ctrlBtn").css("font-size", this.oldFontSize + "px");
						this.$ctrl.attr("data-textSize", this.oldFontSize);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnfontSizeLogoId) {
						this.$ctrl.find("input.ctrlBtn").css("font-size", this.newFontSize);
						this.$ctrl.attr("data-textSize", this.newFontSize);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[btnfontSizeLogoId].execute(new btnfontSizeCommand($ctrl));
		},
		imgBoxUndo : function($ctrl, oldImgBox, newImgBox, imgBoxLogoId) {
			var imgBoxCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldImgBox = oldImgBox;
					this.newImgBox = newImgBox;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == imgBoxLogoId) {
						this.$ctrl.css("border-color", this.oldImgBox);
						this.$ctrl.attr("data-borderColor", this.oldImgBox);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == imgBoxLogoId) {
						this.$ctrl.css("border-color", this.newImgBox);
						this.$ctrl.attr("data-borderColor", this.newImgBox);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[imgBoxLogoId].execute(new imgBoxCommand($ctrl));
		},
		imgBoxShadowColorUndo : function($ctrl, oldShadow, newShadow, oldLevel, oldVertical, oldSize, oldChange, ShadowLogoId) {
			var imgBoxShadowCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldShadow = oldShadow;
					this.newShadow = newShadow;
					this.oldLevel = oldLevel;
					this.oldVertical = oldVertical;
					this.oldSize = oldSize;
					this.oldChange = oldChange;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ShadowLogoId) {
						this.$ctrl.find("img").css("box-shadow", this.oldLevel + 'px ' + this.oldVertical + 'px ' + this.oldSize + 'px ' + this.oldChange + 'px ' + this.oldShadow);
						this.$ctrl.attr("data-shadowColor", this.oldShadow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ShadowLogoId) {
						this.$ctrl.find("img").css("box-shadow", this.oldLevel + 'px ' + this.oldVertical + 'px ' + this.oldSize + 'px ' + this.oldChange + 'px ' + this.newShadow);
						this.$ctrl.attr("data-shadowColor", this.newShadow);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ShadowLogoId].execute(new imgBoxShadowCommand($ctrl));
		},
		ShadowElementUndo : function($ctrl, oldShadowColor, oldLevel, oldVertical, oldSize, oldChange, newLevel, newVertical, newSize, newChange, ShadowElementLogoId) {
			var ShadowElementCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldShadowColor = oldShadowColor;
					this.oldLevel = oldLevel;
					this.oldVertical = oldVertical;
					this.oldSize = oldSize;
					this.oldChange = oldChange;
					this.newLevel = newLevel;
					this.newVertical = newVertical;
					this.newSize = newSize;
					this.newChange = newChange;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ShadowElementLogoId) {
						this.$ctrl.find("img").css("box-shadow", this.oldLevel + 'px ' + this.oldVertical + 'px ' + this.oldSize + 'px ' + this.oldChange + 'px ' + this.oldShadowColor);
						this.$ctrl.attr("data-level", this.oldLevel);
						this.$ctrl.attr("data-vertical", this.oldVertical);
						this.$ctrl.attr("data-size", this.oldSize);
						this.$ctrl.attr("data-change", this.oldChange);
						this.$ctrl.attr("data-shadowColor", this.oldShadowColor);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ShadowElementLogoId) {
						this.$ctrl.find("img").css("box-shadow", this.newLevel + 'px ' + this.newVertical + 'px ' + this.newSize + 'px ' + this.newChange + 'px ' + this.oldShadowColor);
						this.$ctrl.attr("data-level", this.newLevel);
						this.$ctrl.attr("data-vertical", this.newVertical);
						this.$ctrl.attr("data-size", this.newSize);
						this.$ctrl.attr("data-change", this.newChange);
						this.$ctrl.attr("data-shadowColor", this.oldShadowColor);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ShadowElementLogoId].execute(new ShadowElementCommand($ctrl));
		},
		lineheightUndo : function($ctrl, oldlineheight, newlineheight, lineheightLogoId) {
			var lineheightCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldlineheight = oldlineheight;
					this.newlineheight = newlineheight;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == lineheightLogoId) {
						this.$ctrl.attr("data-lineheight", this.oldlineheight);
						this.$ctrl.css("line-height", this.oldlineheight + "px");
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == lineheightLogoId) {
						this.$ctrl.attr("data-lineheight", this.newlineheight);
						this.$ctrl.css("line-height", this.newlineheight + "px");
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[lineheightLogoId].execute(new lineheightCommand($ctrl));
		},
		btnWidthUndo : function($ctrl, oldbtnWidth, newbtnWidth, btnWidthLogoId) {
			var btnWidthCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldbtnWidth = oldbtnWidth;
					this.newbtnWidth = newbtnWidth;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnWidthLogoId) {
						this.$ctrl.find("input.ctrlBtn").css("width", this.oldbtnWidth).attr("btn-width", this.oldbtnWidth);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnWidthLogoId) {
						this.$ctrl.find("input.ctrlBtn").css("width", this.newbtnWidth).attr("btn-width", this.newbtnWidth);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[btnWidthLogoId].execute(new btnWidthCommand($ctrl));
		},
		pictureSizeUndo : function($ctrl, oldpictureSize, newpictureSize, pictureSizeLogoId) {
			var pictureSizeCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldpictureSize = oldpictureSize;
					this.newpictureSize = newpictureSize;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pictureSizeLogoId) {
						this.$ctrl.find("img").css("width", this.oldpictureSize + "%");
						this.$ctrl.find("img").css("height", this.oldpictureSize + "%");
						this.$ctrl.find("img").attr("data-pictureSize", this.oldpictureSize);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == pictureSizeLogoId) {
						this.$ctrl.find("img").css("width", this.newpictureSize + "%");
						this.$ctrl.find("img").css("height", this.newpictureSize + "%");
						this.$ctrl.find("img").attr("data-pictureSize", this.newpictureSize);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[pictureSizeLogoId].execute(new pictureSizeCommand($ctrl));
		},
		colboxWidthUndo : function($ctrl, oldcolboxWidth, newcolboxWidth, colboxWidthLogoId) {
			var colboxWidthCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldcolboxWidth = oldcolboxWidth;
					this.newcolboxWidth = newcolboxWidth;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxWidthLogoId) {
						this.$ctrl.css("width", this.oldcolboxWidth).attr("data-width", this.oldcolboxWidth);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == colboxWidthLogoId) {
						this.$ctrl.css("width", this.newcolboxWidth).attr("data-width", this.newcolboxWidth);
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[colboxWidthLogoId].execute(new colboxWidthCommand($ctrl));
		},
		borderWidthUndo : function(borderType, $ctrl, oldborderWidth, newborderWidth, borderWidthLogoId) {
			var borderWidthCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldborderWidth = oldborderWidth;
					this.newborderWidth = newborderWidth;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == borderWidthLogoId) {
						if (borderType == "border") {
							this.$ctrl.css("border-width", this.oldborderWidth).attr("data-border", this.oldborderWidth);
							$("#borderLeft-spinner").spinner("value", this.oldborderWidth);
							$("#borderRight-spinner").spinner("value", this.oldborderWidth);
							$("#borderTop-spinner").spinner("value", this.oldborderWidth);
							$("#borderBottom-spinner").spinner("value", this.oldborderWidth);
						} else if (borderType == "borderLeft") {
							this.$ctrl.css("border-left-width", this.oldborderWidth);
							$("#borderLeft-spinner").spinner("value", this.oldborderWidth);
						}
						if (borderType == "borderRight") {
							this.$ctrl.css("border-right-width", this.oldborderWidth);
							$("#borderRight-spinner").spinner("value", this.oldborderWidth);
						}
						if (borderType == "borderTop") {
							this.$ctrl.css("border-top-width", this.oldborderWidth);
							$("#borderTop-spinner").spinner("value", this.oldborderWidth);
						}
						if (borderType == "borderBottom") {
							this.$ctrl.css("border-bottom-width", this.oldborderWidth);
							$("#borderBottom-spinner").spinner("value", this.oldborderWidth);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == borderWidthLogoId) {
						if (borderType == "border") {
							this.$ctrl.css("border-width", this.newborderWidth).attr("data-border", this.newborderWidth);
							$("#borderLeft-spinner").spinner("value", this.newborderWidth);
							$("#borderRight-spinner").spinner("value", this.newborderWidth);
							$("#borderTop-spinner").spinner("value", this.newborderWidth);
							$("#borderBottom-spinner").spinner("value", this.newborderWidth);
						} else if (borderType == "borderLeft") {
							this.$ctrl.css("border-left-width", this.newborderWidth);
							$("#borderLeft-spinner").spinner("value", this.newborderWidth);
						}
						if (borderType == "borderRight") {
							this.$ctrl.css("border-right-width", this.newborderWidth);
							$("#borderRight-spinner").spinner("value", this.newborderWidth);
						}
						if (borderType == "borderTop") {
							this.$ctrl.css("border-top-width", this.newborderWidth);
							$("#borderTop-spinner").spinner("value", this.newborderWidth);
						}
						if (borderType == "borderBottom") {
							this.$ctrl.css("border-bottom-width", this.newborderWidth);
							$("#borderBottom-spinner").spinner("value", this.newborderWidth);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[borderWidthLogoId].execute(new borderWidthCommand($ctrl));
		},
		marginUndo : function(marginType, $ctrl, oldmargin, newmargin, marignLogoId) {
			var marginCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldmargin = oldmargin;
					this.newmargin = newmargin;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == marignLogoId) {
						if (marginType == "margin") {
							this.$ctrl.css("margin", this.oldmargin + 'px').attr("data-margin", this.oldmargin);
							$("#marginLeft-spinner").spinner("value", this.oldmargin);
							$("#marginRight-spinner").spinner("value", this.oldmargin);
							$("#marginTop-spinner").spinner("value", this.oldmargin);
							$("#marginBottom-spinner").spinner("value", this.oldmargin);
						} else if (marginType == "marginLeft") {
							this.$ctrl.css("margin-left", this.oldmargin);
							$("#marginLeft-spinner").spinner("value", this.oldmargin);
						}
						if (marginType == "marginRight") {
							this.$ctrl.css("margin-right", this.oldmargin);
							$("#marginRight-spinner").spinner("value", this.oldmargin);
						}
						if (marginType == "marginTop") {
							this.$ctrl.css("margin-top", this.oldmargin);
							$("#marginTop-spinner").spinner("value", this.oldmargin);
						}
						if (marginType == "marginBottom") {
							this.$ctrl.css("margin-bottom", this.oldmargin);
							$("#marginBottom-spinner").spinner("value", this.oldmargin);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == marignLogoId) {
						if (marginType == "margin") {
							this.$ctrl.css("margin", this.newmargin).attr("data-margin", this.newmargin);
							$("#marginLeft-spinner").spinner("value", this.newmargin);
							$("#marginRight-spinner").spinner("value", this.newmargin);
							$("#marginTop-spinner").spinner("value", this.newmargin);
							$("#marginBottom-spinner").spinner("value", this.newmargin);
						} else if (marginType == "marginLeft") {
							this.$ctrl.css("margin-left", this.newmargin);
							$("#marginLeft-spinner").spinner("value", this.newmargin);
						}
						if (marginType == "marginRight") {
							this.$ctrl.css("margin-right", this.newmargin);
							$("#marginRight-spinner").spinner("value", this.newmargin);
						}
						if (marginType == "marginTop") {
							this.$ctrl.css("margin-top", this.newmargin);
							$("#marginTop-spinner").spinner("value", this.newmargin);
						}
						if (marginType == "marginBottom") {
							this.$ctrl.css("margin-bottom", this.newmargin);
							$("#marginBottom-spinner").spinner("value", this.newmargin);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[marignLogoId].execute(new marginCommand($ctrl));
		},
		paddingUndo : function(paddingType, $ctrl, oldpadding, newpadding, paddingLogoId) {
			var paddingCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldpadding = oldpadding;
					this.newpadding = newpadding;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == paddingLogoId) {
						if (paddingType == "padding") {
							this.$ctrl.css("padding", this.oldpadding).attr("data-padding", this.oldpadding);
							$("#paddingLeft-spinner").spinner("value", this.oldpadding);
							$("#paddingRight-spinner").spinner("value", this.oldpadding);
							$("#paddingTop-spinner").spinner("value", this.oldpadding);
							$("#paddingBottom-spinner").spinner("value", this.oldpadding);
						} else if (paddingType == "paddingLeft") {
							this.$ctrl.css("padding-left", this.oldpadding);
							$("#paddingLeft-spinner").spinner("value", this.oldpadding);
						}
						if (paddingType == "paddingRight") {
							this.$ctrl.css("padding-right", this.oldpadding);
							$("#paddingRight-spinner").spinner("value", this.oldpadding);
						}
						if (paddingType == "paddingTop") {
							this.$ctrl.css("padding-top", this.oldpadding);
							$("#paddingTop-spinner").spinner("value", this.oldpadding);
						}
						if (paddingType == "paddingBottom") {
							this.$ctrl.css("padding-bottom", this.oldpadding);
							$("#paddingBottom-spinner").spinner("value", this.oldpadding);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == paddingLogoId) {
						if (paddingType == "padding") {
							this.$ctrl.css("padding", this.newpadding).attr("data-padding", this.newpadding);
							$("#paddingLeft-spinner").spinner("value", this.newpadding);
							$("#paddingRight-spinner").spinner("value", this.newpadding);
							$("#paddingTop-spinner").spinner("value", this.newpadding);
							$("#paddingBottom-spinner").spinner("value", this.newpadding);
						} else if (paddingType == "paddingLeft") {
							this.$ctrl.css("padding-left", this.newpadding);
							$("#paddingLeft-spinner").spinner("value", this.newpadding);
						}
						if (paddingType == "paddingRight") {
							this.$ctrl.css("padding-right", this.newpadding);
							$("#paddingRight-spinner").spinner("value", this.newpadding);
						}
						if (paddingType == "paddingTop") {
							this.$ctrl.css("padding-top", this.newpadding);
							$("#paddingTop-spinner").spinner("value", this.newpadding);
						}
						if (paddingType == "paddingBottom") {
							this.$ctrl.css("padding-bottom", this.newpadding);
							$("#paddingBottom-spinner").spinner("value", this.newpadding);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[paddingLogoId].execute(new paddingCommand($ctrl));
		},
		borderRadiusUndo : function(borderRadiusType, $ctrl, oldborderRadius, newborderRadius, borderRadiusLogoId) {
			var borderRadiusCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldborderRadius = oldborderRadius;
					this.newborderRadius = newborderRadius;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == borderRadiusLogoId) {
						if (borderRadiusType == "borderRadius") {
							this.$ctrl.css({
								"border-radius" : this.oldborderRadius + "px",
								"overflow" : "hidden"
							});
							this.$ctrl.attr("data-radius", this.oldborderRadius);
							$("#radiusLeft-spinner").spinner("value", this.oldborderRadius);
							$("#radiusRight-spinner").spinner("value", this.oldborderRadius);
							$("#radiusTop-spinner").spinner("value", this.oldborderRadius);
							$("#radiusBottom-spinner").spinner("value", this.oldborderRadius);
						} else if (borderRadiusType == "borderRadiusLeft") {
							this.$ctrl.css("border-top-left-radius", this.oldborderRadius);
						}
						if (borderRadiusType == "borderRadiusRight") {
							this.$ctrl.css("border-bottom-left-radius", this.oldborderRadius);
						}
						if (borderRadiusType == "borderRadiusTop") {
							this.$ctrl.css("border-top-right-radius", this.oldborderRadius);
						}
						if (borderRadiusType == "borderRadiusBottom") {
							this.$ctrl.css("border-bottom-right-radius", this.oldborderRadius);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == borderRadiusLogoId) {
						if (borderRadiusType == "borderRadius") {
							this.$ctrl.css({
								"border-radius" : this.newborderRadius + "px",
								"overflow" : "hidden"
							});
							this.$ctrl.attr("data-radius", this.newborderRadius);
							$("#radiusLeft-spinner").spinner("value", this.newborderRadius);
							$("#radiusRight-spinner").spinner("value", this.newborderRadius);
							$("#radiusTop-spinner").spinner("value", this.newborderRadius);
							$("#radiusBottom-spinner").spinner("value", this.newborderRadius);
						} else if (borderRadiusType == "borderRadiusLeft") {
							this.$ctrl.css("border-top-left-radius", this.newborderRadius);
						}
						if (borderRadiusType == "borderRadiusRight") {
							this.$ctrl.css("border-bottom-left-radius", this.newborderRadius);
						}
						if (borderRadiusType == "borderRadiusTop") {
							this.$ctrl.css("border-top-right-radius", this.newborderRadius);
						}
						if (borderRadiusType == "borderRadiusBottom") {
							this.$ctrl.css("border-bottom-right-radius", this.newborderRadius);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[borderRadiusLogoId].execute(new borderRadiusCommand($ctrl));
		},
		ColorUndo : function(setType, $ctrl, oldColor, newColor, ColorLogoId) {
			var ColorCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldColor = oldColor;
					this.newColor = newColor;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ColorLogoId) {
						if (setType == "color") {
							this.$ctrl.css("color", this.oldColor);
							this.$ctrl.attr("data-textcolor", this.oldColor);
						} else if (setType == "background-color") {
							this.$ctrl.css("background-color", this.oldColor);
							this.$ctrl.attr("data-bgcolor", this.oldColor);
						} else {
							this.$ctrl.css("border-color", this.oldColor);
							this.$ctrl.attr("data-borderbgcolor", this.oldColor);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == ColorLogoId) {
						if (setType == "color") {
							this.$ctrl.css("color", this.newColor);
							this.$ctrl.attr("data-textcolor", this.newColor);
						} else if (setType == "background-color") {
							this.$ctrl.css("background-color", this.newColor);
							this.$ctrl.attr("data-bgcolor", this.newColor);
						} else {
							this.$ctrl.css("border-color", this.newColor);
							this.$ctrl.attr("data-borderbgcolor", this.newColor);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[ColorLogoId].execute(new ColorCommand($ctrl));
		},
		btnColorUndo : function(setType, $ctrl, oldColor, newColor, btnColorLogoId) {
			var btnColorCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.oldColor = oldColor;
					this.newColor = newColor;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnColorLogoId) {
						if (setType == "color") {
							this.$ctrl.find("input.ctrlBtn").css("color", this.oldColor);
							this.$ctrl.attr("data-textcolor", this.oldColor);
						} else if (setType == "background-color") {
							this.$ctrl.find("input.ctrlBtn").css("background-color", this.oldColor);
							this.$ctrl.attr("data-bgcolor", this.oldColor);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnColorLogoId) {
						if (setType == "color") {
							this.$ctrl.find("input.ctrlBtn").css("color", this.newColor);
							this.$ctrl.attr("data-textcolor", this.newColor);
						} else if (setType == "background-color") {
							this.$ctrl.find("input.ctrlBtn").css("background-color", this.newColor);
							this.$ctrl.attr("data-bgcolor", this.newColor);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[btnColorLogoId].execute(new btnColorCommand($ctrl));
		},
		textAlignUndo : function($ctrl, positionOld, positionNew, textAlignLogoId, panel) {
			var textAlignCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.positionOld = positionOld;
					this.positionNew = positionNew;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == textAlignLogoId) {
						var $main_text_align = $ctrl.css("text-align");
						$("#main-text-align-" + $main_text_align, panel).attr("checked", "checked");
						$("#main-text-align").buttonset();
						if (positionOld == "left" || positionOld == "start") {
							$ctrl.attr("Isleft", "false");
							$ctrl.css("text-align", this.positionOld);
						} else if (positionOld == "right") {
							$ctrl.css("text-align", this.positionOld);
						} else {
							$ctrl.css("text-align", this.positionOld);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == textAlignLogoId) {
						var $main_text_align = $ctrl.css("text-align");
						$("#main-text-align-" + $main_text_align, panel).attr("checked", "checked");
						$("#main-text-align").buttonset();
						if (positionOld == "left" || positionOld == "start") {
							$ctrl.attr("Isleft", "false");
							$ctrl.css("text-align", this.positionNew);
						} else if (positionOld == "right") {
							$ctrl.css("text-align", this.positionNew);
						} else {
							$ctrl.css("text-align", this.positionNew);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[textAlignLogoId].execute(new textAlignCommand($ctrl));
		},
		btnAlignUndo : function($ctrl, positionOld, positionNew, btnAlignLogoId, panel) {
			var btnAlignCommand = Undo.Command.extend({
				constructor : function($ctrl) {
					this.$ctrl = $ctrl;
					this.positionOld = positionOld;
					this.positionNew = positionNew;
				},
				execute : function() {
				},
				undo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnAlignLogoId) {
						var $main_text_align = $ctrl.css("text-align");
						$("#main-text-align-" + $main_text_align, panel).attr("checked", "checked");
						$("#main-text-align").buttonset();
						if (positionOld == "left" || positionOld == "start") {
							$ctrl.attr("Isleft", "false");
							$ctrl.css("text-align", this.positionOld);
						} else if (positionOld == "right") {
							$ctrl.css("text-align", this.positionOld);
						} else {
							$ctrl.css("text-align", this.positionOld);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				},
				//恢复
				redo : function() {
					var pageOldId = $(".selectedForm").parent().attr("id");
					if (pageOldId == btnAlignLogoId) {
						var $main_text_align = $ctrl.css("text-align");
						$("#main-text-align-" + $main_text_align, panel).attr("checked", "checked");
						$("#main-text-align").buttonset();
						if (positionOld == "left" || positionOld == "start") {
							$ctrl.attr("Isleft", "false");
							$ctrl.css("text-align", this.positionNew);
						} else if (positionOld == "right") {
							$ctrl.css("text-align", this.positionNew);
						} else {
							$ctrl.css("text-align", this.positionNew);
						}
						$(".ctrlSelected").removeClass("ctrlSelected");
					}
				}
			});
			ezCommon.pageIdURdo[btnAlignLogoId].execute(new btnAlignCommand($ctrl));
		},
		/**************************************控件属性撤销恢复各类情况相关方法（style）ed********************************************/
	};
	module.exports = undoRedo;
});
