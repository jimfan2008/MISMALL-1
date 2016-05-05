$(function(){
	 //加载应用logo图片
	 $("#showimg").each(function(){ 
   	     var imgId=$(this).find("img").attr("id");   
   	     $path=app_path+"/Appsup/showImg?id="+imgId; 
   	     $(this).find("img").attr("src",$path);
    });
	 
	 $("#updataimg a").click(function(){
		 
		  art.dialog.open(app_path+"/MyCenter/UploadImg",{
				title:"修改图片",
				width:475,
				height:442,
				opacity : 0.3,
				lock:true,
				drag : false,
				close:function(){
				}	
			});
	 })
	 
})
 
	
	