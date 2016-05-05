<?php
/**
 * 文件存放目录
 * @param $domain 文件夹名称
 */
function file_domain($domain=''){
	return __ROOT__.'/'.$domain;
}
    
/**
 * 本地上传文件的IO操作
 * 
 * @param $src_file 源文件
 * @param $dest_file 目标文件
 */
function file_upload($src_file,$dest_file){
	$pdir=dirname($dest_file);
	if(!is_dir($pdir)) @mkdirs($pdir,0777);
	return copy($src_file,$dest_file);
}

/**
 * 删除文件
 * @param $filename 文件路径名称
 */
function file_delete($filename){
	return unlink($filename);
}

/**
 * 获取文件内容
 * @param $filename
 */
function file_get($filename){
	return file_get_contents($filename);
}

/**
 * 创建多级目录
 * @param $dir
 * @param $mode
 */
function mkdirs($dir, $mode = 0777){
	if (is_dir($dir) || @mkdir($dir, $mode)) return TRUE;
	if (!mkdirs(dirname($dir), $mode)) return FALSE;
	return @mkdir($dir, $mode);
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
 * 判断文件是否存在
 * 
 */
function file_exist($filename){
	return file_exists($filename);
}

/**
 * 获取文件目录
 * @param $domain
 */
function file_path($domain = ''){
	return ROOT_PATH . DS . $domain;
}

/**
 * 创建文件
 */
function file_create($filename){
	$fp=fopen("$filename", "w+"); //打开文件指针，创建文件
	if ( !is_writable($filename) ){
		die("文件:" .$filename. "不可写，请检查！");
	}
	fclose($fp);  //关闭指针
}

/**
 * 文件内容写入
 */
function file_write($filename, $content){
	//$name = time().random(5);
	//$filename = 'http://qjwd.oss-cn-shenzhen.aliyuncs.com/2015-08-31/'.$name.".png";
	$pdir=dirname($filename);
	if(!is_dir($pdir)) @mkdirs($pdir,0777);
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
	list($dir, $filepath) = get_base_dir($filename);
	return file_path($dir) . DS . $filepath;
}
/**
 * 复制目录
 */
function file_dir_copy($source, $destination){
	if (is_dir($source) == false)
	{
		//exit("The Source Directory Is Not Exist!");
		return false;
	}

	if (is_dir($destination) == false)
	{
		@mkdirs($destination);
	}
	$handle = opendir($source);
	while (false !== ($file = readdir($handle)))
	{
		if ($file != "." && $file != ".." && $file != '.svn')
		{
			$status = is_dir("$source/$file")?
			file_dir_copy("$source/$file", "$destination/$file"):
			copy("$source/$file", "$destination/$file");
			if(false == $status){
				return false;
			}
		}
	}
	closedir($handle);
	return true;
}

/**
 * 删除目录
 * @param $directory 目录
 */
function file_dir_del($directory)
{
	if (is_dir($directory) == false)
	{
		exit("The Directory Is Not Exist!");
	}
	$handle = opendir($directory);
	while (($file = readdir($handle)) !== false)
	{
		if ($file != "." && $file != "..")
		{
			is_dir("$directory/$file") ? file_dir_del("$directory/$file") : unlink("$directory/$file");
		}
	}
	if (readdir($handle) == false)
	{
		closedir($handle);
		rmdir($directory);
	}
}
	