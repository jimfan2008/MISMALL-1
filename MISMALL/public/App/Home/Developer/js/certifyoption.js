$(function() {

	var provinceStr = [], cityStr = [], countyStr = [], ismobile = false, isqqNum = false, addressCity = false, isconsigneeAddress = false;
	$.each(provinceList, function(key, value) {
		provinceStr.push('<option value="');
		provinceStr.push(key);
		provinceStr.push('">');
		provinceStr.push(value["name"]);
		provinceStr.push('</option>');
	});
	$("#provinceDiv").append(provinceStr.join(''));

	$("#provinceDiv").on("change", function() {
		var citySum = $(this).find("option:selected").attr("value");
		cityStr.length = 0;
		// 清空数组
		$.each(provinceList[citySum]["cityList"], function(key, value) {
			cityStr.push('<option value="');
			cityStr.push(key);
			cityStr.push('">');
			cityStr.push(value["name"]);
			cityStr.push('</option>');
		});
		$("#cityDiv").find("option:not(:first)").remove();
		$("#countyDiv").find("option:not(:first)").remove();
		$("#cityDiv").append(cityStr.join(''));
	});

	$("#cityDiv").on("change", function() {
		var citySum = $("#provinceDiv").find("option:selected").attr("value");
		var countySum = $(this).find("option:selected").attr("value");
		countyStr.length = 0;
		$.each(provinceList[citySum]["cityList"][countySum]["areaList"], function(key, value) {
			countyStr.push('<option value="');
			countyStr.push(key);
			countyStr.push('">');
			countyStr.push(value);
			countyStr.push('</option>');
		});
		$("#countyDiv").find("option:not(:first)").remove();
		$("#countyDiv").append(countyStr.join(''));
	});

	//验证手机格式
	$("#consigneeMobile").on("blur", function() {
		var mobile = $(this).val();
		var telReg = /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
		if (!telReg.test(mobile) || mobile.length != 11) {
			var error_msg = '手机号码格式不正确';
			$(this).parent().next().text(error_msg).css("display", "inline-block");
		} else {
			ismobile = true;
			$(this).parent().next().text("").css("display", "none");
		}
	});
	//验证QQ
	$("#qqNum").on("blur", function() {
		var qqNum = $.trim($(this).val());
		if (!qqNum) {
			var error_msg = 'QQ不能为空';
			$(this).parent().next().text(error_msg).css("display", "inline-block");
		} else {
			isqqNum = true;
			$(this).parent().next().text("").css("display", "none");
		}
	});
	//验证地址
	$("#consigneeAddress").on("blur", function() {
		var consigneeAddress = $.trim($(this).val());
		if (!consigneeAddress) {
			var error_msg = '联系地址不能为空';
			$(this).parent().next().text(error_msg).css("display", "inline-block");
		} else {
			isconsigneeAddress = true;
			$(this).parent().next().text("").css("display", "none");
		}
	});
	// 下一步
	$(".next-btn").on("click", function() {
		var provinceDivText = $("#provinceDiv").find("option:selected").attr("value"), cityDivText = $("#cityDiv").find("option:selected").attr("value"), countyDivText = $("#countyDiv").find("option:selected").attr("value");
		var addressNum = provinceDivText + "-" + cityDivText + "-" + countyDivText;
		if (provinceDivText && cityDivText && countyDivText && qqNum) {
			addressCity = true;
			$("#countyDiv").next().text("").css("display", "none");
		} else {
			var error_msg = '所在地不能为空';
			$("#countyDiv").next().text(error_msg).css("display", "inline-block");
		}
		if (!$.trim($("#consigneeMobile").val())) {
			$("#consigneeMobile").parent().next().text("手机号码格式不正确").css("display", "inline-block");
		} else {
			ismobile = true;
		}
		if (!$.trim($("#qqNum").val())) {
			$("#qqNum").parent().next().text("QQ不能为空").css("display", "inline-block");
		} else {
			isqqNum = true;
		}
		if (!$.trim($("#consigneeAddress").val())) {
			$("#consigneeAddress").parent().next().text("联系地址不能为空").css("display", "inline-block");
		} else {
			isconsigneeAddress = true;
		}
		if (ismobile && isconsigneeAddress && addressCity) {

			//var phone = $("#consigneeMobile").val(), province = $("#provinceDiv").find("option:selected").text(), city = $("#cityDiv").find("option:selected").text(), district = $("#countyDiv").find("option:selected").text(), address = $("#consigneeAddress").val();
			/*$.ajax({
			type : "post",
			url : APPPATH + "/Home/Developer",
			data : {
			"userPhone" : phone,
			"province" : province,
			"city" : city,
			"district" : district,
			"address" : address,
			"addressNum" : addressNum
			},
			async : false,
			success : function(r) {

			}
			}); */

			// 保存现有的数据并跳转到下一步
			$(this).parents(".profile").addClass("hide");
			$(this).parents(".profile").next("[page=2]").removeClass("hide");
			//$("#sflex03").find(".active").removeClass("active");
			$("#sflex03 .first hr").addClass("active");
			$("#sflex03 .normal").find("dt").addClass("active");
		}

	});

	$(".describe,.experience").find("textarea").text("");
	$(".submitDiv").find(".btn").on("click", function() {
		var describeText = $.trim($(".describe").find("textarea").val());
		var experienceText = $.trim($(".experience").find("textarea").val());
		var $_this = $(this);
		if (describeText && experienceText) {
			if ($(".familiarlist").find(".active").length < 1) {
				$(".familiarlist").next(".error").text("请至少选择一项").css("display", "block");
			} else {
				$(".familiarlist").next(".error").text("").css("display", "none");


				$_this.parents(".profile").addClass("hide");
				$_this.parents(".profile").next("[page=3]").removeClass("hide");
				//$("#sflex03").find(".active").removeClass("active");
				$("#sflex03 .normal").find("hr").addClass("active");
				$("#sflex03").find(".last dt").addClass("active");


			}
		} else {
			$(".submitDiv").find(".message").text("");
			if (!describeText) {
				$("#describe").next().text("描述不能为空").css("display", "block");
			}
			if (!experienceText) {
				$("#experience").next().text("经历不能为空").css("display", "block");
			}
		}
	});

	$("#describe").on("blur", function() {
		var describeText = $.trim($(this).val());
		if (describeText) {
			$("#describe").next().text("").css("display", "none");
		} else {
			$("#describe").next().text("描述不能为空").css("display", "block");
		}

	});

	$("#experience").on("blur", function() {
		var experienceText = $.trim($(this).val());
		if (experienceText) {
			$("#experience").next().text("").css("display", "none");
		} else {
			$("#experience").next().text("经历不能为空").css("display", "block");
		}

	});

	$(".familiarlist").find("li").on("click", function() {
		if ($(this).hasClass("active")) {
			$(this).removeClass("active");
		} else {
			$(this).addClass("active");
		}

	});

	//身份证认证
	$(".idImgWraper").on("click", function() {
		$(this).find("input[type='file']").click();
	});
	
	$(".uploadImgFile").click(function(e){
		stopEventBubble(e);
	});
	
	$(".idCardFront ,.idCardBack,.idCardHand").unbind("change").change(function() {
		if (!checkImgFile(this)) {
			return;
		}
		$(this).parent().find(".imgBoxProgressData").show();
		var fd = new FormData();
		var url = APPPATH + "/Index/ajaxUpload";
		fd.append(this.name, this.files[0]);
		upload(fd, url, $(this).parent());
	});

	function upload(fd, url, $obj) {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		var $ProgressData = $obj.find('.imgBoxProgressData .dataVal');
		var $ProgressBar = $obj.find('.imgBoxProgressBar');
		$ProgressData.html("0%").show();
		$ProgressBar.html("").width(0).show();
		var percent = 0;
		xhr.upload.onprogress = function(ev) {
			console.log(ev.loaded,ev.total);
			if (ev.lengthComputable) {
				percent = 100 * ev.loaded / ev.total;
				var finalPercent = parseInt(percent);
				if (finalPercent == 100) {
					$ProgressBar.html("请稍候...");
				}
				$ProgressData.html(finalPercent + '%');
				$ProgressBar.width(finalPercent + '%');
			}
		};
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = xhr.responseText;
				var json = JSON.parse(data);
				$obj.find(".validTip").hide();
				$obj.find("img.picPositive").attr('src', json.image).unbind("load").bind("load", function() {
					$(this).show();
					setTimeout(function() {
						$ProgressData.fadeOut();
						$ProgressBar.fadeOut();
						$('.imgBoxProgressData').hide();
					}, 1000);
				});
				$obj.find("input[type=hidden]").val(json.image);
			}
		};
		xhr.send(fd);
	}

	// 验证成功后 保存数据
	$(".ok-btn").on("click", function() {
		var familiarlist = [], provinceList = [], cityList = [], districtList = [];
		var address = $("#consigneeAddress").val();
		var phone =$.trim($("#consigneeMobile").val()), qqNum = $.trim($("#qqNum").val()),describeText = $.trim($(".describe").find("textarea").val()), experienceText = $.trim($(".experience").find("textarea").val());
		provinceList.push({
			"key" : $("#provinceDiv").find("option:selected").attr("value"),
			"value" : $("#provinceDiv").find("option:selected").text()

		});
		cityList.push({
			"key" : $("#cityDiv").find("option:selected").attr("value"),
			"value" : $("#cityDiv").find("option:selected").text()

		});

		districtList.push({
			"key" : $("#countyDiv").find("option:selected").attr("value"),
			"value" : $("#countyDiv").find("option:selected").text()

		});

		//标签
		$(".familiarlist").find('.active').each(function(key, value) {
			familiarlist.push({
				"familtype" : $(this).attr("familtype"),
				"familText" : $.trim($(this).text())
			});
			console.log(JSON.stringify(provinceList));
			$.ajax({
				url : APPPATH+"/Developer/saveValidInfo",
				type : "post",
				data : {
					"userPhone" : phone,
					"address" : address,
					"province" : JSON.stringify(provinceList),
					"city" : JSON.stringify(cityList),
					"district" : JSON.stringify(districtList),
					"describeText" : describeText,
					"experienceText" : experienceText,
					"familiarlist":JSON.stringify(familiarlist),
					"idCardFront":idCardFront,
					"idCardBack":idCardBack,
					"idCardHand":idCardHand,
					"userQQ" : qqNum,
				},
				dataType : "json",
				success : function(r){
					if(r){
						window.location.href = APPPATH+"/Developer/member_center.html";
					}else{
						
					}
				}
			});

		});

	});

	/**
	 * 过滤图片文件大小和类型  只允许上传jpg|gif|png|jpeg格式，且大小不超过800K的图片
	 * target input[type = "file"] 对象
	 */
	function checkImgFile(target) {
		//检测上传文件的类型
		if (!(/(?:jpg|gif|png|jpeg)$/i.test(target.value))) {
			alert("只允许上传jpg|gif|png|jpeg格式的图片");
			if (window.ActiveXObject) {
				target.select();
				document.selection.clear();
			} else if (window.opera) {
				target.type = "text";
				target.type = "file";
			} else {
				target.value = "";
				return false;
			}

		}

		//检测上传文件的大小
		var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
		var fileSize = 0;
		var size = fileSize / 1024;
		if (isIE && !target.files) {
			var filePath = target.value;
			var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
			var file = fileSystem.GetFile(filePath);
			fileSize = file.Size;
		} else {
			fileSize = target.files[0].size;
		}

		if (size > 4096) {
			alert("文件大小不能超过4M");
			if (window.ActiveXObject) {
				target.select();
				document.selection.clear();
			} else if (window.opera) {
				target.type = "text";
				target.type = "file";
			} else {
				target.value = "";
			}
			return false;
		} else {
			return true;
		}
	}

});
