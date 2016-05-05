$(function() {
	var $preThis = $("#hr-html");
	var $val;
	$("#nav nav").click(function() {
		var $this = $(this);
		//window.scrollTo(0,512);//单击导航菜单滚动条距离顶部512px
		if (window.scrollY != 512) {
			$("html,body").animate({
				scrollTop : '512px'
			}, {
				queue : false,
				duration : 2500,
				easing : 'easeOutCubic'
			});
		}
		$("#navmk").addClass("navmk");
		if ($preThis) {
			$preThis.animate({
				left : "1000px"
			}, 500, function() {
				$preThis.css("display", "none");
				$preThis.animate({
					left : "-1000px"
				}, 10);
			});
		}
		$("#nav nav a").each(function() {
			var id = $("a",$this).attr("href").split("#")[2];
			var currid = $(this).attr("href").split("#")[2];
			if (currid === id) {
				$val = $(this).html();
				$(".mk span").remove();
				$("#" + id).css("display", "block");
				$("#" + id).animate({
					left : "0px"
				}, 500, function() {
					$("#container").animate({
						height : (($("#" + currid).height()) + 100) + "px"
					}, 1000);
					$preThis = $("#" + currid);
					$("#navmk").removeClass("navmk");
				});
			}
		});

		$(".mk").animate({
			left : ($this.position().left - 1 ) + 'px'
		}, 500, function() {
			$("<span>" + $val + "</span>").appendTo($(".mk"));
		});
	});

	//单击加载地图
	$("#dituContent a").click(function() {
		$(this).remove();
		initMap();
	});

	$("#content ul a").click(function() {
		$("#hr-user").css("display", "block");
	});

	$(".colse").click(function() {
		$("#hr-user").css("display", "none");
	});
	//定位到屏幕中间
	$("#hr-user").css({
		"top" : ($(window).height() - $("#hr-user").height()) / 2 + "px",
		"left" : ($(window).width() - $("#hr-user").width()) / 2 + "px"
	});

	/**
	 * 简历上传
	 */
	$("#fileField").uploadify({
		'auto' : true,
		height : 30,
		widht : 120,
		'removeTimeout' : 3,
		'swf' : PUBLICPATH + '/Js/uploadify/uploadify.swf',
		'uploader' : ROOT + '/Home/Index/resume',
		'method' : 'post',
		'buttonText' : '上传简历',
		'multi' : true,
		'uploadLimit' : 10,
		'fileTypeDesc' : 'Image Files;Text Files',
		'fileTypeExts' : '*.gif;*.jpg;*.png;*.doc;*.docx;*.pdf;*.txt;*.jpeg;*.bmp;*.xls;*.xlsx;*.ppt;*.htm;*.html;',
		'fileSizeLimit' : '2MB',
		'onUploadSuccess' : function(file, data, response) {
			if ($("#msg").html() == undefined)
				$("<label id='msg' style='margin-top:-175px;color:red'>" + data + "</label>").appendTo($(".hr-user"));
			setTimeout(function() {
				$("#msg").remove();
			}, 2000);

		},

		'onQueueComplete' : function(queueData) {
		},
	});

	/**
	 *提交简历地址
	 */
	$("#resume").click(function() {
		//简历地址填写规则
		var rule = new RegExp("^(http://)+[1-9a-zA-Z]\.");
		var resumeURL = $("#resumeURL").val();
		if (resumeURL == null || resumeURL == "") {
			if ($("#msg").html() == undefined)
				$("<label id='msg' style='margin-top:-180px;color:red'>简历地址不能为空，请输入...</label>").appendTo($(".hr-user"));
		} else if (rule.test(resumeURL)) {
			$.ajax({
				type : "get",
				url : ROOT + "/Home/Index/resume",
				data : 'resumeURL=' + resumeURL,
				dataType : "text",
				success : function(msg) {
					if ($("#msg").html() == undefined)
						$("<label id='msg' style='margin-top:-180px;color:red'>" + msg + "</label>").appendTo($(".hr-user"));
				}
			});
		} else {
			if ($("#msg").html() == undefined)
				$("<label id='msg' style='margin-top:-180px;color:red'>您输入的简历地址不合法，请输入合法的简历地址</label>").appendTo($(".hr-user"));
		}

		setTimeout(function() {
			$("#msg").remove();
		}, 2000);

	});

});

