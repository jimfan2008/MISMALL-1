<?php
/**
 * 专门用来做测试的控制器
 */
class TestAction extends BaseAction {

	public function index() {
		echo 'index....';
	}

	public function replace() {
		$html = <<<EOF
		{{first.DATA}} 通知内容：{{keyword1.DATA}} 通知人：{{keyword2.DATA}} 通知时间：{{keyword3.DATA}} {{remark.DATA}}
EOF;
		//$html = trim(str_replace(array('{{first.DATA}}', '{{remark.DATA}}'), '', $html));
		//echo $html . '<br/>';
		preg_match_all("/{{(.*?).DATA}}/", $html, $matches);
		print_r($matches);
		$param = $matches[1];
		array_pop($param);
		array_shift($param);
		print_r($param);exit;
		$content = preg_replace("/{{(.*?).DATA}}/", "<input name='\$1' />", $html);
		echo $content;
		$html2 = <<<EOF
		<script>
		var str = "{{first.DATA}} 通知内容：{{keyword1.DATA}} 通知人：{{keyword2.DATA}} 通知时间：{{keyword3.DATA}} {{remark.DATA}}";
//var m = str.match(/{{(.*?).DATA}}/g);
		str = str.replace(/}} (.*?)：/g, "}}<span>\$1<span />");
		var m = str.replace(/{{(.*?).DATA}}/g, "<input name='\$1' />");
