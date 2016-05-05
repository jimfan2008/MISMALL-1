//事件基础类
(function() {
	var EventBase = function() {

		this.addListener = function(type, listener) {
			getListener(this, type, true).push(listener);
		}

		this.removeListener = function(type, listener) {
			var listeners = getListener(this, type);
			for ( var i = 0; i < listeners.length; i++) {
				if (listeners[i] == listener) {
					listeners.splice(i, 1);
					return;
				}
			}
		}

		this.fireEvent = function(type) {
			var listeners = getListener(this, type), r, t, k;
			if (listeners) {
				k = listeners.length;
				while (k--) {
					t = listeners[k].apply(this, arguments);
					if (t !== undefined) {
						r = t;
					}
				}
			}
			if (t = this['on' + type.toLowerCase()]) {
				r = t.apply(this, arguments);
			}
			return r;
		}
	}

	function getListener(obj, type, force) {
		var allListeners;
		type = type.toLowerCase();
		return ((allListeners = (obj.__allListeners || force
				&& (obj.__allListeners = {}))) && (allListeners[type] || force
				&& (allListeners[type] = [])));
	}

	window['EventBase'] = EventBase;
})();

//分页类
var Page = function(pageCanvas) {
	this.recordCount;
	this.pageSize;
	this.numericButtonCount;
	this.pageCanvas = pageCanvas;
	this.pageIndex = 1;
}

Page.prototype = new EventBase();

Page.prototype.getPageHtml = function() {
	this.pageCount = Math.ceil(this.recordCount / this.pageSize);

	var pageStr = "";

	if (this.pageCount > 1) {
		var prev = this.pageIndex == 1 ? " <li class='page_up_onthis' pageindex='1'><<</li>"
				: " <li class='page_up' pageindex='" + (this.pageIndex - 1)
						+ "'><<</li> ";
		var next = this.pageCount <= this.pageIndex ? " <li class='page_next_onthis' pageIndex='"
				+ (this.pageIndex) + "'>>></li>"
				: " <li class='page_next' pageIndex='" + (this.pageIndex + 1)
						+ "'>>></li>";
		var first = this.pageIndex == 1 ? "<li class='onthis'>1</li><li>...</li>"
				: "<li pageindex='1'>1</li><li>...</li>";
		var last = this.pageCount <= this.pageIndex ? "<li>...</li><li class='onthis'>"
				+ this.pageCount + "</li>"
				: "<li>...</li><li pageindex='" + (this.pageCount) + "'>"
						+ this.pageCount + "</li>";

		var pageMathIndex = Math.floor(this.numericButtonCount / 2);
		var pageStartIndex;
		var pageEndIndex;

		if (this.pageCount < this.numericButtonCount) {
			pageStartIndex = 1
			pageEndIndex = this.pageCount;
		} else {
			if (this.pageCount - pageMathIndex < this.pageIndex) {
				pageStartIndex = this.pageCount - this.numericButtonCount + 1;
				pageEndIndex = this.pageCount;
			} else {
				if (this.pageIndex - pageMathIndex < 1) {
					pageStartIndex = 1;
					pageEndIndex = this.numericButtonCount;
				} else {
					pageStartIndex = this.pageIndex - pageMathIndex;
					pageEndIndex = this.pageIndex + pageMathIndex;
				}
			}
		}

		for ( var i = pageStartIndex; i <= pageEndIndex; i++) {
			if (this.pageIndex == i)
				pageStr += " <li style='background:#ffa405;color:#fff' class='curr onthis' pageindex='"
						+ i + "'>" + i + "</li>";
			else
				pageStr += " <li pageindex='" + i + "'>" + i + "</li>";
		}

		if (pageStartIndex == 1)
			first = '';
		if (pageEndIndex == this.pageCount)
			last = '';
		// pageStr = first + prev + pageStr + next + last;
		pageStr = prev + first + pageStr + last + next;
	}

	return pageStr;
}

Page.prototype.onPageChanged = function(pageIndex) {
	this.pageIndex = pageIndex;
	this.fireEvent('pageChanged');
}

