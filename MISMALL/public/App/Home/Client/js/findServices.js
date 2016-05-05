jQuery(function($) {
	var AjaxgetServices = {
		getServicesData : function() {
			var tplConterData = '';
			$.ajax({
				type : "POST",
				url : APPPATH + "/Client/findServicesUser",
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
		getServicesHtml : function(data) {
			var servicesHtml = [];
			if (data) {
				$.each(data, function(key, value) {
					servicesHtml.push('<div class="col-md-12 col-sm-12 findServicesSiteList">');
					servicesHtml.push('<ul><li class="siteList"><div class="siteListImg" ><img src="');
					servicesHtml.push(value["userPhoto"]);
					servicesHtml.push('"></div><div class="findServicesContext"><p class="p1" ><span style="font-size: 16px">');
					servicesHtml.push(value['userName']);
					servicesHtml.push('</span><span class="p1_span1" ><img src="' + PUBLICPATH + '/App/Home/Client/images/award.jpg"></span><span ><a href="javascript:;">&nbsp;</a></span></p><p class="p2"><span >');
					servicesHtml.push(value['introduction']);
					servicesHtml.push('</span></p><p class="p3" ><span> 开发的应用 </span><span>评价</span></p></div><div class="callBtn" ><span><a style="color:white" href="http://wpa.qq.com/msgrd?v=3&uin='+value['userQQ']+'&site=qq&menu=yes" target="_blank">找TA联系</a></span></div></li></ul>');
					servicesHtml.push('</div>');
				});
			} else {
				    servicesHtml.push('<div class="template_no" style="display: block;">暂无应用，请选择其他分类</div>');

			}
			return servicesHtml.join('');
		},
	};

	var servicesData = AjaxgetServices.getServicesData();
	var getServicesHtml = AjaxgetServices.getServicesHtml(servicesData);
	$("#servicesList").find(".servicesUsers").append(getServicesHtml);
});
