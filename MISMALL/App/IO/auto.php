<?php
//腾讯云TAE
if (defined('TAE') && TAE) {
    define('IS_CLOUD', true);
    define('IS_SAE', false);
    define('IS_BAE', false);
    require dirname(__FILE__) . '/tae.php';
    define('IO_TRUE_NAME', 'tae');
}
//新浪SAE
elseif(function_exists('saeAutoLoader')){
	define('IS_CLOUD',true);
	define('IS_BAE',false);
	define('IS_TAE', false);
	require dirname(__FILE__).'/sae.php';
	define('IO_TRUE_NAME','sae');
}
//百度云BAE
elseif(isset($_SERVER['HTTP_BAE_LOGID'])){
	define('IS_CLOUD',true);
	define('IS_SAE',false);
	define('IS_TAE', false);
	require dirname(__FILE__).'/bae.php';
	define('IO_TRUE_NAME','bae');
}
else //本地环境
{
	define('IS_SAE',false);
	define('IS_BAE',false);
	define('IS_TAE', false);
	define('IS_CLOUD',false);
	$runtime = defined('MODE_NAME')?'~'.strtolower(MODE_NAME).'_runtime.php':'~runtime.php';
	defined('RUNTIME_FILE') or define('RUNTIME_FILE',RUNTIME_PATH.$runtime);
	//加载 local 文件
	require dirname(__FILE__).'/local.php';
    
	if(!APP_DEBUG && is_file(RUNTIME_FILE)) {
	    // 部署模式直接载入运行缓存
	    require RUNTIME_FILE;
	}else{
	    // 加载运行时文件
	    require THINK_PATH.'Common/runtime.php';
	}
	exit();
}
