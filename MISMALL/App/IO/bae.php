<?php
//分布式环境IO操作实现函数，本文件只是示例代码，请根据自己环境的实际情况对以下函数进行修改。
if(!isset($_SERVER['HTTP_BAE_LOGID'])){
	define('IS_BAE',false);
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
define('IS_BAE',true);
$_SERVER['PHP_SELF']=$_SERVER['SCRIPT_NAME'];


/*Cache配置信息，可查询Cache详情页*/
require_once THINK_PATH.'Extend/Vendor/bae/configure.php';
require_once THINK_PATH.'Extend/Vendor/bae/sdk/BaeMemcache.class.php';
require_once THINK_PATH.'Extend/Vendor/bae/sdk/bcs/bcs.class.php';
require_once THINK_PATH.'Extend/Vendor/bae/sdk/BaeLog.class.php';


/***Cache配置信息***/
$cacheid = ServiceConf::$cache_cfg['cacheid'];
$host = ServiceConf::$cache_cfg['host'];
$port = ServiceConf::$cache_cfg['port'];
$user = ServiceConf::$aksk['ak'];
$pwd = ServiceConf::$aksk['sk'];
$global_mc = new BaeMemcache($cacheid,$host. ': '. $port, $user, $pwd);

//编译缓存文件创建方法
function runtime_set($filename,$content){
	global $global_mc;
	$ret=$global_mc->set($filename,$content,0,0);
	if(2==$global_mc->errno()){
		header('Content-Type:text/html;charset=utf-8');
		exit('您没有初始化Cache服务，请在BAE的管理平台初始化Cache服务');
	}
	return $ret;
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
//F缓存设置，强烈建议修改为可持久性的存储方式，如redis
function F_set($name,$value){
	global $global_mc;
	return $global_mc->set($name,$value,MEMCACHE_COMPRESSED,0);
}
//F缓存获取方法，强烈建议修改为可持久性的存储方式，如redis
function F_get($name){
	global $global_mc;
	return $global_mc->get($name);
}
//F缓存的删除方法，强烈建议修改为可持久性的存储方式，如redis
function F_delete($name){
	global $global_mc;
	return $global_mc->delete($name);
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

//静态缓存,强烈建议修改为可持久性的存储方式
function html_set($filename,$content){
	global $global_mc;
	return $global_mc->set($filename,$content,MEMCACHE_COMPRESSED,0);
}
function html_get($filename){
   global $global_mc;
   return $global_mc->get($filename);
}
//日志批量保存
function log_save($logs,$request_info){
	log_write('##########'.$request_info);
	foreach($logs as $log){
		log_write($log);	
	}	
}
//写入单条日志
function log_write($log){
	$user = ServiceConf::$aksk['ak'];
	$pwd = ServiceConf::$aksk['sk'];
	$level = ServiceConf::$log_cfg['level'];
	$logger = BaeLog::getInstance(array('user'=>$user, 'passwd'=> $pwd));
	$logger->setLogLevel($level);
	$logger->Debug($log);
}

//文件上传,这只是示例代码，暂时以单机写入的方式举例，请根据自己的实际环境修改代码
function file_upload($src_file, $dest_file){
	if(!IS_BAE){
		$pdir=dirname($dest_file);
		if(!is_dir($pdir)) @mkdir($pdir,0777);
		return copy($src_file, $dest_file);
	}
	list($bucket, $save_path) = get_base_dir($dest_file);
	try{
		$bcs = new BaiduBCS();
		$response = $bcs->create_object($bucket, $save_path, $src_file, array('acl'=>BaiduBCS::BCS_SDK_ACL_TYPE_PUBLIC_READ));
		return $response->status == 200 ? true : false;
	}catch(Exception $e){
		return false;
	}
}
//删除上传的文件
function file_delete($filename){
	if(!IS_BAE) return unlink($filename);
	list($bucket, $filepath) = get_base_dir($filename);
	try{
		$bcs = new BaiduBCS();
		$response = $bcs->delete_object($bucket, $filepath);
		return $response->status == 200 ? true : false;
	}catch(Exception $e){
		return false;
	}
}
//获得文件内容
function file_get($filename){
	if(IS_BAE){
		list($bucket, $filepath) = get_base_dir($filename);
		try{
			$bcs = new BaiduBCS();
			$tmp_name = sys_get_temp_dir().'/'.uniqid();
			$response = $bcs->get_object($bucket, $filepath, array('fileWriteTo'=>$tmp_name));
			if($response->status == 200){
				$content = file_get_contents($tmp_name);
				unlink($tmp_name);
				return $content;
			}
			return false;
		}catch(Exception $e){
			return false;
		}
	}else{
		return file_get_contents($filename);
	}
}
//获得文件的根地址
function file_domain($bucket){
	if(!IS_BAE) return '';
	return 'http://' . ServiceConf::$bcs_cfg['host'] . '/' . strtolower($bucket);
}

/**
 * 复制目录
 * @param $source 源目录
 * @param $destination 目标目录
 */
function file_dir_copy($source, $destination){
	if(! IS_BAE){return ;}
	$status = false;
	//source
	list($source_bucket, $source_dir) = get_base_dir($source);
	//dest
	list($dest_bucket, $dest_dir) = get_base_dir($destination);
	
	$bcs = new BaiduBCS();
	$response = $bcs->list_object_by_dir($source_bucket, $source_dir.'/');
    if(200 === $response->status){
    	$result_body = json_decode($response->body);
    	foreach($result_body->object_list as $file) {
    		if($file->is_dir){
    			file_dir_copy(rtrim($source, '/').$file->object, rtrim($destination, '/').$file->object);
    		} else {
	        	$filename = str_replace($file->parent_dir, $dest_dir.'/', $file->object);
	        	$copy_form = array(
	        		'bucket' => $source_bucket,
	        		'object' => $file->object,
	        		);
	        	$copy_to = array(
	        		'bucket' => $dest_bucket,
	        		'object' => $filename,
	        		);
	        	$copy_response = $bcs->copy_object($copy_form, $copy_to, array('acl'=>BaiduBCS::BCS_SDK_ACL_TYPE_PUBLIC_READ_WRITE));
	    		$status = $copy_response->status == 200 ? true : false;
	    		if( ! $status ) break;
    		}
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
	if(! IS_BAE){return ;}
	$status = false;
	$bcs = new BaiduBCS();
	list($bucket, $dir) = get_base_dir($directory);
	
	 $response = $bcs->list_object_by_dir($bucket, $dir.'/');
	 if(200 === $response->status){
    	$result_body = json_decode($response->body);
    	foreach($result_body->object_list as $file) {
			//删除指定的文件
	        $delResponse = $bcs->delete_object($bucket, $file->object);
	        $status = $delResponse->status == 200 ? true : false;
		}
	 }
	return $status;
}

/**
 * 判断文件是否存在
 * 
 */
function file_exist($filename){
	if(IS_BAE){
		$bcs = new BaiduBCS();
		list($bucket, $filePath) = get_base_dir($filename);
		$response = $bcs->is_object_exist($bucket, $filePath);
		return $response ? true : false;
	}else{
		return file_exists($filename);
	}
}

/**
 * 获取文件URL
 */
function get_file_url($filename){
	list($bucket, $filepath) = get_base_dir($filename);
	return file_domain($bucket) . $filepath;
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
	$arr = explode('/', ltrim($source,'./'));
	$bucket = C('BUCKET_PREFIX') . strtolower(array_shift($arr));
	$filePath = implode('/', $arr);
	return array($bucket, '/' . $filePath);
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
	if(IS_BAE){
		$bcs = new BaiduBCS();
		list($bucket, $filePath) = get_base_dir($filename);
		$response = $bcs->create_object_by_content($bucket, $filePath, $content,array('acl'=>BaiduBCS::BCS_SDK_ACL_TYPE_PUBLIC_READ_WRITE));
		return $response->status == 200 ? true : false;
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