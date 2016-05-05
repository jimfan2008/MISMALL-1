/**
 * @author 陈毅
 * @desc 平台页面管理
 * @date 2015-06-29
 */

define(function(require, exports, module) {
	//页面模板列表缓存
	var pageTplListCache = null;
	//自己保持的模板缓存列表
	var myTemplateCache = null;
	//手机翻页模板列表缓存
	var layerSwitchListCache = null;
	var ajaxData = require("ajaxData");
	var compLogic = require("compLogic");
	var pageMgr = {
		//初始化栈 对象（撤销恢复处用到）
		stack : null,

		/**
		 * 还原菜单
		 */
		restoreMenu : function(loadedMenuJson) {
			if (loadedMenuJson) {
				loadedMenuJson = JSON.parse(loadedMenuJson);
				if (loadedMenuJson.pageMgr && loadedMenuJson.pageManage && loadedMenuJson.pageMenu) {
					ezCommon.pageMenuJson = loadedMenuJson;
					ezCommon.menuJson = loadedMenuJson['pageMenu'];
				}
				for (var i in loadedMenuJson) {
					if (i == "pageMgr") {
						var html = "";
						$.each(loadedMenuJson[i], function(m, n) {
							html += '<li class="page-common" formid="' + n.formId + '" pageid="' + n.page + '"><span class="custom_page_name">' + n.name + '</span><div class="input-group modNameInput" parentPageId="' + n.page + '"><input class="form-control input-sm pageMenu" value="' + n.name + '" type="text" aria-describedby="basic-addon2" placeholder=" "><span id="basic-addon2" class="input-group-addon glyphicon glyphicon-ok"></span></div><div class="hideIco"></div><a class="edit_pageName glyphicon glyphicon-pencil" href="javascript:;" title="修改标题"></a><a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;" title="保存到我的模板"></a><a class="delete_page glyphicon glyphicon-trash" href="javascript:;" title="删除"></a></li>';
						});
						$(".link-page .link-menu-list").empty().append(html);
					} else if (i == "pageManage") {
						var html = "";
						$.each(loadedMenuJson[i], function(m, n) {
							html += '<li class="page-common" formid="' + n.formId + '" pageid="' + n.page + '"><span class="custom_page_name">' + n.name + '</span><div class="input-group modNameInput" parentPageId="' + n.page + '"><input class="form-control input-sm pageMenu" value="' + n.name + '"  type="text" aria-describedby="basic-addon2" placeholder=" "><span id="basic-addon2" class="input-group-addon glyphicon glyphicon-ok"></span></div><div class="hideIco"></div><a class="edit_pageName glyphicon glyphicon-pencil" href="javascript:;" title="修改标题"></a><a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;" title="保存到我的模板"></a><a class="delete_page glyphicon glyphicon-trash" href="javascript:;" title="删除"></a></li>';
						});
						$(".backstage-manage-page .backstage-menu-list").empty().append(html);
					} else {
						//还原左侧的菜单
						pageMgr.restoreLeftMenu(loadedMenuJson[i]);
					}
				}

			}
		},

		/**
		 * 还原左侧微信菜单
		 */
		restoreLeftMenu : function(leftMenuJson) {
			var num = 0;
			$(".wx-menu-list").empty();
			$.each(leftMenuJson, function(k, v) {
				var $eqMenu = $("#wxMenu").find(".firstMenu:eq(" + num + ")"), menuPageId = k;
				var firstMenu = '<li class="page-common"  pageid="' + k + '" formid="' + v["formId"] + '"><div><span class="custom_page_name">' + decodeURIComponent(v["menuName"]) + '</span>' + '<input class="form-control input-sm pageMenu" type="text" placeholder="输入页面名称" style="display: none;" value="' + decodeURIComponent(v["menuName"]) + '">' + '<a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;" title="保存到我的模板"></a></div><ul></ul></li>';
				$eqMenu.attr("pageId", k).removeClass("toEditMain").addClass("edited").find(".firstMenuName").text(html_decode(decodeURIComponent(v["menuName"])));
				num++;
				$(".wx-menu-list").append(firstMenu);

				$.each(v["subMenu"], function(m, n) {
					var childrenMenu = '<li class="page-common page-secmenu"  pageid="' + m + '" formid="' + n["formId"] + '"><span class="custom_page_name">' + decodeURIComponent(n["menuName"]) + '</span>' + '<input class="form-control input-sm pageMenu" type="text" placeholder="输入页面名称" style="display: none;" value="' + decodeURIComponent(n["menuName"]) + '">' + '<a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;" title="保存到我的模板"></a></li>';
					$(".wx-menu-list").find("li[pageid =" + menuPageId + "] >ul").append(childrenMenu);
				});
			});
		},

		/**
		 * 拼接所有页面属性的json
		 */
		getMenuJson : function() {
			ezCommon.pageMenuJson['pageMenu'] = ezCommon.menuJson;
			var allPageFromJson = {};
			for (var i in ezCommon.controlLists) {
				var formId = i, name = $(".page-total").find(".page-common[formid='" + i + "']").find(".custom_page_name").text(), pageId = $(".page-total").find(".page-common[formid=" + i + "]").attr("pageid");
				var formJson = {
					"actionIndex" : 0, //存储当前表单存储的动作序号的最大值,表单还原的时候,再增加动作,避免序号重复
					"ctrlIndex" : ezCommon.ctrlNameNum[ezCommon.formId] || 1, //存储当前添加控件最大值序号最大值
					"tabs" : {
						"tab1" : {
							"name" : "页签1",
							"page" : name,
							"ctrlList" : []
						}
					}
				};
				for (var j in ezCommon.controlLists[i]) {
					formJson['tabs']['tab1']['ctrlList'].push(j);
				}
				formJson["controlLists"] = ezCommon.controlLists[i];
				allPageFromJson[i] = formJson;
			}
			return allPageFromJson;

		},

		/**
		 * 微信一级菜单选中时
		 */
		wxFirstLevelMenuClick : function($this) {
			$("#setWxMenuName").attr("placeholder", "少于4个汉字或8个字母");
			_initPanel(1, $this);
			if ($this.hasClass("selectMenu"))
				return false;
			$("#wxMenu").find(".selectMenu").removeClass("selectMenu");
			$this.addClass("selectMenu");

			$("#wxMenu").find(".new_subMenuWrap").hide().find(".addSubMenuBtn").remove();
			var pageId = $this.attr("pageId"), len = 0;
			//是否有子菜单
			if (pageId) {
				$.each(ezCommon.menuJson[pageId]["subMenu"], function(k, v) {
					len++;
				});
			}
			//如果没有子菜单
			if (len == 0) {
				//判断是否已经命名一级菜单
				var menuName = $.trim($this.find(".firstMenuName").text());
				if (menuName != "") {
					$("#editPage").show();
					$("#deleteMenu").show();
					$("#importTemplate").hide();
					$("#editPage,#deleteMenu").removeClass("disabled-item").show();
				} else {
					$("#editPage").hide();
					$("#deleteMenu").hide();
					$("#importTemplate").show();
					$("#importTemplate").removeClass("disabled-item");
				}
			} else {
				$("#editPage").hide();
				$("#deleteMenu").hide();
				$("#importTemplate").hide();
			}
			if ($this.hasClass("edited")) {

				_showSubMenu($this);

			}
		},

		/**
		 * 微信二级菜单选中时
		 */
		wxSecondLevelMenuClick : function($this) {
			//当前菜单的一级菜单Id
			$("#setWxMenuName").attr("placeholder", "少于8个汉字或16个字母");
			_initPanel(2, $this);
			$("#wxMenu").find(".selectMenu").removeClass("selectMenu");
			$this.addClass("selectMenu");
			//如果当前创建菜单即将是子菜单
			if ($this.hasClass("addSubMenuBtn")) {
				$("#editPage").hide();
				$("#deleteMenu").hide();
				$("#importTemplate").show();
				$("#importTemplate").removeClass("disabled-item");
			} else {
				$("#editPage").show();
				$("#deleteMenu").show();
				$("#importTemplate").hide();
				$("#editPage,#deleteMenu").removeClass("disabled-item").show();
			}

		},

		/**
		 * 微信菜单设置小面板中，输入菜单名称时
		 */
		onInputWxMenuName : function() {
			var id = numRand();
			var firstNode = $(".selectMenu .firstMenuName").text();
			var secondNode = $(".selectMenu .nodeMenuName").text();
			var $selectMenu = $("#wxMenu").find(".selectMenu"), hasSubMenu = $selectMenu.find(".new_subMenuWrap ul .subMenu").length, menuName = $("#setWxMenuName").val(), nameWrap = null, nodeMenu = 1;
			if (secondNode || firstNode) {
				$("#importTemplate").hide();
			} else {
				$("#importTemplate").show();
				$("#importTemplate").removeClass("disabled-item").show();
			}
			if (!$("#setWxMenuName").val()) {
				$("#editPage").hide();
				$("#deleteMenu").show();
				return;
			} else {
				$("#editPage").show();
				$("#deleteMenu").show();
				$("#importTemplate").hide();
				$("#editPage,#deleteMenu").removeClass("disabled-item").show();
			}

			if ($selectMenu.find(".firstMenuName").size() > 0) {
				//只取菜单名的前四位作为菜单名称
				menuName = getLength(menuName, 5);
				nameWrap = $selectMenu.find(".firstMenuName");
			} else {
				menuName = getLength(menuName, 5);
				nameWrap = $selectMenu.find(".nodeMenuName"), nodeMenu = 2;
			}
			nameWrap.text(menuName);
			if ($.trim(menuName)) {
				var $submenuWrap = null;
				if (nodeMenu == 1) {//一级菜单
					$submenuWrap = $selectMenu.find(".new_subMenuWrap");
					$selectMenu.removeClass("toEditMain");

					$("#editPage").show();
					$("#deleteMenu").hide();
					$("#importTemplate").hide();
					var pageId = $selectMenu.attr("pageid"), formId = $selectMenu.attr("formid") ? $selectMenu.attr("formid") : " ";
				} else {//二级菜单
					$submenuWrap = $selectMenu.parents(".new_subMenuWrap");
					$selectMenu.removeClass("addSubMenuBtn");
				}
				if ($submenuWrap.find(".addSubMenuBtn").size() <= 0) {
					var $ulObj = $submenuWrap.show().find("ul");
					if (nodeMenu == 1) {
						$ulObj.append('<li class = "nodeMenu addSubMenuBtn"><p class = "nodeMenuName"></p></li>');
					} else {
						var liLen = $ulObj.find("li").size();
						if (liLen < 5) {
							$ulObj.find("li:first").before('<li class = "nodeMenu addSubMenuBtn"><p class = "nodeMenuName"></p></li>');
						}
					}
				}
				$selectMenu.addClass("edited");
				//手机模型微信菜单改变时，同时修改左侧“微信菜单页面”列表中对应菜单
				if (!$selectMenu.attr("pageId") && $selectMenu.attr("pageId") != "") {
					var formId = $selectMenu.attr("formid") ? $selectMenu.attr("formid") : " ";
					$(".wxqyPage").hide().find("form").removeClass("selectedForm");
					$selectMenu.attr("pageId", id);

					if (nodeMenu == 1) {
						var appendMainMenu = $("<div class='pageMenuGather row'><div class='pageList fatherPageMenu' pageid='" + pageId + "' formid='" + formId + "'><span class='custom_page_name'>" + menuName + "</span><a class='save_page glyphicon glyphicon-floppy-disk' href='javascript:;' title='保存到我的模板'></a></div></div>");
						$("#pageMenuList").find(".child_content").append(appendMainMenu);
						//pageMenuIconEvent(appendMainMenu);
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
					} else {
						var appendChildMenu = $("<div class='pageList childPageMenu' formid='" + formId + "'><span class='custom_page_name custom_child_page_name'>" + menuName + "</span><a  class='save_page glyphicon glyphicon-floppy-disk' href='javascript:;' title='保存到我的模板'></a></div>");
						var firstMenuPageId = $selectMenu.closest(".firstMenu").attr("pageid");
						$("#pageMenuList").find("div[pageid='" + firstMenuPageId + "']").parent(".pageMenuGather").append(appendChildMenu);
						//	pageMenuIconEvent(appendChildMenu);
					}
				};
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.writeJson(nodeMenu, $selectMenu, html_encode(menuName));
				});
			} else {
				var historyname = $("#setWxMenuName").attr("historyName");
				if (!historyname || historyname == "") {
					deleteData($selectMenu, nodeMenu);
				}
			}

			//输入文字时同时更新左边的菜单 nodeMenu=1 表示根菜单， nodeMenu=2表示子菜单
			if (nodeMenu == 1) {
				var menuPageHtml = [], selectMenuPageId = $selectMenu.attr("pageid");
				//判断当前菜单是否已经存在
				if (!objIsnull($(".wx-menu-list").find("li[pageid =" + selectMenuPageId + "]"))) {
					menuPageHtml.push('<li class="page-common"  pageid="');
					menuPageHtml.push(selectMenuPageId);
					menuPageHtml.push('"formid="');
					menuPageHtml.push($selectMenu.attr("formid"));
					menuPageHtml.push('"><div><span class="custom_page_name">');
					menuPageHtml.push(menuName);
					menuPageHtml.push('</span><input class="form-control input-sm pageMenu" type="text" placeholder="输入页面名称" style="display: none;" value="');
					menuPageHtml.push(menuName);
					menuPageHtml.push('"><a class="save_page glyphicon glyphicon-pencil" href="javascript:;" title="保存到我的模板"></a></div><ul></ul></li>');
					menuPageHtml = menuPageHtml.join("");
					$(".wx-page").find(".wx-menu-list").append(menuPageHtml);
				} else {
					$(".wx-menu-list").find("li[pageid =" + selectMenuPageId + "]>div>span").text(menuName);
				}
			} else {
				var childrenMenuPageHtml = [], seletChildrenMenuPageId = $selectMenu.attr("pageid"), thisParentsPageId = $selectMenu.parents(".firstMenu").attr("pageid");
				if (!objIsnull($(".wx-menu-list").find("li[pageid =" + seletChildrenMenuPageId + "]"))) {
					childrenMenuPageHtml.push('<li class="page-common page-secmenu"  pageid="');
					childrenMenuPageHtml.push(seletChildrenMenuPageId);
					childrenMenuPageHtml.push('" formid="');
					childrenMenuPageHtml.push($selectMenu.attr("formid"));
					childrenMenuPageHtml.push('"><span class="custom_page_name">');
					childrenMenuPageHtml.push(menuName);
					childrenMenuPageHtml.push('</span><input class="form-control input-sm pageMenu" type="text" placeholder="输入页面名称" style="display: none;" value="');
					childrenMenuPageHtml.push(menuName);
					childrenMenuPageHtml.push('"><a class="save_page glyphicon glyphicon-pencil" href="javascript:;" title="保存到我的模板"></a></li>');
					childrenMenuPageHtml = childrenMenuPageHtml.join('');
					$(".wx-page").find(".wx-menu-list > li[pageid=" + thisParentsPageId + "] >ul").append(childrenMenuPageHtml);
				} else {
					$(".wx-menu-list").find("li[pageid =" + seletChildrenMenuPageId + "]").find(".custom_page_name").text(menuName);
				}
			}
		},

		savePageName : function($this) {
			var title = $this.parent().find(".custom_page_name").text();
			var pageId = $this.parents(".page-common").attr("pageid"), formId = $this.parents(".page-common").attr("formid");
			var OBJ = $("#" + pageId).clone().wrap("<div />");
			if ( typeof (OBJ) != undefined) {
				if ($("#saveTplModal").length > 0) {
					$("#saveTplModalInput").val(title);
				} else {
					var $saveTplModal = $('<div class="modal fade" id="saveTplModal" ><div class="modal-dialog bs-example-modal-sm" style="width:400px;" ><div class="modal-content"><div class="modal-body">模板保存名称：<input type="text" class="form-control" name="saveTplModalInput" id="saveTplModalInput" value =' + title + ' />      </div>      <div class="modal-footer">        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary saveTplModalBtn">保存</button></div></div></div></div>');
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
							alert("页面没打开或者页面没有内容，不能保存！请打开页面重试");
						} else {

							$.ajax({
								url : SITECONFIG.APPPATH + "/Editor/saveTplForUse",
								type : "POST",
								data : {
									"page" : id,
									"jsonData" : formId,
									"siteId" : SITECONFIG.SITEID,
									"content" : htmls,
									"title" : $("#saveTplModalInput").val(),
								},
								success : function(r) {
									//console.log(r["status"] == "success"); 成功保存模板
								}
							});
						}
						$("#saveTplModal").modal("hide");
					} else {
						alert("模板保存名称不能为空");
					}
				});

				return false;
			} else {
			}
		},

		/**
		 * 修改页面的名字
		 *
		 */
		editPageName : function($this) {
			//	$(this)=$this;
			//当前的li
			var parentObj = $this.parent("li:first");
			var ico = '<a class="edit_pageName glyphicon glyphicon-pencil" href="javascript:;" title="修改标题"></a><a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;" title="保存到我的模板"></a><a class="delete_page glyphicon glyphicon-trash" href="javascript:;" title="删除"></a>';
			parentObj.addClass("edit-name");

			parentObj.find(".input-group-addon").unbind("click").on("click", function() {
				var newValue = parentObj.find("input").val();
				if (newValue == "") {
					parentObj.find("input").css("border", "1px red solid");
				} else {
					if (newValue != parentObj.find(".custom_page_name").text()) {
						parentObj.find(".custom_page_name").text(newValue);
						if (parentObj.parent().hasClass("link-menu-list")) {
							var parentMenu = "pageMgr";
						} else {
							var parentMenu = "pageManage";
						}
						//更新菜单json
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.updatePageMenuJson(parentMenu, parentObj.attr("pageid"), newValue);
						});
						//更新数字字典表中的表
						ajaxData.updateTableName(newValue, parentObj.attr("formid"));
					}
				}
				parentObj.removeClass("edit-name");
			});
		},

		/**
		 * 切换页面显示模板或者加载模板(左侧页面菜单点击事件)
		 * by cc bycc
		 */
		onClickManagePage : function($this) {
			//显示头部复制粘贴
			$(".tool-menu").show();
			$("#formPreView").show();
			$("#myWeb .wxqyPage").hide().find("form").removeClass("selectedForm");
			var parentObj = $this.closest(".page-common"), pageId = parentObj.attr('pageid'), formId = parentObj.attr('formId'), name = $this.text(), $myWeb = $("#myWeb"), $content = $myWeb.find("#" + pageId);

			if (!formId || formId == "undefined") {
				alert("此创建的页面无效,请重新创建!");
				$(".page-close").click();
				$("#wxMenu").find("[pageid=" + pageId + "]").click();
			} else {
				ezCommon.formId = parentObj.attr('formid');
				if ($content.length <= 0) {
					$content = $(ajaxData.getPageContent(SITECONFIG.SITEID, pageId));
					$myWeb.append($content);
					//获取表单JSON
					ajaxData.getFormJsonData(formId);
					$content.find("form").addClass("selectedForm");
					//初始化栈 对象（撤销恢复处用到）
					var pageLogo = $(".selectedForm").parent().attr("id");
					ezCommon.pageIdURdo[pageLogo] = new Undo.Stack();
					ezCommon.undoEvent(pageLogo);
				}
				if (!$content.find("form").hasClass("selectedForm")) {
					$content.find("form").addClass("selectedForm");
				}

				$("#control-lib").click();

				generalForm();

				ctrlInit(pageId);

				//控件在鼠标移入时，显示拖动手柄
				ezCommon.ctrlMouseOver();

				//设置页面顶部或底部的导航菜单
				require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.js", function() {
					require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.css");
					ezCommon.setNav();
				});

				inputPanelClick($content, $("#" + pageId));
			}

			/**
			 * 解释以下代码  首选要关闭一些和打开一些  尤为重要的是去掉控件选中类
			 * 增加新页面的首个控件选中 然后解析属性的时候就能通过ctrlSelected 来找到唯一的选中 修复时间07-08
			 **/
			function generalForm() {
				$(".pageTopTitle").text(name);
				$("#appInitPage,#wxMenu,#setWXMenu").hide();
				//关闭页面的叉叉
				$(".page-close").show();
				$myWeb.find(".wxqyPage").hide();
				$myWeb.show();
				$content.show();
				ezCommon.deBug("初始化定位栏可拖动", "pageManage", 309);
				colBoxDraggable();
				ezCommon.deBug("初始化控件可排序", "ctrlEvent", 312);
				formSortable();
				//定位栏中拖入控件事件
				compLogic.allColInnerSortAble();
				$("#control-lib").click();

			}

		},

		/**
		 * 删除后台管理或者链接页面
		 */
		delPage : function($this) {
			var parentObj = $this.parent(), pageId = parentObj.attr('pageid'), name = parentObj.find(".custom_page_name").text(), formId = parentObj.attr("formid");

			if (confirm("确定删除页面: " + name)) {
				ajaxData.deleteForm(formId, pageId);
				if (parentObj.parent().hasClass("link-menu-list")) {
					var parentMenu = "pageMgr";
				} else {
					var parentMenu = "pageManage";
				}
				//删除json节点
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.delPageMenuJson(parentMenu, pageId);
				});
				//保存json
				ezCommon.pageMenuJson['pageMenu'] = ezCommon.menuJson;
				var content = ezCommon.pageMenuJson;
				var data = {
					"page" : "config",
					'content' : JSON.stringify(content),
					"siteId" : SITECONFIG.SITEID
				};
				//var result = ajaxData.saveMenuJson(data);

				//if (result) {
				parentObj.remove();
				$(".page-close").click();
				//}
			}
		},

		/**
		 * 当微信菜单设置小面板中，“设计页面”选项被单击时
		 */
		onEditPageClick : function() {
			var selectedPageId = $(".selectMenu").attr("pageid");
			historyname = $("#setWxMenuName").attr("historyName");
			$(".page-close").show();
			$(".phoneMod-title-vLline").show();
			$(".pageTop-title").removeClass("pageTop-title ");
			var thisFormId = $(".wx-menu-list").find("[pageid=" + selectedPageId + "]").attr("formid");
			$("#set-ctrl-basic").click();
			//新建页面时,form 的 id空,可据此判断是新建页面,还是切换已有页面
			if (!thisFormId || thisFormId == "undefined") {//为空的时候

				//从右侧滑出'页面模板选择面板'
				var ptlHeight = $(window).height();
				$("#theMaskLayer").fadeIn(500);
				$("#pageTplLib").height(ptlHeight).animate({
					width : "950"
				}, 250, function() {
					if (!pageTplListCache) {
						pageTplListCache = ajaxData.getLayoutTplList(2);
						var $li_sys = "";
						$.each(pageTplListCache, function(i, v) {
							$li_sys += '<li class="pageTplItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.ROOTPATH + '/' + v.imgurl + '"/><p>' + v.title + '</p></li>';
						});
						$(".sysPtlList #now").append($li_sys);
					} else if (pageTplListCache && $(".pageTplItem").length <= 0) {
						var $li_sys = "";
						$.each(pageTplListCache, function(i, v) {
							$li_sys += '<li class="pageTplItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.ROOTPATH + '/' + v.imgurl + '"/><p>' + v.title + '</p></li>';
						});
						$(".sysPtlList #now").append($li_sys);
					}
					$(".sysPtlList .nowTemp").removeClass("nowTemp");
					$(".sysPtlList #now").addClass("nowTemp");
					if (!myTemplateCache) {
						myTemplateCache = ajaxData.getMyTempList();
					}
					if (myTemplateCache) {
						var html = "";
						$.each(myTemplateCache, function(i, v) {
							html += '<li class="pageTplItem" tempid="' + v["ID"] + '"><img src="' + SITECONFIG.ROOTPATH + '/public/App/Qywx/Images/blanktemp.png"><p>' + v.title + '</p></li>';
						});
						$("#myTemplate").empty().append(html);

					}

					$("#pageTplLib .nowMenu").removeClass("nowMenu");
					$("#pageTplLib #sysPtlList").addClass("nowMenu");
					$(".sysPtlList #now").show();
					$(".sysPtlList #template,.sysPtlList #myTemplate").hide();
					$(".ptlMenu,.pageTplListWrap").fadeIn(300);
				});
				//切换页面
			} else {

				$("#appInitPage").hide();
				//关闭页面的叉叉
				$(".page-close").show();
				$("#myWeb").show();
				var $selectMenu = $("#wxMenu").find(".selectMenu"), nodeName = "";
				var $leftMenuPage = $(".wx-menu-list").find("[pageid=" + selectedPageId + "]");
				var leftMenuFormId = $leftMenuPage.attr("formid");

				$("#setWXMenu,#wxMenu").hide();
				changePage($selectMenu);

				if ($selectMenu.hasClass("firstMenu")) {
					nodeName = $selectMenu.find(".firstMenuName").text();
				} else if ($selectMenu.hasClass("nodeMenu")) {
					nodeName = $selectMenu.find(".nodeMenuName").text();
				}
				$("#container").find(".pageTopTitle").text(nodeName);
				//判断如果右边菜单的fomrid为空则加上fomrid
				if (leftMenuFormId == "" || leftMenuFormId == "undefined") {
					$leftMenuPage.attr("formid", $("#" + selectedPageId).find("form").attr("id"));
				}
				//显示头部复制粘贴
				$(".tool-menu").show();
				$("#formPreView").show();
				$(".main").find(".mainTop").click();

			}
			//$(".pageTopTitle").text(historyname);
			$("#myWeb .selectedForm").css({
				"min-height" : 390
			});
			$("#myWeb .selectedForm").parent(".wxqyPage").css({
				height : "100%"
			});
			var $editLayer = $("#myWeb").find(".selectedForm .editor-layer-switch");
			var $layer = $("#myWeb").find(".selectedForm .layer-switch");
			if ($editLayer.length) {
				$editLayer.find(".vgPage").removeClass("pageFigureSelect").hide();
				$editLayer.find(".vgPage:first").addClass("pageFigureSelect").show().css({
					"min-height" : "390px",
					"height" : "100%"
				});
			}
			if ($layer.length) {
				$layer.find(".vgPage").removeClass("pageFigureSelect").hide();
				$layer.find(".vgPage:first").addClass("pageFigureSelect").show().css({
					"min-height" : "390px",
					"height" : "100%"
				});
			}
		},

		/**
		 * 当微信菜单被删除时
		 */
		onWxMenuDeleted : function() {
			$(".closePanel").click();
			var $that = $(this);
			var menuJson = ezCommon.menuJson;
			if (!$that.hasClass("disabled-item")) {
				if (confirm("是否删除当前菜单,及所有关联的页面?")) {
					var $selectMenu = $("#wxMenu").find(".selectMenu"), nodeMenu = 0;
					var pageId = $selectMenu.attr("pageid");

					if ($selectMenu.hasClass("firstMenu")) {
						nodeMenu = 1;
						$selectMenu.find(".firstMenuName").empty();
						$selectMenu.find(".addSubMenuBtn").remove();
						$selectMenu.find(".new_subMenuWrap").hide();
					} else if ($selectMenu.hasClass("nodeMenu")) {
						nodeMenu = 2;
						$selectMenu.parents(".firstMenu").find(".addSubMenuBtn:first").remove();
						//$selectMenu.addClass("addSubMenuBtn").removeAttr("pageId");
						$selectMenu.find(".nodeMenuName").empty();
					}
					deleteData($selectMenu, nodeMenu);
					$("#setWxMenuName").val("").attr("historyName", "");
					$selectMenu.removeClass("edited");
					$selectMenu.removeClass("selectMenu");
					//删除菜单json

					//删除左边对应微信菜单
					$(".wx-menu-list").find("li[pageid =" + pageId + "]").remove();
					$("#pageMenuList").find(".child_content").empty();
				}
			}
			//var menuJson = ajaxData.getPageContent(SITECONFIG.SITEID, "qyConfig");

			$.each(menuJson, function(key, val) {
				var $addpage = $('<div class="pageMenuGather row"><div class="pageList fatherPageMenu"><span class="custom_page_name"></span></div></div>');
				$("#pageMenuList").find(".child_content").append($addpage);
				$addpage.find(".custom_page_name").text(decodeURIComponent(val["menuName"])).show();
				//	pageMenuIconEvent($addpage.find(".fatherPageMenu"));
				for (var c in val["subMenu"]) {
					var $childMenu = $("<div class='pageList childPageMenu'><span class='custom_page_name custom_child_page_name'>" + decodeURIComponent(val['subMenu'][c]['menuName']) + "</span></div>");
					$addpage.append($childMenu);
					$addpage.find($childMenu).attr({
						"pageId" : c,
						"formId" : val["subMenu"][c]["formId"]
					});
					//	pageMenuIconEvent($childMenu);
				}
				$addpage.find(".fatherPageMenu").attr({
					"pageId" : key,
					"formId" : val["formId"]
				});
			});
		},

		/**
		 * 页面模板在被单击时 （微信菜单页面）cy
		 */
		onPageTplClick : function($this, type) {
			var tempId = $this.attr("tempId");
			$(".ptlMenu,.pageTplListWrap").fadeOut(250, function() {
				$("#pageTplLib").animate({
					width : "0"
				}, 250);
			});
			$("#theMaskLayer").fadeOut(500);
			var pageContentStr = ajaxData.getPageTplContent(tempId, type);
			var $selectWxMenu = $("#wxMenu").find(".selectMenu"), nodeName = "", id = $selectWxMenu.attr("pageid");
			if ($selectWxMenu.hasClass("firstMenu")) {
				nodeName = $selectWxMenu.find(".firstMenuName").text();
			} else if ($selectWxMenu.hasClass("nodeMenu")) {
				nodeName = $selectWxMenu.find(".nodeMenuName").text();
			}
			var formTitle = "";
			//菜单级
			if ($selectWxMenu.hasClass("firstMenu")) {
				formTitle = $selectWxMenu.find(".firstMenuName").text();
			} else {
				formTitle = $selectWxMenu.find(".nodeMenuName").text();
			}
			var formId = createForm(id, formTitle);
			if (type == 1) {
				var $pageContent = $(pageContentStr["content"]);
				var jsonData = JSON.parse(pageContentStr['jsonData']);
				var ctrlList = jsonData["tabs"]["tab1"]["ctrlList"];
				ezCommon.controlLists[ezCommon.formId] = jsonData["controlLists"];
				ezCommon.ctrlNameNum[ezCommon.formId] = jsonData["ctrlIndex"];
			} else {
				var $pageContent = $(pageContentStr);
			}

			$pageContent.attr("id", id);
			$(".page-total").find(".page-common[pageid=" + id + "]").attr("formid", formId);
			$pageContent.find("form:first").attr("id", formId);
			$("#myWeb").append($pageContent);
			formSortable();
			$("#appInitPage").hide();
			$("#myWeb").show();
			$("#setWXMenu,#wxMenu").hide();

			$("#container .pageTopTitle").text(nodeName);

			var nodeMenu = 1;
			if ($selectWxMenu.find(".firstMenuName").size() <= 0) {
				nodeMenu = 2;
			}

			var menuName = $selectWxMenu.find("p").html();

			
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.writeJson(nodeMenu, $selectWxMenu, menuName, formId);
				});
			

			$("#control-lib").click();
			//初始化栈 对象（撤销恢复处用到）
			var pageLogo = $(".selectedForm").parent().attr("id");
			ezCommon.pageIdURdo[pageLogo] = new Undo.Stack();
			ezCommon.undoEvent(pageLogo);
		},

		//切换模板列表
		switchTemplateList : function(id) {
			if (id == "myPtlList") {
				$("#myPtlList").addClass("nowMenu");
				$("#sysPtlList").removeClass("nowMenu");

				$("#template,#now").hide();
				$("#myTemplate").show();
			} else {
				$("#sysPtlList").addClass("nowMenu");
				$("#myPtlList").removeClass("nowMenu");
				$(".nowTemp").show();
				$("#myTemplate").hide();
			}
		},
		/**
		 * 单个页面保存
		 */
		pageSave : function(pageId, siteId, content) {
			//保存时让form中的submit_tipWrap隐藏;
			$("form").find(".submit_tipWrap").hide();
			var bool = false;
			$.ajax({
				type : "POST",
				url : SITECONFIG.GROUPPATH + "/Editor/savePage",
				data : {
					siteId : siteId,
				},
				async : false,
				success : function(result) {
					if (result) {
						bool = true;
					}
				}
			});
			return bool;
		},

		/**
		 * 开放表单可拖入排序接口
		 */
		makeFormSortable : function() {
			formSortable();
		},

		/**
		 * @desc 关闭页面
		 * @author 黄俊
		 * date 2015-6-30
		 */
		closePage : function() {
			var $myWeb = $("#myWeb"), $pageTopTitle = $(".mainTop").find(".pageTopTitle"), $wxqyPage = $myWeb.find(".wxqyPage");
			$wxMenu = $("#wxMenu");
			$pageTopTitle.addClass("pageTop-title ");
			$myWeb.hide().css("background", "");
			$(".phoneMod-title-vLline").hide();
			$pageTopTitle.text(SITECONFIG.SITENAME);

			$("#appInitPage").show();
			var id = $wxMenu.find(".selectMenu").attr("pageId"), $currentPage = $("#" + id);
			$currentPage.hide();
			$wxMenu.show().find("[pageId='" + id + "']").removeClass("selectMenu");
			$myWeb.find(".selectedForm").removeClass("selectedForm");
			//$wxqyPage.hide();
			$(".inputPanel", $currentPage).css("right", "-100%");
			$(".left-menu-list .page-manage").click();
		},

		/**
		 * 从右边点添加按钮 新增页面事件
		 */
		addNewPage : function($this) {
            $(".closePanel").click();			
			$("#pageModal").find("#newPageName").val("");
			$("#pageModal").modal("show");
			var newPageName = "", addWhere = $this.closest("li").attr("class");
			$(".pageNameSaveBtn").unbind("click").on("click", function() {//模态框确定按钮事件
				if ($.trim($("#newPageName").val()) == "") {
					$(".addNewPageTip").show();
					$("#newPageName").on("focus", function() {
						$(".addNewPageTip").hide();
					});
				} else {
					newPageName = $.trim($("#newPageName").val());
					$("#pageModal").modal("hide");
					if (!pageTplListCache) {
						pageTplListCache = ajaxData.getLayoutTplList(2);
						var $li_sys = "";
						$.each(pageTplListCache, function(i, v) {
							$li_sys += '<li class="managePageTplItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.ROOTPATH + '/' + v.imgurl + '"/><p>' + v.title + '</p><div class = "pageTplMask"></div></li>';
							$(".sysPtlList #template").empty().append($li_sys);
						});

					} else if (pageTplListCache && $(".managePageTplItem").length <= 0) {
						var $li_sys = "";
						$.each(pageTplListCache, function(i, v) {
							$li_sys += '<li class="managePageTplItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.ROOTPATH + '/' + v.imgurl + '"/><p>' + v.title + '</p></li>';
							$(".sysPtlList #template").empty().append($li_sys);
						});
					}

					if (!myTemplateCache) {
						myTemplateCache = ajaxData.getMyTempList();
					}
					if (myTemplateCache) {
						var html = "";
						$.each(myTemplateCache, function(i, v) {
							html += '<li class="myPageTplItem" tempid="' + v["ID"] + '"><img src="' + SITECONFIG.ROOTPATH + '/public/App/Qywx/Images/blanktemp.png"><p>' + v.title + '</p></li>';
						});
						$("#myTemplate").empty().append(html);
					}

					$("#pageTplLib .nowMenu").removeClass("nowMenu");
					$("#pageTplLib #sysPtlList").addClass("nowMenu");
					$(".sysPtlList .nowTemp").removeClass("nowTemp");
					$(".sysPtlList #template").addClass("nowTemp").show();
					$(".sysPtlList #myTemplate").hide();
					var ptlHeight = $(window).height();
					$("#theMaskLayer").fadeIn(500);
					$("#pageTplLib").height(ptlHeight).animate({
						width : "950"
					}, 500, function() {
						$(".ptlMenu,.pageTplListWrap").fadeIn(300);
					});
					$("#now").hide();
					$("#template").show();
					$("#pageTplLib").find("li.managePageTplItem,li.myPageTplItem").unbind("click").on("click", function() {
						if ($(this).parent().attr("id") == "myTemplate") {
							var type = 1;
						} else {
							var type = 0;
						}
						onPageTplClick2($(this), addWhere, newPageName, type);
						$(".main").find(".mainTop").click();
						$("#theMaskLayer").fadeOut(500);

					});
					//阻止模板遮罩被点击时，冒泡到Li上，重复触发创建页面事件
					$("#pageTplLib").find("li.managePageTplItem .pageTplMask").unbind("click").on("click", function(e) {
						e.stopPropagation();
					});
					$("#pageTplLib").show();
				}
				$("#myWeb .wxqyPage").hide().find("form").removeClass("selectedForm");
				//去掉selectedForm 类 hj
			});
		}
	};

	/**
	 * 表单中拖入控件事件
	 */
	function formSortable() {
		//撤销恢复需要用到的参数st
		var oldNextId = "";
		var colInnerObj = "";
		var colInnerType = "";
		var newColInnerObj = "";
		var newColInnerType = "";
		//撤销恢复需要用到的参数ed
		//
		$(".delMainTop").sortable({
			placeholder : "ui-state-highlight",
			helper : function(e, ui) {
				return;
			}
		});

		$(".topNavWraper, .selectedForm, .bottomNavWraper").sortable({
			distance : "10",
			placeholder : "ui-state-highlight",
			connectWith : ".colInner,.delMainTop",
			tolerance : "pointer",
			cursor : "crosshair",
			scroll : true,
			scrollSensitivityType : 30,
			scrollSpeedType : 40,
			//handle : ".dyna-handle",
			axis : "y",
			start : function(e, ui) {
				var $dragger = ui.item;
				// var typeLogo = $dragger[0].tagName;
				// if (typeLogo == "DIV") {
					// $(".delMainTop").show();
					// $(".realMaintop").hide();
				// }
				ezCommon.setCtrlSelected($dragger);
				//撤销恢复需要用到的st
				//父级元素的id 以及后一个控件的id
				if ($dragger.parent().hasClass("colInner")) {
					var colunmID = $dragger.parent(".colInner").attr("columnidx");
					if (colunmID) {
						colInnerObj = colunmID;
						colInnerType = "column";
					} else {
						colInnerObj = $dragger.parent(".colInner");
						colInnerType = "colbox";
					}
				}
				var $nextCtrl = $dragger.next().next();
				if ($nextCtrl.length) {
					oldNextId = $nextCtrl.attr("ctrlId");
				}
				//撤销恢复需要用到的ed
				//$(".selectedForm").find(".ui-state-highlight").text("放到这里");

			},
			helper : function(e, ui) {
				if (ui.attr("ctrl-type") == "COLUMN") {
					return '<div class = "sortIng_helper" style = "width:360px;height:55px;"> 分栏 </div>';
				} else if (ui.attr("ctrl-type") == "IMAGEBOX") {
					return '<div class = "sortIng_helper" style = "width:360px;height:55px;"> 图片展示 </div>';
				} else if (ui.attr("ctrl-type") == "COLBOX") {
					return '<div class = "sortIng_helper" style = "width:360px;height:55px;"> 定位栏 </div>';
				} else {
					var sortTitle = ui.find(".fieldTitle").html();
					if (!sortTitle) {
						return '<div class = "sortIng_helper" style = "width:360px;height:55px;"></div>';
					} else {
						return '<div class = "sortIng_helper" style = "width:360px;height:55px;">' + sortTitle + '</div>';
					}
				}
			},
			sort : function(e, ui) {
			},
			over : function(e, ui) {
			},
			stop : function(e, ui) {
				var $this = ui.item;
				var isSorting = $this.hasClass("ctrl");
				$this.css("display", "");
				//标识是否已修改了JSON，以判断是否需要保存当前页面
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});

				//撤销恢复需要用到的st
				//父级元素的id 以及后一个控件的id
				if ($this.parent().hasClass("colInner")) {
					var colunmID = $this.parent(".colInner").attr("columnidx");
					if (colunmID) {
						newColInnerObj = colunmID;
						newColInnerType = "column";
					} else {
						newColInnerObj = $this.parent(".colInner");
						newColInnerType = "colbox";
					}
				}
				var newNextId = ui.item.next().attr("ctrlId");
				var sortParentLogoId = $(".selectedForm").parent().attr("id");
				//如果是控件排序，则不需要执行添加的逻辑
				if (isSorting) {
					if ($this.parent().hasClass("delMainTop")) {
						var deleteId = $this.attr("ctrlId");
						$this.remove();
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
							e.deleteCtrlJson(deleteId);
						});
						$(".right-menu").hide();
						if ($this.attr("ctrl-type") != 'systemCp' && $this.attr("ctrl-type") != 'compLogic') {
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.deleteCtrlUndo(colInnerType, colInnerObj, $this, oldNextId, sortParentLogoId);
							});
						}
					} else {
						if ($this.attr("ctrl-type") != 'systemCp' && $this.attr("ctrl-type") != 'compLogic') {
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/undoRedo.js", function(e) {
								e.sortableUndo(colInnerType, colInnerObj, newColInnerType, newColInnerObj, $this, newNextId, oldNextId, sortParentLogoId);
							});
						}
					}
					$(".realMaintop").show();
					$(".delMainTop").hide();
					return;
				}

				//撤销恢复需要用到的ed
				//拖动添加控件
				var ctrlType = $this.attr("ctrl-type"), isComponent = $this.hasClass("sys-comp");

				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controler.js", function(e) {
					if (isComponent) {
						// 判断是否为第三方插件
						if ($this.hasClass("thirdpartyPlugin")) {
							e.loadThirdpartyComponent(ctrlType, $this);
						} else {
							e.loadComponent(ctrlType, $this);
						}
					} else {
						e.loadCtrls(ctrlType, $this);
					}
				});
			}
		});
	}

	/**
	 * 定位栏可拖动
	 */
	function colBoxDraggable() {
		$('.ctrl[ctrl-type="COLBOX"]').draggable({
			containment : "parent",
			zIndex : 9999,
			start : function(e, ui) {
				ezCommon.setCtrlSelected($(this));
			}
		});
		$('[fixedTop="true"]').draggable("disable");
		$('[fixedBottom="true"]').draggable("disable");
		$('[fixedBottom="true"]').css("opacity", "1");

	}

	/**
	 * 删除微信菜单时,删除相关json数据(从formJson.js移来)
	 */
	function deleteData($selectMenu, nodeMenu) {
		var pageId = $selectMenu.attr("pageId"), formId = $(".wx-menu-list").find("[pageId='" + pageId + "']").attr("formid");
		if (pageId) {
			if (nodeMenu == 1) {
				$selectMenu.addClass("toEditMain").removeAttr("pageId");
				delete ezCommon.menuJson[pageId];
			} else {
				var parentId = $selectMenu.parents(".firstMenu").attr("pageId"), childrenJson = ezCommon.menuJson[parentId]["subMenu"][pageId];
				delete ezCommon.menuJson[parentId]["subMenu"][pageId];
			}
			$("#" + pageId).remove();
			if (formId) {
				ajaxData.deleteForm(formId, pageId);
			}
			if (nodeMenu == 2) {
				$selectMenu.parents(".firstMenu").click();
				$("#setWXMenu").hide();
			}
		}
	}

	/**
	 * 初始化微信菜单设置面板
	 * @param	nodeMenu	int		1为一级菜单,2为二级菜单
	 */
	function _initPanel(nodeMenu, obj) {
		$(".closePanel").click();
		var position = obj.offset();
		var left = position["left"], top = position["top"], index = obj.index();
		$("#setWXMenu").css({
			"left" : left + obj.width() + 15,
			"top" : top - obj.height() / 2 - 5
		}).show();
		$("#setWxMenuName").val("").attr("historyname", "").focus();
		var pageId = obj.attr("pageId");

		if (!pageId)
			var menuName = "", sendInfo = "", menuObj;
		if (nodeMenu == 1) {
			menuObj = ezCommon.menuJson[pageId];

			if (menuObj) {
				menuName = menuObj["menuName"];
				sendInfo = menuObj["sendInfo"];
			}

		} else {
			var parentId = obj.parents(".firstMenu").attr("pageId");
			if (parentId) {
				menuObj = ezCommon.menuJson[parentId]["subMenu"][pageId];
				if (menuObj) {
					menuName = menuObj["menuName"];
					sendInfo = menuObj["sendInfo"];
				}
			} else {

			}

		}
		$("#setWxMenuName").val(html_decode(decodeURIComponent(menuName))).attr("historyName", html_decode(decodeURIComponent(menuName))).focus();

	};

	/**
	 * 呈现子菜单
	 */
	function _showSubMenu(obj) {
		var $subMenuWrap = obj.find(".new_subMenuWrap");
		$subMenuWrap.show();
		var pageId = obj.attr("pageId");
		var subMenu = ezCommon.menuJson[pageId]["subMenu"];
		var $ulObj = $subMenuWrap.find("ul"), h = '<li class = "nodeMenu addSubMenuBtn"><p class = "nodeMenuName"></p></li>', num = 0;
		$ulObj.empty();
		$.each(subMenu, function(item, val) {
			var menuHtml = '<li class="nodeMenu edited" pageid="' + item + '"><p class="nodeMenuName">' + decodeURIComponent(val["menuName"]) + '</p></li>';
			if (num == 0)
				$ulObj.append(menuHtml);
			else
				$ulObj.find("li.nodeMenu:first").before(menuHtml);
			num++;
		});
		if (num != 0) {
			if ($ulObj.find("li.nodeMenu").size() < 5)
				$ulObj.find("li.nodeMenu:first").before(h);
		} else {
			$ulObj.empty().append(h);
		}
	};

	/**
	 * 左侧页面列表项后面的小图标事件
	 * 这里注释是因为事件写到editorEvent.js文件中， 但很多地方都调用了本方法， 目前不知道对其他地方有什么影响，所以没有删除
	 */
	/*function pageMenuIconEvent($parObj) {
	var $savePageToTpl = $('<a href="javascript:;" class="save_page" title="保存到我的模板"></a>');
	$parObj.append($savePageToTpl);
	$(".save_page").click(function(e) {
	var title = $(this).parent().find(".custom_page_name").text(), $this = ($this);
	var pageId = $(this).closest(".pageList").attr("pageid"), formId = $(this).closest(".pageList").attr("formid");
	var OBJ = $("#" + pageId).clone().wrap("<div />");
	if ( typeof (OBJ) != undefined) {
	if ($("#saveTplModal").length > 0) {
	$("#saveTplModalInput").val(title);
	} else {
	var $saveTplModal = $('<div class="modal fade" id="saveTplModal" ><div class="modal-dialog bs-example-modal-sm" style="width:400px;" ><div class="modal-content"><div class="modal-body">模板保存名称：<input type="text" class="form-control" name="saveTplModalInput" id="saveTplModalInput" value =' + title + ' />      </div>      <div class="modal-footer">        <button type="button" class="btn btn-default" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary saveTplModalBtn">保存</button></div></div></div></div>');
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
	url : APPPATH + "/Qywx/Editor/saveTplForUse",
	type : "POST",
	data : {
	"page" : id,
	"jsonData" : formId,
	"siteId" : SITEID,
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
	} else {
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
	}  */

	/**
	 * 当微信菜单设置小面板关闭时
	 */
	function onWxMenuSetPanelClose() {
		var selectMenu = $("#wxMenu").find(".selectMenu"), historyName = $("#setWxMenuName").attr("historyName"), formId = 0;
		if (selectMenu.hasClass("firstMenu")) {
			var selectMenuName = selectMenu.find(".firstMenuName");
			var pageId = selectMenu.attr("pageId");
			if (historyName != "" && selectMenuName.text() == "") {
				selectMenuName.text(historyName);
				ezCommon.menuJson[pageId]["menuName"] = historyName;
			}
			formId = ezCommon.menuJson[pageId] ? ezCommon.menuJson[pageId]["formId"] : 0;
		} else if (selectMenu.hasClass("nodeMenu")) {
			var selectMenuName = selectMenu.find(".nodeMenuName");
			var pageId = selectMenu.attr("pageId"), parentId = selectMenu.parents(".firstMenu").attr("pageId");
			if (historyName != "" && selectMenuName.text() == "") {
				selectMenuName.text(historyName);
				ezCommon.menuJson[parentId]["subMenu"][pageId]["menuName"] = historyName;
			}
			formId = ezCommon.menuJson[parentId]["subMenu"][pageId] ? ezCommon.menuJson[parentId]["subMenu"][pageId]["formId"] : 0;
		}
		//修改菜单名同时更新表单名
		var menuName = $("#setWxMenuName").val();
		$("#pageMenuList").find("div[pageid='" + pageId + "']").find(".custom_page_name").text(menuName);
		if (historyName != menuName && menuName != "" && formId && !$("#setWXMenu").is(":hidden")) {
			var data = {};
			data["form_id"] = formId, data["form_title"] = menuName;
			$.ajax({
				type : "POST",
				url : SITECONFIG.ROOTPATH + "/FormData/updateFormName",
				data : data,
				success : function(result) {
				}
			});
		}
		$("#setWXMenu").hide();
	}

	/**
	 * 导入微信菜单页面模板时
	 */
	function importWxPageTpl() {
		$("#designAddNewPages").modal("show");
		var len = $(".firstMenu .new_subMenuWrap ul").find("li").length;
		$.ajax({
			type : "POST",
			url : SITECONFIG.ROOTPATH + "/FormData/getWxTpl",
			data : {
				siteId : SITECONFIG.SITEID
			},
			async : false,
			success : function(r) {

				if (r && r != "null") {

					var $li_my = "", $li_sys = "";
					r = JSON.parse(r);

					$.each(r, function(i, v) {

						if (v.type == 0) {
							$li_my += '<li class="myTemp ctrl-element" dataId="' + v.ID + '" tplID="' + v.name + '" ctrl-type="compLogic" pagename="" data-type="mycomp" original="yes"><span class="myPagesTemp"><button class="btn btn-default btn-lg" type="button" style="font-size:12px;">' + v.title + '</button></span></li>';
						} else {
							$li_sys += '<li class="myTemp ctrl-element"  dataId="' + v.ID + '" sytle="margin-right:10px; " tplID="' + v.name + '" ctrl-type="compLogic" pagename="" data-type="mycomp" original="yes"><span class="sysPagesTemp">' + v.title + '</span></li>';
						}
					});
					$("#designAddNewPages .myPages  ul").empty().append($li_my);
					$("#designAddNewPages .sysPages ul").empty().append($li_sys);
					$("#designAddNewPages ul button").unbind("click").click(function() {
						$("#designAddNewPages button").removeClass("btn-primary").addClass("btn-default");
						$(this).addClass("btn-primary");
					});

					$("#designAddNewPages .saveNewPages").unbind("click").on("click", function(e) {

						e.stopPropagation();
						if ($("#designAddNewPages button.btn-primary").length > 0) {

							var selectObj = $("#designAddNewPages button.btn-primary"), tplid = selectObj.closest("li").attr("tplid"), dataId = selectObj.closest("li").attr("dataId");

							var title = $.trim(selectObj.text());
							var $pageContent = null;
							var jsonData = null;
							var $submenuWrap = null;

							//获取已经
							$.ajax({
								type : "POST",
								url : SITECONFIG.ROOTPATH + "/FormData/getWxTplData",
								data : {
									"dataId" : dataId,
									"name" : tplid
								},
								async : false,
								dataType : "json",
								success : function(re) {

									if (re) {
										var pageid = numRand();

										var $selectMenu = $("#wxMenu").find(".selectMenu");

										var firstParagraph = $(".firstMenu  p:first").text();
										var nodeMenu = null;
										title = getLength(title, 4);
										$selectMenu.addClass("edited");
										if (len > 1 || len == 1) {
											if (firstParagraph) {
												nodeMenu = 2;
												$submenuWrap = $selectMenu.parents(".new_subMenuWrap");

												$selectMenu.removeClass("toEditMain");
												$selectMenu.attr("pageId", pageid);
												$selectMenu.removeClass("addSubMenuBtn");
												var nameWrap = $selectMenu.find(".nodeMenuName");
												nameWrap.text(title);
												_initPanel(2, $selectMenu);
												_writeJson(2, $selectMenu, title);
											}
										} else {
											nodeMenu = 1;
											$submenuWrap = $selectMenu.find(".new_subMenuWrap");
											$selectMenu.removeClass("toEditMain");
											$(".addSubMenuBtn").show();
											$selectMenu.attr("pageId", pageid);
											$selectMenu.removeClass("toEditMain");
											var nameWrap = $selectMenu.find(".firstMenuName");
											nameWrap.text(title);
											_initPanel(1, $selectMenu);
											_writeJson(1, $selectMenu, title);
										}

										if (!$("#setWXMenu").is(":hidden")) {
											$(".closePanel").click();
										}

										$pageContent = $(re.pageContent).find(".myForm").html();
										jsonData = JSON.parse(re["jsonData"]);

										var $pageHtml = $('<div id="' + pageid + '" class="wxqyPage"><form class="myForm selectedForm" role="form">' + $pageContent + '</form></div>');
										$(".wxqyPage").hide().find("form").removeClass("selectedForm");
										$("#myWeb").append($pageHtml);
										var formId = createForm(pageid, title);
										$("#header,#main").click(function(e) {
											if (!$("#setWXMenu").is(":hidden")) {
												$(".closePanel").click();
											}
										});
										$("#appInitPage").hide();
										$("#myWeb").show();

										$("#myWeb").find(".selectedForm").html($pageContent);

										ezCommon["formId"] = formId;
										ezCommon.ctrlNameNum[ezCommon.formId] = jsonData["ctrlIndex"];
										ezCommon.actionNameNum[ezCommon.formId] = jsonData["actionIndex"];
										ezCommon.controlLists[ezCommon["formId"]] = jsonData["controlLists"];
										$("#editPage").click();

										if ($submenuWrap.find(".addSubMenuBtn").size() <= 0) {

											var $ulObj = $submenuWrap.show().find("ul");
											if (nodeMenu == 1) {
												$ulObj.append('<li class = "nodeMenu addSubMenuBtn"><p class = "nodeMenuName"></p></li>');
											} else {
												var liLen = $ulObj.find("li").size();
												if (liLen < 5) {
													$ulObj.find("li:first").before('<li class = "nodeMenu addSubMenuBtn"><p class = "nodeMenuName"></p></li>');
												}
											}
										}
										if (nodeMenu == 1) {
											var appendMainMenu = $("<div class='pageMenuGather row'><div class='pageList fatherPageMenu' pageid='" + pageid + "' formid='" + formId + "'><span class='custom_page_name'>" + title + "</span><a  class='save_page  glyphicon glyphicon-floppy-disk' href='javascript:;' title='保存到我的模板'></a></div></div>");

											$("#pageMenuList").find(".child_content").append(appendMainMenu);
											//	pageMenuIconEvent(appendMainMenu);
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
										} else {
											var appendChildMenu = $("<div class='pageList childPageMenu' pageid='" + pageid + "' formid='" + formId + "'><span class='custom_page_name custom_child_page_name'>" + title + "</span><a class='save_page  glyphicon glyphicon-floppy-disk' href='javascript:;' title='保存到我的模板'></a></div>");
											var firstMenuPageId = $selectMenu.closest(".firstMenu").attr("pageid");

											$("#pageMenuList").find("div[pageid='" + firstMenuPageId + "']").parent(".pageMenuGather").append(appendChildMenu);
											//	pageMenuIconEvent(appendChildMenu);
										}
										pageListClick();
										$("#editPage").show();
										$("#deleteMenu").show();
										$("#importTemplate").hide();

										$("#editPage,#deleteMenu").removeClass("disabled-item").show();

										$("#designAddNewPages").modal("hide");

									} else {
										alert("请先选择所需模板！");
									}
								}
							});

						} else {
							alert("请先从已有页面中选择保存为模板！");
						}
					});
				}
			}
		});

		$("#designAddNewPages .page-content-header").unbind("click").on("click", function() {
			$("#designAddNewPages .pages-header-ul").find(".active").removeClass("active");
			$("#designAddNewPages .modalTpl").hide();
			$(this).addClass("active");
			if ($(this).hasClass("myPageTpl")) {

				$("#designAddNewPages .myPages").show();
			} else {

				$("#designAddNewPages .sysPages").show();
			}
		});
	}

	/**
	 * 微信菜单页面切换
	 */
	function changePage($menu) {
		if ($("#wxMenu").find(".selectMenu").length) {
			$(".selectMenu").removeClass("selectMenu");
		}
		var $selectWxMenu = $menu.addClass("selectMenu"), id = $selectWxMenu.attr("pageId"), $subMenu = $selectWxMenu.find(".nodeMenu").not(".addSubMenuBtn");
		formTitle = "", nodeMenu = 1;
		//菜单级
		if ($selectWxMenu.hasClass("firstMenu")) {
			formTitle = $selectWxMenu.find(".firstMenuName").text();
		} else {
			formTitle = $selectWxMenu.find(".nodeMenuName").text();
			nodeMenu = 2;
		}
		if (!$subMenu.length) {
			$(".wxqyPage").hide().find("form").removeClass("selectedForm");
			if (id && $("#" + id).size() <= 0) {
				//获取页面结构
				var content = ajaxData.getPageContent(SITECONFIG.SITEID, id);
				if (content) {
					var $content = $(content);
					$content.appendTo($("#myWeb")).show().find("form").addClass("selectedForm");
					var formId = $(content).find("form").attr('id');
					if (!formId) {
						formId = createForm(id, formTitle);
						if (nodeMenu == 1) {
							ezCommon.menuJson[id]["formId"] = formId;
						} else {
							var parId = $selectWxMenu.parents(".firstMenu").attr("pageId");
							ezCommon.menuJson[parId]["subMenu"][id]["formId"] = formId;
						}
					} else {
						ajaxData.getFormJsonData(formId);
					}
					//第一次打开二级菜单才会走
					ctrlInit(id);

					//控件在鼠标移入时，显示拖动手柄
					//ezCommon.ctrlMouseOver();

					ezCommon.pageIdURdo[id] = new Undo.Stack();
				} else {
					//第一次打开一级菜单才会走
					var $pageHtml = $('<div id="' + id + '" class="wxqyPage"><div class = "topNavWraper"><div class = "removeNavBtn" title = "移出导航菜单"></div></div><form  class="myForm selectedForm" role="form" data-bgColor="white" style="min-height: 390px;"> </form><div class = "bottomNavWraper"><div class = "removeNavBtn"></div></div></div>');
					$("#myWeb").append($pageHtml);
					formId = createForm(id, formTitle);
					if (nodeMenu == 1) {
						ezCommon.menuJson[id]["formId"] = formId;
					} else {
						var parId = $selectWxMenu.parents(".firstMenu").attr("pageId");
						ezCommon.menuJson[parId]["subMenu"][id]["formId"] = formId;
					}
					ezCommon.pageIdURdo[id] = new Undo.Stack();
				}
				ezCommon.deBug("初始化定位栏可拖动", "pageManage", 1210);
				colBoxDraggable();
				ezCommon.deBug("初始化控件可排序", "ctrlEvent", 1212);
				formSortable();
				//设置页面顶部或底部的导航菜单
				require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.js", function() {
					require.async(SITECONFIG.PUBLICPATH + "/Js/spectrum/spectrum.css");
					ezCommon.setNav();
				});
				//compLogic.allColInnerSortAble();
			} else {
				if (id) {
					$("#myWeb").find("form").removeClass("selectedForm");
					var $page = $("#" + id), formId = $page.show().find("form").addClass("selectedForm").attr("id");
					if (formId == undefined) {
						var formId = createForm(id, formTitle);
						if (nodeMenu == 1) {
							ezCommon.menuJson[id]["formId"] = formId;
						} else {
							var parId = $selectWxMenu.parents(".firstMenu").attr("pageId");
							ezCommon.menuJson[parId]["subMenu"][id]["formId"] = formId;
						}
					} else {
						ezCommon.formId = formId;
					}
				}
			}
			//控件在鼠标移入时，显示拖动手柄
			ezCommon.ctrlMouseOver();
			ezCommon.undoEvent(id);
			inputPanelClick($content, $page);
			if ($(".myForm:visible").hasClass("slideInputForm")) {
				$(".ctrlValue", $(".selectedForm")).show();
			}
		}
	};

	function ctrlInit(pageId) {
		$("#" + pageId + " .ctrl").each(function() {
			var $this = $(this), ctrlType = $this.attr("ctrl-type"), ctrlName = $(this).attr("ctrlId");

			switch(ctrlType) {
				case "compLogic":
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
						//控件初始化（调用插件等）
						e.set($this);
						e.init($this);
					});
					break;
				case "systemCp":
					var syscomtype = $this.attr("syscomtype");
					if ($this.hasClass("thirdpartyPlugin")) {
						//初始化当前组件属性
						require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/" + syscomtype + "/style.css", function(e) {
							require.async(SITECONFIG.PUBLICPATH + "/Js/pluginUploadList/" + syscomtype + "/editing.js", function(e) {
								var ctrl = e.get();
								e.set($this);
								e.init($this);
							});
						});

					} else {
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + syscomtype + ".js", function(e) {
							var ctrl = e.get();
							e.set($this);
							e.init($this);
						});

					}

					break;
				default:
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
						var ctrl = e.get();
						//还原控件的数据属性
						var ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlName], dataValue = ctrl["attrs"]["Data"];
						//还原数据属性
						if (ctrlJson) {
							if (ctrlJson["attrs"]["data"]) {
								var dataJson = ctrlJson["attrs"]["data"][dataValue[0]];
								if (dataJson) {
									require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/data.js", function(e) {
										e.restoreAttrData($this, dataJson, $("#" + dataValue[0]));
									});
								}
							}
						}
						//控件初始化（调用插件等）
						e.set($this);
						e.init($this);
					});
					break;
			}
		});
	}

	function inputPanelClick($content, $page) {
		var $slider = $(".inputPanel", $content);
		if ($slider.length) {
			$slider.css("right", "-100%");
			//滑出式输入面板头部的返回和提交事件绑定
			$(".ipBack", $page).click(function() {
				var $this = $(this);
				if ($this.hasClass("slideCityCounty")) {
					$(".slide-city-county", $slider).hide();
					$(".slide-province", $slider).show();
					$(".slideCityCounty", $slider).removeClass("slideCityCounty");
				} else if ($this.hasClass("slideCounty")) {
					$(".slide-detailed", $slider).hide();
					$(".slide-city-county", $slider).show();
					$(".slideCounty", $slider).removeClass("slideCounty").addClass("slideCityCounty");
					$(".ipSave", $slider).addClass("slideIpSaveNone");
				} else {
					$(".ipSave", $slider).removeClass("slideIpSave").removeClass("slideIpSaveNone");
					$slider.animate({
						"right" : "-100%"

					}, 300).hide();
				}

			});
			$(".ipSave", $page).click(function() {
				var $input = $(".ipEditBox textarea"), value = "";
				if ($input.length) {
					value = $input.val();
					if ($(this).hasClass("slideIpSave")) {
						value = $(".province-city-county", $slider).text() + value;
					}
				} else {
					$slider.find(".itemLabel.onChecked").each(function() {
						var itemValue = $(this).find("span").text();
						value += itemValue + "，";
					});
					value = value.substring(0, value.length - 1);
				}

				var $ctrl = $slider.data("ctrl");
				$ctrl.find(".ctrlValue").html(value).show();
				$ctrl.find('[isbasectrl="true"]').val(value);
				$slider.animate({
					"right" : "-100%"

				},300).hide();
				$(this).removeClass("slideIpSave");
			});
		}
	}

	/**
	 * 新增页面
	 */
	function addNewPage() {
		$("#pageModal").modal("show");
		var newPageName = "", addWhere = $(this).closest("li").attr("class");
		$(".pageNameSaveBtn").unbind("click").on("click", function() {//模态框确定按钮事件
			if ($.trim($("#newPageName").val()) == "") {
				$(".addNewPageTip").show();
				$("#newPageName").on("focus", function() {
					$(".addNewPageTip").hide();
				});
			} else {
				newPageName = $.trim($("#newPageName").val());
				$("#pageModal").modal("hide");
				if (!cacheTemplate) {
					$.ajax({
						type : "post",
						url : SITECONFIG.APPPATH + '/ViewGet/Index/getLayoutTplList',
						data : {
							type : 2,
							siteId : SITECONFIG.SITEID
						},
						async : false,
						success : function(data) {
							if (data && data != "null") {
								var $li_sys = "";
								data = JSON.parse(data);
								cacheTemplate = data;
								$.each(data, function(i, v) {
									$li_sys += '<li class="tempItem" tempId="' + v.id + '"><img src = "' + SITECONFIG.APPPATH + '/' + v.imgurl + '"/><p>' + v.title + '</p></li>';
								});
								$(".sysPtlList #template").empty().append($li_sys);
							}
						}
					});
				} else {

				}

				$(".sysPtlList .nowTemp").removeClass("nowTemp");
				$(".sysPtlList #template").addClass("nowTemp").show();
				$(".sysPtlList #myTemplate").hide();

				$("#pageTplLib").show();
				$("#theMaskLayer").fadeIn(500);
				var ptlHeight = $(window).height();
				$("#pageTplLib").height(ptlHeight).animate({
					width : "950"
				}, 500, function() {
					$(".ptlMenu,.pageTplListWrap").fadeIn(300);
					layoutEditor(newPageName, addWhere);
				});
				$("#pageTplLib").show();

			}
		});

	}

	/**
	 * 页面模板在被单击时(链接页面，后台管理页面) cc
	 */
	function onPageTplClick2($this, addWhere, newPageName, type) {
		var tplId = $this.closest("li").attr("tempid");
		var $mask = $this.find(".pageTplMask");
		$mask.show();
		$(".ptlMenu,.pageTplListWrap").fadeOut(250, function() {//关闭滑出面板
			$("#pageTplLib").animate({
				width : 0
			}, 250);
			$mask.hide();
		});
		$("#theMaskLayer").fadeOut(500);
		var content = ajaxData.getPageTplContent(tplId, type);
		var id = numRand(), $li = [];
		formId = createForm(id, newPageName);
		$li.push('<li  class="page-common" pageid="');
		$li.push(id);
		$li.push('" formid="');
		$li.push(formId);
		$li.push('"><span class="custom_page_name">');
		$li.push(newPageName);
		$li.push('</span><div class="input-group modNameInput" parentPageId="');
		$li.push(id);
		$li.push('"><input class="form-control input-sm pageMenu" value="');
		$li.push(newPageName);
		$li.push('"type="text" aria-describedby="basic-addon2" placeholder=" "><span id="basic-addon2" class="input-group-addon glyphicon glyphicon-ok">');
		$li.push('</span></div><div class="hideIco"></div><a class="edit_pageName  glyphicon glyphicon-pencil" title="修改标题" href="javascript:;">');
		$li.push('</a><a class="save_page glyphicon glyphicon-floppy-disk" href="javascript:;"  title="保存到我的模板"></a><a class="delete_page glyphicon glyphicon-trash" title="删除" href="javascript:;"></a></li>');
		$li = $li.join('');
		if (type == 1) {
			$content = $(content['content']);
		} else {
			$content = $(content);
		}

		$content.attr("id", id);
		$content.find("form").attr("id", formId);
		$(".wxqyPage,#appInitPage").hide();
		$("#myWeb").show();
		$(".mainTop span:last").html(newPageName);
		$("#myWeb").append($content);
		formSortable();
		//控件在鼠标移入时，显示拖动手柄
		ezCommon.ctrlMouseOver();
		$("#control-lib").click();

		//记录需要保存的表单
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addNeedSavePage();
		});

		//来自那个添加按钮的class
		$li = $($li);
		$("." + addWhere).find("ul").append($li);

		var nodes = {
			"page" : id,
			"name" : newPageName,
			"formId" : formId
		};
		//新增到菜单json中
		require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
			e.addPageMenuJson(id, nodes);
		});
		ezCommon.formId = formId;
		if (type == 1) {
			var $pageContent = $(content["content"]);
			var jsonData = JSON.parse(content['jsonData']);
			var ctrlList = jsonData["tabs"]["tab1"]["ctrlList"];
			ezCommon.controlLists[ezCommon.formId] = jsonData["controlLists"];
			ezCommon.ctrlNameNum[ezCommon.formId] = jsonData["ctrlIndex"];
		}
		//初始化栈 对象（撤销恢复处用到）
		var pageLogo = $(".selectedForm").parent().attr("id");
		ezCommon.pageIdURdo[pageLogo] = new Undo.Stack();
		ezCommon.undoEvent(pageLogo);
		$(".page-close").show();
		$(".phoneMod-title-vLline").show();
		$("#wxMenu").hide();
		//显示头部复制粘贴
		$(".tool-menu").show();
		$("#formPreView").show();
	}

	/**
	 * @param {Object} id 新建页面的pageId
	 * @param {Object} formTitle 新建页面的名称
	 */
	function createForm(id, formTitle) {
		ezCommon.deBug("创建新表单[ " + formTitle + " ]（pageId:" + id + "）", "public/App/Qywx/pageManage", 1783);
		var data = {};
		data["flow_id"] = 1;
		//先给一个默认值， 在保存站点时统一修改表单名称
		formTitle = formTitle ? formTitle : "表单";
		data['form_title'] = formTitle;

		data['siteId'] = SITECONFIG.SITEID;
		var newFormId = ajaxData.saveFormInfo(data);
		if (newFormId && newFormId != "0") {
			$("#" + id).find(".myForm").attr("id", newFormId);
		} else {
			alert("此创建的页面无效,请删除重建!");
		}
		ezCommon.controlLists[newFormId] = {};
		var content = $("#" + id).prop("outerHTML");
		ezCommon.formId = "" + newFormId;

		return newFormId;
	};

	module.exports = pageMgr;
});
