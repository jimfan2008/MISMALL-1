var curr;

/*加载事件begin*/
$(function() {
	var id = _getUrlParas("id") ? _getUrlParas("id") : 0;		// 当前项目的发布ID
	//提交评论的秒
	var seconds;
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/AppStore/getAReleaseProjectInfo",
		data : {
			id : id
		},
		success : function(data) {
			//加载项目详细信息数据
			var json_data = JSON.parse(data);
			$(".curent.fl").find("span:last-child").text(json_data.projectName);
			$(".pre").find("strong").text(json_data.projectPrice);
			$(".infor_jx").text(json_data.projectDesc);
			$(".title2").find("strong").text(json_data.projectName + "应用介绍");
			//有多少条评论数
			$(".redfot").children("b").text(json_data.commentNum);

			$(".navlist ul").children("li:eq(0)").children("strong").text(json_data.projectType);
			var date = new Date(Date.parse(json_data.releaseTime.replace(/-/g, "/")));
			//转换成Data();
			var newDate = date.FormatTime("yyyy-MM-dd");
			$(".navlist ul").children("li:eq(2)").children("strong").text(newDate);
			$(".navlist ul").children("li:eq(3)").children("strong").text(json_data.releaseUser);

			// 显示项目LOGO
			$.ajax({
				type : "post",
				url : GROUPPATH + "/AppStore/getAReleaseImageDetailInfo",
				data : {id : json_data.projectImage},
				success : function(data1) {
					var json_data1 = JSON.parse(data1);
					if (typeof(json_data1) != "undefined")
						var img_src = PUBLICPATH + json_data1.imgPath + json_data1.imgName + '.' + json_data1.imgType;
					else
						var img_src = PUBLICPATH + '/Uploads/Images/ReleaseProject/nopic.png';
					$("#app_logo").attr("src", img_src);
				}
			});
			totalProjectComment(0);
			totalProjectComment(1);
			totalProjectComment(2);
			totalProjectComment(3);
			loadProjectCommentInfo(0);
		}
	});

	//好  中  差  全 点击事件
	$(".tit_list ul li a").click(function() {
		var type = $(this).attr("val");
		$(".commenttype").find("a").css("background", "").css("color", "#fff");
		$("#allcomment").css("background", "#37bd42");
		$(this).css("background", "#FFF").css("color", "#000");
		loadProjectCommentInfo(type);
	});

	//发布评论
	$("#submitbtn").click(function() {
		var myDate = new Date();
		if (seconds) {
			//开始时间
			var date1 = new Date();
			//结束时间   seconds
			var date3 = date1.getTime() - seconds.getTime();
			//时间差的毫秒数
			//计算出相差天数
			var days = Math.floor(date3 / (24 * 3600 * 1000));
			//计算出小时数
			var leave1 = date3 % (24 * 3600 * 1000);
			//计算天数后剩余的毫秒数
			var hours = Math.floor(leave1 / (3600 * 1000));
			//计算相差分钟数
			var leave2 = leave1 % (3600 * 1000);
			//计算小时数后剩余的毫秒数
			var minutes = Math.floor(leave2 / (60 * 1000));
			//计算相差秒数
			var leave3 = leave2 % (60 * 1000);
			//计算分钟数后剩余的毫秒数
			var seconds2 = Math.round(leave3 / 1000);
			//alert(" 相差 " + days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds2 + " 秒");
			if (seconds2 < 5) {
				$.messager.alert("操作提示", "您提交评论的速度太快了,请稍候再发表评论。！");
				return;
			}
		}
		seconds = myDate;
		getComment();
		loadProjectCommentInfo(0);
		totalProjectComment(0);
		totalProjectComment(1);
		totalProjectComment(2);
		totalProjectComment(3);
	});

	//试用
	$("#try").click(function() {
	});

	//购买
	$("#buy").click(function() {
		window.location = "confirmorder?id=" + id;
	});

	//根据传入的值得到评论数量      type评论级别        0-全部   3-差评 2-中评 1-好评
	function totalProjectComment(type) {
		var type = type;
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/getAReleaseProjectCommentNum",
			data : {
				id : id,
				comment_display : type
			},
			success : function(data) {
				//评论数
				$(".tit_list ul").find("li").eq(type).find("b").text(data);
			}
		});
	}

	//根据传入的值得到评论信息      type评论级别        0-全部   3-差评 2-中评 1-好评
	function loadProjectCommentInfo(type) {
		var type = type;
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/getAReleaseProjectCommentInfo",
			data : {
				id : id,
				comment_display : type
			},
			success : function(data) {
				$("#ulComment").empty();
				var json_data = JSON.parse(data);
				$.each(json_data, function(i, v) {
					var commentGrade;
					switch(v.commentGrade) {
						case "3":
							commentGrade = "差评";
							break;
						case "2":
							commentGrade = "中评";
							break;
						case "1":
							commentGrade = "好评";
							break;
					}
					var html = "<li class='bd'><div><span class='plfl name fl'>用户" + v.commentUser + "说：</span>";
					html += "<span class='plfl fl'>" + v.commentGrade + "</span> <span class='plfl fl'>版本：1.0.0</span>";
					html += "<span class='plfl time fr'>" + v.commentTime + "</span></div>";
					html += "<div class='plinfor'>" + v.content + " </div></li>";
					$("#ulComment").append(html);
				});
				pager();
			}
		});
	}

	//截图图片
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/AppStore/getReleaseProjectImagesInfo",
		data : {
			id : id
		},
		success : function(data) {
			var json_data = JSON.parse(data);
			var html = "";
			$.each(json_data, function(i, v) {
				var img_src = PUBLICPATH + v.imgPath + v.imgName + '.' + v.imgType;
				html += "<li><img src='" + img_src + "' width='620' height='320' id='" + v.ID + "' /></li>";
			});						
			$(".slides").append(html);
			loadAppPrevireImg();	// 加载截图轮播效果		
		}
	});
		
});
/*加载事件end*/


