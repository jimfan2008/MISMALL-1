/**
 * @author 柯斌
 * @desc 省市区级联
 * @desc 2015-10-20
 */

define(function(require, exports, module) {
	var cascade = {
		get : function() {
			return ctrl;
		},

		set : function() {

		},

		init : function($ctrl) {
			require("./cascade/cascade.css");
			require.async("./cascade/city.js", function() {
				getProvince();
				//getCity(0);
				//getCounty(0, 0);

				$(".cascade-province", $ctrl).unbind("click").click(function() {
					$(this).css("background", "#00aaff ");
					$(".cascade-city,.cascade-county", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-provinceList", $ctrl).show();
					$(".cascade-cityList", $ctrl).hide();
					$(".cascade-countyList", $ctrl).hide();
					$(".cascade-addRess", $ctrl).hide();
				});

				$(".cascade-city", $ctrl).unbind("click").click(function() {
					if (!$(".cascade-province", $ctrl).attr("index"))
						return;
					$(this).css("background", "#00aaff ");
					$(".cascade-province,.cascade-county", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-cityList", $ctrl).show();
					$(".cascade-countyList", $ctrl).hide();
					$(".cascade-provinceList", $ctrl).hide();
					$(".cascade-addRess", $ctrl).hide();
					cityListClick();
				});

				$(".cascade-county", $ctrl).unbind("click").click(function() {
					if (!$(".cascade-city", $ctrl).attr("index"))
						return;
					$(this).css("background", "#00aaff ");
					$(".cascade-city,.cascade-province", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-countyList", $ctrl).show();
					$(".cascade-provinceList", $ctrl).hide();
					$(".cascade-cityList", $ctrl).hide();
					$(".cascade-addRess", $ctrl).hide();
					countyListClick();
				});

				onValueChange($(".cascade-addressIput",$ctrl)[0], function() {
					var $baseCtrl = $("[isbasectrl]", $ctrl), baseText = $baseCtrl.attr("address") + $(".cascade-addressIput", $ctrl).val();
					$baseCtrl.val(baseText);
				});
			});

			/**
			 * @desc 获取所有省份
			 */
			function getProvince(flag) {
				var p = provinceList;
				var str = [];
				for (var i = 0; i < p.length; i++) {
					flag ? str.push("<li") : str.push("<li class='col-md-6 col-xs-6'");
					str.push(" index='");
					str.push(i);
					str.push("'><span>");
					str.push(p[i]["name"]);
					if (i < 4 || i > 30) {
						str.push("</span>");
					} else {
						str.push("省</span>");
					}
					flag ? str.push("<div class='slide-cityList'><ul>" + getCity(i, flag) + "<br style='clear:both'></ul></div>") : "";
					str.push("</li>");

				}
				if (!flag) {
					$(".cascade-provinceList ul", $ctrl).empty().append(str.join(""));
					provinceListClick();
				}
				return str.join("");
			}

			/**
			 * @desc 获取选中省份的所有城市
			 */
			function getCity(p, flag) {
				var c = provinceList[p]["cityList"];
				var str = [];
				for (var i = 0; i < c.length; i++) {
					flag ? str.push("<li") : str.push("<li class='col-md-6 col-xs-6'");
					str.push(" index='");
					str.push(i);
					str.push("'>");
					str.push(c[i]["name"]);
					str.push("</li>");
				}
				if (!flag) {
					$(".cascade-cityList ul", $ctrl).empty().append(str.join(""));
					cityListClick();
				}
				return str.join("");
			}

			/**
			 * @desc 获取选中城市的所有县区
			 */
			function getCounty(p, c,flag) {
				var county = provinceList[p]["cityList"][c]["areaList"], str = [];
				for (var i = 0; i < county.length; i++) {
					flag ? str.push("<li>") : str.push("<li class='col-md-6 col-xs-6'>");
					str.push(county[i]);
					str.push("</li>");
				}
				$(".cascade-countyList ul", $ctrl).empty().append(str.join(""));
				countyListClick();
				return str.join("");
			}

			function provinceListClick() {
				$(".cascade-provinceList li", $ctrl).unbind("click").click(function() {
					var index = $(this).attr("index");
					$(".cascade-province", $ctrl).attr("index", index).html($(this).html());
					$(".cascade-city", $ctrl).removeAttr("index").html("城市");
					$(".cascade-county", $ctrl).html("县区");
					$(".cascade-provinceList", $ctrl).hide();
					getCity(index);
					$(".cascade-cityList", $ctrl).show();
					$(".cascade-city", $ctrl).css("background", "#00aaff ");
					$(".cascade-province,.cascade-county", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-addRess", $ctrl).hide();
				});
			}

			function cityListClick() {
				$(".cascade-cityList li", $ctrl).unbind("click").click(function() {
					var index = $(this).attr("index"), p = $(".cascade-province", $ctrl).attr("index");
					$(".cascade-city", $ctrl).attr("index", index).html($(this).html());
					$(".cascade-county", $ctrl).html("县区");
					getCounty(p, index);
					$(".cascade-cityList", $ctrl).hide();
					$(".cascade-countyList", $ctrl).show();
					$(".cascade-county", $ctrl).css("background", "#00aaff ");
					$(".cascade-province,.cascade-city", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-addRess", $ctrl).hide();
				});
			}

			function countyListClick() {
				$(".cascade-countyList li", $ctrl).unbind("click").click(function() {
					$(".cascade-county", $ctrl).html($(this).html());
					$(".cascade-countyList", $ctrl).hide();
					$(".cascade-county", $ctrl).css("background", $ctrl.attr("data-bgcolor"));
					$(".cascade-addRess", $ctrl).show();
					var text = $(".cascade-province", $ctrl).html() + $(".cascade-city", $ctrl).html() + $(this).html();
					$("[isbasectrl]", $ctrl).attr("address", text).val(text);
				});
			}

			var $selectedForm = $(".selectedForm");
			$ctrl.click(function() {
				if ($selectedForm.hasClass("slideInputForm")) {
					var fieldTitle = $(this).find(".fieldTitle").html(), ctrlValue = $(this).find(".ctrlValue").html(), $inputPanel = $selectedForm.next(".inputPanel"), $ipEditBox = $inputPanel.find(".ipEditBox");
					//缓存当前点击的控件到滑出面板中
					$inputPanel.data("ctrl", $ctrl);
					$inputPanel.find('.ipTitle').html("选择省份");
					$ipEditBox.empty().append("<ul class='slide-province'>" + getProvince(true) + "<br style='clear:both'></ul>");
					//$ipEditBox.find("textarea").val(ctrlValue);
					if ($selectedForm.hasClass("slideInputForm")) {
						$selectedForm.next(".inputPanel").show().animate({
							"right" : 0
						}, 300, function() {
							//$(".inputPanel textarea").focus();
						});
						var myWebH = $("#myWeb").height(),winH = $(window).height(),h=0,$ipTitile = $(".ipTitleWrap"),ipTitileH = $ipTitile.height();
						h = isMobile() ? winH : myWebH;
						$(".ipSave",$ipTitile).addClass("slideIpSaveNone");
						//$ipTitile.append('<div class="slide-ipTitleWrap" style="background:#2f96b4;height:'+ipTitileH+'px;position:relative;"><span class="ipBack ipp">返回</span><span class="ipTitle ipp"></span><span class="ipSave ipp">保存</span></div>');
						$ipEditBox.css("height",h-ipTitileH);
						$(".ipEditBox .slide-cityList li").unbind("click").click(function(){
							var $this = $(this), p =$this.parents(".slide-cityList").parent().attr("index"),c=$this.attr("index"),provinceName =$this.closest(".slide-cityList").prev().html(); 
							$(".selected-slide-city").removeClass("selected-slide-city");
							$this.addClass("selected-slide-city");
							$(".ipBack,.ipSave",$ipTitile).addClass("slideCityCounty");
							$(".ipTitleWrap .ipTitle").html(provinceName);
							$(".ipEditBox .slide-province").hide();
							$ipEditBox.append('<div class="slide-city-county"><ul class="slide-city">'+$this.parent().html()+'</ul><ul class="slide-county">'+getCounty(p,c,true)+'</ul><br style="clear:both"></div>');
							var cityName = $this.html();
							$(".slide-city-county .slide-city li").unbind("click").click(function(){
								cityName = $(this).html();
								$(".selected-slide-city").removeClass("selected-slide-city");
								$(this).addClass("selected-slide-city");
								$(".slide-city-county .slide-county").empty().append(getCounty(p,$(this).attr("index"),true));
							});
							
							$(".slide-city-county .slide-county").off("click").on("click","li",function(){
								var $this = $(this);
								$(".ipSave",$ipTitile).addClass("slideIpSave").removeClass("slideIpSaveNone");
								$(".ipBack,.ipSave",$ipTitile).removeClass("slideCityCounty").addClass("slideCounty");
								//$(".ipSave",$ipTitile).addClass("slideCountySave").removeClass("slideCity");
								$(".ipEditBox .slide-city-county").hide();
								if($(".ipEditBox").find(".slide-detailed").size()){
									$(".slide-detailed").show();
									$(".province-city-county .province").html(provinceName);
									$(".province-city-county .city").html(cityName);
									$(".province-city-county .county").html($this.html());
								}else{
									$(".ipEditBox").append('<div class="slide-detailed"><div class="province-city-county"><span class="province">'+provinceName+'</span><span class="city">'+cityName+'</span><span class="county">'+$this.html()+'</span></div><textarea  placeholder="请输入详细地址"></textarea></div>');
								}
							});
						});
						
					} else {

					}
				}
			});

		},

		/**
		 * 加载控件属性
		 */
		loadAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(e) {
				e.loadAttrs(ctrl);
			});
		},

		/**
		 * 加载控件动作
		 */
		loadAction : function(ctrlType) {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(e) {
				e.loadAction(ctrlType, "components");
			});
		},

		/**
		 * 设置控件属性
		 */
		setAttrs : function() {
			require.async(SITECONFIG.PUBLICPATH + "/App/Qywx/Js/ctrlCommon.js" + SITECONFIG.VERSION, function(e) {
				e.setAttrs(ctrl);
			});
		}
	};
 
	var ctrl = {
		html : '<div class="row cascadeContent ctrl imFormCtrl " fieldsum="true" syscomtype="cascade" ctrl-type="systemCp" data-bgColor="#00ccff" data-textColor="#000000"><div class="cascadeList" text-color="true"><div class="col-md-4 cascade-province"  pure-bg-color="true" style="height:40px;line-height:40px;text-align:center;background:#00ccff;overflow: hidden;">省份</div><div class="col-md-4 cascade-city"  pure-bg-color="true" style="height:40px;line-height:40px;text-align:center;background:#00ccff;overflow: hidden;">城市</div><div class="col-md-4 cascade-county"  pure-bg-color="true" style="height:40px;line-height:40px;text-align:center;background:#00ccff;overflow: hidden;">县区</div></div><div class="row cascade-addRess"><div class="col-xs-3 control-label ">详细地址</div><div class="col-md-9"><input type="text" class="form-control cascade-addressIput" placeholder="请填写详细地址"><input type="text" isbasectrl="true" style="display:none;"></div></div><div class="cascade-provinceList cascade" style="display:none"><ul></ul></div><div class="cascade-cityList cascade" style="display:none"><ul></ul></div><div class="cascade-countyList cascade" style="display: none"><ul></ul></div><div class="ctrlValue" style="float: right; position: relative;width:300px;">选择地址</div><div class="formInputArrow" style="display: none;">></div><div class = "ctrlIconWraper"></div></div>',
		cName : '省市区级联',
		attrs : {
			General : [],
			style : ["bgColor", "textColor"]
		},

	};

	module.exports = cascade;
});
