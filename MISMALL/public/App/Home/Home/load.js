$(function() {
	var id = _getUrlParas("id") ? _getUrlParas("id") : 0;
	// 当前项目的发布ID
			
	$.ajax({
		type : "POST",
		url : APPPATH + "/Index/getPublishRequest",
		data : {
			id : id
		},
		dataType : "JSON",
		async : false,		
		success : function(data) {       
			$(".mainText #nowContent").text(data.content);
		}
		
	});

});
