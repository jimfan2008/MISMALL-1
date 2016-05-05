/*！
 * 图片上传本地预览插件
 * 兼容：火狐、谷歌、IE浏览器
 * @param {Object} $
 */
(function($) {
	$.fn.ImagePreview = function() {
		//建立一個可存取到該file的url
		/*function getObjectURL(file) {
			var url = null ; 
			if (window.createObjectURL!=undefined) { // basic
				url = window.createObjectURL(file) ;
			} else if (window.URL!=undefined) { // mozilla(firefox)
				url = window.URL.createObjectURL(file) ;
			} else if (window.webkitURL!=undefined) { // webkit or chrome
				url = window.webkitURL.createObjectURL(file) ;
			}
			return url ;
		}*/
		function previewImage($imageContainer, file) {
			
			var MAXWIDTH = 100;
			var MAXHEIGHT = 100;
			if (file.files && file.files[0]) {
				//var $image = $('<img/>');
				//$imageContainer.empty().append($image);
				var $image = $imageContainer.find("img");
				$image.load(function() {
					var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, this.offsetWidth, this.offsetHeight);
					this.width = rect.width;
					this.height = rect.height;
					this.style.marginLeft = rect.left + 'px';
					this.style.marginTop = rect.top + 'px';
				});
				var reader = new FileReader();
				reader.onload = function(evt) {
					$image.get(0).src = evt.target.result;
				};
				reader.readAsDataURL(file.files[0]);
			} else {
				var src = file.value;
				if (!src)
					return;
				var $image = $('<img/>');
				$imageContainer.empty().append($image);
				var img = $image.get(0);
				img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
				var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
				var viewDiv = $('<div></div>');
				viewDiv.css({
					width : rect.width,
					height : rect.height,
					'margin-top' : rect.top,
					'margin-left' : rect.left,
					filter : "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src='" + src + "'"
				});
				$imageContainer.empty().append(viewDiv);
			}
			//file.remove();
		}

		function clacImgZoomParam(maxWidth, maxHeight, width, height) {
			var param = {
				top : 0,
				left : 0,
				width : width,
				height : height
			};
			if (width > maxWidth || height > maxHeight) {
				rateWidth = width / maxWidth;
				rateHeight = height / maxHeight;

				if (rateWidth > rateHeight) {
					param.width = maxWidth;
					param.height = Math.round(height / rateWidth);
				} else {
					param.width = Math.round(width / rateHeight);
					param.height = maxHeight;
				}
			}

			param.left = Math.round((maxWidth - param.width) / 2);
			param.top = Math.round((maxHeight - param.height) / 2);
			return param;
		}
	    function getFullPath(obj) { 
		    	   //得到图片的完整路径  
	        if (obj) {  
	            //ie  
	            if (window.navigator.userAgent.indexOf("MSIE") >= 1) {  
	                obj.select();  
	                return document.selection.createRange().text;  
	            }  
	            //firefox  
	            else if (window.navigator.userAgent.indexOf("Firefox") >= 1) {  
	                if (obj.files) {  
	                    return obj.files.item(0).getAsDataURL();  
	                }  
	                return obj.value;  
	            }  
	            return obj.value;  
	        }  
	    } 
	    /**
	     * 针对微信浏览器图片上传特殊处理
	     */
	    function wxImageUpLoad($obj) {
			var $imageHtml = $('<div class="modal fade componentData" parMenu = "componentData" dataFormListId = ""><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">关闭</span></button><h4 class="modal-title">选择图片</h4></div><div class="modal-body"></div><div class="modal-footer"><button class="btn btn-info" id="btn_selImg">确定</button><button type="button" class="btn btn-default" data-dismiss="modal">取消</button></div></div></div></div>');
			$("#siteContent").append($imageHtml);
			$imageHtml.modal("show");
			var data = {};
			data['site_id'] = temp_siteId;
			data['form_id'] = $("form").attr("id");
			$.ajax({
				type : "POST",
				url : APPPATH + "/FormData/getWechatUserImageList",
				data : data,
				async : false,
				success : function(result) {
					if(result) {
						var $ulObj = $("<ul />");
						var jsonData = JSON.parse(decodeURIComponent(result));
						var imgHtml = "";
						$.each(jsonData, function(key, val) {
							imgHtml += '<li class="wxImgList"><img src="'+val+'" /></li>';
						});
						if(imgHtml != "") {
							$imgHtml = $(imgHtml);
							$imageHtml.find(".modal-body").append($ulObj);
							$imageHtml.find(".modal-body").append("<div style='clear:both;'/>");
							$ulObj.append($imgHtml);
							$imageHtml.find(".wxImgList").click(function() {
								$("#btn_selImg").removeAttr("disabled");
								$imageHtml.find(".modal-body .wxImgList").removeClass("wxImgSelect");
								$(this).addClass("wxImgSelect");
							});
							
						}else {
							$imageHtml.find(".modal-body").append("当前没有要选择的图片!请切换到聊天模式发送图片.");
						}
						$("#btn_selImg").unbind("click").click(function() {
							var imgSrc = $imageHtml.find(".wxImgSelect img").attr("src");
							if(imgSrc != "") {
								$obj.parent().find(".ImagePreview img").attr("src", imgSrc);
								$imageHtml.modal("hide");
								$imageHtml.remove();
							}
						});
					}else {
						$imageHtml.find(".modal-body").append("当前没有要选择的图片!请切换到聊天模式发送图片.");
					}
				}
			});
	    }
	   
		return this.each(function() {
			var $this = $(this);
			var name = $(this).find("img").attr("name");
			var $file = $(this).parent("div").find("input[type='file']");
			var ua = navigator.userAgent.toLowerCase();
			if(ua.match(/MicroMessenger/i)=="micromessenger") {
				$this.unbind("click").click(function() {
					wxImageUpLoad($(this));
				});
			} else {
				$this.unbind("click").click(function() {
					$file.click();
				});
			}
			
			$file.unbind("change").change(function() {
				var pos =  $file.get(0).value.lastIndexOf(".");
				var imagelg =  $file.get(0).value.length;
				var postf =  $file.get(0).value.substring(pos, imagelg);
				
				if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(postf)) {
					alert("图片类型必须是.gif,jpeg,jpg,png中的一种");
				} else {
				   previewImage($this, $file.get(0));
				}
			});
		});
	};
})(jQuery);
