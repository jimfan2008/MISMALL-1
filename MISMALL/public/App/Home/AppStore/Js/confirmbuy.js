$(function() {
	var id = parseInt(_getUrlParas("id")) ? parseInt(_getUrlParas("id")) : 0;
	
	$.ajax({
		type : "POST",
		url : GROUPPATH + "/AppStore/getAReleaseProjectInfo",
		data : {
			id : id
		},
		success : function(data) {
			//加载项目信息
			//return;
			var json_data = JSON.parse(data);
			$(".title").find("a").text(json_data.siteName);
			$(".app_price").text((json_data.price || 0) + " 元");
			$("#ProjectName").val(json_data.siteName);
		    $(".username").text(json_data.user_name);
		   // $("#btnconbuy").attr("src","confirmbuy.html?id="+id);
			CountPrice();
			// 显示项目LOGO
			if (typeof(json_data) != "undefined")
				var img_src = json_data.thumbPath;
			else
				var img_src = PUBLICPATH + '/Uploads/Images/ReleaseProject/nopic.png';
			$(".pro-img").find("img").attr("src", img_src);
		}
	});
	//加减按钮计算方法
	var tu = $("#textUser");
	var td = $("#textDay");
	$(".addu").click(function() {
		var tu = $(this).parent().find("#textUser");
		var goodsCount = parseInt(tu.val());
		if(isNaN(goodsCount)){
			return;
		}else{
			tu.val(parseInt(tu.val()) +1);
		}
		var total = parseFloat($(this).parent().parent().find(".unit_price").text())*parseInt(tu.val());
		if(!/\./.test(priceNum)){
			total +=".00";
		}
		$(this).parent().parent().find(".total").text(total);
		CountPrice();
	});
	$(".addd").click(function() {
		if (td.val() == ""||isNaN(td.val()))
			td.val(1);
		td.val(parseInt(td.val()) + 1);
		if (td.val() > 1 || td.val() == 1) {
			if (td.val() > 1000)
				td.val(1000);
			$(".mind").removeAttr("disabled");
		}
		CountPrice();
	});
	$(".minu").click(function() {
		var goodsCount = parseInt(tu.val());
		if(isNaN(goodsCount) || goodsCount < 2){
			return;
		}else{
			tu.val(parseInt(tu.val()) - 1);
		}
		var total = parseFloat($(this).parent().parent().find(".unit_price").text())*parseInt(tu.val());
		if(!/\./.test(priceNum)){
			total +=".00";
		}
		$(this).parent().parent().find(".total").text(total);
		CountPrice();
	});
	$(".mind").click(function() {
		var goodsCount = parseInt(td.val());
		if(isNaN(goodsCount) || goodsCount < 2){
			return;
		}else{
			td.val(parseInt(td.val()) - 1);
		}
		CountPrice();
	});
		//返回到商品详细页面
	$(".title").click(function() {
		window.location = "shop_detail?id=" + id;
	});
	$(".pro-img").click(function() {
		window.location = "shop_detail?id=" + id;
	});

	//确认下单
	$("#btnconbuy").click(function() {
		// 应用单价
		var price = $(".app_price").text().substr(0, $(".app_price").text().length-1);
		//用户数量
		var userNum = $("#textUser").val();
		//使用天数
		var dayNum = $("#textDay").val();
	 	if(userNum > 100)
	       userNum = 100;
	    if(userNum < 1 ||isNaN(userNum))    
	       userNum = 1;
	    if(dayNum > 1000)
	       dayNum = 1000;
	    if(dayNum < 1 || isNaN(dayNum))
	       dayNum = 1;    	
		//return;
		$.ajax({
			type : "POST",
			url : GROUPPATH + "/AppStore/saveUserOrderInfo",
			data : {
				id : id,
				app_price : price,
				user_num : userNum,
				day_num : dayNum
			},
			success : function(data) {
				if (data != "0")
					window.location = GROUPPATH + "/AppStore/confirmbuy?id=" + data;
				else
					alert("失败");
			}
		});
	  });
	});	

//文本框的值改变事件
function SumNum() {
	var tutext = $("#textUser").val();
	var tdtext = $("#textDay").val();
	if (tutext == "0" || tutext == "1") {
		$("#textUser").val(1);
		$("#minu").attr("disabled", "true");

	}
	if (tdtext == "0" || tdtext == "1") {
		$("#textDay").val(1);
		$("#mind").attr("disabled", "disabled");
	}
	if (tutext > 1) {
		$("#minu").removeAttr("disabled");
	}
	if (tdtext > 1) {
		$("#mind").removeAttr("disabled");
	}
	if (tutext == "") {
		setTimeout("istextNull()", 1000);
		return;
	}
	if (tdtext == "") {
		setTimeout("istextNull()", 1000);
		return;
	}
	if ($('#textUser').val() > 100)
		$('#textUser').val(100);
	if ($('#textDay').val() > 1000)
		$('#textDay').val(1000);
	CountPrice();
}

// 判断文本框中值是否为空，if为空则1秒后返回默认值，
function istextNull() {
	if ($('#textUser').val() == "")
		$('#textUser').val(1);
	if ($('#textDay').val() == "")
		$('#textDay').val(30);
	CountPrice();
}

//计算总价格
function CountPrice() {
	var price = $(".app_price").text().substr(0, $(".app_price").text().length-1);
	//UserNum=eval(textUser.value);IE form下不支持eval取值
	UserNum = $("#textUser").val();
 // DayNum=eval(textDay.value);
	DayNum = $("#textDay").val();
	sumValue = price * UserNum * DayNum;
	var num = toDecima(sumValue);
	$("#priceNum").text(num);
}

//截取一个数后面二位小数，如果为整数后面保留.00
function toDecima(x) {
	var f = parseFloat(x);
	if (isNaN(f)) {
		return false;
	}
	var f = Math.round(x * 100) / 100;
	var s = f.toString();
	var rs = s.indexOf('.');
	if (rs < 0) {
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 2) {
		s += '0';
	}
	return s;
}

//支付是否遇到问题
function getUniqueStr() {
	var d = new Date();
	var yy = d.getFullYear(), mm = d.getMonth() + 1, dd = d.getDate(), hh = d.getHours(), min = d.getMinutes(), ss = d.getSeconds();
	ms = d.getMilliseconds();
	return "10" + yy + mm + dd + hh + min + ss + ms;
};