/* 应用预览图轮播效果 start */
var loadAppPrevireImg = function() {
	// We are listening to the window.load event, so we can be sure
	// that the images in the slideshow are loaded properly.
	// Testing wether the current browser supports the canvas element:
	var supportCanvas = 'getContext' in document.createElement('canvas');
	// The canvas manipulations of the images are CPU intensive,
	// this is why we are using setTimeout to make them asynchronous
	// and improve the responsiveness of the page.
	var slides = $('#slideshow li'), current = 0, slideshow = {
		width : 0,
		height : 0
	};
	setTimeout(function() {
		window.console && window.console.time && console.time('Generated In');
		if (supportCanvas) {
			$('#slideshow img').each(function() {
				if (!slideshow.width) {
					// Taking the dimensions of the first image:
					slideshow.width = this.width;
					slideshow.height = this.height;
				}
				// Rendering the modified versions of the images:
				createCanvasOverlay(this);
			});
		}
		window.console && window.console.timeEnd && console.timeEnd('Generated In');
		if ($(".slides li").length > 1) {
			$('#slideshow .arrow').click(function() {
				var li = slides.eq(current), canvas = li.find('canvas'), nextIndex = 0;
				// alert(current);
				// Depending on whether this is the next or previous
				// arrow, calculate the index of the next slide accordingly.
				if ($(this).hasClass('next')) {

					nextIndex = current >= slides.length - 1 ? 0 : current + 1;
				} else {
					nextIndex = current <= 0 ? slides.length - 1 : current - 1;
				}
				var next = slides.eq(nextIndex);
				if (supportCanvas) {
					// This browser supports canvas, fade it into view:
					canvas.fadeIn(function() {
						// Show the next slide below the current one:
						next.show();
						current = nextIndex;
						// Fade the current slide out of view:
						li.fadeOut(function() {
							li.removeClass('slideActive');
							canvas.hide();
							next.addClass('slideActive');
						});
					});
				} else {
					// This browser does not support canvas.
					// Use the plain version of the slideshow.
					current = nextIndex;
					next.show();
					li.removeClass('slideActive').hide();
				}
			});
		} else {
			$('#slideshow .arrow').click(function() {
				$("#last").fadeIn("slow");
				$("#last").css("display", "block");
				setTimeout(function() {
					$("#last").css("display", "none");
				}, 3000);
			});
		}
	}, 10);

	// This function takes an image and renders
	// a version of it similar to the Overlay blending
	// mode in Photoshop.

	function createCanvasOverlay(image) {

		var canvas = document.createElement('canvas'), canvasContext = canvas.getContext("2d");

		// Make it the same size as the image
		canvas.width = slideshow.width;
		canvas.height = slideshow.height;

		// Drawing the default version of the image on the canvas:
		canvasContext.drawImage(image, 0, 0);

		// Taking the image data and storing it in the imageData array:
		var imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height), data = imageData.data;

		// Loop through all the pixels in the imageData array, and modify
		// the red, green, and blue color values.

		for (var i = 0, z = data.length; i < z; i++) {
			// The values for red, green and blue are consecutive elements
			// in the imageData array. We modify the three of them at once:

			data[i] = ((data[i] < 128) ? (2 * data[i] * data[i] / 255) : (255 - 2 * (255 - data[i]) * (255 - data[i]) / 255));
			data[++i] = ((data[i] < 128) ? (2 * data[i] * data[i] / 255) : (255 - 2 * (255 - data[i]) * (255 - data[i]) / 255));
			data[++i] = ((data[i] < 128) ? (2 * data[i] * data[i] / 255) : (255 - 2 * (255 - data[i]) * (255 - data[i]) / 255));

			// After the RGB elements is the alpha value, but we leave it the
			// same.
			++i;
		}

		// Putting the modified imageData back to the canvas.
		canvasContext.putImageData(imageData, 0, 0);

		// Inserting the canvas in the DOM, before the image:
		image.parentNode.insertBefore(canvas, image);
	}
};
/* 应用预览图轮播效果 end*/

