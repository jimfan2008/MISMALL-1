/**
 * @author 唐苗
 * @desc 上传图片，添加文件夹，加载图片列表
 * @date 2015-07-28
 */
define(function(require, exports, module) {
	var cacheImg = null;
	var state = null;
	var undoRedo = require("../undoRedo.js");
	var changeImage = {
		//当前选中的图片url
		SelectImage : "",
		//当前选择分类Id
		SelectTypeId : 0,
		//session 当前用户ID
		UserId : 0,
		//当前选择显示图片数的对象
		SelectNumberObj : "",
		//初始化当前页面索引
		PageIndex : 0,
		//初始化显示条数
		PageSize : 40,
		//分页标识
		PageFlag : true,

		/**
		 * 加载分类列表
		 */
		LoadImageType : function() {
			changeImage.SelectNumberObj = $("#total-image-number");
			$.ajax({
				url : SITECONFIG.APPPATH + "/Editor/userImgType",
				data : {
					"siteId" : SITECONFIG.SITEID
				},
				type : "POST",
				success : function(data) {
					var dataNow = data.data;
					if (dataNow != 0 && dataNow != "0" && dataNow != null && dataNow != "null") {
						var dataObj = eval("(" + dataNow + ")");
						var num = 0;
						$.each(dataObj, function(index, item) {
							changeImage.LoadImageTypeItem(item);
						});

					}
				}
			});
		},

		/**
		 * 加载分类
		 */
		LoadImageTypeItem : function(item) {
			$(".my-image-type ul").append('<li><p class="image-type-name"><span>' + item.imgTypeName + '</span><span>(' + item.imgNum + ')</span></p>' + '<div class="image-type-operation"><p class="image-type-edit" title="重命名">&nbsp;</p>' + '<p class="image-type-delete" title="删除">&nbsp;</p></div></li>');
			//绑定编辑事件
			$(".my-image-type ul li").last().find("div.image-type-operation").find("p").eq(0).bind("click", function(e) {
				//如果上一个还在编辑状态，取消
				changeImage.CancelTypeEdit();
				var $p_name = $(this).parent().parent().find("p.image-type-name");
				if ($p_name.attr("current-edit") != "true") {
					$p_name.attr("current-edit", true);
					var $type_name = $p_name.find("span:first").text();
					$p_name.find("span").eq(1).hide();
					$p_name.find("span:first").html('<input type="text" class="mt3 ez-text" style="width:115px;line-height:normal;" maxlength="10" />');
					$p_name.find("input:first").val($type_name);
					$p_name.find("input:first").focus();
					$p_name.find("input:first").bind("click", function(ee) {
						//阻止事件冒泡
						ee.stopPropagation();
					});
					//文本框失去焦点修改分类
					$p_name.find("input:first").bind("blur", function() {
						var $txt = $(this);
						var val = $txt.val();
						//如果值没改变不提交
						if ($.trim(val) == "") {
							$txt.css("border", "1px solid red");
						} else {
							if (val != $type_name) {
								$.ajax({
									url : SITECONFIG.APPPATH + "/Editor/modifyUserImgType",
									data : {
										"siteId" : SITECONFIG.SITEID,
										"imgTypeId" : item.imgTypeId,
										"imgTypeName" : val
									},
									type : "POST",
									cache : false,
									success : function(data) {//alert(data);
										$txt.parent().parent().attr("current-edit", false);
										$txt.parent().parent().find("span").eq(1).show();
										$txt.parent().text(val);
									}
								});
							} else {
								$txt.parent().parent().attr("current-edit", false);
								$txt.parent().parent().find("span").eq(1).show();
								$txt.parent().text(val);
							}
						}

					});
				}
				//阻止事件冒泡
				e.stopPropagation();
			});
			//绑定单击分类加载分类图片列表事件
			$(".my-image-type ul li").last().bind("click", function() {
				changeImage.SelectTypeId = item.imgTypeId;
				changeImage.SelectNumberObj = $(this).find("p.image-type-name").find("span").eq(1);
				//重新绑定上传事件
				changeImage.UploadImage();
				//重新绑定分页
				//changeImage.PageFlag=true;

				if ($(".select-image-li").length > 0) {
					$(".select-image-li").removeClass("select-image-li");
				}
				$(this).addClass("select-image-li");

				$.ajax({
					url : SITECONFIG.APPPATH + "/Editor/userTypeImg",
					data : {
						"siteId" : SITECONFIG.SITEID,
						"imgTypeId" : item.imgTypeId
					},
					type : "POST",
					cache : false,
					success : function(data) {
						changeImage.GetImageList(data);
					}
				});
			});
			//绑定删除分类事件
			$(".my-image-type ul li").last().find("div.image-type-operation").find("p").eq(1).bind("click", function(e) {
				$.ajax({
					url : SITECONFIG.APPPATH + "/Editor/userTypeImg",
					data : {
						"siteId" : SITECONFIG.SITEID,
						"imgTypeId" : item.imgTypeId
					},
					type : "POST",
					cache : false,
					success : function(data) {

						$("#image-list").empty();
						var dataObj = eval("(" + data + ")");
						if (dataObj.imgList.length > 0) {
							$.each(dataObj.imgList, function(index, item) {
								changeImage.AddImageItem(item, "prepend");
								//改变加载顺序  ljp
							});
							require.async("lazyload", function() {
								$("#image-list .img").lazyload({
									container : "#image-list",
									failure_limit : 8
								});
							});

						}
						changeImage.NotImageInfo();
						cacheImg = data;
					}
				});
				var $li = $(this).parent().parent();
				$('<div id="ez-dialog-confirm" title="删除"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0; "></span>您确定要删除  <b style="color:red;">' + $li.find("p:first").find("span:first").text() + '</b>?</p></div>').dialog({
					resizable : true,
					draggable : true,
					width : 500,
					modal : true,
					buttons : {
						"删除" : function() {
							var $del_this = $(this);
							$.ajax({
								url : SITECONFIG.APPPATH + "/Editor/delUserImgType",
								data : {
									"siteId" : SITECONFIG.SITEID,
									"imgTypeId" : item.imgTypeId
								},
								type : "POST",
								cache : false,
								success : function(data) {

									$li.remove();
									$("#image-list").find("div.image-item").find("input").each(function() {
										var $id = $(this).parent().parent().attr("imgid");
										$item = $(this).parent().parent().parent();
										$.ajax({
											url : SITECONFIG.APPPATH + "/Editor/delUserImg",
											data : {
												"siteId" : SITECONFIG.SITEID,
												"imgId" : $id
											},
											type : "POST",
											cache : false,
											success : function(data) {
												var dataNow = data.data;

												if (dataNow == true) {
													var num = $li.find(".image-type-name span:last").text();
													var totalNum = $("#total-image-number").text();
													num = parseInt(num.substring(1, num.length - 1));
													totalNum = parseInt(totalNum.substring(1, totalNum.length - 1));
													if (num > 0) {
														num = num - 1;
														totalNum = totalNum - 1;
													}
													$li.find(".image-type-name span:last").text("(" + num + ")");
													$("#total-image-number").text("(" + totalNum + ")");
												}
												$("#image-list").find("div[imgid=" + $id + "]").parent().remove();
												//if(type == "image"){
												changeImage.NotImageInfo();
												//}
												changeImage.SelectImage = "";
												$(".select-image-name").text("");
												state = 1;
											}
										});
									});
									$del_this.dialog("destroy");
								}
							});
						},
						"取消" : function() {
							$(this).dialog("destroy");
						}
					}
				});
				//阻止事件冒泡
				e.stopPropagation();
			});

			$(".my-image-type ul li").last().hover(function() {
				$(this).find("div.image-type-operation").show();
			}, function() {
				$(this).find("div.image-type-operation").hide();
			});
		},

		/**
		 * 加载图片列表
		 */
		LoadImageList : function(pageIndex) {
			if (!cacheImg || state == '1') {
				$.ajax({
					url : SITECONFIG.APPPATH + "/Editor/userTypeImg",
					data : {
						"siteId" : SITECONFIG.SITEID
					},
					type : "POST",
					cache : false,
					async : false,
					success : function(data) {
						var data = data.data;
						var data = JSON.stringify(data);
						changeImage.GetImageList(data);
						cacheImg = data;
					}
				});
			} else {
				changeImage.GetImageList(cacheImg);

			}
		},

		/**
		 * 取消编辑状态(图片分类)
		 */
		CancelTypeEdit : function() {
			if ($("p.image-type-name[current-edit=true]", $(".my-image-type")).length > 0) {
				$("p.image-type-name[current-edit=true]", $(".my-image-type")).each(function() {
					var $name = $(this).find("input:first").val();
					if ($.trim($name) != "") {
						$(this).find("span:first").text($name);
						$(this).find("span").eq(1).show();
						$(this).attr("current-edit", false);
					}
				});
			}
		},

		/**
		 * 添加文件夹（图片分类）
		 */
		AddImageType : function() {
			$(".my-image-type ul").append('<li><p style="width:130px; float:left;"><input type="text" class="w120 ez-text" maxlength="10" style="line-height:normal;" /></p></li>');
			$(".my-image-type ul li").last().find("p:first").find("input:first").focus();
			$(".my-image-type ul li").last().find("p:first").find("input:first").bind("blur", function() {
				var typeName = $(this).val();
				if ($.trim(typeName) != "") {
					$.ajax({
						url : SITECONFIG.APPPATH + "/Editor/addUserImgType",
						data : {
							"siteId" : SITECONFIG.SITEID,
							"typeName" : typeName
						},
						type : "POST",
						cache : false,
						success : function(data) {
							if (data > 0) {
								var data = '[{imgTypeId:"' + data + '",imgTypeName:"' + typeName + '",imgNum:"0"}]';
								var dataObj = eval("(" + data + ")");
								$(".my-image-type ul li").last().remove();
								changeImage.LoadImageTypeItem(dataObj[0]);
							}
						}
					});
				} else {
					$(this).parent().parent().remove();
				}
			});
			$(".my-image-type ul li").last().find("p").eq(1).bind("click", function() {
				$(this).parent().remove();
			});
		},

		/**
		 * 根据返回来的图片列表数据加载页面
		 */
		GetImageList : function(data) {
			$("#image-list").empty();
			var dataObj = eval("(" + data + ")");
			changeImage.SelectNumberObj.text("(" + dataObj.total + ")");
			if (dataObj.imgList.length > 0) {
				$.each(dataObj.imgList, function(index, item) {
					changeImage.AddImageItem(item, "prepend");
				});
				require.async(SITECONFIG.PUBLICPATH + "/Js/lazyload/jquery.lazyload.min.js", function() {
					$("#image-list .img").lazyload({
						container : "#image-list",
						failure_limit : 8
					});
				});
			}
			changeImage.NotImageInfo();
		},

		/**
		 * 如果列表没有图片，显示提示
		 */
		NotImageInfo : function() {
			if ($("#image-list .image-item").length == 0) {
				$("#image-list").append('<div class="not-image">没有图片！</div>');
			}

		},

		/**
		 * 添加图片到列表
		 */
		AddImageItem : function(item, prepend) {
			var width = $("#image-list").width();
			//图片列表宽度
			var div = $('<div class="image-item" style="width:' + ((width / 4) - 20) + 'px;">' + '<div class="img" imgId = "' + item.id + '" src="' + item.imgUrl + '" style="background:url(' + item.imgThumb + ');background-repeat: no-repeat;background-position: center center;background-size:auto 100%;width:' + ((width / 4) - 22) + 'px;" data-original="' + item.imgThumb + '">' + '<div class="check" style="float:left;"><input type="checkbox" /></div>' + '</div>' + '<div class="del-div" ><a href="javascript:void(0);" class="delete" title="删除">&nbsp;</a></div>' + '<div class="title" title="' + item.imgName + '">' + item.imgName + '</div>' + '</div>');
			var fp = ":last";
			if (prepend == "prepend") {
				div.appendTo($("#image-list"));
			} else {
				div.prependTo($("#image-list"));
				fp = ":first";
			}
			if (prepend == "upLoad") {
				div.find(".img").css("background-image", "url(" + item.imgThumb + ")");
			}

			//选择点击图片  ljp
			var start = undefined;
			function changeClick(src) {
				var $selectObj = ezCommon.Obj;
				if ($(".ez-settings-content").hasClass("actionImagePreview")) {
					$(".ez-settings-content").find("img").attr("src", src);
				} else if ($selectObj.hasClass("selectedForm")) {

					$selectObj.parent().css("backgroundImage", "url(" + src + ")");
					$selectObj.parent().attr("backgroundImage", src);
					$(".removeBgImg").removeAttr("disabled");
					$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
				} else if ($selectObj.find("button").length) {
					$selectObj.find("button").css("backgroundImage", "url(" + src + ")");
					$selectObj.find("button").attr("haveImage", src);
					require.async("fdCtrls", function(el) {
						var ctrlName = $selectObj.attr("ctrlId"), attrType = "general", ctrlbtn = "btnImgChange";
						el.formCtrlJson.updateJson(ctrlName, attrType, ctrlbtn, src);
					});
				} else if ($selectObj.hasClass("pageFigureSelect")) {//层切换背景图
					$selectObj.css("backgroundImage", "url(" + src + ")");
				} else if ($selectObj.attr("syscomtype") == "swiper") {//图片轮播
					$selectObj.find(".swiper-slide-active img").attr("data-src", src);
					$(".right-menu .swiper-active").attr("src", src);
				} else {
					var imgObj = $selectObj.find("img").length ? $selectObj.find("img") : $selectObj;
					imgObj.attr("src", src);
				}
			}

			//单击选中
			$("#image-list,#system-imglist").find("div.image-item").unbind("click").bind({
				click : function(e) {
					changeImage.SelectImage = $(this).find("div.img").attr("src");
					if ($("#image-list .select-image")) {
						$("#image-list .select-image").removeClass("select-image");
					}
					$(this).addClass("select-image");
					if (e.shiftKey) {
						//多个多选
						if (!start) {
							start = this;
							return;
						}
						var cks = $("#image-list").find("div.image-item");
						var startIndex = cks.index(start);
						var endIndex = cks.index(this);
						var sels = cks.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
						sels.each(function() {
							$(this).find("input[type=checkbox]").prop("checked", true);
							$(this).css({
								"border" : "1px solid #1E90FF",
								"background-color" : "#4C93FF"
							});
						});
						cks.not(sels).each(function() {
							$(this).find("input[type=checkbox]").prop("checked", false);
							$(this).css({
								"border" : "",
								"background-color" : ""
							});
						});
						$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
						return;
					} else if (e.ctrlKey) {
						//单个多选
						start = this;
						if ($(this).find("input[type=checkbox]")[0].checked == true) {
							$(this).find("input[type=checkbox]").prop("checked", false);
							$(this).css({
								"border" : "",
								"background-color" : ""
							});
						} else {
							$(this).find("input[type=checkbox]").prop("checked", true);
							$(this).css({
								"border" : "1px solid #1E90FF",
								"background-color" : "#4C93FF"
							});
						}
						$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
						return;
					} else {
						if ($(this).find("input[type=checkbox]")[0].checked == true) {
							$(this).find("input[type=checkbox]").prop("checked", false);
							$(this).css({
								"border" : "",
								"background-color" : ""
							});
							$("#selectAll").find("input").prop("checked", false);
						} else {
							$(this).find("input[type=checkbox]").prop("checked", true);
							$(this).css({
								"border" : "1px solid #1E90FF",
								"background-color" : "#4C93FF"
							});
						}

					}
					start = this;
					$("#image-list").find("div.image-item").not(this).each(function() {
						$(this).find("input[type=checkbox]").attr("checked", false);
						$(this).css({
							"border" : "",
							"background-color" : ""
						});
					});
					$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
					//return false;
				},
				//双击选择图片
				dblclick : function() {
					changeImage.isGlyphicon();
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/commonValidate.js", function(e) {

						if (commonValidate.validateNull(changeImage.SelectImage)) {
							//将缩略图的路径替换成原图路径
							var src = changeImage.SelectImage;
							if ($("#image-list")) {
								var imgObj = $("#image-list").find("img");
								var imgSrc = imgObj.attr("src");
								var backColor = imgObj.css("background-color");
							}
							//调用回调函数
							changeClick(src);
							//清空已选图片

							//隐藏选择图片弹出框蒙板
							$(".layer").remove();
							$("#subImgFlashMenu").hide();
							$("#subImgFlashMenu").attr("style", "");
						}
					});
					$(".ctrlSelected").find("img").css({
						"width" : "100%",
						"height" : "auto",
						"background-size" : "100% 100%",
						"background-repeat" : "no"
					});
					$(".selectedForm").parent().css("background-size", "100% 100%");
					$(".selectedForm").parent().css("background-repeat", "no");

				}
			});

			//点击复选框  ljp
			$("#image-list,#system-imglist").find("div.image-item").find("input").bind("click", function(ee) {
				ee.stopPropagation();
				//阻止事件冒泡
				var $siglebox = $(this).prop("checked");
				if ($siglebox == true) {
					$(this).parents("div .image-item").click();
					$(this).prop("checked", true);
				} else {
					$(this).prop("checked", false);
					$(this).parent().parent().parent().removeClass("select-image");
				}
				$(".select-image-name").text("已选择" + $("#image-list,#system-imglist").find("div.image-item").find("input:checked").size() + "张图片");
			});

			//点击全选按钮  ljp
			$("#selectAll").find("input").bind("click", function() {
				var $statu = $(this).prop("checked");
				if ($statu == true) {
					$("#image-list").find("div.image-item").find("input").prop("checked", true);
					$("#image-list").find("div.image-item").css({
						"border" : "1px solid #1E90FF",
						"background-color" : "#4C93FF"
					});
				} else {
					$("#image-list").find("div.image-item").find("input").prop("checked", false);
					$("#image-list").find("div.image-item").css({
						"border" : "",
						"background-color" : ""
					});
				}
				$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
			});
			//显示/应藏全选
			$("#selectAll").find(".delta-icon").unbind("click").bind("click", function() {
				var selObj = $("#selectAll").find(".selectAll-setting");
				selObj.toggle();
			});

			$(document).click(function(event) {
				if ($(event.target).parents(".selectAll-setting").size() == 0 && $(event.target).attr('class') != 'delta-icon') {
					window.setTimeout("$('#selectAll').find('.selectAll-setting').css('display','none')", 200);
				}
			});
			//全选
			$(".selectAll-setting .select-div a:first").bind("click", function() {
				$("#selectAll").find("input").prop("checked", true);
				$("#image-list").find("div.image-item").find("input").prop("checked", true);
				$("#image-list").find("div.image-item").css({
					"border" : "1px solid #1E90FF",
					"background-color" : "#4C93FF"
				});
				$(".selectAll-setting").hide();
				$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
			});
			//反选
			$(".selectAll-setting .select-div a:last").bind("click", function() {
				$("#selectAll").find("input").prop("checked", false);
				$("#image-list").find("div.image-item").find("input").prop("checked", false);
				$("#image-list").find("div.image-item").css({
					"border" : "",
					"background-color" : ""
				});
				$(".selectAll-setting").hide();
				$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片");
			});
			//删除图片
			$("#image-list").find("a.delete" + fp).bind("click", function() {

				var $id = item.id;
				var $item = $(this).parent().parent();
				var title = $item.find("div.title").text().substring(0, 50);
				$('<div id="ez-dialog-confirm" title="删除"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0; "></span>您确定要删除该图片吗?</p></div>').dialog({

					resizable : false,
					draggable : false,
					width : 500,
					modal : true,
					buttons : {
						"删除" : function() {
							$.ajax({
								url : SITECONFIG.APPPATH + "/Editor/delUserImg",
								data : {
									"siteId" : SITECONFIG.SITEID,
									"imgId" : $id
								},
								type : "POST",
								cache : false,
								success : function(data) {
									var dataNow = data.data;
									if (dataNow == true) {
										var num = changeImage.SelectNumberObj.text();
										var totalNum = $("#total-image-number").text();
										num = parseInt(num.substring(1, num.length - 1));
										totalNum = parseInt(totalNum.substring(1, totalNum.length - 1));
										if (num > 0) {
											num = num - 1;
											totalNum = totalNum - 1;
										}
										changeImage.SelectNumberObj.text("(" + num + ")");
										$("#total-image-number").text("(" + totalNum + ")");
									}
									$item.remove();
									changeImage.NotImageInfo();
									changeImage.SelectImage = "";
									$(".select-image-name").text("");
									state = 1;
								}
							});
							$(this).dialog("destroy");
						},
						"取消" : function() {
							$(this).dialog("destroy");
						}
					}
				});
			});
		},

		/**
		 * 上传图片
		 */
		UploadImage : function() {
			$("#subImgFlashMenu").on("click", "#selectLocalImg", function() {
				$('#image_upload').click();
			});
			$('#image_upload')[0].onchange = function() {
				if (!checkImgFile(this, 4096, "M")) {
					return;
				}
				var fd = new FormData();
				fd.append(this.name, this.files[0]);
				fd.append("siteId", SITECONFIG.SITEID);
				$("#progress,#persent").show();
				upload(fd);

			};

			function upload(fd) {
				xhr = new XMLHttpRequest();
				xhr.open('POST', SITECONFIG.APPPATH + '/Editor/uploadUserImg', true);
				xhr.upload.onprogress = function(ev) {
					var percent = 0;
					if (ev.lengthComputable) {
						percent = 100 * ev.loaded / ev.total;
						document.getElementById('persentData').innerHTML = parseInt(percent);
						document.getElementById('bar').style.width = percent + '%';
					}
				};
				xhr.send(fd);
				xhr.onreadystatechange = processResponse;
			}

			function processResponse() {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						var data = xhr.responseText;

						$("#progress,#persent").fadeOut();
						if ($("#image-list .not-image").length > 0) {
							$("#image-list .not-image").remove();
						}
						if (data.status != "error") {
							var data = eval("(" + data + ")");

							dataObj = data.data;
							if (cacheImg) {
								cacheImg = JSON.parse(cacheImg);
							}
							if (dataObj.imgList.length > 0) {

								$.each(dataObj.imgList, function(index, item) {
									changeImage.AddImageItem(item, "upLoad");
									var totalNum = parseInt($("#total-image-number").text().replace("(", " ").replace(")", " ")) + 1;

									$("#total-image-number").text("(" + totalNum + ")");

									if (cacheImg) {
										cacheImg["imgList"].unshift(item);
									}
								});
							}
							var imgLength = dataObj["total"];
							if (!cacheImg) {
								cacheImg = dataObj;
							} else {
								cacheImg["total"] = parseInt(cacheImg["total"]) + parseInt(imgLength);
							}
							cacheImg = JSON.stringify(cacheImg);
							state = 1;
						} else {
							console.log(data.info);
						}

					} else {
						alert("图片上传失败！");
					}
				}
			}

		},

		/**
		 * 更换图片
		 */
		changeImg : function($obj, callBack) {
			//标识是否已修改了JSON，以判断是否需要保存当前页面
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
				e.addNeedSavePage();
			});
			if (!objIsnull($obj)) {
				$obj = $("<div></div>");
			}
			//更换图片时设置面板的宽高
			var imgWinWidth = ($(window).width() * 0.75) - 35, imgWinHeight = ($(window).height() * 0.7), imgListWrap = imgWinHeight - 100;
			$(".changeImageContent").each(function() {
				$(".changeImageContent").remove();
				$(this).appendTo($("#subImgFlashMenu .subMenuImgList").empty()).width(imgWinWidth).height(imgWinHeight);
			});

			$("#subImgFlashMenu .subMenuImgList").find(".changeImageContent").show();

			$("#image-list,#my-image,#system-glyphicon,#system-imglist,#system-image").height(imgListWrap);
			changeImage.createChangeImageSettingsPanel($("#subImgFlashMenu"), function(src) {
				var $selectObj = ezCommon.Obj;
				console.log($selectObj);
				if ($obj.hasClass("actionImagePreview")) {
					$obj.find("img").attr("src", src);
				} else if ($selectObj.hasClass("selectedForm")) {
					var oldPagePic = $selectObj.parent().css("backgroundImage");
					$selectObj.parent().css("backgroundImage", "url(" + src + ")");
					$selectObj.parent().attr("backgroundImage", src);
					$selectObj.parent().css({
						"width" : "100%",
						"height" : "100%"
					});
					$selectObj.parent().css("background-size", "100% 100%");
					$selectObj.parent().css("background-repeat", "no");
					if (newPagePic != 'none') {
						$(".removeBgImg").removeAttr("disabled");
						$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
					}
					var newPagePic = src;
					var changeImgLogoId = $(".selectedForm").parent().attr("id");
					var changeType = "page";
					if (oldPagePic != newPagePic) {
						undoRedo.changePicUndo(changeType, $selectObj.parent(), oldPagePic, newPagePic, changeImgLogoId);
					}
					//翻页浏览
				} else if ($selectObj.attr("syscomtype") == "pageBrowse") {
					$selectObj.find(".swiper-slide-active").css("backgroundImage", "url(" + src + ")");
					$selectObj.find(".swiper-slide-active").attr("backgroundImage", src);
					$selectObj.find(".swiper-slide-active").css({
						"width" : "100%",
						"height" : "100%"
					});
					$selectObj.find(".swiper-slide-active").css("background-size", "100% 100%");
					$selectObj.find(".swiper-slide-active").css("background-repeat", "no");
					$(".removeBgImg").removeAttr("disabled");
					$(".removeBgImg").css("background", "rgb(0, 157, 217) none repeat scroll 0% 0%");
					//图片轮播，见插件swiper.js
				} else if ($selectObj.attr("syscomtype") == "swiper") {
					//添加一个轮播的slider
					if ($obj.hasClass("addOneWrap") || $obj.closest(".addOneWrap").length) {
						callBack(src);
						return;
					}
					var $currentSlide = $selectObj.find(".currrent-slide");
					$currentSlide.attr("data-src", src);
					if ($currentSlide.attr("src")) {
						$currentSlide.attr("src", src);
					}
					$(".right-menu .swiper-active").attr("src", src);
				} else {
					var oldImgObj = $selectObj.find("img").attr("src");
					var imgObj = $selectObj.find("img").length ? $selectObj.find("img") : $selectObj;
					imgObj.attr("src", src);
					var newImgObj = src;
					var changeType = "ctrl";
					var changeImgLogoId = $(".selectedForm").parent().attr("id");
					if (oldImgObj != newImgObj) {
						undoRedo.changePicUndo(changeType, $selectObj, oldImgObj, newImgObj, changeImgLogoId);
					}
				}
				$(".ctrlSelected").find("img").css({
					"width" : "100%",
					"height" : "auto",
					"background-size" : "100% 100%",
					"background-repeat" : "no"
				});

			});

			//关闭图片上传面板
			$("#subImgFlashMenu .subMenuTitle").find("span:eq(1)").unbind("click").click(function() {
				$("#subImgFlashMenu").hide();
				$(".layer").remove();
			});
		},

		/**
		 * 批量删除图片
		 */
		DelImageItem : function(type) {
			$("#selectAll").find("a.delete").bind("click", function() {
				var $imageBox;
				$("#image-list").find("div.image-item").each(function() {
					if ($(this).find("input").prop("checked") == true) {
						$imageBox = true;
					}
				});
				if ($imageBox == true) {
					$('<div id="ez-dialog-confirm" title="删除"><p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0; "></span>您确定要删除  <b style="color:red;"></b>?</p></div>').dialog({
						resizable : false,
						draggable : false,
						width : 500,
						modal : true,
						buttons : {
							"删除" : function() {
								$("#image-list").find("div.image-item").find("input").each(function() {
									$cc = $(this).prop("checked");
									if ($cc == true) {

										var $id = $(this).parent().parent().attr("imgid");

										$item = $(this).parent().parent().parent();
										$.ajax({
											url : SITECONFIG.APPPATH + "/Editor/delUserImg",
											data : {
												"siteId" : SITECONFIG.SITEID,
												"imgId" : $id
											},
											type : "POST",
											cache : false,
											success : function(data) {
												var dataNow = data.data;

												if (dataNow == true) {
													var num = changeImage.SelectNumberObj.text();
													var totalNum = $("#total-image-number").text();
													num = parseInt(num.substring(1, num.length - 1));
													totalNum = parseInt(totalNum.substring(1, totalNum.length - 1));
													if (num > 0) {
														num = num - 1;
														totalNum = totalNum - 1;
													}
													changeImage.SelectNumberObj.text("(" + num + ")");
													$("#total-image-number").text("(" + totalNum + ")");
												}
												$item.remove();

												$("#image-list").find("div[imgid=" + $id + "]").parent().remove();

												changeImage.NotImageInfo();

												changeImage.SelectImage = "";
												$(".select-image-name").text("");
												state = 1;
											}
										});
									}

								});
								$(this).dialog("destroy");
							},
							"取消" : function() {
								$(this).dialog("destroy");
							}
						}
					});
				} else {
					alert("请选择要删除的文件！");
				}
			});
		},

		/**
		 * 切换图标到页面和关闭弹出层方法
		 */
		changeGlyphiconAndHide : function(obj) {
			var glyphiconType = $("#system-glyphicon").find(".select-glyphicon").children().attr("class");
			var ImgName = ezCommon.Obj.attr('ctrlid');
			ezCommon.Obj.find('a').remove();
			ezCommon.Obj.find('.glyphicon').remove();
			ezCommon.Obj.find(".ctrlWraper").append("<span class='" + glyphiconType + "' name='" + ImgName + "' style='font-size:25px'></span>");
			$(".border-bg-color").find(".ez-left-align").text("颜色");
			$(".layer").remove();
			obj.hide();

		},

		/**
		 * 添加系统图标事件
		 */
		createChangeSystemGlyphicon : function(obj) {
			$("#glyphicon-list").find("td").unbind("click").bind({
				click : function(e) {
					$(this).parents(".table-bordered").find("td").removeClass("select-glyphicon");
					$(this).addClass("select-glyphicon");

				},
				dblclick : function() {
					changeImage.changeGlyphiconAndHide(obj);
				},
			});

		},

		/**
		 * 添加时判断当前是系统图标还是图片
		 *
		 */
		isGlyphicon : function() {
			$(".border-bg-color").find(".ez-left-align").text("边框");
			if (!objIsnull(ezCommon.Obj.find("img"))) {
				var ImgName = ezCommon.Obj.attr('ctrlid');
				ezCommon.Obj.find(".glyphicon").remove();
				//ezCommon.Obj.find(".ctrlWraper").append('<a class="ImagePreview" href="javascript:;"><img src="/newmismall/public/App/Qywx/Images/imgBox.png" class="img_avatar" data-picturesize="100" style="cursor:pointer;width:40%;" byctrlradius="true" isbasectrl="true" name="' + ImgName + '"></a>');
			}
		},

		/**
		 * 创建更换Image设置面板
		 * title:标题
		 * obj：要设置的元素对象
		 * changeClick:更换图片事件
		 */
		createChangeImageSettingsPanel : function(obj, changeClick, callBack) {
			//图片弹出框添加蒙板
			$("body").append("<div class='layer'></div>");
			$(".layer").css({
				"height" : $(document).height() + "px",
				"display" : "block"
			});
			//设置面板的宽/高度
			obj.width(($(window).width() * 0.75) - 35 + "px");
			obj.find(".subMenuImgList").width(($(window).width() * 0.75) - 35 + "px");
			obj.find(".subMenuImgList").height($(window).height() * 0.79 + "px");

			//加载选项卡
			$("#tabs").tabs();
			// 上传图片事件
			changeImage.UploadImage();
			//加载图片分类列表
			changeImage.LoadImageType();

			//加载图片列表
			changeImage.LoadImageList(0);
			//批量删除
			changeImage.DelImageItem("image");
			//选中全部图片项
			$("#my-image-all", obj).addClass("select-image-li");
			//加载全部图片
			$("#my-image-all", obj).bind("click", function() {
				if ($(".select-image-li", obj).length > 0) {
					$(".select-image-li", obj).removeClass("select-image-li");
				}
				$(this).addClass("select-image-li");
				changeImage.SelectNumberObj = $("#total-image-number", obj);

				changeImage.PageFlag = true;
				changeImage.LoadImageList(0);

			});
			//添加文件夹
			$("#add-folder", obj).bind("click", function() {
				changeImage.AddImageType();
			});
			//确定选择图片
			$(".change-image-bottom button:first", obj).unbind("click").bind("click", function() {
				//判断选择的是图片还是系统图标
				var tabsType = $("#tabs").find("[aria-hidden=false]").attr("id");
				if (tabsType == "my-image" || tabsType == "system-image") {
					var selNum = $("#image-list,#system-imglist").find("div.image-item").find("input:checked").size();
					if (selNum > 1) {
						$(".select-image-name").text("已选择" + $("#image-list").find("div.image-item").find("input:checked").size() + "张图片.请只选择一项更换");
						return;
					}
					changeImage.isGlyphicon();
					require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/commonValidate.js", function(e) {

						if (commonValidate.validateNull(changeImage.SelectImage)) {
							//将缩略图的路径替换成原图路径
							var src = changeImage.SelectImage;
							var imgName = src.substr(src.lastIndexOf('/') + 1, src.length);
							if (obj.hasClass("ctrlImgFlash")) {
								var imgObj = obj.find("img");
								var imgSrc = imgObj.attr("src");
								var backColor = imgObj.css("background-color");
							}
							//调用回调函数
							changeClick(src);
							//清空已选图片
							changeImage.SelectImage = "";
							//隐藏选择图片弹出框蒙板
							$(".layer").remove();
							obj.hide();
							obj.attr("style", "");
						} else {
							$(".select-image-name", obj).text("请选择图片！");
						}
					});

				} else {
					changeImage.changeGlyphiconAndHide(obj);

				}
			});
			//添加系统图标
			changeImage.createChangeSystemGlyphicon(obj);

			//显示图片设置面板
			$("#subImgFlashMenu").show();
		}
	};

	module.exports = changeImage;
});
