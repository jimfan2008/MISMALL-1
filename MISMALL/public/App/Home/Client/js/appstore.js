/**
 * @author Administrator
 */
jQuery(function($) {

	var AjaxgetAppstore = {
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
			if (AjaxgetAppstore.isLogin()) {
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
					window.location ="/mismalls/Unregistered/login.html";
			}
		},
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
		},
		getAppstoreData : function() {
			var tplConterData = '';
			$.ajax({
				type : "POST",
				url : APPPATH + "/Unregistered/getSaleApps",
				data : {},
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
		getAppstoreHtml : function(data) {
			var apptoreHtml = [];
			if (data["saleApps"]) {
				$.each(data["saleApps"], function(key, value) {
					if (key % 4 == 0) {
						apptoreHtml.push('<div class="row">');
					}
					apptoreHtml.push('<div class="col-md-3 col-sm-6 wow fadeInDown animated templated" ><div class="temp-border" style=""><div class="img" ><img style="width:100%;height:183px" alt="" src="');
					if(value["thumbPath"].indexOf("qjwd.oss")>-1){
						apptoreHtml.push(value["thumbPath"]);
					}else{
						apptoreHtml.push(APPPATH+value["thumbPath"]);
					}
					apptoreHtml.push('" class="img-responsive"></div><div class = "appInfoWrap"><div style="padding: 6px 0"><span class = "appName" class="template-name">');
					apptoreHtml.push(value["siteName"]);
					apptoreHtml.push('</span><span class="template-price" style="color: red;float:right"><strong>¥ ');
					apptoreHtml.push(value['price']);
					apptoreHtml.push('</strong></span><br style = "clear:both"/></div><div class = "appAuthor"><span class="template-author"><strong style = "padding-right:5px">');
					apptoreHtml.push(value['user_name']);
					apptoreHtml.push('</strong>的作品</span></div><div class="row optBtnWrap"><span class="template-details col-md-6"><a class="btn btn-info active no-radius" href="../AppStore/shop_detail.html?id='+value["id"]+'" data-filter="*">详情</a></span>');
					apptoreHtml.push('<span class="template-buy col-md-6" ><a class="btn btn-info active no-radius" href="../AppStore/confirmorder.html?id='+value["id"]+'" data-filter="*"  uid='+value["userId"]+'  onclick="">购买</a></span>');
					apptoreHtml.push('</div></div></div></div>');
					
					if (key % 4 == 3) {
						apptoreHtml.push('</div>');
					}
						
				});
			} else {
				apptoreHtml.push('<div class="template_no" style="display: block;">暂无应用，请选择其他分类</div>');
			}
			return apptoreHtml.join('');
		},
	};

	var appstoreData = AjaxgetAppstore.getAppstoreData();
	var pageOptions = {
		bootstrapMajorVersion : 3,
		numberOfPages : 5,
		totalPages : Math.ceil(appstoreData["totalCount"] / 12),
		itemTexts : function(type, page, current) {

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
			var appType = "";
			$.post(APPPATH + "/Unregistered/getSaleApps", {
				page : page,
				"apptype" : appType,
			}, function(data) {
				var appstoreHtml = AjaxgetAppstore.getAppstoreHtml(data);
				$("#templatelist").find(".container").empty();
				$("#templatelist").find(".container").append(appstoreHtml);
			});
		}
	};

	var appstoreHtml = AjaxgetAppstore.getAppstoreHtml(appstoreData);
	$("#templatelist").find(".container").append(appstoreHtml);
	
	if(appstoreData.totalCount > 12){
		$(".pagination").bootstrapPaginator(pageOptions);
	}
	$(".template-buy").click(function(){
		AjaxgetAppstore.editorByTplId(1,15);
	});
});
