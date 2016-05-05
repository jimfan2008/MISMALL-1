/**
 * 公司信息JS
 * @author cjli
 * @date 2013-10-08
 */

//上传公司LOGO
function ajaxUploadCompanyLogo(){
	$.ajaxFileUpload({
		url : APPPATH + '/RuleFormula/upload?prefix=upload_company_logo', //需要链接到服务器地址
		secureuri : false,
		fileElementId : 'upload_company_logo', //文件选择框的id属性
		dataType : 'json', //服务器返回的格式，可以是json
		success : function(data) {
			$('#localImag').html('<img src="'+data['img']+'" width="120" height="80" />');
			$('#company_logo').val(data['img_base']);
			$('#upload_company_logo').css('display','none');
		},
		error : function(data) {
		}
	});
}

//过滤公司名称
function getCompanyName(company_name){
	if(company_name==""){
		alert('公司名称不能为空');
		return false;
	}
	var reg = new RegExp("^[0-9a-zA-Z\u3E00-\u9FA5]+$");
	if( ! reg.test(company_name) ){
		alert('公司名称只能为中文、数字和字母组成');
		return false;
	}
	return true;
}
//过滤验证公司域名
function getCompanyDomain(domain){
	if(domain==""){
		alert('公司域名不能为空');
		return false;
	}
	var reg = new RegExp("^[0-9a-zA-Z_]+$");
	if( ! reg.test(domain) ){
		alert('公司域名只能为数字和字母组成');
		return false;
	}
	var domainStatusArray = new Array();
	domainStatusArray[0] = '域名可以使用.';
	domainStatusArray[1] = '二级域名不能为空!';
	domainStatusArray[2] = '二级域名只能由数字和字母组成！';
	domainStatusArray[3] = '禁用域名';
	domainStatusArray[4] = '域名已经被使用，请选用其他域名';

	$.ajax({
		url: APPPATH+'/Index/checkCompanyDomain',
		type:'GET',
		data:'domain='+domain,
		dataType:'text',
		async: false,
		success: function(status){
			if(status==0){
				$('#domainurl_addr').html(domain);
			}else{
				alert(domainStatusArray[status]);
				return false;
			}
		}
	});
	return true;
}

//保存公司信息
function saveCompanyInfo(){
	var com_name = $('#company_name').val();
	var com_domain = $('#company_domain').val();
	var com_logo = $('#company_logo').val();
	if(! getCompanyName(com_name)){
		return false;
	}
	if(! getCompanyDomain(com_domain)){
		return false;
	}
	
	$.ajax({
		type : "post",
		url : APPPATH+"/MyCenter/updateCompanyInfo",
		data : {
			id : $('#company_id').val(),
			company_name : com_name,
			company_domain: com_domain,
			company_logo: com_logo,
		},
		success : function(status) {
			if(status==1){
				alert('操作成功')
			}else{
				alert('操作失败');
			}
		}
	});
	
}