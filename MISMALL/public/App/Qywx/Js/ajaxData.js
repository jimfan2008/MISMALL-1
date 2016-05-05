/**
 * @author 陈毅
 * @desc 平台前后台数据交互处理部分, 主要是涉及到ajax的部分,都集中在本模块处理.请求成功后的处理函数,用回调模式执行
 * @date 2015-06-29
 */

define(function(require, exports, module) {

	var ajaxData = {

		/**
		 * 获取页面内容
		 */
		getPageContent : function(siteId, pageId) {
			var pageContent = "";
			_commonAjax({
				url : SITECONFIG.APPPATH + "/Editor/loadPage",
				data : {
					"siteId" : SITECONFIG.SITEID,
					"page" : pageId
				},
				dataType : 'JSON',
				type : 'POST',
				cache : false,
				async : false,
				success : function(data) {
					if (data == 0) {
						throw new Error("没有请求到页面内容");
					}
					ezCommon.deBug("获取页面内容成功", "ajaxData", 30);
					if (data.pageContent) {
						pageContent = data.pageContent.replace(/CTRLDYNAMIC/g, "compLogic");
					}
				}
			});
			return pageContent;
		},

		/**
		 * 获取表单数据
		 */
		getFormJsonData : function(formId) {
			ezCommon.formId = formId;
			var data = {}, formData = {};
			data["id"] = formId;
			data['siteId'] = SITECONFIG.SITEID;
			_commonAjax({
				type : "POST",
				url : SITECONFIG.ROOTPATH + "/FormData/getFormJsonData",
				data : data,
				async : false,
				success : function(result) {
					if (result && result != "null") {
						formData = JSON.parse(result);
						var jsonData = formData;
						var ctrlList = jsonData["tabs"]["tab1"]["ctrlList"];
						ezCommon.controlLists[ezCommon.formId] = jsonData["controlLists"];
						ezCommon.ctrlNameNum[ezCommon.formId] = jsonData["ctrlIndex"];
					}
				},
				error : function(o) {
				}
			});
			return formData;
		},

		/**
		 * 获取页面模板内容
		 */
		getPageTplContent : function(tempId, type) {
			var pageContentStr = "";
			var data = {};
			data["tplid"] = tempId;
			data["siteId"] = SITECONFIG.SITEID;
			data["type"] = type;
			$.ajax({
				type : "post",
				url : SITECONFIG.ROOTPATH + "/Qywx/Editor/getLayoutTpl",
				data : data,
				dataType : "json",
				cache : false,
				async : false,
				success : function(r) {
					var pageContent = r;
					if (type == 1) {
						pageContentStr = r;
					} else {
						pageContentStr = pageContent["content"];
					}
				},
				error : function(re) {
					console.log(re);
				}
			});
			return pageContentStr;
		},

		/**
		 * 获取页面模板内容列表
		 */
		getLayoutTplList : function($type) {
			var pageTplModList = {};
			_commonAjax({
				type : "post",
				url : SITECONFIG.APPPATH + '/Editor/getLayoutTplList',
				data : {
					'type' : $type,
					'siteId' : SITECONFIG.SITEID
				},
				async : false,
				success : function(data) {
					if (data && data != "null") {
						var $li_sys = "";
						pageTplModList = data;
					}
				}
			});
			return pageTplModList;
		},

		/**
		 * 创建表单时,在后台生成对应的表
		 */
		saveFormInfo : function(data) {
			var newFormId = "";
			_commonAjax({
				type : "POST",
				url : SITECONFIG.ROOTPATH + "/FormData/saveFormInfo",
				data : data,
				async : false,
				success : function(res) {
					newFormId = res;
				}
			});
			return newFormId;
		},

		/**
		 * 保存菜单json 或者页面
		 * @param saveMenuJson   菜单json
		 * @param allPageFromJson 页面控件属性的json
		 */
		saveMenuJson : function(data) {
			var newFormId = "";
			_commonAjax({
				type : "POST",
				url : SITECONFIG.APPPATH + "/Editor/savePage",
				data : data,
				async : false,
				success : function(res) {

					newFormId = res;
				}
			});
			return newFormId;
		},

		/**
		 * 保存表单控件及属性json
		 * saveFormJson
		 */
		saveFormJson : function(allPageFromJson) {
			var data = {}, saveInfo = "";
			data['json_data'] = JSON.stringify(allPageFromJson);
			data['siteId'] = SITECONFIG.SITEID;
			//data['tableRelation'] = ezCommon.tableRelationJson;
			data['form_id'] = ezCommon.formId;
			_commonAjax({
				type : "POST",
				url : SITECONFIG.ROOTPATH + "/FormData/saveFormInfo",
				data : data,
				async : false,
				success : function(res) {
					saveInfo = res;
				}
			});
			return saveInfo;
		},

		/**
		 * 表单提交时，保存或修改表单数据
		 * @param formDataId 修改数据的ID 没有则表示增加新数据
		 */
		saveFormData : function(formDataId) {
			var formData = getFormData(), data = {}, flag = false;
			data["form_id"] = ezCommon.formId;
			data['data_id'] = formDataId;
			data["form_data"] = formData;

			$("#mask").show();
			$(".mas_img").css("display", "inline");
			$(".mas_text").css("display", "inline").html("提交中...");
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/FormData/saveFormDataInfo",
				type : "post",
				data : {
					data_str : JSON.stringify(data),
					siteId : SITECONFIG.SITEID,
				},
				async : false,
				success : function(r) {
					//保存后的操作 遮罩隐藏
					if (r["status"] == "success") {
						flag = true;
						$(".mas_img").css("display", "none");
						//   $(" .tipWrap_img").html("提交成功");
						$(" .mas_text").html("提交成功");
						setTimeout(function() {

							/*$(".tipWrap, .mas_img ").css("display","none");
							 $(".tipWrap_img ").css("display","none");*/
							$("#mask, .mas_img, .mas_text").css("display", "none");
							$(".selectedForm ").find(".itemLabel").removeClass("onChecked").find("input").removeAttr("checked");

						}, 1500);

					}
				}
			});
			return flag;
		},

		/**
		 * 查询当前项目所有数据源
		 * @param string flowId 站点id 或 流程id
		 */
		getProjectFormInfo : function(flowId) {
			var formData = "", formItem = "";
			$.ajax({
				//url : SITECONFIG.ROOTPATH + "/FormData/getAllFlowQuerier",
				url : SITECONFIG.ROOTPATH+"/Qywx/Query/getAllQueryDataSources",
				type : "POST",
				data : {
					"flowId" : flowId,
					"siteId" : SITECONFIG.SITEID
				},
				cache : false,
				async : false,
				dataType : "JSON",
				success : function(formList) {
					if (formList["data"]) {
						formData = formList["data"];
					}
				}
			});
			return formData;
		},

		/**
		 * 根据数据集ID，获取数据集数据
		 * @param	dsId	integer	数据集id号
		 * @return	object	数据集json对象
		 */
		getFormFieldInfo : function(dsId, type) {
			var fieldList = [];
			var dataSources = ezCommon.cacheDataSource;
			console.log(dataSources);
			if(dataSources.length > 0) {	
				$.each(dataSources, function(key, val) {
					var id = val["id"];
					if(id == dsId) {
						fieldList = val["querierConfig"]	;
						return false;
					}
				});
			}
			return fieldList;
			/*var dataJ = "";
			if (dsId) {
				var result = ezCommon.getQueryField(dsId, type);
				if (result) {
					dataJ = result['querierData'];
					/*if (dataJ != null && dataJ) {
					 if (dataJ["whereJson"]["condJson"]) {
					 condJson = dataJ["whereJson"]["condJson"];
					 }
					 var sql = result['querierData']["sql"];
					 $.each(dataJ.selectFields, function(index, value) {
					 var checkboxHtml = '<input type="checkbox"  value="' + value['tableName'] + '_' + value['fieldId'] + '" name="field" >';
					 fieldList += '<li class="fieldItem" fieldName="' + value['tableName'] + '_' + value['fieldId'] + '" formId = "' + dsId + '" fieldTitle="' + value['fieldTitle'] + '"><span class="fieldName">' + value['fieldTitle'] + '</span><span class="isChecked">' + checkboxHtml + '</span></li>';
					 dragFiled += '<li class="fieldItem" original = "yes" fieldName="' + value['tableName'] + '_' + value['fieldId'] + '" formid = "' + result['ID'] + '"><span class="fieldName">' + value['fieldTitle'] + '</span></li>';
					 });
					 }
				}

			}
			fieldData = {
			 "fieldList" : fieldList,
			 "sql" : sql,
			 "dragField" : dragFiled,
			 "condJson" : condJson
			 };
			return dataJ;*/
		},

		/**
		 * 加载页面或者加载菜单json
		 */
		loadPage : function($data) {
			var returnData = "";
			_commonAjax({
				type : "POST",
				url : SITECONFIG.APPPATH + "/Editor/loadPage",
				data : $data,
				async : false,
				success : function(res) {
					returnData = res['pageContent'];
				}
			});
			return returnData;
		},

		/**
		 * 删除单个表单
		 */
		deleteForm : function(formId, pageId) {
			var bool = false;
			if (formId) {
				var data = {};
				data["form_id"] = formId;
				data["siteId"] = SITECONFIG.SITEID;
				data["pageId"] = pageId;
				$.ajax({
					type : "POST",
					url : SITECONFIG.ROOTPATH + "/FormData/delAForm",
					data : data,
					async : false,
					success : function(result) {
						if (result) {
							bool = true;
						}
					}
				});
			}
			return bool;
		},
		/**
		 * 更新表名字（左侧菜单更改名字）
		 */
		updateTableName : function(newName, formid) {
			var bool = false;
			if (newName && formid) {
				var data = {};
				data['tableTitle'] = newName;
				data['ID'] = formid;
				data["siteId"] = SITECONFIG.SITEID;
				_commonAjax({
					type : "POST",
					url : SITECONFIG.ROOTPATH + "/FormData/updateTableName",
					data : data,
					async : false,
					success : function(result) {
						if (result) {
							bool = true;
						}
					}
				});
			}
		},

		/**
		 * 组件名称是否重复
		 * @param componentname 组件名称
		 * @param componentId 组件Id
		 */
		IscompNameRepeat : function(componentname, componentId) {
			var status = 0;
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/FormData/getCompRecord",
				type : "post",
				data : {
					"name" : componentname,
					"siteId" : SITECONFIG.SITEID
				},
				async : false,
				success : function(compName) {
					if (compName["status"] == "success") {
						status = 1;
					}
				}
			});
			return status;
		},

		/**
		 * 添加组件名称
		 * @param componentname 组件名称
		 */
		addCompName : function(componentname, componentId) {
			var data = {};
			data["name"] = componentname;
			data["componentId"] = componentId;
			data['siteId'] = SITECONFIG.SITEID;
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/FormData/addCompRecord",
				type : "post",
				data : data,
				async : false,
				success : function(r) {
				}
			});
		},
		//获取自己保存的模板数据
		getMyTempList : function() {
			var data = {};
			var tempList = {};
			data['siteId'] = SITECONFIG.SITEID;
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/Qywx/Editor/getMyTempList",
				type : "post",
				data : data,
				async : false,
				dataType : "json",
				success : function(r) {
					tempList = r;
				}
			});
			return tempList;
		},
		//获取模板内容
		getMyTempContent : function(tplId) {
			var result = {}, data = {};
			data['siteId'] = SITECONFIG.SITEID;
			data['tplId'] = tplId;
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/Qywx/Editor/getMyTempContent",
				type : "post",
				data : data,
				async : false,
				dataType : "json",
				success : function(r) {
					tempList = r;
				}
			});
		},
	};

	/**
	 * 拼接控件数据
	 */
	function getFormData() {
		var formData = {};
		var formIdNow = ezCommon.formId;
		$("form[id=" + formIdNow + "]").find("div.ctrl").not('[issubmit="true"]').each(function() {
			var ctrtype = $(this).attr("ctrl-type");
			var ctrlid = $(this).attr("ctrlid");
			var $ctrl = $(this).find("[name='" + ctrlid + "']");
			var $this = $(this);
			var $imgCtrl = $(this);
			if ($(this).attr("syscomtype") == "cusKindEditor") {
				if (ezCommon.kindEditorObj) {
					formData[ctrlid] = html_encode(ezCommon.kindEditorObj.html());
				}
			} else if ($(this).attr("syscomtype") == "cascade") {
				formData[ctrlid] = html_encode($ctrl.val());
			}
			switch (ctrtype) {
				case "TEXTBOX":
				case "TEXTAREA":
					var ctrlText = html_encode($ctrl.val());
					formData[ctrlid] = ctrlText;
					break;
				case "TIME":
					if ($ctrl.val()) {
						formData[ctrlid] = $ctrl.val();
					} else {
						formData[ctrlid] = $this.find(".ctrlValue").text();
					}

					break;
				case "DROPDOWN":
					formData[ctrlid] = $ctrl.find("option:selected").attr("value");
					break;
				case "CHECKBOX":
					$(this).find(".itemLabel").each(function() {
						$(this).find("input").attr("name", ctrlid);
					});
					formData[ctrlid] = {};
					var objectList = [];
					$(this).find("input[type='checkbox']").each(function() {
						if ($(this).attr("checked")) {
							var id = $(this).next("span").text();
							objectList.push(id);
						}
					});
					objectList = objectList.join(",");
					formData[ctrlid] = objectList;
					break;
				case "IMAGE":
					//没用上传图片，还是原来默认的图片时 不保存
					if ($imgCtrl.find("img").attr("src").indexOf("image.png") != "-1") {
						break;
					}
					formData[ctrlid] = $imgCtrl.find("img").attr("src");
					break;
				case "CCUpload":
					break;
				case "CCPageBrowse" :
					formData[ctrlid] = $.common.html_encode($(".wxqyPage").html());
					break;
			}

		});
		return formData;
	}


	module.exports = ajaxData;
});