Page.prototype.pageEvent = function(page) {
	this.onclick = function(e) {
		e = e || window.event;
		t = e.target || e.srcElement;

		if (t.tagName == "LI")
			page.onPageChanged(parseInt(t.getAttribute("pageindex")));

	}
}

Page.prototype.render = function() {
	var pageCanvas = document.getElementById(this.pageCanvas);
	pageCanvas.innerHTML = this.getPageHtml();
	this.pageEvent.call(pageCanvas, this);
}

Page.prototype.initialize = function() {
	this.onPageChanged(this.pageIndex);
}

	/**
     * 分页
     * @param pageSize 页数
     * @param sum 总数
     * @btnObj 确定按钮对象
     * @fewObj 输入页数的文本框对象 
     * @pageSite 分页的标签id
     * @param showObj 隐藏和显示的对象
     */
	function myCenterPageSize(pageSize, sum , btnObj, fewObj, pageSite, showObj)
	{
		var p = new Page(pageSite);
	    p.numericButtonCount = 5;
	    p.pageSize = pageSize;
	    p.recordCount = sum;
	    p.addListener('pageChanged', function() {
	    	myCenterPageIndex(p, p.pageIndex, showObj);
	    });
	    //分页-确定
		btnObj.click(function(){
			var fewPage = fewObj.val();
			if((fewPage == "" || !/^[0-9]*$/.test(fewPage)) && fewPage > 0) return;
			p.pageIndex = fewPage;
		   	myCenterPageIndex(p, fewPage, showObj);
		});
	    p.initialize();
	    return p;
	}
	function myCenterPageIndex(p, index, showObj)
	{
		showObj.hide();
    	var pageStart = (index - 1) * p.pageSize;
    	var pageEnd = pageStart + p.pageSize;
    	showObj.slice(pageStart, pageEnd).show();
    	p.render();
	}

	//充值记录详细加载  ljp
	/*var LoadPayDetail = function(){
		$(".rightcontent").empty();
		$(".rightcontent").append('<div class="rightcontent fr">'
				+'<div class="breadCrumb f-14b">充值记录</div>'
				+'<div class="order" style="display: block;"></div>'
				+'<table width="100%" border="0" cellspacing="1" cellpadding="5" class="tablediv">'
				+'<tr>'
			    +'<td width="23%" height="36" align="center" bgcolor="#FFFFFF">充值时间</td>'
			    +'<td width="33%" align="center" bgcolor="#FFFFFF">充值来源 </td>'
			    +'<td width="17%" align="center" bgcolor="#FFFFFF">总金额</td>'
			    +'<td width="17%" align="center" bgcolor="#FFFFFF">状态</td>'
			    +'<td width="10%" align="center" bgcolor="#FFFFFF">操作</td>'
			    +'</tr></table>'
			    +'<div class="clear"></div>'
			    +'<div class="page"><a href="#" class="now">1</a> <a href="#">2</a> <a href="#">3</a> <a href="#">4</a> <a href="#">5</a> ... 共10页 到第'
			    +'<input name="" type="text"  class="input_box"/> 页 <input name="" type="submit" class="btn" value="确定" /></div>'
			    +'</div>');
		var result="";
		$.ajax({
			url: GROUPPATH+"/MyCenter/getPayInfo",
			data:{},
			type: "POST",
			cache:false,
			success: function(data){
				var data = eval(data);
				$.each(data,function(i,n){
					result+='<tr>'
					    +'<td width="23%" height="36" align="center" bgcolor="#FFFFFF">'+data[i]['payTime']+'</td>'
					    +'<td width="33%" align="center" bgcolor="#FFFFFF">'+data[i]['payFrom']+' </td>'
					    +'<td width="17%" align="center" bgcolor="#FFFFFF">'+data[i]['payMoney']+'</td>'
					    +'<td width="17%" align="center" bgcolor="#FFFFFF">'+((data[i]["payStatue"]==1)?"充值成功":"未充值")+'</td>'
					    +'<td width="10%" align="center" bgcolor="#FFFFFF"><p class="del" style="align:center;"><a href="#">删除</a></p></td>'
					    +'</tr>'
				});
				$(".rightcontent").find("tr").after(result);
			},
			error: function(){
				alert("it is not exit!");
			}
			
				
		});
		
	};*/