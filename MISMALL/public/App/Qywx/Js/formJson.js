/**
 * @author 陈毅
 * @desc MisMall平台表单JSON操作
 * @time 2015-05-08
 */

define(function(require, exports, module) {

	var FORMJSON = {

		/**
		 * 微信菜单json写入
		 * @param	nodeMenu	int		1为一级菜单,2为二级菜单
		 * @param	$selectMenu object	选中的菜单对象
		 */
		writeJson : function(nodeMenu, $selectMenu, menuName, formid) {
			_writeJson(nodeMenu, $selectMenu, menuName, formid);
		},

		/**
		 * 内页面json添加	 实时改变
		 * @author cc
		 * @param id 页面的pageId
		 * @param  nodes json结构
		 *   date 2015-07-01
		 */
		addPageMenuJson : function(id, nodes) {

			var where = $(".page-total").find("li[pageid=" + id + "]").parents("li").attr("class");
			if (where == "link-page") {
				var parentMenu = "pageMgr";
			} else {
				var parentMenu = "pageManage";
			}
			var config = ezCommon.pageMenuJson[parentMenu];
			//ezCommon.pageMenuJson[parentMenu] = new Array();
			ezCommon.pageMenuJson[parentMenu].push(nodes);
		},

		/**
		 * 更新内页菜单json
		 *@param  where  是 pageMgr 或者pageManage
		 * @param  pageId 是页面的Id 不是formid
		 * @name  新的名字
		 */
		updatePageMenuJson : function(where, pageId, name) {
			$.each(ezCommon.pageMenuJson[where], function(i, v) {
				if (v.page == pageId) {
					v.name = name;
					return;
				}
			});
		},

		/**
		 * 删除内页菜单json
		 */
		delPageMenuJson : function(where, pageId) {
			$.each(ezCommon.pageMenuJson[where], function(i, v) {
				if (v != undefined && v.page == pageId) {
					//delete ezCommon.pageMenuJson[where][i];
					var start = parseInt(i);
					ezCommon.pageMenuJson[where].splice(start, 1);
					return;
				}
			});
		},

		/**
		 * 删除微信菜单时,删除相关json数据
		 */
		deleteData : function($selectMenu, nodeMenu) {
			_deleteData($selectMenu, nodeMenu);
		},

		/**
		 * @desc 添加控件Json
		 * @param ctrlType string 控件类型
		 * @param ctrlName 控件的ctrlId
		 * @param ctrlTitle 控件标题
		 */
		add : function(ctrlType, ctrlName, ctrlTitle, fun) {
			this.addNeedSavePage();
			if (!ezCommon.controlLists[ezCommon.formId]) {
				ezCommon.controlLists[ezCommon.formId] = {};
			}
			ezCommon.controlLists[ezCommon.formId][ctrlName] = {
				"ctrlType" : ctrlType,
				"attrs" : {
					"general" : {
						"ctrlTitle" : ctrlTitle
					}
				}
			};
			if (ctrlType == "LotteryTurn") {
				ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"]["general"] = {
					"ctrlTitle" : ctrlTitle,
					"lottery" : "1"
				};
			}

			//多选项增加item初始值（CCRadio ，CCCheckBox，CCDropDown）
			if (ctrlType == "CHECKBOX" || ctrlType == "DROPDOWN") {
				var itemJson = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"]["item"];
				var items = {};
				var itemId1 = numRand("item", 8);
				var itemId2 = numRand("item", 8);
				items[itemId1] = {
					"key" : "选项1",
					"val" : "选项1",
				};
				items[itemId2] = {
					"key" : "选项2",
					"val" : "选项2",
				};
				ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"]["item"] = {
					"items" : items,
					"checked" : {},
					"itemnum" : "2",
					"selectLimit" : 1000
				};
				fun(itemId1, itemId2);
			}
		},

		/**
		 * 控件属性设置时，同步更新控件对应的json对象
		 * @param    string    ctrlName   控件名ID
		 * @param    string    attrType   属性分类(general,validate,item,data,setApp)//大分类
		 * @param    string    attrKey    属性名
		 * @param    string    attrVal    属性值
		 */
		update : function(ctrlName, attrType, attrKey, attrVal) {
			this.addNeedSavePage();
			var ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"];
			var num = 0;
			//检查属性是否存在
			var _isExistAttrKey = function(ctrlJson) {
				$.each(ctrlJson, function(key, val) {
					if (val != undefined && typeof (val) != "string" && typeof (val) != "number") {
						_isExistAttrKey(val);
					} else if (key == attrKey) {
						num++;
						return false;
					}
				});
				return num;
			};
			var num = _isExistAttrKey(ctrlJson);
			//获取json属性所属的对象，可能是当前控件json对象，也可能是子对象（general,validate等）
			var _getAttrParent = function() {
				var ctrlJson = ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"];
				if (!ctrlJson[attrType]) {
					ctrlJson[attrType] = {};
				}
				var val = ctrlJson[attrType];
				var subJson = null;
				if ( typeof (val) != "string") {
					return val;
				} else {
					return ctrlJson;
				}
			};
			if (attrVal == "@default@") {//属性值为默认，即不需要存入JSON
				if (num) {
					var j = 0;
					for (var i in _getAttrParent()) {
						j++;
					}
					if (j == 1) {//如果属性的父节点只包含当前一个属性，则删掉父节点
						delete ezCommon.controlLists[ezCommon.formId][ctrlName]["attrs"][attrType];
					} else {
						delete _getAttrParent()[attrKey];
					};
				}
			} else {
				_getAttrParent()[attrKey] = attrVal;
			}
		},

		/**
		 * @desc 删除控件json节点
		 *	@param String ctrlId 控件的ctrlid
		 */
		deleteCtrlJson : function(ctrlId) {
			this.addNeedSavePage();
			delete ezCommon.controlLists[ezCommon.formId][ctrlId];
		},

		/**
		 * 当修改或者改变页面的结构（增加，修改,删除控件，排序控件）的时候需要记录此页面需要保存
		 * 存放在ezCommon.needSavePage 中
		 */
		addNeedSavePage : function() {
			var pageid = $("#myWeb").find(".wxqyPage:visible").attr("id");
			if ($.inArray(pageid, ezCommon.needSavePage) == -1 && pageid != undefined) {
				ezCommon.needSavePage.push(pageid);
			}
		}
	};

	/**
	 * 写入菜单json
	 * @param	nodeMenu	int		1为一级菜单,2为二级菜单
	 * @param	$selectMenu object	选中的菜单对象
	 */
	function _writeJson(nodeMenu, $selectMenu, menuName, formid) {
		//menuName = encodeURIComponent(menuName);
		var pageId = $selectMenu.attr("pageId");
		if (nodeMenu == 1) {

			if (!ezCommon.menuJson[pageId]) {
				ezCommon.menuJson[pageId] = JSON.parse('{"menuName":"' + menuName + '", "formId":"' + formid + '", "sendInfo":"","subMenu":{}}');
			} else {
				ezCommon.menuJson[pageId]["menuName"] = menuName;
				ezCommon.menuJson[pageId]["formId"] = formid;
			}
		} else {
			var parentId = $selectMenu.parents(".firstMenu").attr("pageId"), menuJson = ezCommon.menuJson[parentId]["subMenu"][pageId];
			if (menuJson) {
				menuJson["menuName"] = menuName;
				menuJson["formId"] = formid;
			} else {
				var childrenJson = JSON.parse('{"menuName":"' + menuName + '", "formId":"' + formid + '","sendInfo":""}');
				ezCommon.menuJson[parentId]["subMenu"][pageId] = childrenJson;
			}
		}
	};

	/**
	 *  删除微信菜单时,删除相关json数据(移动到pageManage.js)
	 */
	/*function _deleteData ($selectMenu, nodeMenu) {
	var pageId = $selectMenu.attr("pageId"), formId = "";
	if (pageId) {
	if (nodeMenu == 1) {
	$selectMenu.addClass("toEditMain").removeAttr("pageId");
	formId = ezCommon.menuJson[pageId]["formId"] ? ezCommon.menuJson[pageId]["formId"] : "";
	delete ezCommon.menuJson[pageId];
	} else {
	$selectMenu.parents(".firstMenu").find(".addSubMenuBtn:first").remove();
	$selectMenu.addClass("addSubMenuBtn").removeAttr("pageId");
	var parentId = $selectMenu.parents(".firstMenu").attr("pageId"), childrenJson = ezCommon.menuJson[parentId]["subMenu"][pageId];
	formId = childrenJson["formId"] ? childrenJson["formId"] : "";
	delete ezCommon.menuJson[parentId]["subMenu"][pageId];
	}
	$("#" + pageId).remove();
	if (formId) {
	editorEvent.deleteForm(formId);
	}
	var strJson = JSON.stringify(ezCommon.menuJson);
	//pageSave方法还没定义好（看定义在哪个页面里）：定义后可以消掉注释
	/*var bool = editorEvent.pageSave("qyConfig", SITECONFIG.SITEID, strJson);
	if (bool) {
	//删除页面
	ezCommon.pageRemoveFile(pageId, SITECONFIG.SITEID, 0);
	}*/
	/*if (nodeMenu == 2) {
	$selectMenu.parents(".firstMenu").click();
	}
	}
	};*/

	/**
	 *
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
	}

	/**
	 * 保存所有结构性的数据（即表单提交的数据除外）
	 */
	function formJsonDataSave() {
		var configStr = JSON.parse(qyEditor.pageMenuWriteJson());
		var configJson = function(formCtrlSite, Mjson) {
			var flag = false;
			if (formCtrlSite > 0 && Mjson["formManage"] != "true") {
				Mjson["formManage"] = "true";
				flag = true;
			} else if (formCtrlSite <= 0 && Mjson["formManage"] == "true") {
				Mjson["formManage"] = "false";
				flag = true;
			}
			return flag;
		};
		$("#myWeb").find("form").each(function() {
			var $this = $(this), formCtrlSite = $this.find(".formCtrl").length, page = $this.parent().attr("id");

			$.each(ezCommon.menuJson, function(key, value) {
				if (key == page) {
					configJson(formCtrlSite, value);
				} else {
					$.each(value["subMenu"], function(k, v) {
						if (k == page) {
							configJson(formCtrlSite, v);
						}
					});
				}
			});

			var pageMgr = configStr["pageMgr"], pageManage = configStr["pageManage"];
			$.each(pageMgr, function(k, v) {
				if (v['page'] == page) {
					configJson(formCtrlSite, v);
				}
			});

			$.each(pageManage, function(k, v) {
				if (v['page'] == page) {
					configJson(formCtrlSite, v);
				}

			});
		});

		configStr["pageMenu"] = ezCommon.menuJson;

		//保存所有菜单json（微信页面菜单，链接页面菜单，后台页面菜单）
		var bool = qyEditor.pageSave("config", SITEID, JSON.stringify(configStr));

		if (bool) {
			//页面管理保存
			var _sumFormJson = function() {
				var allFormJson = {};
				var _allFormJson = function(key, formName, formJson) {
					var fJson = {};
					var formJson = {
						"actionIndex" : 0, //存储当前表单存储的动作序号的最大值,表单还原的时候,再增加动作,避免序号重复
						"ctrlIndex" : 0, //存储当前添加控件最大值序号最大值
						"tabs" : {
							"tab1" : {
								"name" : "页签1",
								"page" : "",
								"ctrlList" : []
							}
						}
					};
					if ($("#" + key).size() > 0) {
						formJson["tabs"]["tab1"]["name"] = formName;
						formJson["tabs"]["tab1"]["page"] = key;
						var formId = $("#" + key).find("form").attr("id");

						var ctrlList = [];
						$("#" + key).find("form .formCtrl").not("[ctrl-type='compLogic']").each(function(n) {
							ctrlList[n] = $(this).attr("ctrlId");
						});
						formJson["actionIndex"] = ezCommon.actionNameNum[formId];
						formJson["ctrlIndex"] = ezCommon.ctrlNameNum[formId];
						formJson["tabs"]["tab1"]["ctrlList"] = ctrlList;
						formJson["controlLists"] = ezCommon.controlLists[formId];

						//判断当前表单是否有翻页浏览

						if (objIsnull($(".selectedForm").find(".editor-layer-switch"))) {
							ctrlList.push("CCPageBrowse");
							var pageBorwse = {
								"ctrlType" : "CCPageBrowse",
								"attrs" : {
									"general" : {
										"ctrlTitle" : "手机翻页"
									}
								}
							};
							formJson["controlLists"]["CCPageBrowse1"] = pageBorwse;
						}

						fJson = formJson;
					}
					return fJson;
				};
				$.each(ezCommon.menuJson, function(key, value) {
					var formName = value["menuName"], formId = $("#" + key).find("form").attr("id");
					if (formId) {
						allFormJson[formId] = _allFormJson(key, formName);
					}
					$.each(value["subMenu"], function(k, v) {
						formName = v["menuName"], formId = $("#" + k).find("form").attr("id");
						if (formId) {
							allFormJson[formId] = _allFormJson(k, formName);
						}
					});
				});
				//用户页面管理里的form
				$("#pageMgr").find(".pageList").not(".addStatus").each(function() {
					var pageId = $(this).attr("pageId"), formId = $("#" + pageId).find("form").attr("id"), formName = $(this).find(".custom_page_name").text();
					if (formId) {
						allFormJson[formId] = _allFormJson(pageId, formName);
					}
				});
				//后台页面管理里的form
				$("#pageManage").find(".pageList").not(".addStatus").each(function() {
					var pageId = $(this).attr("pageId"), formId = $("#" + pageId).find("form").attr("id"), formName = $(this).find(".custom_page_name").text();
					if (formId) {
						allFormJson[formId] = _allFormJson(pageId, formName);
					}
				});
				return allFormJson;
			};
			var data = {}, num = 0;
			data["json_data"] = JSON.stringify(_sumFormJson());

			$.ajax({
				type : "POST",
				url : APPPATH + "/FormData/saveFormInfo",
				data : data,
				async : false,
				success : function(result) {
					if (result) {
						$("#myWeb .editArea").find("form").each(function() {
							var $this = $(this);
							var $htmlForm = $(this).parent();
							var page = $htmlForm.attr('id');
							var formData = {};
							var content = $htmlForm.prop("outerHTML");
							var $content = $(content);
							$content.find("form>[ctrl-type='compLogic']").each(function(key) {
								var $that = $(this);
								require.async("cpOptCp", function(e) {
									var componentTplHtml = e.getDynaTpl($that);
									$that.replaceWith($(componentTplHtml));
								});
							});
							/**保存$content时 如果 $content中有制作层 则将保存的制作层的默认选中层设置为第一个**/
							$content.find(".editor-layer-switch").each(function() {
								if ($(this).hasClass("editor-layer-switch")) {
									$(this).find(".pageLayer").find(".layerSelect").removeClass("layerSelect");
									$(this).find(".pageLayer").find("li:first").addClass("layerSelect");
								}
							});
							content = $content.prop("outerHTML");
							$.ajax({
								type : "POST",
								url : GROUPPATH + "/Editor/savePage",
								data : {
									page : page,
									content : content,
									siteId : SITEID,
									title : ""
								},
								async : false,
								success : function(result) {
									if (result) {

									} else {
										num++;
									}
								}
							});
						});
						if (num) {
							ezCommon.showSaveResult("保存失败!");
						} else {
							ezCommon.showSaveResult("保存成功!");
						};
					}
				}
			});
		}
	}


	module.exports = FORMJSON;
});
