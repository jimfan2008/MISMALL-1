<?php
//SAE环境的IO文件
if(!function_exists('saeAutoLoader')){
	//如果是普通环境，加载普通核心文件
	define('IS_SAE',false);
	$runtime = defined('MODE_NAME')?'~'.strtolower(MODE_NAME).'_runtime.php':'~runtime.php';
	defined('RUNTIME_FILE') or define('RUNTIME_FILE',RUNTIME_PATH.$runtime);
	if(!APP_DEBUG && is_file(RUNTIME_FILE)) {
	    // 部署模式直接载入运行缓存
	    require RUNTIME_FILE;
	}else{
	    // 加载运行时文件
	    require THINK_PATH.'Common/runtime.php';
	}	
	exit();
}
define('IS_SAE',true);
$global_mc=@memcache_init();
if(!$global_mc){
	header('Content-Type:text/html;charset=utf-8');
	exit('您未开通Memcache服务，请在SAE管理平台初始化Memcache服务');
}
//编译缓存文件创建方法
function runtime_set($filename,$content){
	global $global_mc;
	return $global_mc->set($filename,$content,MEMCACHE_COMPRESSED,0);
}
//编译缓存文件设置方法
function runtime_get($filename){
	global $global_mc;
	return $global_mc->get($filename);
}
//编译缓存文件删除方法
function runtime_delete($filename){
	global $global_mc;
	return $global_mc->delete($filename);
}
function getSaeKvInstance(){
	static $kv;
	if(!is_object($kv)){
		$kv=new SaeKV();
		if(!$kv->init()) halt('您没有初始化KVDB，请在SAE管理平台初始化KVDB服务');
	}
	return $kv;
}
//F缓存设置
function F_set($name,$value){
	$kv=getSaeKvInstance();
	return $kv->set($name,$value);
}
//F缓存获取方法
function F_get($name){
	$kv=getSaeKvInstance();
	return $kv->get($name);
}
//F缓存的删除方法
function F_delete($name){
	$kv=getSaeKvInstance();
    if(false!==strpos($name,'*')){//实现批量删除
		$keys=$kv->pkrget(rtrim($name,'*'),100);
		if(is_array($keys)){
			foreach($keys as $key=>$value){
				$kv->delete($key);
			}
		}
		return true;
	}
	return $kv->delete($name);
}
//S缓存的设置方法， 注：只有当DATA_CACHE_TYPE配置为File时下面的函数才会被触发，如果DATA_CACHE_TYPE如果不为File则触发你指定类型的缓存驱动。
function S_set($name,$value,$expire){
	global $global_mc;
	return $global_mc->set($name,$value,MEMCACHE_COMPRESSED,$expire);
}
function S_get($name){
	global $global_mc;
	return $global_mc->get($name);
}
function S_delete($name){
	global $global_mc;
	return $global_mc->delete($name);
}
function S_clear(){
	global $global_mc;
	return $global_mc->flush();
}
//文件上传,路径中第一个文件夹名称会作为storage的domain。
function file_upload($src_file,$dest_file){
  if(!IS_SAE){//兼容普通环境
	 $pdir=dirname($dest_file);
  	 if(!is_dir($pdir)) @mkdir($pdir,0777);
	 return copy($src_file,$dest_file);
  }
  $s=new SaeStorage();
  list($domain, $save_path) = get_base_dir($dest_file);
  return $s->upload($domain,$save_path,$src_file);
}
//删除文件
function file_delete($filename){
    if (IS_SAE) {
        list($domain, $filePath) = get_base_dir($filename);
        $s = new SaeStorage();
		return $s->delete($domain, $filePath);
    } else {
        return unlink($filename);
    }
}
//获得文件内容
function file_get($filename){
	if(IS_SAE){
        list($domain, $filePath) = get_base_dir($filename);
		$s=new SaeStorage();
		return $s->read($domain,$filePath);
	}else{
		return file_get_contents($filename);
	}
}
//一般在IO专用配置中使用
function file_domain($domain=''){
	if(!IS_SAE) return '';
	$s = new SaeStorage();
	return rtrim( $s->getUrl($domain,''), '/');
}


