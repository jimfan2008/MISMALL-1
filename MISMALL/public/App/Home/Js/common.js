$(function(){
						$(".footer_btn1").on("mouseover",function(){
						var $img=$(this).find("img");
						var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_49.png");
						});
						$(".footer_btn2").on("mouseover",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_50.png");
						});
						$(".footer_btn3").on("mouseover",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_51.png");
						});
						$(".footer_btn4").on("mouseover",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_52.png");
						});
						
						$(".footer_btn1").on("mouseout",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
								$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_36.png");
						});
						$(".footer_btn2").on("mouseout",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_38.png");
						});
						$(".footer_btn3").on("mouseout",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_41.png");
						});
						$(".footer_btn4").on("mouseout",function(){
							var $img=$(this).find("img");
							var num=$(this).index();
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_43.png");
						});	

					var $con_nav=$("#con_nav a");
					$con_nav.on("mouseover",function(){
						var $img=$(this).find("img");
						var num=$(this).index();
						if(num==0)
						{
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_15.png");
						}
						else if(num==1)
						{
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_16.png");
						}
						else if(num==2)
						{
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_17.png");
						}
						else if(num==3)
						{
							$img.attr("src","http://mywork2014.qiniudn.com/maka02_index_18.png");
						}
					})
					$con_nav.on("mouseout",function(){
						
						var $img=$(this).find("img");
						var num=$(this).index();
						if(num==0)
						{
							$img.attr("src","http://makaindex.qiniudn.com/index_03.png");
						}
						else if(num==1)
						{
							$img.attr("src","http://makaindex.qiniudn.com/index_05.png");
						}
						else if(num==2)
						{
							$img.attr("src","http://makaindex.qiniudn.com/index_07.png");
						}
						else if(num==3)
						{
							$img.attr("src","http://makaindex.qiniudn.com/index_09.png");
						}
					});

})
					