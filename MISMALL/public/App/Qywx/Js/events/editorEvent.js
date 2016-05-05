/**
 * @author 陈毅
 * @desc 编辑器界面事件集合，也是整个编辑器的交互程序入口
 * @Date 2015-06-27
 */

define(function(require, exports, module) {

	var editorEvent = {

		/**
		 * 初始化，如页面元素事件绑定
		 */
		init : function() {
			//左侧菜单切换 显示或隐藏效果
			menuCtrler();
			//右侧 单击基本属性，操作 交互和数据切换面板
			view_attr_action();
			// 保存功能
			actionEventSave();
			//预览功能
			preview();
			//退出功能
			back();
			//加载菜单json
			loadMenuJson();
			pageListClick();
			setWXMenu();
			ctrlDraggable();
			dropMenu();
			initPanelHeight();
			initRemindHeight();
			addNewManagePage();
			//保存
			save();

			//添加自定义组件
			addCustomComponentClick();
			//添加动作事件
			addAction();
			dataSetEvent();
			switchEvent();
			switchActionType();
			//头部点击设计页面属性事件
			pageForm();
			//addLogicEvent();
			apiManageClick();
			//api管理面板 add by tlj 2015-12-03
		}
	};

	/**
	 * 设置微信企业菜单
	 */
	function setWXMenu() {
		var pageMgr = require("pageManage");

		//pageMgr.makeFormSortable();

		//一级菜单选中 -- 少于4个汉字或8个字母
		$("#wxMenu").on("click", ".firstMenu", function(e) {
			e.stopPropagation();
			pageMgr.wxFirstLevelMenuClick($(this));
			//第一次click时初始化子菜单的拖动事件
			if ($(this).find("li").hasClass('nodeMenu')) {
				draggableNodeMenu();
			}
		});

		//关闭微信菜单设置面板
		$(".closePanel").click(function(e) {
			e.stopPropagation(e);
			$("#setWXMenu").hide();
		});

		//关闭页面（hj）
		$(".page-close").unbind("click").click(function(e) {
			e.stopPropagation(e);
			//隐藏手机浏览点击
			$("#app").hide();
			//隐藏头部复制粘贴字样
			$(".tool-menu").hide();
			$("#formPreView").hide();
			$(this).hide();
			$("#container").find(".right-menu").hide();
			pageMgr.closePage();
			$("#set-ctrl-basic").click();
		});

		//删除微信菜单
		$("#deleteMenu").click(function() {
			pageMgr.onWxMenuDeleted();
		});

		//导入微信菜单模板
		$("#importTemplate").click(function() {

		});

		//设置微信菜单名
		onValueChange($("#setWxMenuName")[0], function() {
			pageMgr.onInputWxMenuName();
		});

		//微信菜单设置小面板中，“设计页面”选项被单击时（请求页面模板，选择并加载页面模板等）
		$("#editPage").click(function() {

			//判断当前选中的设计页面是从子页面还是父页面
			var $selectMenu = $("#wxMenu").find(".selectMenu");
			var thisPageId = $selectMenu.attr("pageid");
			//当前选择页面的pageId;
			var isParentPage = $selectMenu.attr("class").indexOf("firstMenu");
			//是否为子页面
			if (isParentPage == -1) {
				var thisPage = $(".wx-menu-list").find("[pageid=" + thisPageId + "]");
				//左边菜单的page
				var thisPageParentFormId = thisPage.parents(".page-common").attr("formid");
				//获取父页面的formId;
				var thisParentPageId = thisPage.parents(".page-common").attr("pageid");
				//获取父页面的formId;
				if (thisPageParentFormId && thisPageParentFormId != "undefined") {
					if (confirm("继续操作会删除父页面的所有数据，是否继续？")) {
						var ajaxData = require("../ajaxData");
						ajaxData.deleteForm(thisPageParentFormId, thisParentPageId);
						//删除保存的form
						thisPage.parents(".page-common").attr("formid", "");
						$("#" + thisPageParentFormId).remove();
						//TDD是否删除form 重新滑出滑板选择模板
						$.each(ezCommon.pageMenuJson["pageMenu"], function(k, v) {
							if (k == thisParentPageId) {
								delete v.formId;
								//删除json节点
								pageMgr.onEditPageClick();
							}
						});
						pageMgr.onEditPageClick();
					}
				} else {
					pageMgr.onEditPageClick();
				}
			} else {
				pageMgr.onEditPageClick();
			}
			$("#set-ctrl-basic").show().css('background', 'white');
			$("#set-ctrl-basic").css("color", "rgb(102, 102, 102)");
			$("#set-ctrl-operation").show().css('background', '#BCBCBC');
			$("#set-ctrl-operation").css("color", "white");
			$(".set-ctrl-operation").hide();
		});

		$("#pageTplLib #now,#pageTplLib #myTemplate").on("click", "li.pageTplItem", function() {
			if ($(this).parent().attr("id") == "myTemplate") {
				pageMgr.onPageTplClick($(this), 1);
			} else {
				pageMgr.onPageTplClick($(this), 0);
			}
			$(".main").find(".mainTop").click();
			//显示头部复制粘贴
			$(".tool-menu").show();
			$("#formPreView").show();
			$("#theMaskLayer").fadeOut(500);
		});

		//关闭页面模板列表面板（收回到右侧）
		$(".page-tpl-panel-close").click(function() {
			$(".ptlMenu,.pageTplListWrap").fadeOut(250, function() {
				$("#pageTplLib").animate({
					width : "0"
				});
				/*$("#customcomponent .formcontent").animate({
				 "margin-left" : "0px"
				 });
				 $("#customcomponent .customcomponent-down-one").animate({
				 "margin-left" : "0px"
				 });*/
				$(".customcomponent-down,customcomponent-down-one").animate({
					"margin-left" : "0px"
				});
			});
			$("#theMaskLayer").fadeOut(600);

		});
		//关闭Api管理面板,其实这三个关闭可以合并成一个,因为不可能同时存在????
		$(".apiManage >.page-tpl-panel-close").click(function() {
			$("#apiManage").animate({
				width : 0
			}, 500, function() {

			});
		});
		//关闭组件
		$(".customcomponent-up >.page-tpl-panel-close,input[name='cancel-btn']").click(function() {
			$("#customcomponent").animate({
				width : "0"
			});

		});

		$("#wxMenu").find(".firstMenu").hover(function() {
			$(this).find(".list-group-firstmenu").show();
		}, function() {
			$(this).find(".list-group-firstmenu").hide();
		});

		//二级菜单选中
		$("#wxMenu").on("click", ".nodeMenu", function(e) {
			e.stopPropagation();
			pageMgr.wxSecondLevelMenuClick($(this));
		});

		$("#header").click(function(e) {
			if (!$("#setWXMenu").is(":hidden")) {
				$(".closePanel").click();
				e.stopPropagation();

			}
		});

		//删除菜单
		$("#btnDelMenu").click(function() {
			$(".closePanel").click();
			if (confirm("是否删除当前菜单,子菜单,及所有关联的页面?")) {
				$selectMenu.find(".new_subMenuWrap ul .subMenu").not('.addSubMenuBtn').remove();
				$selectMenu.removeClass("selectMenu").addClass("toEdit").find(".firstMenuName").text("");
			}
		});

		//页面名字的的修改和页面删除删除事件
		$(".page-total").on("click", "li.page-common .edit_pageName", function() {
			//pageMgr.modPageName($(this));
		});

		//点击表单列表名字还原表单
		$(".page-total").on("click", ".custom_page_name", function() {
			$(this).parent().attr("pageid");
		});

		//左侧模板切换
		$(".link-page, .backstage-manage-page, .wx-page").on("click", "span.custom_page_name", function() {
			//分页隐藏
			$("#app").hide();
			pageMgr.onClickManagePage($(this));
			$(".main").find(".mainTop").click();
		});

		//模板小图片事件   之  模板修改名字
		$(".link-page, .backstage-manage-page").on("click", ".edit_pageName", function() {
			pageMgr.editPageName($(this));
		});

		//模板小图片事件   之  保存到我的模板
		$(".wx-page,.link-page, .backstage-manage-page").on("click", "li.page-common .save_page", function() {
			pageMgr.savePageName($(this));
		});

		//模板小图片事件   之  链接页面（后台管理）删除事件
		$(".link-page, .backstage-manage-page").on("click", "li.page-common .delete_page", function() {
			pageMgr.delPage($(this));
		});

		//模板面板切换
		$("#myPtlList,#sysPtlList").click(function() {
			pageMgr.switchTemplateList($(this).attr("id"));
		});

	}

	/**
	 * 左侧控件菜单拖动入口（控件添加）
	 */
	function ctrlDraggable() {
		$(".ctrl-comp").draggable({
			cursor : "move",
			helper : "clone",
			connectToSortable : ".topNavWraper, .selectedForm, .bottomNavWraper",
			scroll : true,
			revert : "invalid",
			containment : "document",
			opacity : "0.8",
			zIndex : 999,
			start : function(e, ui) {
				ui.helper.css({
					"background-position" : $(this).css("background-position"),
					"border" : "1px solid #ccc",
					width : "120px",
					height : "90px"
				});

				if (!$(".wxqyPage:visible").length) {
					$("#wxMenu .firstMenu:first").click();
					//弹出微信菜单设置面板
					$(".aipArrowDown").css({
						"animation-play-state" : "running"
					});
					if (t) {
						clearTimeout(t);
					}
					var t = setTimeout(function() {
						$(".aipArrowDown").css({
							"animation-play-state" : "paused"
						});
					}, 3000);
					return;
				}
			},
			stop : function(e, ui) {

			}
		});
	}

	/**
	 * 上传图片事件
	 */
	function uploadImage(ctrlType, $obj) {
		var nameVal = ctrlType + ezCommon.ctrlNameNum[ezCommon.formId];
		if (ctrlType == "IMAGE") {
			var $newCtrl = $obj;
			$newCtrl.find("input").addClass(nameVal).attr("id", nameVal);
			require.async(SITECONFIG.PUBLICPATH + "/Js/jquery.ImagePreview.js", function() {
				$newCtrl.find(".ImagePreview").ImagePreview();
			});
		}
	}

	/**
	 *  左侧页面列表中的页面在单击时
	 */
	function pageListClick() {
		$("#pageMgr,#pageManage,#pageMenuList").find(".pageList").unbind("click").on("click", function() {

		});
	}

	/**
	 * 单击创建自定义组件事件
	 */
	function addCustomComponentClick() {
		//创建数据组件并将组建添加到当前选中的form中
		$(".comp-add").unbind("click").click(function(e) {

			var compStatus = $("#customcomponent").attr("compStatus", "comp-add");
			if ($("#myWeb").is(":visible")) {
				var ptlHeight = $(window).height();
				//再次创建数据组件，从组件名称开始设置
				$(".customcomponent-down").css("margin-left", "0px");
				$(".customcomponent-down").find("input[name='componentname']").val("");
				$("#theMaskLayer").fadeIn(500);
				$("#customcomponent").height(ptlHeight).animate({
					width : "950"
				}, 500, function() {
					$(".ptlMenu,.pageTplListWrap").fadeIn(300);
				});

			} else {
				//alert("请先设计页面");
				$(".tipWrap").css("display", "inline");
				$(".tipWrap img").css("display", "none");
				$(".tipWrap_img").css("display", "inline").html("请先设计页面");
				setTimeout(function() {
					$(".tipWrap, .tipWrap_img").css("display", "none");
					$("#wxMenu").find(".firstMenu:first").click();
				}, 2000);
			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/events/compEvent.js", function(e) {
				e.setDataSourse();
			});
			e.stopPropagation();
		});
	}

	/**
	 * 拖动根菜单
	 */
	function draggableMenu() {
		$(".firstMenu").draggable({
			handle : '.firstMenu',
			opacity : 0.8,
			addClasses : false,
			helper : 'clone',
			distance : "10",
			zIndex : 999,
			start : function(e, ui) {
				ui.helper.css({
					"border" : "1px solid #ccc"
				});
				$("#setWXMenu").hide();
				$(this).removeClass("selectMenu");
				$(".new_subMenuWrap").hide();
			},
			stop : function(e, ui) {
				require.async("pageManage", function(e) {
					e.restoreLeftMenu(ezCommon.menuJson);
				});

			}
		});
	}

	/**
	 *拖动子菜单
	 */
	function draggableNodeMenu() {
		$(".new_subMenuWrap .nodeMenu").draggable({
			handle : '.new_subMenuWrap .nodeMenu p',
			opacity : 0.8,
			addClasses : false,
			helper : 'clone',
			zIndex : 999,
			start : function(e, ui) {
				ui.helper.css({
					"border" : "1px solid #ccc"
				});
				$("#setWXMenu").hide();
				if ($(this).hasClass("firstMenu")) {
					$(this).removeClass("selectMenu");
					$(".new_subMenuWrap").hide();
				}
			},
			stop : function() {
				require.async("pageManage", function(e) {
					e.restoreLeftMenu(ezCommon.menuJson);
				});
			}
		});
		droppableMenu($(".firstMenu .new_subMenuWrap .nodeMenu"), '.new_subMenuWrap .nodeMenu');
	}

	/**
	 *拖动时的相关处理
	 */
	function droppableMenu($select, accept) {
		$select.droppable({
			accept : accept,
			tolerance : 'touch',
			tolerance : 'pointer',
			drop : function(e, ui) {
				//如果当前子菜单已经超过5个则不允许继续拖动
				if ($(this).find("li").length < 5 || ui.draggable.hasClass("firstMenu")) {
					var drag = ui.draggable, pageid = drag.attr("pageId"), tpageId = $(this).attr("pageId"), dragHtml = drag[0].outerHTML, draghtml = drag.html(), thisHtml = this.outerHTML, menuConfig = ezCommon.menuJson;
					if (pageid && tpageId) {
						if ($(this).hasClass("firstMenu") && drag.hasClass("firstMenu")) {
							drag.attr("pageId", tpageId).removeClass("selectMenu").empty().append($(this).html());
							$(this).attr("pageId", pageid).html(draghtml);
							ezCommon.menuJson = updateConfig(pageid, tpageId, menuConfig);
						} else if ($(this).hasClass("nodeMenu") && drag.hasClass("nodeMenu")) {
							var $parent = $(this).closest(".firstMenu"), parentPageId = $parent.attr("pageId"), nodeConfig = menuConfig[parentPageId]["subMenu"];
							drag.attr("pageId", tpageId).removeClass("selectMenu").empty().append($(this).html());
							$(this).attr("pageId", pageid).html(draghtml);
							ezCommon.menuJson[parentPageId]["subMenu"] = updateConfig(pageid, tpageId, nodeConfig);
						} else if ($(this).hasClass("firstMenu") && drag.hasClass("nodeMenu")) {
							var $parent = drag.closest(".firstMenu"), parentPageId = $parent.attr("pageId");
							drag.remove();
							$(this).find(".new_subMenuWrap ul").append(dragHtml);
							menuConfig[tpageId]["subMenu"][pageid] = menuConfig[parentPageId]["subMenu"][pageid];
							delete menuConfig[parentPageId]["subMenu"][pageid];
							ezCommon.menuJson = menuConfig;
						}
					}
				}

				var menuJson = ezCommon.menuJson;
				$("#pageMenuList").find(".child_content").empty();
				$.each(menuJson, function(key, val) {
					var $addpage = $('<div class="pageMenuGather row"><div class="pageList fatherPageMenu"><span class="custom_page_name"></span></div></div>');
					$("#pageMenuList").find(".child_content").append($addpage);
					$addpage.find(".custom_page_name").text(decodeURIComponent(val["menuName"])).show();
					pageMenuIconEvent($addpage.find(".fatherPageMenu"));
					for (var c in val["subMenu"]) {
						var $childMenu = $("<div class='pageList childPageMenu'><span class='custom_page_name custom_child_page_name'>" + decodeURIComponent(val['subMenu'][c]['menuName']) + "</span></div>");
						$addpage.append($childMenu);
						$addpage.find($childMenu).attr({
							"pageId" : c,
							"formId" : val["subMenu"][c]["formId"]
						});
						pageMenuIconEvent($childMenu);
					}
					$addpage.find(".fatherPageMenu").attr({
						"pageId" : key,
						"formId" : val["formId"]
					});
				});

				function pageMenuIconEvent($parObj) {
					var $savePageToTpl = $('<a href="javascript:;" class="save_page" title="保存到我的模板"></a>');
					$parObj.append($savePageToTpl);
					$savePageToTpl.click(function(e) {
						var title = $(this).parent().find(".custom_page_name").text(), $this = ($this);

						var pageId = $(this).closest(".pageList").attr("pageid"), formId = $(this).closest(".pageList").attr("formid");
						var OBJ = $("#" + pageId).clone().wrap("<div />");
						if ( typeof (OBJ) != undefined) {
							if ($("#saveTplModal").length > 0) {
								$("#saveTplModalInput").val(title);
							} else {
								var $saveTplModal = $('<div class="modal fade" id="saveTplModal" ><div class="modal-dialog bs-example-modal-sm" style="width:400px;" ><div class="modal-content"><div class="modal-body">模板保存名称：<input type="text" class="form-control" name="saveTplModalInput" id="saveTplModalInput" value =' + title + ' /></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary saveTplModalBtn">保存</button></div></div></div></div>');
							}
							$("body").append($saveTplModal);
							$("#saveTplModal").modal("show");

							$(".saveTplModalBtn").unbind("click").on("click", function() {
								if ($("#saveTplModalInput").val() != "") {
									OBJ.find("[mycompid]").attr({
										"mycompid" : "",
										"formid" : ""
									});
									OBJ.find("[fieldname]").attr("fieldname", "");
									var htmls = OBJ.wrap("<div />").parent().html(), id = numRand();

									if ( typeof htmls == "undefined") {
										alert("页面没有内容，不能保存！");
									} else {
										$.ajax({
											url : SITECONFIG.ROOTPATH + "/Qywx/Editor/saveTplForUse",
											type : "POST",
											data : {
												"page" : id,
												"jsonData" : formId,
												"siteId" : SITECONFIG.SITEID,
												"content" : htmls,
												"title" : $("#saveTplModalInput").val(),
											},
											success : function(r) {
												//console.log(r);
											}
										});
									}
									$("#saveTplModal").modal("hide");
								} else {
									alert("模板保存名称不能为空");
								}
							});
							return false;
						}
					});

					$(".fatherPageMenu").each(function() {
						$(".fatherPageMenu").hover(function() {
							if ($(this).parent().find(".childPageMenu").length != 0) {
								$(this).find(".save_page").hide();
							} else {
								$(this).find(".save_page").show();
							}
						});
					});
					$(".fatherPageMenu").mouseleave(function() {
						$(this).find(".save_page").hide();
					});
				}

				/**
				 * 更新交换后的菜单JSON配置文件
				 * @param  pageid  string   当前拖动的菜单页面ID
				 * @param  tpageId string  被交换的菜单页面ID
				 * @param menuConfig JSON   菜单JSON
				 */
				function updateConfig(pageid, tpageId, menuConfig) {
					var menuArray = [];
					var temp = menuConfig[tpageId];
					menuConfig[tpageId] = menuConfig[pageid];
					menuConfig[pageid] = temp;
					$.each(menuConfig, function(key, value) {
						var v = "";
						if (value) {
							v = JSON.stringify(value);
						} else {
							v = "{}";
						}
						if (key == pageid) {
							menuArray.push('"' + tpageId + '"' + ":" + v);
						} else if (key == tpageId) {
							menuArray.push('"' + pageid + '"' + ":" + v);
						} else {
							menuArray.push('"' + key + '"' + ":" + v);
						}
					});
					return JSON.parse("{" + menuArray.join(",") + "}");
					;
				}


				$(this).css({
					"background" : ""
				});
				draggableMenu();

			},

			out : function(e, ui) {
				$(this).css({
					"background" : ""
				});
			},
			over : function(e, ui) {
				$(this).css({
					"background" : "#fef5f5"
				});
			}
		});
	}

	/**
	 *
	 */
	function dropMenu() {
		draggableMenu();
		draggableNodeMenu();
		droppableMenu($(".firstMenu,.new_subMenuWrap .nodeMenu"), '#wxMenu .menuWrap ul .firstMenu,.new_subMenuWrap .nodeMenu');
	}

	/**
	 * 设置动作的下拉框值改变时，添加动作
	 */
	function addAction() {
		$("#container .right-menu .set-ctrl-operation .action-list").unbind("change").change(function() {
			var actionType = $(this).val();

			if ($(this).find("option:selected").attr("type") == "api")//自定义api,此处可以将type属性放在select
			{
				var actionIndex = $(this).val();
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/apiManageAction.js" + SITECONFIG.VERSION, function(e) {
					e.action(actionIndex);
				});
			} else {
				if (actionType != "__blank") {
					if (ezCommon.actionNameNum[ezCommon.formId]) {++
						ezCommon.actionNameNum[ezCommon.formId];
					} else {
						ezCommon.actionNameNum[ezCommon.formId] = 1;
					}
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js" + SITECONFIG.VERSION, function(e) {
						ezCommon.deBug(actionType, "public/Js/Qywx/event/editorEvent", 459);
						e.action();
					});

					setTimeout(function() {
						//选中第一个option请选择
						$("#container .right-menu .set-ctrl-operation .action-list").get(0).selectedIndex = 0;
					}, 500);

				}
			}
		});
	}

	/**
	 * 设置默认值时的选项单击事件绑定
	 */
	function dataSetEvent() {
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js" + SITECONFIG.VERSION, function(e) {
			e.dataEvent();
		});
	}

	/**
	 * @desc 单击切换事件类型
	 */
	function switchEvent() {
		$("#container .right-menu .set-ctrl-operation ").unbind("click.operationType").on("click.operationType", ".operationType", function() {
			var ctrlType = ezCommon.Obj.attr("ctrl-type"), ctrlId = ezCommon.Obj.attr("ctrlId"), operationType = $.trim($(this).attr("operationtype")), actionType = $("#container .right-menu .set-ctrl-operation .selectedActionType").attr("actiontpye");
			if (ctrlType == undefined) {
				ctrlType = "pageForm";
				ctrlId = "undefined";
			}

			$("#container .right-menu .set-ctrl-operation .selectedOperationType").removeClass("selectedOperationType");
			$(this).addClass("selectedOperationType");
			loadAction(ctrlType, operationType, actionType);
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(ctrlCommon) {
				ctrlCommon.restoreAction(ctrlId, operationType);
			});

		});
	}

	/**
	 * @desc 单击切换动作类型
	 */
	function switchActionType() {
		$("#container .right-menu .set-ctrl-operation .actionType").unbind("click").click(function() {
			var ctrlType = $(".ctrlSelected").attr("ctrl-type"), actionType = $(this).attr("actiontpye"), operationType = $("#container .right-menu .set-ctrl-operation .selectedOperationType").attr("operationtype");
			if (ctrlType == undefined) {
				ctrlType = "pageForm";
			}

			$("#container .right-menu .set-ctrl-operation .selectedActionType").removeClass("selectedActionType");
			$(this).addClass("selectedActionType");
			loadAction(ctrlType, operationType, actionType);
		});
	}

	/**
	 * @desc 重新加载动作源(动作下拉框)
	 */
	function loadAction(ctrlType, operationType, actionType) {
		//外部api绑定到动作下拉框
		if (actionType == "api") {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/apiManage/apiManageDataOpt.js" + SITECONFIG.VERSION, function(e) {
				//var apiList = e.getApiListForActionSet();
				var apiList = e.getApiListForActionSetNew();
				$(".right-menu .actionList .select-content .action-list").empty().append(apiList);
				$(".right-menu .actionList .select-content .action-list").attr("type", "api");
			});
		} else {
			var uri = "controls/";
			if (ctrlType == "compLogic" || ctrlType == "systemCp") {
				uri = "components/";
			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/" + uri + ctrlType + ".js", function(ctrl) {
				var action = ctrl.get().event;
				var option = ["<option value='__blank'>---请选择---</option>"];
				if (!operationType) {
					operationType = "click";
				}

				if (!actionType) {
					actionType = "base";
				}
				if (action[operationType]) {
					$.each(action[operationType]["action"][actionType], function(k, v) {
						option.push("<option value='");
						option.push(k);
						option.push("'>");
						option.push(v);
						option.push("</option>");
					});
				}

				$(".right-menu .actionList .select-content .action-list").empty().append(option.join(""));

			});
		}

	}

	/**
	 * 初始化左右面板的高度
	 */
	function initPanelHeight() {
		var initHeight = $(window).height() - 50;
		if (initHeight < 590) {
			initHeight = 590;
		}
		$(".left-main-menu,.left-menu-wrap,.right-menu,.page-manage-wrap").css("height", initHeight + "px");
		$(".wx-menu-list, .link-menu-list, .backstage-menu-list").css("height", ((initHeight / 3) - 36) + "px");
		$(".right-menu .default-content").css("height", (initHeight - 83) + "px");
	}

	/*
	 *  设置提示定位
	 */
	function initRemindHeight() {
		var divHeight = ($(window).height() / 2) - ($(".tipWrap").height() / 2);
		var divWidth = ($(window).width() / 2) - ($(".tipWrap").width() / 2);
		$(".tipWrap").css({
			"top" : divHeight + "px",
			"left" : divWidth + "px"
		});
	}

	/**
	 * 从左边菜单新增页面
	 */
	function addNewManagePage() {
		$(".page-manage-wrap .page-add").unbind("click").on("click", function() {
			$that = $(this);
			require.async("pageManage", function(e) {
				e.addNewPage($that);
			});
		});
	}

	/**
	 * 把新添加的页面信息加入到config中
	 */
	function setConfig(config, nodes) {
		for (var i = 0; i < config.length; i++) {
			if (config[i]["page"] == nodeId) {
				//如果子节点长度为空
				if (config[i]["nodes"].length <= 0) {
					config[i]["nodes"] = [];
				}
				config[i]["nodes"].push(nodes);
			} else if (config[i]["nodes"].length > 0) {
				setConfig(config[i]["nodes"], nodes);
			}
		}
	}

	/**
	 * @desc 左侧菜单切换 显示或隐藏效果
	 * @author 黄俊
	 * @date 2015-6-27
	 */
	function menuCtrler() {
		$(".left-main").click(function() {
			$(".left-main:visible").css('background', '#BCBCBC');
			$(this).css('background', '#009DD9');
			var id = $(this).attr("id");
			$(".left-block:visible").hide();
			$("." + id).show();
		});
	}

	/**
	 * 表单保存
	 */
	function save() {
		$("#formSave").unbind("click").click(function() {

			var ajaxData = require("ajaxData");
			$(".tipWrap,.tipWrap img").css("display", "inline");
			$(".tipWrap_img").css("display", "inline").html("保存中...");
			ezCommon.pageMenuJson['pageMenu'] = ezCommon.menuJson;
			//获取页面的json
			require.async("pageManage", function(e) {
				var allPageFromJson = e.getMenuJson();
				var mark = true;
				//存菜单和页面json
				var content = ezCommon.pageMenuJson;
				var data = {
					"page" : "config",
					'content' : JSON.stringify(content),
					"siteId" : SITECONFIG.SITEID
				};

				ajaxData.saveMenuJson(data);
				ajaxData.saveFormJson(allPageFromJson);

			});
			//存模板
			var formId = "";
			if (ezCommon.needSavePage.length) {
				$.each(ezCommon.needSavePage, function(i, pageid) {
					$this = $("#myWeb").find("#" + pageid);
					var data = {}, $that = $this.clone();
					$that.css("display", "block");
					$that.find('[ctrl-type="compLogic"]').hide();
					$that.find('#imgBoxProgressData,#imgBoxProgressBar').hide();
					data['content'] = $that.prop("outerHTML"), data['page'] = pageid, data["siteId"] = SITECONFIG.SITEID;
					formId = ajaxData.saveMenuJson(data);
					if (formId) {
						$(" .tipWrap_img ").html("保存成功");
						$(".tipWrap img").css("display", "none");
						setTimeout(function() {
							$(".tipWrap , .tipWrap_img ").css("display", "none");
						}, 1000);
					}
				});
				ezCommon.needSavePage = [];
				//保存完之后清空
			} else {
				$(".tipWrap ").css("display", "none");
			}

		});
		// ctrl + s监听事件
		$(document).keydown(function(e) {
			if (e.ctrlKey == true && e.keyCode == 83) {
				return false;
			}
		});
		$(document).keyup(function(e) {
			if (e.ctrlKey == true && e.keyCode == 83) {
				$("#formSave").click();
				return false;
			}
		});
	}

	/**
	 * 加载菜单json 并且还原菜单
	 */
	function loadMenuJson() {
		var data = {};
		data['page'] = "config";
		data["siteId"] = SITECONFIG.SITEID;
		var loadedMenuJson = "";
		require.async("ajaxData", function(e) {
			loadedMenuJson = e.loadPage(data);
		});
		require.async("pageManage", function(e) {
			e.restoreMenu(loadedMenuJson);
		});
	}

	/**
	 * @desc 退出功能
	 * @author 黄俊
	 * @date 2015-6-27
	 */
	function back() {
		$("#backTo").click(function() {
			var page_name = _getCookie("from_page");
			_setCookie("from_page", null);
			window.location = SITECONFIG.ROOTPATH + '/Developer/developerCenter.html';
		});
	}

	/**
	 * @desc 预览功能
	 * @author 黄俊
	 * @date 2015-6-27
	 */
	function preview() {
		$("#formPreView").data("state", "edit").click(function(e) {
			stopEventBubble(e);
			if (ezCommon.needSavePage.length) {
				if (confirm("页面未保存，是否现在保存？")) {
					$("#formSave").click();
				} else {
					return;
				}
			}

			var pageId = $("#myWeb .wxqyPage .selectedForm").parent().attr("id");
			if (pageId) {
				window.open(SITECONFIG.ROOTPATH + "/Site/Wechat/index/pageId/" + pageId + "/siteId/" + SITECONFIG.SITEID);
			}
		});
	}

	/**
	 * @desc 动作保存功能
	 * @author 黄俊
	 * @date 2015-6-27
	 */
	function actionEventSave() {
		$("#actionSave").on("click", function() {
			var haveQrcode = $(".selectedForm").find(".Qrcode").attr("have");
			if (!haveQrcode) {
				$(".actionPanel").each(function() {
					var type = $(this).attr("actiontype");
					var name = $(this).find(".returnControl").attr("valuetype");
					if (type == "generatedQrcode") {
						var ctrlid = numRand();
						//	var $QRHtml = $('<div class="row editCtrl Qrcode" data-type="controls" ctrl-type="ctrl-QRcode" have="yes" ctrlid="' + ctrlid + '"  style="border-color: rgb(133, 200, 255);text-align:center;"><img  alt="" src = "http://s.jiathis.com/qrcode.php?url=' +window.location.href+ '"  class="img-rounded img-responsive" data-picturesize="35" data-radius="4" byctrlradius="true" style="margin-left:130px;""><span class="exist">这是二维码</span></div>');
						//OCPATH
						//$(".selectedForm").append($QRHtml);
						$(".selectedForm").find("[name=" + name + "]").attr("src", "http://s.jiathis.com/qrcode.php?url=" + window.location.href);
					}
				});
			}
			saveActionJson();
			$("#formSave").click();
			// if (qyEditor.formJsonDataSave(Global[Global.ezType].formId)) {
			// formResolve.base.showMessage("动作保存成功!");
			// }
		});
	}

	/**
	 * @desc 右侧 单击基本属性,操作交互和数据切换面板
	 * @author 黄俊
	 * @date 2015-6-27
	 */
	function view_attr_action() {
		$(".ctrl-setting-title").click(function() {
			$(".ctrl-setting-title:visible").css({
				'background' : '#CCCCCC',
				'color' : 'white'
			});
			$(this).css({
				'background' : 'white',
				'color' : '#666'
			});
			var id = $(this).attr("id");
			$(".set-ctrl-panel:visible ").hide();
			$("." + id).show();
		});
	}

	/**
	 * 保存动作设置的json数据
	 */
	function saveActionJson() {
		//动作保存按钮单击时
		var selectObj = ezCommon.Obj, ctrlName = selectObj.attr("ctrlId"), isOpt = isSetAction(ctrlName), eventType = $(".right-menu .action-operation .selectedOperationType").attr("operationtype");
		var controlJson = null;

		//如果但前选中控件的是页面 name = 'undefined'
		if (selectObj.hasClass("myForm")) {
			ctrlName = "undefined";
		}

		if (ctrlName) {
			controlJson = ezCommon.controlLists[ezCommon.formId][ctrlName];
		}
		var actionId = 0;
		if (isOpt) {//当前选中控件设置了动作
			var eventVal = controlJson["operations"][eventType];
			actionId = eventVal ? eventVal : 0;
		}
		if (!selectObj.length) {//页面动作
			var formActionId = $(".selectedForm").attr("acttionId");
			actionId = formActionId ? formActionId : 0;
		}
		var stateJson = saveJson(actionId), actionState = stateJson["state"], jsonData = stateJson["jsonData"];
		if (selectObj.length) {
			//当actionId为0时,动作为新增,写入主json
			if (actionId == 0) {
				if (isOpt) {
					controlJson["operations"][eventType] = actionState;
				} else {
					controlJson["operations"] = JSON.parse('{"' + eventType + '":"' + actionState + '"}');
				}
			} else if (actionState == "delete" && actionId != 0) {
				delete controlJson["operations"][eventType];
				//重新去检测是否还存在动作
				if (!isSetAction(ctrlName)) {
					delete controlJson["operations"];
				}
			}
			//保存动作立即解析
			if (actionState != "delete") {
				require.async(SITECONFIG.PUBLICPATH + "/Js/actionResolve/actionResolve.js" + SITECONFIG.VERSION, function(e) {
					e.actionEvent(ezCommon.controlLists[ezCommon.formId][ctrlName]["operations"], selectObj);
				});
			}
		} else {
			var $selForm = $("#ctrlArea").find(".selectedForm");
			if (actionState != "delete") {
				if (eventType == "leftSliding") {
					$selForm.attr({
						"leftSliding" : actionState
					});
				} else if (eventType == "rightSliding") {
					$selForm.attr({
						"rightSliding" : actionState
					});
				} else if (eventType == "load") {
					$selForm.attr({
						"load" : actionState
					});
				}
			} else {
				if (eventType == "leftSliding") {
					$selForm.attr({
						"leftSliding" : ""
					});
				} else if (eventType == "rightSliding") {
					$selForm.attr({
						"rightSliding" : ""
					});
				} else if (eventType == "load") {
					$selForm.attr({
						"load" : ""
					});
				}
			}
		}
	}

	/**
	 * 头部点击事件
	 */
	function pageForm() {
		$(".main").find(".mainTop").click(function(e) {
			preventDefault(e);
			stopEventBubble(e);
			$("#set-ctrl-basic").click();
			//选中头部时出现红色虚线框
			$(".selectedForm").parent().css("outline", "none");
			ezCommon.setpageSelected();
			//将页面写入JSON
			var ctrlTitle = $(".mainTop").find(".pageTopTitle").text();

			if (!objIsnull(ezCommon.controlLists[ezCommon.formId])) {
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js" + SITECONFIG.VERSION, function(e) {
					e.add("pageForm", undefined, ctrlTitle);
				});
			}

			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(e) {
				e.hideDataSetting();
			});
			if ($(".selectedForm").parent().attr("backgroundimage") && $(".selectedForm").parent().attr("backgroundimage") != "none") {
				$(".removeBgImg").removeAttr("disabled");
				$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
			} else {
				$(".removeBgImg").attr("disabled", "disabled");
				$(".removeBgImg").css("background", "#ccc");
			}
			if (!$(".page-close").is(":hidden")) {
				$(".ctrlSelected").removeClass("ctrlSelected");
				$page = $("#myWeb").find(".selectedForm");
				if ($page) {
					var ctrlName = "pageForm";
					ezCommon.Obj = $page;
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js" + SITECONFIG.VERSION, function(e) {
						e.getAttrs(ctrlName, function(ctrl) {

							//加载控件属性
							ctrl.loadAttrs(ctrl);
							//还原属性设置
							ctrl.setAttrs(ctrl.get());
							//加载控件动作
							ctrl.loadAction(ctrlName);
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(ctrlCommon) {
								//还原动作设置
								ctrlCommon.restoreAction("undefined", "load");
							});
						});
					});
				}
			}
		});

	}

	/**
	 * 判断控件是否设置了动作
	 */
	function isSetAction(ctrlName) {
		if (ctrlName == "pageForm") {//检测页面是否存在动作
			var rightsliding = $(".selectedForm").attr("rightsliding");
			var leftsliding = $(".selectedForm").attr("leftsliding");
			var load = $(".selectedForm").attr("load");
			if (rightsliding || leftsliding || load) {
				return true;
			}
			return false;
		}
		if (ctrlName == undefined || ctrlName.match(/compLogic/g))
			return false;
		var cJson = ezCommon.controlLists, cOpt = cJson[ezCommon.formId][ctrlName]["operations"], eventNum = 0;
		//记录控件设置的事件个数
		if (cOpt) {
			for (var i in cOpt) {
				eventNum++;
			}
		}
		if (cOpt && eventNum) {
			return true;
		}
		return false;
	}

	/**
	 *
	 */
	function saveJson(optId) {
		var actionJsonSum = "", sort = "";
		$(".selectedForm .ctrlSelected").attr("slideCtrl", false);
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addNeedSavePage();
		});
		$("#ctrlActionList .actionPanel").each(function() {
			var $_this = $(this), actionType = $_this.attr("actionType"), actionName = $_this.attr("actionId");
			if (actionType == "layerSwitch") {
				$(".selectedForm .ctrlSelected").attr("slideCtrl", true);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			}
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + actionType + ".js" + SITECONFIG.VERSION, function(e) {
				var jumpJson = e.json($_this);
				if (jumpJson) {
					actionJsonSum += jumpJson;
					actionJsonSum += ",";
					sort += '"' + actionName + '",';
					ezCommon.savePageParam(actionName, "{" + jumpJson + "}", actionType);
				}
			});
		});
		actionJsonSum = actionJsonSum.substr(0, actionJsonSum.length - 1);
		sort = sort.substr(0, sort.length - 1);
		if (actionJsonSum != "") {
			actionJsonSum = '{"sort":[' + sort + '],"actionList":{' + actionJsonSum + '}}';
		}
		var data = {}, stateJson = {};
		data["json_data"] = actionJsonSum;
		data["action_id"] = optId;
		data["siteId"] = SITECONFIG.SITEID;
		$.ajax({
			type : "POST",
			url : SITECONFIG.ROOTPATH + "/FormData/saveFormActionData",
			data : data,
			async : false,
			success : function(result) {
				if (result["status"] == "success") {
					stateJson["state"] = result["data"];
					if (actionJsonSum) {
						ezCommon.ctrlActionCache[optId] = JSON.parse(actionJsonSum);
					}
				}
				if (!result) {
					alert("动作修改失败!");
				}
			}
		});
		if (actionJsonSum == "") {
			stateJson["state"] = "delete";
			stateJson["jsonData"] = "";
		} else {
			stateJson["jsonData"] = JSON.parse(actionJsonSum);
		}
		return stateJson;
	}

	/**
	 * 添加逻辑设计器
	 */
	function addLogicEvent() {
		$("body").on("click", ".addLogic", function() {
			var $actionObj = $(this).closest(".actionPanel"), type = $actionObj.attr("actionType"), actionId = $actionObj.attr("actionId");
			require.async(SITECONFIG.PUBLICPATH + "/Js/logic/logic.css" + SITECONFIG.VERSION, function() {
				require.async(SITECONFIG.PUBLICPATH + "/Js/logic/logic.js" + SITECONFIG.VERSION, function() {
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/action/" + type + ".js" + SITECONFIG.VERSION, function(action) {
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/dataBase.js" + SITECONFIG.VERSION, function(dataBase) {
							var ctrlId = $(".ctrlSelected").attr("ctrlId"), ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlId], logicStr = "";

							if (objIsnull(ctrlJson)) {
								if (objIsnull(ctrlJson["operations"])) {
									var actionJsonId = ctrlJson["operations"][$(".set-ctrl-operation .action-operation .selectedOperationType").attr("operationtype")];
									var actionJson = ezCommon.ctrlActionCache[actionJsonId];
									if (objIsnull(actionJson)) {
										if (objIsnull(actionJson["actionList"])) {
											if (objIsnull(actionJson["actionList"][actionId])) {
												logicStr = actionJson["actionList"][actionId]["logicStr"];
											}
										}
									}
								}
							}

							var logincObj = action.logic, logic = new Logic($("body"), dataBase);
							logic.init(logincObj, $actionObj, logicStr);
						});
					});

				});
			});
		});
	}

	/**
	 * Api管理
	 */
	function apiManageClick() {
		$(".third-lib .the-third,#apiManagePanel").unbind("click").click(function() {
			var wHeight = $(window).height();
			$("#apiManage").height(wHeight).animate({
				width : 1000
			}, 500, function() {
				$(".ptlMenu").fadeIn(300);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/apiManage/apiManageDataOpt.js" + SITECONFIG.VERSION, function(e) {
					var apiListHtml = e.getApiList();
					$("#api_list").empty().append(apiListHtml);
				});
			});
		});
	}


	editorEvent.init();
	module.exports = editorEvent;
});
