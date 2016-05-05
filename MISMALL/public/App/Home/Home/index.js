$(function() {
	/* banner begin */
	// $("#top_banner").banner();
	$(window).resize(function(e) {

	});
	/* banner end */

	$.ajax({
		type : "POST",
		url : ROOTPATH + "/AppStore/getHottestAppInfo",
		data : null,
		success : function(data) {
			var json_data = JSON.parse(data);
			$(".shop_applist").empty();
			$.each(json_data, function(i, v) {
				var innerHtml = '<li id="' + v.ID + '">';
				// 给每个li添加点击事件。
				innerHtml += '<p class="pic_div"><a href="' + Shop_detail + '?id=' + v.ID + '"><img src="' + UPLOAD_URL + v.imgPath + '" width="90" height="90" /></a></p>';
				innerHtml += '<p class="name"><a href="' + Shop_detail + '?id=' + v.ID + '">' + v.projectName + '</a></p>';
				innerHtml += '<p class="price">' + v.projectPrice + '元/天</p>';
				innerHtml += '<p class="buy"><a href="' + Shop_detail + '?id=' + v.ID + '">购买</a></p>';
				innerHtml += '</li>';
				$(".shop_applist").append(innerHtml);
			});
		}
	});

	if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g, "") == "MSIE6.0") {
		$("#toTemp").find(".tt1").addClass("ttIE1").removeClass("tt1");
		$("#toTemp").find(".tt2").addClass("ttIE2").removeClass("tt2");
	} else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g, "") == "MSIE7.0") {
		$("#toTemp").find(".tt1").addClass("ttIE1").removeClass("tt1");
		$("#toTemp").find(".tt2").addClass("ttIE2").removeClass("tt2");
	} else if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
		$("#toTemp").find(".tt1").addClass("ttIE1").removeClass("tt1");
		$("#toTemp").find(".tt2").addClass("ttIE2").removeClass("tt2");
	}
	//点击进入创建表单按钮
	$(".banner1").find(".botton").click(function() {
		$.ajax({
			type : "post",
			url : APPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
				if (result) {
					$.ajax({
						type : "post",
						url : APPPATH + "/Qywx/Editor/initFactory",
						data : null,
						async : false,
						success : function(result1) {
							window.location = ROOTPATH + "/Qywx/Editor/index";
						}
					});
				} else {
					$("#a_show_login").click();
				}
			}
		});

	});

	//点击进入创建模板按钮
	$(".banner2").find(".botton").click(function() {
		$.ajax({
			type : "post",
			url : ROOTPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
				if (result) {
					window.location = ROOTPATH + "/Template/index";
				} else {
					$("#a_show_login").click();
				}
			}
		});
	});
	//需求发布页面相关JS（点击文本框等时添加边框）
	$(".text").click(function() {
		$(".text").css("border", "1px solid #CCCCCC");
		$(this).css("border", "1px solid #2795D0");
	});
	$(".requestMoney").numeral();
	//取值
	// var textareaContent = _getCookie("content");
	// $("#nowContent").text(textareaContent);
    $(".requestTitle").click(function() {
			$(".writeTitle").hide();
		});
		$(".requestMoney").click(function() {
			$(".writeMoney").hide();
		});
		$(".requestDate").click(function() {
			$(".writeDate").hide();
		});
		$(".requestContent").click(function() {
			$(".writeContent").hide();
		});
	//需求发布页面相关JS（主要是验证以及提交数据）
	$(".addRequest").click(function() {
		//取值
		var type = $("#nowSelected option:selected").val(), title = $(".requestTitle").val(), content = $(".requestContent").val(), money = $(".requestMoney").val(), date = $(".requestDate").val();
		//验证数据
		if (!title) {
			$(".writeTitle").show();
			$(".in").show();
		}
		if (!money) {
			$(".writeMoney").show();
		} 
         if (!date) {
			$(".writeDate").show();
		} 
		if (!content) {
			$(".writeContent").show();
		}
		//验证通过
		if (title && money && date && content) {
			$("#ajaxmask").show();
						setTimeout(function() {
							$("#ajaxmask").hide();
						}, 500);
			// $.ajax({
				// type : "POST",
				// url : ROOTPATH + "/Index/savePublishRequest",
				// data : {
					// 'type' : type,
					// 'title' : title,
					// 'money' : money,
					// 'date' : date,
					// 'content' : content
				// },
				// async : false,
				// success : function(result) {
					// if (result) {
						// $("#ajaxmask").show();
						// setTimeout(function() {
							// $("#ajaxmask").hide();
						// }, 500);
					// }
				// }
			// });
		}
	});
	//点击进入ezfrom了解更多...
	$("#content .project_list #one").click(function() {
		$.ajax({
			type : "post",
			url : ROOTPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
				if (result) {
					window.location = ROOTPATH + "/Qywx/Editor/index";
				} else {
					$("#a_show_login").click();
				}
			}
		});

	});

	//点击进入ezsize了解更多...
	$("#content .project_list #two").click(function() {
		$.ajax({
			type : "post",
			url : ROOTPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
				if (result) {
					window.location = ROOTPATH + "/Template/index";
				} else {
					$("#a_show_login").click();
				}
			}
		});
	});

	$("#sina_weibo").click(function() {
		window.open("http://weibo.com/u/5117349177");
	});

	$("#tencent_weibo").click(function() {
		window.open("http://t.qq.com/weiyiyun01");
	});
});

//二维码分享到腾讯微博
function postToWb() {
	var _t = encodeURI(window.location.host + '/Index/index.html' + '网站建站神器,简单从这里开始。');
	var _url = encodeURI(document.location);
	var _appkey = encodeURI("appkey");
	var _pic = encodeURI('');
	var _site = '';
	var _u = 'http://v.t.qq.com/share/share.php?title=' + _t + '&url=' + _url + '&appkey=' + _appkey + '&site=' + _site + '&pic=' + _pic;
	window.open(_u, '转播到腾讯微博', 'height=330,width=550,top=' + (screen.height - 280) / 2 + ',left=' + (screen.width - 550) / 2 + ', toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no');
}

//二维码分享到新浪微博
function postSina() {
	var url = 'http://v.t.sina.com.cn/share/share.php?appkey=你的APPKEY&title=' + encodeURIComponent(window.location.host + '/Index/index.html' + '网站建站神器,简单从这里开始。') + '&amp;info=' + encodeURIComponent('${(activity.intro)!}') + ' ' + encodeURIComponent(document.location.href);
	window.open('http://v.t.sina.com.cn/share/share.php?' + url + '&amp;' + new Date().getTime(), 'newwindow', 'height=330,width=550,top=' + (screen.height - 280) / 2 + ',left=' + (screen.width - 550) / 2 + ', toolbar=no, menubar=no, scrollbars=no,resizable=yes,location=no, status=no');
}

//购买
/*$("body").undelegate($(".buyBtn"),"click").delegate($(".buyBtn"),"click",function(){
$.ajax({
type : "post",
url : GROUPPATH + "/Passport/isLogin",
data : null,
async : false,
success : function(result) {
if(result) {
//   window.location = 'confirmorder.html?id=' + id;
} else {
$("#a_show_login").click();
}
}
});
});*/

/**
 * ezApp 进入开发
 */
$("#btn_ezApp").click(function() {
	$.ajax({
		type : "post",
		url : GROUPPATH + "/Passport/isLogin",
		data : null,
		async : false,
		success : function(result) {
			if (result) {
				window.location = APPPATH + "/Template/index/type/40.html";
				///Qywx/Editor/edit";
			}
			else {
				$("#a_show_login").click();
			}
		}
	});
});