// 获取输入的app_url
function getAppUrl(str) {
	// alert(str);
	$("#appurl_addr").html(str);
}

// 分页效果
function pager() {
	var total = Math.ceil($("#ulComment li").length / 10);
	curr = 1;
	$("#ulComment").find("li").show();
	$("#ulComment").find("li:lt(" + (curr - 1) * 10 + ")").hide();
	$("#ulComment").find("li:gt(" + (curr * 10 - 1) + ")").hide();
	$("#pager").pager({
		pagenumber : 1,
		pagecount : parseInt(total),
		buttonClickCallback : PageClick
	});
}

PageClick = function(pageclickednumber) {
	curr = pageclickednumber;
	var total = Math.ceil($("#ulComment li").length / 10);
	$("#ulComment").find("li").show();
	$("#ulComment").find("li:lt(" + (curr - 1) * 10 + ")").hide();
	$("#ulComment").find("li:gt(" + (curr * 10 - 1) + ")").hide();
	$("#pager").pager({
		pagenumber : curr,
		pagecount : parseInt(total),
		buttonClickCallback : PageClick
	});
};

// 提交评论
function getComment() {
	html = editor.html();
	// 同步数据后可以直接取得textarea的value
	editor.sync();
	var content = $("#content").val();
	//alert(content);
	var grade = $("input[type='radio'][name='comment-rank']:checked").val();
	var id = _getUrlParas("id");
	if (content.length < 5) {
		$.messager.alert("操作提示", "最少输入5个字！");
	} else {
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/saveUserComment",
			async : false,
			data : {
				comment_content : content,
				comment_grade : grade,
				id : id
			},
			success : function(data) {
				KindEditor.instances[0].html('');
			},
			error : function() {
				alert("服务器忙，请稍候再试！");
			}
		});
	}
}

// 限制评论字符长度
$("textarea[maxlength]").keyup(function() {
	var area = $(this);
	var max = parseInt(area.attr("maxlength"));
	// 获取maxlength的值
	if (max > 0) {
		// alert(area.attr("maxlength"));
		if (area.val().length > max) {// textarea的文本长度大于maxlength
			area.val(area.val().substr(0, max));
			// 截断textarea的文本重新赋值
		}
	}
});

$("textarea[maxlength]").blur(function() {
	var area = $(this);
	var max = parseInt(area.attr("maxlength"));
	// 获取maxlength的值
	if (max > 0) {
		if (area.val().length > max) {// textarea的文本长度大于maxlength
			area.val(area.val().substr(0, max));
			// 截断textarea的文本重新赋值
		}
	}
});

/*if (pay) {
art.dialog({
content : $("#add_app_dialog").html(),
opacity : 0.1,
lock : true,
title : ThinkLang["APPSUP_PLEASE_APP_URL"],
button : [{
name : ThinkLang["APPSUP_DETERMINE"],
callback : function() {

}
}],
close : function() {
$.ajax({
type : "post",
url : GROUPPATH + "/AppStore/deployProject",
data : {
id : id,
appId : appId,
appUrl : $("#app_url").val(),
company_name : $('#company_name').val(),
company_domain : $('#company_domain').val(),
company_logo : $('#company_logo').val(),
},
success : function(result) {
// alert(result);
window.location = '/erp/Index/deployAppComp';
}
});
}
});
}*/

// 试用和购买特效
/*
 * function botton(){ $(".left").live("mouseenter",function(){
 * $(this).find(".tryUse a").animate({ marginLeft:"40px" },{duration:500, queue:
 * false}) $(this).find(".tryUsenow").animate({ left:"75px", opacity:1
 * },{duration:500, queue: false}) return false;
 * }).live("mouseleave",function(){ $(".tryUse a").animate({ marginLeft:"100px"
 * },{duration:500, queue: false}) $(".tryUsenow").animate({ left:0, opacity:0
 * },{duration:500, queue: false}) return false; }); }
 */
$(".tab li").on("click", function() {
	$(this).css("background-color", "#ffffff");
});

// 立即购买
function nowbuy() {
	if (user == "") {
		window.location = "/admin/Index/login";
	} else {
		window.location = "confirmorder?id=" + id + "&appId=" + appId;
	}
}

// 设置cookie, 两个参数，一个是cookie的名子，一个是值
function setCookie(name, value) {
	var exp = new Date();
	// new Date("December 31, 9998");
	exp.setTime(exp.getTime() + 24 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString();
}

// 试用部署
function nowtry(id, appId) {
	if (user == "") {
		window.location = "/admin/Index/login";
	} else {
		// var projectID = $(obj).find("input[type='hidden']").val();

		$.ajax({
			type : "post",
			url : GROUPPATH + "/AppStore/tryProject",
			data : {
				pid : id
			},
			success : function(result) {
				// alert(result);
				setCookie('pageFrom', 'appsup');
				window.location = '/erp/Index/tryAppComp?id=' + id + '&appId=' + appId;
			}
		});
	}
}
