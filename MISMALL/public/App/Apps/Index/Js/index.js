/**
 * 微信应用后端管理
 */
define(function(require, exports, module) {

	var fdWechatAdmin = {
		
		getFormHistory : null,
		pageId : 0,
		mmg : null,
		selectRowIdx : 0,
		modifyDataId : 0,
		kindEditor : null,
		init : function() {
			//设置界面高度
			setUI();
			//获取微信应用后端管理页面列表
			fdWechatAdmin.getAdminPageLists();
			
			$("#formList").on("click",".adminPage",function(){
				var $this = $(this),
					cols = [];
				fdWechatAdmin.pageId = $this.attr('pageid');
				ezCommon.formId = $this.attr('formid');
					
				$("p.active").removeClass("active");
				$this.addClass("active");
				
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ajaxData.js", function(e) {
					e.getFormJsonData(ezCommon.formId);
				});
				
				fdWechatAdmin.getFormData(ezCommon.formId);
			});
			
			//后台页面列表单击时，解析对应页面类似编辑器页面预览
			$("#pageChild").on("click",".adminPage",function(){
				var formTitle = $(this).find("a").text(), pageContent = "";
				_commonAjax({
					url : SITECONFIG.ROOTPATH + "/Qywx/Editor/loadPage",
					data : {
						"siteId" : SITECONFIG.SITEID,
						"page" : fdWechatAdmin.pageId
					},
					dataType : 'JSON',
					type : 'POST',
					cache : false,
					async : false,
					success : function(data) {
						if (data == 0) {
							throw new Error("没有请求到页面内容");
						}
						pageContent = data.pageContent;
					}
				});
				var $pageContent = $(pageContent);
				var $selectedForm = $pageContent.find(".selectedForm");
				var $pageWraper = $('<div id="pcContent"><div class="mainTop"><span class="pageTopTitle pageTop-title"></span></div><div id="myWeb"></div></div>');
				$pageWraper.find("#myWeb").append($pageContent);
				$("main").empty().append($pageWraper);
				$("#pcContent .pageTopTitle").text(formTitle);
				
				var formId = $(".myForm").attr("id"), formData = "";
				if (formId) {
					formData = fdWechatAdmin.getManageFormData(formId);
					console.log(formData);
					fdWechatAdmin.callFormParsing(formData, formId);
				}
				fdWechatAdmin.initCtrl();
				//fdWechatAdmin.ctrlEvent();
				//预览页面解析选项单击事件
				fdWechatAdmin.itemCheck();
			});
			
			$("#content").on("click","#btnRemoveSelected",function(){
				if (confirm('您确定要删除选中行记录吗?')) {
					fdWechatAdmin.deleteSelectRows(fdWechatAdmin.mmg,ezCommon.formId);
				}
			});
			
			$("#content").on("click","#mmg .deleteBtn",function(e){
				e.stopPropagation();
				if (confirm('您确定要删除本行记录吗?')) {
					var $this = $(this),$row = $this.closest("tr");
					fdWechatAdmin.deleteRowData(ezCommon.formId,$row);
				}
			});
			
			$("body").on("click","#mmg .modifyBtn",function(e){
				e.stopPropagation();
				var $this = $(this),$row = $this.closest("tr");
				fdWechatAdmin.selectRowIdx = $row.index();
				fdWechatAdmin.modifyFormRowData(fdWechatAdmin.mmg,$row);
			});
			
			//提交修改
			$(".modifySureBtn").unbind("click").click(function(e) {
				e.stopPropagation();
				formDataSubmit();
			});
			
			//后台页面提交按钮数据提交
			$("main").unbind("click").on("click", "input[issubmit='true']", function(e) {
				e.stopPropagation();
				mgrPageFormSubmit($(this));
				
			});
		},

		/**
		 * 获取后端页面列表
		 */
		getAdminPageLists : function() {
			var data = {};
			data["siteId"] = SITECONFIG.SITEID;
			data["pageId"] = 'config';
			$.ajax({
				type : "POST",
				url : SITECONFIG.GROUPPATH + '/Index/getPageContent',
				data : data,
				async : false,
				dataType : "JSON",
				success : function(list) {
					var Modulehtml = "", mgrPagelist = "";
					if (list) {
						//后台页面列表
						$.each(list["pageManage"], function(k, v) {
							Modulehtml += '<p class="adminPage" pageid="' + v['page'] + '" formid="' + v['formId'] + '"><a>' + decodeURIComponent(v["name"]) + '</a></p>';
							mgrPagelist =  Modulehtml;
						});
						//微信菜单页面和链接页面列表
						$.each(list["pageMgr"], function(k, v) {
							Modulehtml += '<p class="adminPage" pageid="' + v['page'] + '" formid="' + v['formId'] + '"><a>' + decodeURIComponent(v["name"]) + '</a></p>';
						});
						//只显示有输入表单的页面
						$.each(list, function(k, v) {
							$.each(v, function(key, value) {
								if (value["formManage"] == "true" && value['page']) {
									Modulehtml += '<p class="adminPage" pageid="' + value['page'] + '" formid="' + value['formId'] + '"><a>' + value["name"] + '</a></p>';
								}
							});
						});
						$("#formList").append(Modulehtml);
						$("#pageChild").append(mgrPagelist);
						
						if (SITECONFIG.PAGEID) {
							fdWechatAdmin.pageId = SITECONFIG.PAGEID;
							ezCommon.formId = $(".adminPage[pageid =" + SITECONFIG.PAGEID + "]").attr("formid");
						} else {
							fdWechatAdmin.pageId = $(".adminPage:first").attr("pageid");
							ezCommon.formId = $(".adminPage:first").attr("formid");
						}
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ajaxData.js", function(e) {
							e.getFormJsonData(ezCommon.formId);
						});
						fdWechatAdmin.getAllFormData(fdWechatAdmin.pageId, ezCommon.formId);
						$("[pageid =" + SITECONFIG.PAGEID + "]:first").addClass("active");
					}
				}
			});
		},
		
		/**
		 * 获取表单数据
		 */
		getFormData : function(formId){
			var cols = [];
			$("main").empty().append('<div class="operationbtn"><button class="btn" id="btnRemoveSelected">删除选择的行</button></div><table id="mmg" class="mmg"><tr><th rowspan="" colspan=""></th></tr></table><div id="pg" style="text-align: right;"></div>');
			_commonAjax({
				url : SITECONFIG.ROOTPATH + '/Home/FormData/getAFormFiledsInfo',
				data : {
					"siteId" : SITECONFIG.SITEID,
					"formId" : formId
				},
				type : 'post',
				async : false,
				success : function(r) {
					if (r != "null" && r != 0) {
						cols.push({
							title : "ID",
							name : "ID",
							width : 100,
							align : 'center',
						});
						$.each(r, function(m, n) {
							var arr = {
								title : n["fieldTitle"],
								name : n["fieldName"],
								sortable : true,
								width : 100,
								align : 'center',
								renderer : function(val) {
									if (n["controlType"] == "IMAGE") {
										if (val) {
											return '<img height="50" width="50" src="' + val + '" />';
										} else {
											return '<img height="50" width="50" src="' + SITECONFIG.ROOTPATH + '/images/upimg.png" />';
										}
									} else {
										return val;
									}

								}
							};
							cols.push(arr);
						});

						cols.push({
							title : '操作',
							name : '',
							width : 150,
							align : 'center',
							lockWidth : true,
							lockDisplay : true,
							renderer : function(val) {
								return '<button  class="btn btn-info modifyBtn">修改</button> <button  class="btn btn-danger deleteBtn">删除</button>';
							}
						});
						var mmg = $('.mmg').mmGrid({
							height : 500,
							cols : cols,
							url : SITECONFIG.ROOTPATH + '/Home/FormData/getAFormData',
							params : {
								'siteId' : SITECONFIG.SITEID,
								'formId' : formId
							},
							method : 'post',
							remoteSort : true,
							multiSelect : true,
							nowrap : true,
							checkCol : true,
							fullWidthRows : true,
							autoLoad : false,
							plugins : [$('#pg').mmPaginator({})]
						});
						
						mmg.on('loadSuccess', function(e, data) {
							if (!mmg.rowsLength()) {
								var $mmGrid = $(".mmGrid"), $message = $mmGrid.find('.mmg-message'), $headWrapper = $mmGrid.find(".mmg-headWrapper");
								$message.css({
									'left' : ($mmGrid.width() - $message.width()) / 2,
									'top' : ($mmGrid.height() + $headWrapper.height() - $message.height()) / 2
								}).show();
							}
							/******数据加载失败后执行********/
						}).on('loadError', function(e, data) {
							var $mmGrid = $(".mmGrid"), $message = $mmGrid.find('.mmg-message'), $headWrapper = $mmGrid.find(".mmg-headWrapper");
							$message.css({
								'left' : ($mmGrid.width() - $message.width()) / 2,
								'top' : ($mmGrid.height() + $headWrapper.height() - $message.height()) / 2
							}).text("数据加载失败，请稍后再试").show();

						}).load();
						
						fdWechatAdmin.mmg = mmg;
					}
				}
			});
		},
	
		/**
		 * 集中删除所有选中的表单行数据
		 */
		deleteSelectRows : function(mmg,formId){
			/***删除选中的行数据***/
			var selectedIndexes = mmg.selectedRowsIndex(), 
				selectedRows = mmg.selectedRows(), 
				records = "";
			$.each(selectedRows, function(m, n) {
				records = records + "," + n["ID"];
			});
			records = records.substring(1);
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/Home/FormData/delFormRecord",
				data : {
					"formId" : formId,
					"records" : records,
					"siteId" : SITECONFIG.SITEID,
				},
				dataType : 'JSON',
				type : 'POST',
				cache : false,
				async : false,
				success : function(r) {
					if (r) {
						mmg.removeRow(selectedIndexes);
						mmg.on('cellSelected', function(e, item, rowIndex, colIndex) {
						}).load();
					}

				}
			});
		},
		
		/**
		 * 删除单行数据
		 */
		deleteRowData : function(formId,$row){
			var rowId = $row.find("td:eq(1)").find("span").text();
			//阻止事件冒泡
			$.ajax({
				url : SITECONFIG.ROOTPATH + "/Home/FormData/delFormRecord",
				data : {
					"formId" : formId,
					"records" : rowId,
					"siteId" : SITECONFIG.SITEID,
				},
				dataType : 'JSON',
				type : 'POST',
				cache : false,
				async : false,
				success : function(r) {
					if (r) {
						fdWechatAdmin.mmg.load();
					}
				},
				error : function(e){
					alert("有点问题，请联系管理员");
				}
			});
		},
		
		/**
		 * 修改表单选中的行数据
		 */
		modifyFormRowData : function(mmg,$row){
			var formTitle = $("#formList").find(".active a").text(), pageContent = "";
			$("#modal-form").find(".modal-title").text(formTitle);
			fdWechatAdmin.modifyDataId = $row.find("td:eq(1) span").text();
			_commonAjax({
				url : SITECONFIG.ROOTPATH + "/Qywx/Editor/loadPage",
				data : {
					"siteId" : SITECONFIG.SITEID,
					"page" : fdWechatAdmin.pageId
				},
				dataType : 'JSON',
				type : 'POST',
				cache : false,
				async : false,
				success : function(data) {
					if (data == 0) {
						throw new Error("没有请求到页面内容");
					}
					pageContent = data.pageContent;
				}
			});
			var $pageContent = $(pageContent);
			var $formCtrl = $pageContent.find(".imFormCtrl,[ctrl-type='systemCp']");
			var $selectedForm = $pageContent.find(".selectedForm");
			$selectedForm.css("min-height",0).empty().append($formCtrl);
			//var $submitBtn = $pageContent.find("[issubmit='true']").closest(".ctrl");
			
			$("#siteContent").empty().append($selectedForm);
			
			/***初始化组件和控件属性***/
			$("#siteContent .ctrl").each(function() {
				var $this = $(this), ctrlType = $this.attr("ctrl-type"), ctrlId = $(this).attr("ctrlId");
				switch(ctrlType) {
					case "compLogic" :
						break;
					case "systemCp":
						var syscomtype = $this.attr("syscomtype");
						if(syscomtype!="cusKindEditor"){
							require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + syscomtype + ".js", function(e) {
								e.init($this);
							});
						}
						break;
					default :
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
							// require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
								// if (ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"]) //给设置验证规则的控件添加验证
									// e.validate(ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"], $this);
							// });
							e.init($this);
						});
						break;
				}
			});
			
			/******定义弹出层样式********/
			$(".modal-dialog").getSizeByScreen({
				"width" : 0.45,
				"height" : 0.5,
				"minHeight" : 0.5
			});
			$(".modal-body").getSizeByScreen({
				"height" : 0.5,
				"minHeight" : 0.5
			});
			$(".container").getSizeByScreen({
				"width" : 0.5,
				"height" : 0.5,
				"minHeight" : 0.5
			});
			$("#modal-form").modal("show");
			
			$("#siteContent").children().show();
			
			var rowData = mmg.row($row.index());
			$("#siteContent").find(".ctrl").each(function() {
				var $that = $(this),
					ctrlId = $(this).attr("ctrlId"),
					ctrlType = $that.attr("ctrl-type"),
					ctrlValue = rowData[ctrlId];
				var sysType = $that.attr("syscomtype");
				if (ctrlId) {
					if(sysType=="cusKindEditor"){
				   		var id = $that.find("textarea[name=content]").attr("id");
				   		//这是删除是通过页面保存没有进行初始化的富文本， 避免添加一个还原出两个富文本
						if ($that.find(".ke-container-default").length > 0) {
							$that.children(":first").remove();
						}
				   		ezCommon.kindEditorObj = null;
				   		require.async(SITECONFIG.PUBLICPATH + "/Js/kindeditor/themes/default/default.css", function() {
							require.async(SITECONFIG.PUBLICPATH + "/Js/kindeditor/kindeditor.js", function() {
								ezCommon.kindEditorObj = KindEditor.create('#' + id, {
									width : "100%",
									resizeType : 1,
									allowPreviewEmoticons : false,
									allowImageUpload : true,
									uploadJson : SITECONFIG.ROOTPATH + "/Apps/WechatPublic/kindEditorAjaxUpload", //图片上传后的处理地址
									 //上传文件后执行的回调函数,获取上传图片的路径
									afterUpload : function(url) {
									},
									items : ['fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist', 'insertunorderedlist', '|', 'emoticons', 'image', 'link'],
									afterCreate : function() {
										this.sync();
									},
									afterBlur : function() {
										this.sync();
									}
								});
								  
								ezCommon.kindEditorObj.html(html_decode(ctrlValue));
							});
						});
					}
					switch(ctrlType){
						case "TEXTBOX":
							$that.find("input").val(ctrlValue);
							break;
						case "TEXTAREA":
							$that.find("textarea").val(ctrlValue);
							break;
						case "TIME":
						    $that.find("input").val(ctrlValue);
							break;
						case "DROPDOWN":
							$that.find("select").val(ctrlValue);
							break;
						case "IMAGE":
							if (ctrlValue) {
								$that.find("img").attr('src', ctrlValue);
							} else {
								$that.find("img").attr('src', SITECONFIG.ROOTPATH + "/images/upimg.png");
							}
							break;
						case "CHECKBOX":
							var $itemLabel = $that.find(".itemLabel");
							$itemLabel.removeClass("onChecked");
							$that.find('input[type="checkbox"]').removeAttr("checked");
							var valueArr = ctrlValue.split(",");
							for(var i = valueArr.length - 1; i >= 0 ;i--){
								$.each($itemLabel,function(){
									var $input = $(this).find("input");
									if($input.attr("value") == valueArr[i]){
										$(this).addClass("onChecked");
										$input.attr("checked","checked");
									}
								});
							}
							// var itemsJson = ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["item"]["items"];
							// for(var i in itemsJson){
								// $that.find(".itemLabel."+i).addClass("onChecked");
							// }
							break;
					}
				}
			});
		},
		
		
		/**
		 * 获取表单数据，生成表格，用于表单数据的修改或删除行记录
		 * @param #this 当前表单对象
		 * @param pageId 页面Id
		 * @param formId 表单Id
		 */
		getAllFormData : function(pageId, formId) {
			var cols = [];
			
			$("main").empty().append('<div class="operationbtn"><button class="btn" id="btnAddArr">增加</button><button class="btn" id="btnRemoveSelected">删除选择的行</button></div><table id="mmg" class="mmg"><tr><th rowspan="" colspan=""></th></tr></table><div id="pg" style="text-align: right;"></div>');
			_commonAjax({
				url : SITECONFIG.ROOTPATH + '/Home/FormData/getAFormFiledsInfo',
				data : {
					"siteId" : SITECONFIG.SITEID,
					"formId" : formId
				},
				type : 'post',
				async : false,
				success : function(r) {
					if (r != "null" && r != 0) {
						cols.push({
							title : "ID",
							name : "ID",
							width : 100,
							align : 'center',
						});
						$.each(r, function(m, n) {
							var arr = {
								title : n["fieldTitle"],
								name : n["fieldName"],
								sortable : true,
								width : 100,
								align : 'center',
								renderer : function(val) {
									if (n["controlType"] == "IMAGE") {
										if (val) {
											return '<img height="50" width="50" src="' + val + '" />';
										} else {
											return '<img height="50" width="50" src="' + SITECONFIG.ROOTPATH + '/images/upimg.png" />';
										}
									} else {
										return val;
									}

								}
							};
							cols.push(arr);
						});

						cols.push({
							title : '操作',
							name : '',
							width : 150,
							align : 'center',
							lockWidth : true,
							lockDisplay : true,
							renderer : function(val) {
								return '<button  class="btn btn-info modifyBtn">修改</button> <button  class="btn btn-danger deleteBtn">删除</button>';
							}
						});

						var mmg = $('.mmg').mmGrid({
							height : 500,
							cols : cols,
							url : SITECONFIG.ROOTPATH + '/Home/FormData/getAFormData',
							params : {
								'siteId' : SITECONFIG.SITEID,
								'formId' : formId
							},
							method : 'post',
							remoteSort : true,
							multiSelect : true,
							nowrap : true,
							checkCol : true,
							fullWidthRows : true,
							autoLoad : false,
							plugins : [$('#pg').mmPaginator({})]
						});
						mmg.on('loadSuccess', function(e, data) {
							if (!mmg.rowsLength()) {
								var $mmGrid = $(".mmGrid"), $message = $mmGrid.find('.mmg-message'), $headWrapper = $mmGrid.find(".mmg-headWrapper");
								$message.css({
									'left' : ($mmGrid.width() - $message.width()) / 2,
									'top' : ($mmGrid.height() + $headWrapper.height() - $message.height()) / 2
								}).show();
							}
							/******数据加载失败后执行********/
						}).on('loadError', function(e, data) {
							var $mmGrid = $(".mmGrid"), $message = $mmGrid.find('.mmg-message'), $headWrapper = $mmGrid.find(".mmg-headWrapper");
							$message.css({
								'left' : ($mmGrid.width() - $message.width()) / 2,
								'top' : ($mmGrid.height() + $headWrapper.height() - $message.height()) / 2
							}).text("数据加载失败，请稍后再试").show();
						}).load();
						
						fdWechatAdmin.mmg = mmg;

						/**********增加数据*********/
						$("#btnAddArr").unbind("click").click(function() {
							var formTitle = $("#pageChild").find(".active").text(), pageContent = "";
							$("#modal-form").find(".modal-title").text(formTitle);
							_commonAjax({
								url : SITECONFIG.ROOTPATH + "/Qywx/Editor/loadPage",
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
									pageContent = data.pageContent;
								}
							});
							$("#siteContent").append(pageContent);
							$("#siteContent").children().show();

							fdWechatAdmin.init();
							/******定义弹出层样式********/
							$(".modal-dialog").getSizeByScreen({
								"width" : 0.45,
								"height" : 0.6,
								"minHeight" : 0.6
							});
							$(".modal-body").getSizeByScreen({
								"height" : 0.5,
								"minHeight" : 0.6
							});
							$(".container").getSizeByScreen({
								"width" : 0.4,
								"height" : 0.4,
								"minHeight" : 0.5
							});
							$("#modal-form").modal("show");
						});

						/***增加和修改数据完成后关闭模式窗口时更行当前行数据***/
						$('#modal-form').unbind("hidden.bs.modal").on('hidden.bs.modal', function() {
							mmg.on('cellSelected', function(e, item, rowIndex, colIndex) {
							}).load();
							$("#siteContent").empty();

						});
						
					} else if (r == "null") {
						$("#content").find(".operationbtn").remove();
						$("#content").find("main").text("没有任何数据,请检查是否创建表单字段");
					} else if (r == "0") {
						$("#content").find(".operationbtn").remove();
						$("#content").find("main").text("没有任何数据,请检查是否创建表单");
					}
				},
			});
		},	
		
		
		/**
		 * 获取后台页面单的数据
		 */
		getManageFormData : function(formId) {
			var formData = "";
			if (fdWechatAdmin.getFormHistory) {
				return fdWechatAdmin.getFormHistory;
			}
			ezCommon.formId = formId;
			if (formId) {
				var data = {};
				var a;
				data["id"] = formId;
				data["siteId"] = SITECONFIG.SITEID;
				_commonAjax({
					type : "POST",
					url : SITECONFIG.ROOTPATH + "/FormData/getFormJsonData",
					data : data,
					dataType : "json",
					async : false,
					success : function(result) {
						if (result) {
							formData = JSON.parse(result);
							//hj(标题)
							page = formData["tabs"]["tab1"]["page"];
							$(".pageTopTitle,title ").text(page);
							fdWechatAdmin.getFormHistory = formData;
						}
					}
				});
			}
			return formData;
		},
		
		/**
		 * 调用解析表单方法和动态组件
		 */
		callFormParsing : function(jsonData, formId) {
			if (isObjNull(jsonData))
				return;
			var ctrlList = jsonData["tabs"]["tab1"]["ctrlList"];
			ezCommon.controlLists[formId] = jsonData["controlLists"];
			ezCommon.ctrlNameNum[formId] = jsonData["ctrlIndex"];
			$.each(ctrlList, function(key, value) {
				var control = ezCommon.controlLists[formId][value];
				var operations = ezCommon.controlLists[formId][value]["operations"];
				var attrJson = ezCommon.controlLists[formId][value]["attrs"];
				if (attrJson) {
					require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/attrResolve.js", function(e) {
						e.init($("[ctrlId='" + value + "']"), attrJson);
					});
				}
				
				if (operations) {
					require.async(SITECONFIG.PUBLICPATH + "/Js/actionResolve/actionResolve.js", function(e) {
						e.actionEvent(operations, $("[ctrlId='" + value + "']"));
					});
				}
			});
		},

		/**
		 * 遍历每一个控件，初始化
		 */
		initCtrl : function() {
			$(".myForm .ctrl").each(function() {
				var $this = $(this), ctrlType = $this.attr("ctrl-type"), ctrlId = $(this).attr("ctrlId");
				switch(ctrlType) {
					case "compLogic" :
						break;
					case "systemCp":
						var syscomtype = $this.attr("syscomtype");
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/" + syscomtype + ".js", function(e) {
							e.init($this);
						});
						break;
					default :
						require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/controls/" + ctrlType + ".js", function(e) {
							//require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
								//if (ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"]) //给设置验证规则的控件添加验证
									//e.validate(ezCommon.controlLists[ezCommon.formId][ctrlId]["attrs"]["validate"], $this);
							//});
							e.init($this);
						});
						break;
				}
			});

			//单独查找组件
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/components/compLogic.js", function(e) {
				$(".myForm .ctrl[ctrl-type = 'compLogic']").each(function() {
					var $this = $(this);
					e.initComponent($this, 0);
				});
			});
		},
		
		/**
		 * 预览页面选项控件，各选项单击事件
		 */
		itemCheck : function() {
			$(".selectedForm ").find(".itemLabel").removeClass("onChecked").find("input").removeAttr("checked");
			/**
			 * 页面中,   多选框 每个选项选中事件
			 * @param {Object} selectObj
			 * @param {string} length
			 */
			var ctrlCheckboxDom = $(".ctrlWraper .itemLabel");
			if ($.support.msie) {//适配IE浏览器
				ctrlCheckboxDom.click(function() {
					this.blur();
					this.focus();
				});
			} else {
				$(".itemLabel").unbind("click").click(function(e) {
					preventDefault(e);
					stopEventBubble(e);
					var ctrlName = $(this).parents(".ctrl").attr("ctrlId");
					var selectLimit = ezCommon.controlLists[ezCommon.formId][ctrlName].attrs.item.selectLimit;
					var hasSelect = $(this).closest(".ctrlWraper").find(".onChecked").length;
					var $itemObj = $(this).closest(".ctrlWraper").find(".itemLabel");
					if (selectLimit == "1") {
						$(this).closest(".ctrlWraper").find(".itemLabel").removeClass("buttonChecked onChecked buttonOval");
						//单选或复选按钮选中时,移出选中的类(class)
						$(this).closest(".itemLabel").addClass("onChecked");
						$(this).closest(".ctrlWraper").find("input[type='checkbox']").removeAttr("checked");
						$(this).find("input[type='checkbox']").attr("checked", "checked");
					} else {
						var $itemLabel = $(this).closest(".ctrlWraper").find(".itemLabel");
						if ($(this).hasClass("onChecked")) {
							$(this).removeClass("onChecked");
							$(this).find("input[type='checkbox']").removeAttr("checked");
						} else {
							$(this).addClass("onChecked");
							$(this).find("input[type='checkbox']").attr("checked", "checked");
						}
					}
					if (selectLimit != "1") {

						if (hasSelect >= selectLimit) {
							$(this).removeClass("onChecked");
							$(this).find("input[type='checkbox']").removeAttr("checked");
							alert("选项控制已设置为最多选择" + selectLimit + "项");

						}
					}
				});
			}

		},
		
	};

	//页面左侧菜单收缩
	$('.appLeftMenu > .mainMenu').click(function() {
		if ($(this).next('.childMenu').is(":hidden")) {
			$(this).next('.childMenu').slideDown('slow');
			$(this).children('.clickShow').attr('src', SITECONFIG.PUBLICPATH + "/App/Apps/Index/Images/show.png");
		} else {
			$(this).next('.childMenu').slideUp('slow');
			$(this).children('.clickShow').attr('src', SITECONFIG.PUBLICPATH + "/App/Apps/Index/Images/hide.png");
		}
	});
	
	function setUI(){
		var winH = $(window).height();
		$(".apps_left").height(winH - 70);
	}
	
	/**
	 * 表单数据提交
	 */
	function  formDataSubmit () {
		var formId = $(".selectedForm").attr("id");
		require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
			require.async(SITECONFIG.PUBLICPATH + "/Js/vaildate/jquery.validate.js", function() {
				var isVal = $(".selectedForm").validate(e.validateOpts);
				if (isVal && $(".selectedForm").valid() && e.validateQueness(formId)) {
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ajaxData.js", function(e) {
						var flag = e.saveFormData(fdWechatAdmin.modifyDataId);
						
						if(flag){
							$("#modal-form").modal("hide");
							fdWechatAdmin.mmg.load();
						}
					});
				}
			});
		});
	}
	
	/**
	 * 表单数据提交
	 */
	function mgrPageFormSubmit ($submitBtn) {
		var formDataId = $submitBtn.parents("form").attr("formDataId"), 
			formId = $submitBtn.parents("form").attr("id"), ctrlId = $submitBtn.attr("name");
		require.async(SITECONFIG.PUBLICPATH + "/Js/attrResolve/validate.js", function(e) {
			require.async(SITECONFIG.PUBLICPATH + "/Js/vaildate/jquery.validate.js", function() {
				var isVal = $submitBtn.parents("form").validate(e.validateOpts);
				if (isVal && $submitBtn.parents("form").valid() && e.validateQueness(ezCommon.formId)) {
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ajaxData.js", function(e) {
						var flag = e.saveFormData(formDataId);
						if (flag) {
							var operations = ezCommon.controlLists[formId][ctrlId]["operations"];
							if (operations) {
								require.async(SITECONFIG.PUBLICPATH + "/Js/actionResolve/actionResolve.js?h=2", function(e) {
									e.actionEvent(operations, $("[ctrlId='" + ctrlId + "']"), 1);
								});
							}
						}
					});

				}
			});
		});
	}
	
	fdWechatAdmin.init();
	module.exports = fdWechatAdmin;

});
