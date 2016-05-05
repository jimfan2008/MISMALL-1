var optionResult = {
	
	
	
	
	
	
	/**
	 * 求和
	 */
	getFieldSum : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".sum").unbind("click").click(function() {
				
				if ($li.attr("sum")) {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/qh.png");
					$(this).attr("title", "未按此列求和");
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("sum");
				} else {
					
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/qh1.png");
					$(this).attr("title", "已按此列求和");
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("sum", "sum");
					$li.removeAttr("max");
					$li.removeAttr("min");
					$li.removeAttr("avg");
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},
	
	/*
	 * 求最大值
	 * 
	 * */
	getFieldMax : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".max").unbind("click").click(function() {
				
				if ($li.attr("max")) {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/max.png");
					
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("max");
				} else {
					
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/max1.png");
					
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("max", "max");
					$li.removeAttr("sum");
					$li.removeAttr("min");
					$li.removeAttr("avg");
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},
	/*
	 * 求最小值
	 * 
	 * */
	getFieldMin : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".min").unbind("click").click(function() {
				
				if ($li.attr("min")) {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/min.png");
					
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("min");
				} else {
					
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/min1.png");
					
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("min", "min");
					$li.removeAttr("sum");
					$li.removeAttr("max");
					$li.removeAttr("avg");
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},
	/*
	 * 求平均值
	 * 
	 * */
	getFieldAvg : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".avg").unbind("click").click(function() {
				
				if ($li.attr("avg")) {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/pj.png");
					
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("avg");
				} else {
					
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/pj1.png");
					
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("avg", "avg");
					$li.removeAttr("sum");
					$li.removeAttr("max");
					$li.removeAttr("min");
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},
	/*
	 * 分组
	 * 
	 * */
	sortFields : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".cat").unbind("click").click(function() {
				
				if ($li.attr("group")) {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/fz.png");
					$(this).attr("title", "未按此列分组");
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("group");
				} else {
					
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/fz1.png");
					$(this).attr("title", "已按此列分组");
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("group", "group");
					
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},
	/*
	 * 排序
	 * 
	 * */
	groupFields : function() {
		var $this = this;
		var $ul = $(".right_data_header");
		$ul.find("li").each(function() {
			var $li = $(this);
			$(this).find(".orderBythis").unbind("click").click(function() {
				
				if (!$li.attr("sorted")) {
					$(this).attr("src",  PUBLICPATH + "/App/Designer/Query/Images/px1.png");
					$(this).attr("title", "已按此列降序排序");
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("sorted", "desc");
				} else if ($li.attr("sorted") == "asc") {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/px1.png");
					$(this).attr("title", "未此列排序");
					$(this).css({
						backgroundColor : '',
						border : '1px solid transparent'
					});
					$li.removeAttr("sorted");
				} else if ($li.attr("sorted") == "desc") {
					$(this).attr("src", PUBLICPATH + "/App/Designer/Query/Images/px.png");
					$(this).attr("title", "已按此列升序排序");
					$(this).css({
						backgroundColor : '#AACCEE',
						border : '1px solid #2692D6'
					});
					$li.attr("sorted", "asc");
				}
				 system._initGetSql();
				//var newSql = $this.updateSql($this.currTableName, false, 0, 100);
				//$this.dataSourceDom.find("sql").text(newSql);
				//$this.querySqlData(newSql);
			});
		});
	},

	//获取正确热时间机及其类型
	getTrueTime : function(obj,type,tname){
		var fname = obj.attr("fname");
		
		if(obj.attr("timeadd")=="timeadd" && obj.attr("tp")!=undefined){
			var num = obj.prev().find(".addnum").val();
		}else {
			
		}
		switch(type){

			case "preday":
				var  re = "@"+type-num+"@";
				return re;
			break;

			case "nextday":

			break;

			case "premonth":

			break;
			
		}
	},

};

