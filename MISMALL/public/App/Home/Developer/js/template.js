/*! fanwb - 2015-12-14 */
jQuery(function($) {
	$(".search_box").keydown(function(ev) {
		var oEven = ev || event;
		if (oEven.keyCode == 13) {
			var keyword = $(".search_box").val();
			var tplData = AjaxGetTplData.getTplData(keyword);
			var tplHtml = AjaxGetTplData.getTplHtml(tplData);
			$("#templatelist").find(".container").append(tplHtml);

		}
	});

	var AjaxGetTplData = {
		getTplData : function(tplType,keyword) {
			var tplConterData = '';
			$.ajax({
				type : "POST",
				url : APPPATH + "/Developer/queryTpl",
				data : {
					"tplType" : tplType,
					"keyword":keyword
				},
				dataType : 'JSON',
				async : false,
				success : function(data) {
					if (data) {
						tplConterData = data;
					} else {
						tplConterData = "获取数据失败，请稍后在试";
					}
				}
			});
			return tplConterData;

		},
		getTplHtml : function(data) {
			var tplHtml = [];
			if (data["list"]) {
				$.each(data["list"], function(key, value) {
					if (key % 4 == 0) {
						tplHtml.push('<div class="row">');
					}
					tplHtml.push('<div class="col-md-3 col-sm-6 templated appItem" ><div class="appItemInner"><div class="img"><img style="width:100%;height:200px" alt="" src="');
					tplHtml.push(value["thumbPath"]);
					tplHtml.push('" class="img-responsive"></div>');
					tplHtml.push('<div class="row" style = "padding:20px;"><span class="template-details col-md-6">');
					tplHtml.push(value["siteName"]);
					tplHtml.push('</span><span class="editTemp col-md-6" ><a class="btn btn-info active no-radius" href="#" data-filter="*" siteTempType=" ');
					tplHtml.push(value["siteTempType"]);
					tplHtml.push('" siteId = "');
					tplHtml.push(value["id"]);
					tplHtml.push('">使用</a></span></div></div></div>');
					if (key % 4 == 3) {
						tplHtml.push('</div>');
					}
				});
			} else {
				$("#templatelist").find(".container").empty();
				tplHtml.push('<div class="template_no" style="display: block;">暂无模板，请选择其他分类</div>');
			}
			return tplHtml.join('');
		},
	};

	var tplData = AjaxGetTplData.getTplData("tpl");
	var pageOptions = {
		bootstrapMajorVersion : 3,
		numberOfPages : 5,
		totalPages : Math.ceil(tplData["total"] / 5),
		tooltipTitles : function(type, page, current) {

			switch (type) {
				case "first":
					return "首页";
				case "prev":
					return "上一页";
				case "next":
					return "下一页";
				case "last":
					return "末页";
				case "page":
					return (page === current) ? "第 " + page + "页" : "第" + page + "页";
			}
		},
		onPageClicked : function(event, originalEvent, type, page) {
			var tplType = $(".templateData").find(".active a").attr("tpltype");
			$.post(APPPATH + "/Developer/queryTpl", {
				page : page,
				"tplType" : tplType,
			}, function(data) {
				var tplHtml = AjaxGetTplData.getTplHtml(tplData);
				$("#templatelist").find(".container").empty();
				$("#templatelist").find(".container").append(tplHtml);

				$(".templateData span").on('click', function() {
					var tplType = $(this).attr('tplType');

					$(this).parent("div").find(".active").removeClass("active");
					$(this).addClass("active");

					$("#templatelist").find(".container").empty();
					tplData = AjaxGetTplData.getTplData(tplType);

					var tplHtml = AjaxGetTplData.getTplHtml(tplData);
					$("#templatelist").find(".container").append(tplHtml);

					$.extend(pageOptions, {
						totalPages : Math.ceil(tplData['TotalCount'] / 5)
					});
					$(".pagination").bootstrapPaginator(pageOptions);

				});

				$("#templatelist").delegate(".editTemp > a", "click", function() {
					var sitetemptype = $(this).attr("sitetemptype");
					var siteId = $(this).attr("siteid");
					ezPageCommon.setWXSiteName(sitetemptype, siteId);
				});

			});

		}
	};
	var ezPageCommon = {
		/**
		 * 设置微信企业应用名
		 */
		setWXSiteName : function(tempType, siteId) {
			//微观直接创建应用
			if (tempType == 3) {
				ezPageCommon.editorByTplId(tempType, siteId);
				return;
			}
			// _setCookie("from_page", 'mycenter');
			var $panelObj = $("#siteName");
			if (tempType == 1) {
				$panelObj.find(".modal-title").text("应用名设置");
			} else if (tempType == 3) {
				$panelObj.find(".modal-title").text("微观名设置");
			} else {
				$panelObj.find(".modal-title").text("网站名设置");
			}

			$panelObj.modal("show");
			
			
			var $selectImg = $("#change_avator");
			$('.image-editor').cropit();
			
			$("#change_avator").click(function(e) {
				$(".cropit-image-input").trigger("click");
			});
	
			$("#another").click(function() {
				$(".cropit-image-input").trigger("click");
			});
	
			$(".cropit-image-input").change(function() {
				var iw = $selectImg.width(), ih = $selectImg.height(), w = 420, h = 200,
					marginTop = ($(window).height() - h)/3;
	      		$('.image-editor').cropit('previewSize', {
	      			 width: w, 
	      			 height: h
	      			}).css("margin-top","50px");
				$(".formWraper").height($(this).closest(".modal-dialog").height()-1).show();
			});
			
			$('#sureBtn').click(function() {
				var imageData = $('.image-editor').cropit('export');
				$.ajax({
					type : "POST",
					data : {"image-data":imageData},
					url : ROOTPATH + "/Home/Public/base64",
					dataType : 'JSON',
					success : function(data) {
						if(data.data.url == undefined){
							$selectImg.attr("src", data.url);
						}else{
							$selectImg.attr("src", data.data.url);
						}
						$(".formWraper").hide();
					}
				});
			});
			
			$("#cancle").click(function() {
				$(".formWraper").hide();
			});
			
			// $panelObj.find(".ImagePreview").undelegate('#inputFile3', 'change').delegate('#inputFile3', 'change', function() {
				// $.ajaxFileUpload({
					// type : "POST",
					// url : ROOTPATH + "/Index/uploadPicture/type/ajax",
					// secureuri : false,
					// fileElementId : 'inputFile3',
					// dataType : 'JSON',
					// success : function(data) {
						// var json = eval('(' + data + ')');
						// console.log(data);
						// $panelObj.find(".ImagePreview").find("img").attr('src', json.image).attr('data-id', json['id']);
					// }
				// });
			// });
			$("#setNameCancleBtn").click(function() {
				$panelObj.modal("hide");
			});
			onValueChange($("#addName")[0], function() {
				$("#modal_errormessage").hide();
			});
			//下一步
			$("#setNameSureBtn").click(function() {
				var name = $.trim($("#addName").val());
				var imgSrc = $.trim($(".ImagePreview").find("img").attr("data-id"));
				if (!name) {
					$("#modal_errormessage").text("名称不能为空").show();
				}
				if (name) {
					//验证名称是否存在
					var _isName = function() {
						var bool = false;
						var data = {};
						data["siteName"] = name;
						//data["imgData"] = imgData;
						$.ajax({
							type : "POST",
							url : ROOTPATH + "/Template/getUserSiteName",
							data : data,
							async : false,
							success : function(result) {
								if (result != 0) {
									bool = true;
								} else {
									$("#modal_errormessage").show();
								}
							}
						});
						return bool;
					};
					if (_isName()) {
						ezPageCommon.editorByTplId(tempType, siteId, name, imgSrc);
					}
				}
			});
		},
		/**
		 * 根据模板ID编辑站点
		 * ＠param int siteId
		 */
		editorByTplId : function(tempType, siteId, name, imgSrc) {
			var url = "";
			var param = '/tplId/' + siteId;
			if (imgSrc == undefined) {
				imgSrc = '';
			}
			if (imgSrc != '') {
				param += '/imgSrc/' + imgSrc;
			}
			if (name != undefined) {
				param += '/siteName/' + name;
			}
			if (ezPageCommon.isLogin()) {
				if (tempType == 1) {
					url = ROOTPATH + "/Qywx/Editor/index";
				} else if (tempType == 2) {
					url = ROOTPATH + "/ezApp/Index/index";
				} else if (tempType == 3) {
					url = ROOTPATH + "/ViewGet/Editor/index";
				} else {
					url = ROOTPATH + "/Qywx/Editor/index";
				}
				window.location = url + param;
			} else {
				//跳转登录
				$("#a_show_login").click();
			}
		},
		/**
		 * 根据站点ID编辑站点
		 * ＠param int siteId
		 */
		editorBySiteId : function(tempType, siteId) {
			_setCookie("from_page", 'template');
			// 记录编辑器来路

			var url = "";
			var param = '/siteId/' + siteId;
			if (ezPageCommon.isLogin()) {
				if (tempType == 1) {
					url = ROOTPATH + "/Qywx/Editor/index";
				} else if (tempType == 2) {
					url = ROOTPATH + "/ezApp/Index/index";
				} else if (tempType == 3) {
					url = ROOTPATH + "/ViewGet/Editor/index";
				} else {
					url = ROOTPATH + "/Qywx/Editor/edit";
				}
				window.location = url + param;
			} else {
				//跳转登录
				$("#a_show_login").click();
			}
		},
		/**
		 *是否登录状态
		 *@return boolean true OR false
		 */
		isLogin : function() {
			var status = false;
			$.ajax({
				type : "POST",
				url : ROOTPATH + "/Passport/isLogin",
				data : {},
				async : false,
				success : function(data) {
					status = data ? true : false;
				}
			});
			return status;
		}
	};

	var tplHtml = AjaxGetTplData.getTplHtml(tplData);
	$("#templatelist").find(".container").append(tplHtml);

	$(".templateData span").on('click', function() {
		var tplType = $(this).attr('tplType');

		$(this).parent("div").find(".active").removeClass("active");
		$(this).addClass("active");

		$("#templatelist").find(".container").empty();
		tplData = AjaxGetTplData.getTplData(tplType);

		var tplHtml = AjaxGetTplData.getTplHtml(tplData);
		$("#templatelist").find(".container").append(tplHtml);

		$.extend(pageOptions, {
			totalPages : Math.ceil(tplData['TotalCount'] / 5)
		});
		$(".pagination").bootstrapPaginator(pageOptions);

	});

	$("#templatelist").delegate(".editTemp > a", "click", function() {
		var sitetemptype = $(this).attr("sitetemptype");
		var siteId = $(this).attr("siteid");
		ezPageCommon.setWXSiteName(sitetemptype, siteId);
	});
	
});

