/**
 * @author 陈毅
 * @desc 轮播图
 * @time 2015-09-21
 */
define(function(require, exports, module) {
	
	var mySwiper = {};
	
	var swiper = {
		
		get : function() {
			return component;
		},
		
		/**
		 * 控件的初始设置（用于控件添加时，如定位栏，分栏内部排序等）
		 */
		set : function($obj) {},

		/**
		 * 控件解析时的初始化（预览和发布后，一般用于调用特殊插件）
		 */
		init : function($obj){
			require.async("swiperCss",function(e){
				require.async("swiperJs", function(e) {
						mySwiper = new Swiper($obj.find('.swiper-container'), {
				        pagination: '.swiper-pagination',
				        paginationClickable: true,
				        preloadImages: false,
				        lazyLoading: true,
				        //loop : true,
						autoplay :3000,
				    });
				});
				$(".swiper-slide",$obj).height(150);
				$(".swiper-slide img",$obj).css({
					width : "100%",
					height: "100%"
				});
			});
		},
		
		/**
		 * 加载组件属性
		 */
		loadAttrs : function($sysComp) {
			var attrHtml = "";
			var settingPanel = $(".basicElementView");
			settingPanel.find(".attrDtlPanel").hide();
			$sysComp.find(".swiper-slide").each(function(idx){
				var src = $(this).find("img").attr("data-src") || $(this).find("img").attr("src");
				$(this).find("img").attr("swiper-img-idx","swiper"+idx);
				attrHtml += '<div class = "swiperAttr"><div class="row "><div class="col-md-6"><img src="'+src+'"/></div><div class="col-md-3"><button type="button"class="btn btn-primary btn-block change" swiper-img-idx = swiper'+idx+'>更换</button><button class="btn btn-danger btn-block delete"  swiper-img-idx = swiper'+idx+' slider-index = "'+idx+'">删除</button></div></div></div>';
			});
			attrHtml += '<div class = "addOneWrap"><div class = "addOneSlider"><div class = "centerSquir"><div class = "centerCircle"></div></div></div></div>';
			settingPanel.find(".GeneralAttr .setAttrs").empty().append(attrHtml);
			$(".right-menu").show();
			settingPanel.find(".GeneralAttr").show();
		},

		/**
		 * 设置组件属性
		 */
		setAttrs : function($swiper) {
			
			var change =  function($this){
				var swiperIdx = $this.attr("swiper-img-idx");
				$(".currrent-slide",ezCommon.Obj).removeClass("currrent-slide");
				
				$(".right-menu .swiper-active").removeClass("swiper-active");
				$this.closest(".row").find("img").addClass("swiper-active");
				
				$("[swiper-img-idx = '"+swiperIdx+"']",ezCommon.Obj).addClass("currrent-slide");
				
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/changeImage.js", function(e) {
					e.changeImg();
				});
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			};
			
			var del = function($this){
				var swiperIdx = $this.attr("swiper-img-idx");
				var sliderIdx = $this.attr("slider-index");
				if(confirm("真的要删除该图片吗？")){
					$this.closest(".swiperAttr").remove();
					mySwiper.removeSlide(sliderIdx);
				}
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/formJson.js", function(e) {
					e.addNeedSavePage();
				});
			};
			
			$(".right-menu .change").click(function(){
				change($(this));
			});
			
			$(".right-menu .delete").click(function(){
				del($(this));
			});
			
			$(".addOneWrap").click(function(){
				var $this = $(this);
				require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/attribute/changeImage.js", function(e) {
					e.changeImg($this,function(src){
						var idx = ezCommon.Obj.find(".swiper-slide").length - 1;
						var newAttr = '<div class = "swiperAttr"><div class="row "><div class="col-md-6"><img src="'+src+'"/></div><div class="col-md-3"><button type="button"class="btn btn-primary btn-block change" swiper-img-idx = swiper'+idx+'>更换</button><button class="btn btn-danger btn-block delete"  swiper-img-idx = swiper'+idx+' slider-index = "'+idx+'">删除</button></div></div></div>';
						var newSlider = '<div class="swiper-slide"><img data-src="'+src+'" class="swiper-lazy"><div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div></div>';
						mySwiper.appendSlide(newSlider);
						$this.before(newAttr);
						$this.prev().find(".change").click(function(){
							change($(this));
						});
						$this.prev().find(".delete").click(function(){
							del($(this));
						});
					});
				});
			});
		},
	};

	var component = {
		html : '<div syscomtype="swiper" fieldsum="true" class="row ctrl" ctrl-type="systemCp"  style=""><div class="swiper-container"><div class="swiper-wrapper"><div class="swiper-slide"><img data-src="http://qjwd.oss-cn-shenzhen.aliyuncs.com/2015-09-22/56010ce3be2e2.jpg" class="swiper-lazy"><div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div></div><div class="swiper-slide"><img data-src="http://qjwd.oss-cn-shenzhen.aliyuncs.com/2015-09-22/56010ce70faa6.jpg"class="swiper-lazy"><div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div></div><div class="swiper-slide"><img data-src="http://qjwd.oss-cn-shenzhen.aliyuncs.com/2015-09-22/56010ceb1f1a6.jpg"class="swiper-lazy"><div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div></div></div><div class="swiper-pagination swiper-pagination-white"></div></div><div class = "ctrlIconWraper"></div></div>',
		cName : '轮播图',
		attrs : {
			General : ["swiper"]
		},
	};

	module.exports = swiper;
});
