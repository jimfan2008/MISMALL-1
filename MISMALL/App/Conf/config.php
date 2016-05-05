<?php
$config = array(
	//'配置项'=>'配置值'

	'LOAD_EXT_CONFIG' => 'upload', //上传配置

	'EZSIZE_VERSION' => '1.0.beta', //版本

	'VAR_SESSION_ID' => 'session_id', //修复uploadify插件无法传递session_id的bug

	//项目配置
	'APP_AUTOLOAD_PATH' => '@.TagLib', // 标签库的文件名
	'APP_GROUP_LIST' => 'Apps,Admin,Home,Qywx', // 项目分组
	'DEFAULT_GROUP' => 'Home', // 默认分组
	'APP_GROUP_MODE' => 1, // 分组模式 0-普通 1-独立
	'APP_FILE_CASE' => true, //是否检查文件的大小写，对Windows平台有效

	//URL配置
	'URL_MODEL' => 2, // 如果你的环境不支持PATHINFO 请设置为3
	'URL_HTML_SUFFIX' => 'html', // URL伪静态后缀设置
	'URL_CASE_INSENSITIVE' => false, // 默认false 表示URL区分大小写 true则表示不区分大小写
	'URL_SITE_SUB_DOMIN_ON' => true, //站点子域名伪静态

	/* 用户相关设置 */
	'USER_MAX_CACHE' => 1000, //最大缓存用户数
	'USER_ADMINISTRATOR' => 1, //管理员用户ID

	/* 模板相关配置 */
	'TMPL_PARSE_STRING' => array(
		'__UPLOAD_URL__' => 'http://qjwd.oss-cn-shenzhen.aliyuncs.com/',
		'__IMAGES_URL__' => __ROOT__ . '/images/',
	),

	//多语言配置
	'LANG_SWITCH_ON' => true, 'DEFAULT_LANG' => 'zh-cn', //默认语言
	//'LANG_AUTO_DETECT' => true,	//自动侦测语言
	//'LANG_LIST' => 'en-us,zh-cn,zh-tw',	//必须写可允许的语言列表

	//目录定义
	'WEB_SITE_PATH' => './website/', //用户站点目录
	'WX_SITE_PATH' => './wxsite/', //微信站点目录
	'APP_SITE_PATH' => './ezApp/', //微信站点目录
	'UPLOAD_PATH' => './uploads/', //上传目录
	
	//'UPLOAD_URL' => UPLOAD_PATH,
	//'UPLOAD_URL' =>  $_SERVER['SERVER_NAME']="www.diyapp.in"?"http://qjwd.oss-cn-shenzhen.aliyuncs.com/": '/uploads/',
	//'UPLOAD_URL' => $_SERVER['SERVER_NAME']="www.mismall.cn"?"http://qjwd.oss-cn-shenzhen.aliyuncs.com/": '/uploads/',
	//'UPLOAD_URL' => 'http://qjwd.oss-cn-shenzhen.aliyuncs.com/',
	'PUBLIC_URL' => __ROOT__ . '/public',
	'IMAGES_URL' => __ROOT__ . '/images',

	/* 支付设置 */
	'payment' => array(
		'alipay' => array(
			//到账类型 1:支付宝担保交易, 2:即时到账交易
			'type' => 1,
			// 收款账号邮箱
			'email' => '13641496507',
			// 加密key，开通支付宝账户后给予
			'key' => 'xhf75XqWrjngdbb6507d6kml0dnfa2j71c2',
			// 合作者ID，支付宝有该配置，开通易宝账户后给予
			'partner' => '2088502806718764'),
		'wxpay' => array(
			'app_id' => 'wx457341e4f5cead31', //微信公众号AppID(应用ID)
			'app_secret' => '7842a2j733137fdbz6d6c495XqW975c8', //AppSecret(应用密钥)
			'mch_id' => '1232414502', //受理商ID
			'key' => 'wKE5Zl0dn7mHyFujz67fdbW97Dd5tCpTv', //商户支付密钥Key
			'type' => 'NATIVE', //JSAPI 支付——H5 网页端调起支付接口
		),
	),
	/*分享配置*/
	'shareCode' =>7845,
);


//数据库配置
switch ($_SERVER['SERVER_NAME']) {
	case 'localhost':
	//本地数据库
	case '10.28.0.12':
	case '10.28.5.12':
	case '10.28.5.11':
	case '10.28.5.49':
	case '10.28.30.9':
	case '192.168.0.101':
	case '10.28.30.220':
	case '192.168.0.110':
	case '10.28.30.223':
	case '10.28.30.218':
	case '10.28.30.225':
	case '10.28.30.231':
	case '10.28.30.221':
	case '10.28.30.229':
	case '10.28.5.14':
	case '10.28.5.92':
	case '10.28.30.217':
	case '10.28.5.52':
	case '10.28.5.124':
	case '10.28.5.80':
		$db = array('DB_TYPE' => 'mysql', 	// 数据库类型
			'DB_HOST' => '10.28.5.11', 	// 数据库地址 119.29.6.190
			'DB_NAME' => 'ccplatform', 	// 默认数据库
			'DB_USER' => 'root', 	// 数据库用户名
			'DB_PWD' => '123', 	// 数据库密码
			'DB_PORT' => '3306', 	// 数据库端口
			'DB_CHARSET' => 'utf8', 	// 网站编码
			'DB_PREFIX' => 'cc_', 	// 数据表前缀
		);
		$uploadUrl = array(
			'UPLOAD_URL' =>'/uploads/'
		);
		break;


	default:
		//服务器数据库
		$db = array('DB_TYPE' => 'mysql', 	// 数据库类型
			'DB_HOST' => '192.168.1.102', 	// 数据库地址 119.29.6.190
			'DB_NAME' => 'ccplatform', 	// 默认数据库
			'DB_USER' => 'root', 	// 数据库用户名
			'DB_PWD' => '123',	// 数据库密码  n25Vnsy3FAuMreM4 nvSFfMzu9Be92n5Y
			'DB_PORT' => '3306', 	// 数据库端口
			'DB_CHARSET' => 'utf8', 	// 网站编码
			'DB_PREFIX' => 'cc_', 	// 数据表前缀
		);
		$uploadUrl = array(
			'UPLOAD_URL' =>'http://qjwd.oss-cn-shenzhen.aliyuncs.com/'
		);
		break;
}

return array_merge($config, $db, $uploadUrl);
?>
