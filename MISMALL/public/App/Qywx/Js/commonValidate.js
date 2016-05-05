/**
 * 一些表单验证的方法
 */
var commonValidate = {
	//正负整数
	validateNumber : function(num) {
		if (!/^-?\d+$/.test(num)) {
			//_this.addClass("bred");
			return false;
		} else {
			//_this.removeClass("bred");
			return true;
		}
	},
	//URL验证
	validateURL : function(url) {
		var val = url;
		if (val.length > 7) {
			if (val.substring(0, 7) != "http://" && val.substring(0, 8) != "https://") {
				val = "http://" + val;
			}
		} else {
			val = "http://" + val;
		}
		if (!/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(val)) {
			return false;
		} else {
			return true;
		}
	},
	//email验证
	validateEmail:function(email){
		var val = email;
		/*if ($.trim(val) == "") {
			return true;
		}*/
		var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		 if (filter.test(val)) {
			 return true;
		}else {
		 //alert('您的电子邮件格式不正确');
		 return false;
		}
	},
	//验证不能""并且不等undefined
	validateNull : function(str) {
		if (str != "" && str != "undefined" && str != undefined&& str != null) {
			return true;
		} else {
			return false;
		}
	}
};


