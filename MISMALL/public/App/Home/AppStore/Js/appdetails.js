var curr;	// 定义当前分页

/*加载事件begin*/
$(function() {
	var id = _getUrlParas("id") ? _getUrlParas("id") : 0;		// 当前项目的发布ID
	var seconds;	// 提交评论的秒

	$.ajax({
		type : "POST",
		url : APPPATH + "/AppStore/getAReleaseProjectInfo",
		data : {
			id : id
		},
		dataType : "JSON",
		success : function(data) {
				console.log(JSON.stringify(data));
			//加载项目详细信息数据
			$(".shop_intro").find(".f-16b").text(data.siteName);
			$(".shop_intro").find(".app_price").text(data.price);
			$(".detail").find(".intor_text").html(data.siteDescription);
			$(".shop_img").find("img").attr("src",data.thumbPath);
			$(".intor_fr").find(".app_type").text('微信应用');
			$(".intor_fr").find(".app_version").text('v1.0');
			$(".intor_fr").find(".release_time").text(new Date(parseInt(data.addTime) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " "));
			$(".intor_fr").find(".app_author").text(data.user_name);

			var imgsSrc =  data.imgPreviewList.substr(0, data.imgPreviewList.length-1).split(',');


			var html = '';
			if(data.imgPreviewList.length){
				$.each(imgsSrc,function(k,v) {
               		html +='<li><a href="#photoView" hidefocus="true"><img src=' + v + ' alt="" /></a><i title="img">'  + v + '</i><i title="timg">'  + v + '</i></li>';			 
				});
				$('.nph_cnt').css('display', 'block');
				$('.nph_photo_prev,.nph_photo_next').css('display', 'block');
				$("#nph_tool").append(imgsSrc.length);
				$("#thumb").append(html);
				ImageViwe();
				if(imgsSrc.length>4){
					$('.nph_scrl_bar,.nph_scrl_prev,.nph_scrl_next').css('display', 'block');
				}
			}
		}
	});

	// 应用详情
	$(".name_bar").click(function() {
		$("#app_detail").show();
		$("#app_comment").hide();
		$(this).css({
			"background" : "#fff",
         			"color" : "#000"
		});
		    $(".name_bar1").css({
	         		"background" : "#ccc",
			"color" : "#fff"
	        });
	});

	// 应用评论
	$(".name_bar1").click(function() {
		$("#app_detail").hide();
		$("#app_comment").show();
		$(this).css({
			"background" : "#fff",
         			"color" : "#000"
		});
		    $(".name_bar").css({
		    	"background" : "#ccc",
			"color" : "#fff"
	        });

		getComment();
		loadProjectCommentInfo(0);
		totalProjectComment(0);
		totalProjectComment(1);
		totalProjectComment(2);
		totalProjectComment(3);
	});

	// 购买
	$(".buy").click(function() {
		//alert('buy');
		$.ajax({
			type : "post",
			url : APPPATH + "/Passport/isLogin",
			data : null,
			async : false,
			success : function(result) {
			                if(result) {
			                	window.location = 'confirmorder.html?id=' + id;
			                } else {
			                	$("#a_show_login").click();
			                }
			}
		});

	});

	//好  中  差  全 点击事件
	$(".tit_list ul li a").click(function() {
		var type = $(this).attr("val");
		$(".commenttype").find("a").css("background", "").css("color", "#fff");
		$("#allcomment").css("background", "#C9E4EF");
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
				$("#tips").find("b").text("您提交评论的速度太快了，请稍候再发表评论。！");
				return;
			} else {
				$("#tips").find("b").text("");
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
				//alert(data);
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
					var html = "<li class='bd'><div class='plinetop'><span class='plfl name fl'>用户 <b>" + v.commentUser + "</b> 说：</span>";
					html += "<span class='plfl fl'>" + v.commentGrade + "</span><span class='plfl fl'>版本：1.0.0</span>";
					html += "<span class='plfl time fr'>" + v.commentTime + "</span></div>";
					html += "<div class='plinerow'></div>";
					html += "<div class='plinfor'>" + v.content + " </div></li>";
					$("#ulComment").append(html);
				});
				pager();
			}
		});
	}
		
});
/*加载事件end*/

/** 图片轮播效果	begin**/
var ImageViwe = function(){
	var slider = new Slider({
		icontainer : "nph_scrl_ct",
		idrag : "bar",
		plusBtn : "scrlPrev",
		reduceBtn : "scrlNext",
		panel : "thumb",
		content : "nph_scrl_main",	
		direction : "left",
		acceleration : 5,
		sliderAcc : 1		
	});

	var ul = ImagePlay.get("nph_scrl_main"),
		list = ul.getElementsByTagName("li"),
		len = list.length,
		intervalD = Math.ceil( ul.scrollWidth / len ),
		intervalS = Math.ceil( slider.Max.left / len ),
		index = 1,
		photoPrev =ImagePlay.get("photoPrev"),
		photoNext = ImagePlay.get("photoNext"),
		photo = ImagePlay.get("photo"),
		photoIndex = ImagePlay.get("photoIndex"),
		photoDesc = ImagePlay.get("photoDesc").getElementsByTagName("p")[0];
	function removeClass(){
		ImagePlay.each(list, function(o, i){
			o.className = "";
		});
	}
	
	function Go(i, o){
		index = i;
		var _distance = 0;
		if(i > 2){
			slider.content.scrollLeft = intervalD * (i - 2);		
		}else{
			slider.content.scrollLeft = 0;	
		}
		_distance = intervalS * i;
		if(i === len - 1){
			_distance = intervalS * (i + 1);
		}
		slider.idrag.style.left = Math.min(Math.max(_distance , 0),slider.Max.left)  + "px";
		removeClass();
		o.className = "nph_list_active";
		photo.src = o.getElementsByTagName("i")[0].innerHTML;
		photoIndex.innerHTML = i + 1;
	}
	
	Go(0, list[0]);
		
	ImagePlay.each(list, function(o, i){
		ImagePlay.addEvent(o, function(){
			Go(i, o);		
		},"click");
	});
	
	ImagePlay.addEvent(photoNext, function(){
		index++;
		if(index >= len){
			index = len - 1;
			return;
		}
		Go(index, list[index]);
		
	},"click");
	
	ImagePlay.addEvent(photoPrev, function(){
		index--;
		if(index < 0 ){
			index = 0;
			return;
		}
		Go(index, list[index]);
		
	},"click");
		
};
/** 图片轮播效果	end**/

// 分页效果
function pager() {
	var total = Math.ceil($("#ulComment li").length / 10);
	curr = 1;
	$("#ulComment").find("li").show();
	$("#ulComment").find("li:lt(" + (curr - 1) * 10 + ")").hide();
	$("#ulComment").find("li:gt(" + (curr * 10 - 1) + ")").hide();
	if(total>2){
	$("#pager").pager({
		pagenumber : 1,
		pagecount : parseInt(total),
		buttonClickCallback : PageClick
	});
	}
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
	// alert('123');
	html = editor.html();
	// 同步数据后可以直接取得textarea的value
	editor.sync();
	var content = $("#comment_content").val();
	var grade = $("input[type='radio'][name='comment-rank']:checked").val();
	var id = _getUrlParas("id");
	if (content.length < 5) {
		$("#tips").find("b").text("最少输入5个字！");
	} else {
		$("#tips").find("b").text("");
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
				$("#tips").find("b").text("服务器忙，请稍候再试！");
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