console.log(m);
</script>
EOF;
		echo $html2;
	}

	public function updateSite() {
		$site = M('UserSite');
		$list = $site->field('id,thumbPath')->where("thumbPath<>''")->select();
		foreach ($list as $a) {
			if (strpos($a['thumbPath'], 'http') === false) {
				$set = array(
					'thumbPath' => '/uploads/' . $a['thumbPath'],
				);
				$site->where(array('id' => $a['id']))->save($set);
			}
			//exit;
		}
	}

	public function pay() {
		session('pid', 175);

		$xml = '<xml><appid><![CDATA[wx457341e4f5cead31]]></appid>
<bank_type><![CDATA[CFT]]></bank_type>
<cash_fee><![CDATA[1]]></cash_fee>
<fee_type><![CDATA[CNY]]></fee_type>
<is_subscribe><![CDATA[Y]]></is_subscribe>
<mch_id><![CDATA[1232414502]]></mch_id>
<nonce_str><![CDATA[0cc8kmluhmiqmgzmar0knzw7a9fywwbm]]></nonce_str>
<openid><![CDATA[o4eQQs4-aQZOi6y9JCbZOuiIWccc]]></openid>
<out_trade_no><![CDATA[2D4hypnvyHFamg2bTyPE3NJkWcyhFJ2N]]></out_trade_no>
<result_code><![CDATA[SUCCESS]]></result_code>
<return_code><![CDATA[SUCCESS]]></return_code>
<sign><![CDATA[8F28ED893C3A288FC0CC8289E5DB4619]]></sign>
<time_end><![CDATA[20150410094332]]></time_end>
<total_fee>1</total_fee>
<trade_type><![CDATA[JSAPI]]></trade_type>
<transaction_id><![CDATA[1003510529201504100054860240]]></transaction_id>
</xml>';

		Log::write("微信支付表单信息\n" . var_export($json_data, TRUE) . "\n", Log::DEBUG);

		//LOG 日志
		$content = "【接收到的notify通知】:\n" . var_export($json_data, TRUE) . "\n";
		file_write(C('LOG_PATH') . 'wechat_pay_' . date('y_m_d') . '.log', $content);
		exit;
		//echo $json_data;exit;
		$res = D('Project')->saveFormDataInfo('cc_tbfm201503230834343364', 0, $json_data);
		dump($res);
		exit;
		$code_url = 'weixin://wxpay/bizpayurl?pr=zno8mQt';
		$out_trade_no = "2015031716575735376";
		$public_url = C('PUBLIC_URL');
		$form = <<<EOF
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="UTF-8">
	<title>微信安全支付</title>
</head>
<body>
	<div align="center">
		<p>订单号：{$out_trade_no}</p>
	</div>
	<div align="center" id="qrcode"></div>
	<div align="center">
		<p>订单号：{$out_trade_no}</p>
	</div>
	<div align="center">
		<a href="/">返回首页</a>
	</div>
</body>
	<script src="/public/Js/jquery-1.9.1.min.js"></script>
	<script src="/public/Js/jquery-qrcode/jquery.qrcode.min.js"></script>
	<script>
		$('#qrcode').qrcode({width: 164,height: 164,text: "{$code_url}"});
	</script>
</html>
EOF;
		$form = <<<EOF
function onBridgeReady(){
   WeixinJSBridge.invoke(
       'getBrandWCPayRequest',{
       	"appId":"wx457341e4f5cead31",
       	"timeStamp":1426649927,
       	"nonceStr":"85bxtrbwimeta1orf4yc02ksrge4yglb",
       	"package":"prepay_id=wx20150318113847771ae15a480596915003",
       	"signType":"MD5",
       	"paySign":"B83015D1D83809BE3E74AC395CE47982"
   },
       function(res){
           if(res.err_msg == "get_brand_wcpay_request:ok" ) {}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
       }
   );
}
if (typeof WeixinJSBridge == "undefined"){
   if( document.addEventListener ){
       document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
   }else if (document.attachEvent){
       document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
       document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
   }
}else{
   onBridgeReady();
}
EOF;
		echo $form;
		echo 'index';
	}

	/**
	 * 文字生成图片
	 */
	public function txttoimg() {
		importORG('Image');
		$string = <<<EOF
asdfasdfasdfsadfsfd
EOF;
		//Image::buildString($string, "200,300");
		Image::GBVerify();
	}

	public function url() {
		$str = <<<EOF
这两天把自己的站点移到了Ubuntu 9.04底下，要弄伪静态的页面，需要启用Apache的rewrite模块。在其他的Linux版本中，这个问题似乎要容易解决一些，但是在ubuntu下，就有点不大一样。
EOF;
		$tags = array('Ubuntu', 'Apache', 'rewrite');
		$str = str_replace($tags, '<a href="/tag/$1">$i</a>', $str);
		echo $str;
	}

	public function uploadify() {
		$html = <<<EOF
<form enctype="multipart/form-data" method="post" action="/mismall/Test/qiniu" >
		<input type="file" name="img">
		<input type="submit" value="submit">
		</form>
EOF;
		echo $html;
		//$this->display();
	}

	public function qiniu() {
		echo file_get_contents($_FILES['img']['tmp_name']);
		dump($_FILES);exit;
		//echo '<img  src="http://qjwd.oss-cn-shenzhen.aliyuncs.com/2015-05-25/5562e71ec7fd5.jpg"/>';exit;
		//importORG('Upload');
		/* 上传文件 */
		/*$upload = new Upload(C('PICTURE_UPLOAD'), C('FILE_UPLOAD_TYPE'), C('UPLOAD_TYPE_CONFIG'));
		$info = $upload->uploadOne();
		if (!$info) {
		echo $upload->getError();
		exit;
		}*/
		$info = $this->uploadPicture();
		dump($info);
		exit;
		/*
		array(9) {
		["name"] => string(38) "2014-05-26 15:18:42的屏幕截图.png"
		["type"] => string(9) "image/png"
		["size"] => int(137815)
		["key"] => string(3) "img"
		["ext"] => string(3) "png"
		["md5"] => string(32) "c897e6b272cb11b98d40988153c50aa1"
		["sha1"] => string(40) "b775f32dd684236b69b8563daeb568318ac540e7"
		["savename"] => string(17) "5563cdd9e3f39.png"
		["savepath"] => string(11) "2015-05-26/"
		}
		 */

		$config = array(
			'mimes' => '', //允许上传的文件MiMe类型
			'maxSize' => 0, //上传的文件大小限制 (0-不做限制)
			'exts' => 'zip', //允许上传的文件后缀
			'autoSub' => false, //自动子目录保存文件
			'subName' => array('date', 'Y/m/d'), //子目录创建方式，[0]-函数名，[1]-参数，多个参数使用数组
			'rootPath' => './uploads/pdf/', //保存根路径
			'savePath' => '', //保存路径
			'saveName' => array('uniqid', ''), //上传文件命名规则，[0]-函数名，[1]-参数，多个参数使用数组
			'saveExt' => '', //文件保存后缀，空则使用原后缀
			'replace' => true, //存在同名是否覆盖
			'hash' => true, //是否生成hash编码
			'callback' => false, //检测文件是否存在回调函数，如果存在返回文件信息数组
		);
		$qiniu_config = array(
			'accessKey' => 'PcO4kLaAqFNWRV2xMXXNZ6WuuicCurf64HNTJAny', //七牛服务器
			'secrectKey' => 'NT7mf-NIne9Lnb2VSDVc02ePTIv-1CTERdD9MSY2', //七牛用户
			'domain' => '7xi40t.com2.z0.glb.qiniucdn.com', //七牛密码
			'bucket' => 'jingu',
		);

		importORG('Upload.Driver.Qiniu.QiniuStorage');
		$qiniu = new QiniuStorage($qiniu_config);

		//dump($_FILES);exit;
		/* 上传文件 */
		/*$upload = new Upload($config, 'local', array());
		$info = $upload->uploadOne();
		if (!$info) {
		echo $upload->getError();
		exit;
		}*/
		$info = array(
			"name" => "550f81f0d1139.zip",
			"type" => "application/zip",
			"size" => 472259,
			"key" => "img",
			"ext" => "zip",
			"md5" => "58b02b6619f2979d374e87b4ffdbf15e",
			"sha1" => "1f1a1fac37ce70f1349adff4d9de7136ad555b3c",
			"savename" => "550f81f0d1139.zip",
			"savepath" => "",
		);
		//dump($info);
		$file_path = getImagePath($config['rootPath'] . $info['savepath'] . $info['savename']);
		//echo $file_path . '<br/>';exit;
		if (!is_file($file_path)) {
			echo '上传文件失败';
		}

		importORG('Phpzip');
		$archive = new Phpzip();
		$unzipList = $archive->GetZipInnerFilesInfo($file_path);
		//dump($unzipList);

		$filecount = 0;
		$dircount = 0;
		$failfiles = array();
		set_time_limit(0);
		//修改为不限制超时时间(默认为30秒)
		$folder_path = ROOT_PATH . '/uploads/pdf/' . $info['savepath'];
		foreach ($unzipList as $key => $arr) {
			//$archive->unZip($file_path, $folder_path, $key);
			/*if ($arr['folder']) {
			$folder = substr($arr['filename'], 0, -1);
			//echo $folder . '<br/>';
			$dircount++;
			} else {*/
			if ($arr['folder'] == 0) {
				//dump($arr);exit;
				$affect = $archive->unZip($file_path, $folder_path, $key);
				if ($affect > 0) {
					$str_start = strrpos($arr['filename'], '/');
					$file_name = substr($arr['filename'], $str_start ? $str_start + 1 : 0, -4);
					//echo $file_name . '<br/>';
					$filecount++;

					$file = array(
						'name' => $file_name,
						'tmp_name' => $folder_path . $arr['filename'],
						'type' => 'application/pdf',
						'error' => 0,
						'site' => $arr['size'],
						'savepath' => date('Y-m-d', time()) . '/',
						'savename' => unquire_rand() . '.pdf',
					);

					$file_new_name = $file['savepath'] . $file['savename'];
					$key = str_replace('/', '_', $file_new_name);
					$upfile = array(
						'name' => 'file',
						'fileName' => str_replace('/', '_', $file_new_name),
						'fileBody' => file_get_contents($file['tmp_name']),
					);
					//print_r($file);
					//print_r($upfile);exit;
					$result = $qiniu->upload(array(), $upfile);
					$url = $qiniu->downLink($key);
					$file['url'] = $url;
					$json_data = array(
						'CCTextBox5' => $file_name,
						'CCDropDown1' => $folder_name,
						'CCTime4' => date('Y-m-d H:i:s'),
						'CCTextBox3' => $file['url'],
					);
					//echo $json_data;exit;
					D('Project')->saveFormDataInfo('cc_tbfm201503231022362177', 0, $json_data);
					file_delete($file['tmp_name']);

				} else {
					$failfiles[] = $arr['filename'];
				}
			}
		}

		echo '上传成功文件数：:' . $filecount . '<br/>';
		echo '失败文件列表 : ' . explode('\r\n', $failfiles);
		exit;
	}

	public function lbs() {
		$political = geocode(23.667231, 114.218430);
		dump($political);
		/*importORG("Curl");
	$url = "http://maps.google.cn/maps/api/geocode/json?latlng=22.667231,114.218430&sensor=true&language=zh-CN";
	$json = Curl::get($url);
	$json = json_decode($json);
	$political = array();
	if ($json->status == 'OK') {
	$result = $json->results[0];
	$political['address'] = $result->formatted_address;
	$address_components = $result->address_components;
	foreach ($address_components as $com) {

	switch ($com->types[0]) {
	case 'administrative_area_level_1':
	$political['province'] = $com->long_name;
	break;
	case 'locality':
	$political['city'] = $com->long_name;
	break;
	case 'sublocality_level_1':
	$political['district'] = $com->long_name;
	break;
	default:
	break;
	}
	}
	dump($political);
	//dump($result);exit;
	}
	//dump($json);exit;*/
	}

}