//静态缓存,使用KVDB实现
function html_set($filename,$content){
	$kv=getSaeKvInstance();
	return $kv->set($filename,$content);
}
function html_get($filename){
   $kv=getSaeKvInstance();
   return $kv->get($filename);
}
//日志批量保存, 记录到SAE日志中心
function log_save($logs,$request_info){
	log_write('#############'.$request_info);
	foreach($logs as $log){
		log_write($log);
	}
}
//写入单条日志
function log_write($log){
	static $is_debug=null;
	if(is_null($is_debug)){
		preg_replace('@(\w+)\=([^;]*)@e', '$appSettings[\'\\1\']="\\2";', $_SERVER['HTTP_APPCOOKIE']);
		$is_debug = in_array($_SERVER['HTTP_APPVERSION'], explode(',', $appSettings['debug'])) ? true : false;
	}
	if($is_debug)
		sae_set_display_errors(false);//记录日志不将日志打印出来
	sae_debug($log);
	if($is_debug)
		sae_set_display_errors(true);
}

/**
 * 复制目录
 * @param $source 源目录
 * @param $destination 目标目录
 */
function file_dir_copy($source, $destination){
	if(! IS_SAE){return ;}
	$status = false;
	//source
	list($source_domain, $source_filePath) = get_base_dir($source);
	//dest
	list($dest_domain, $dest_filePath) = get_base_dir($destination);
	
	$stor=new SaeStorage();
	$fileList = $stor->getListByPath($source_domain, rtrim($source_filePath,'/'));
    if($fileList['files']){
    	foreach($fileList['files'] as $file) {
        	//读取指定的文件
        	$file_content = $stor->read($source_domain, $file['fullName']);
            //写入指定的文件
            $status = $stor->write($dest_domain, $dest_filePath.'/'.$file['Name'], $file_content);
        }
    }
    
    return (boolean)$status;
}

/**
 * 删除目录
 * @param $directory 目录
 */
function file_dir_del($directory)
{
	if(! IS_SAE){return ;}
	$status = false;
	
	$stor=new SaeStorage();
	list($source_domain, $source_filePath) = get_base_dir($directory);
	
	 $fileList = $stor->getListByPath($source_domain, $source_filePath);
	 if($fileList['files']){
		foreach($fileList['files'] as $file) {
			//删除指定的文件
	        $status = $stor->delete($source_domain, $file['fullName']);
		}
	 }
	return $status;
}

/**
 * 判断文件是否存在
 * 
 */
function file_exist($filename){
	if(IS_SAE){
		list($domain, $filePath) = get_base_dir($filename);
		$stor = new SaeStorage();
		return $stor->fileExists($domain,$filePath);
	}else{
		return file_exists($filename);
	}
}

/**
 * 获取文件URL
 */
function get_file_url($filename){
	list($dir, $filepath) = get_base_dir($filename);
    return file_domain($dir) . '/' . $filepath;
}

/**
 * 获取文件地址
 */
function get_file_path($filename){
	return get_file_url($filename);
}

/**
 * 获取顶级目录
 */
function get_base_dir($source){
	$arr = explode('/', ltrim($source, './'));
    $domain = array_shift($arr);
	$filePath = implode('/', $arr);
	return array($domain, $filePath);
}

/**
 * 创建文件
 */
function file_create($filename){
	return true;
}
/**
 * 文件内容写入
 */
function file_write($filename, $content){
	if(IS_SAE){
		list($domain, $filePath) = get_base_dir($filename);
		$stor = new SaeStorage();
		return (boolean)$stor->write($domain, $filePath, $content);
	}else{
        if(file_exists($filename)) {
			return file_put_contents($filename, $content);
		} 
		else //文件不存在
		{
	        if(fopen($filename, "a")) {
	        	return file_put_contents($filename, $content);
	        }
		}
	}
}