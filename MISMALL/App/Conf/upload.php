<?php

//各种上传统一编辑
return array(
	// 图片上传相关配置
	'PICTURE_UPLOAD' => array(
		'maxSize' => 4 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('jpg', 'gif', 'png', 'jpeg', 'swf'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	// 文件上传相关配置
	'DOWNLOAD_UPLOAD' => array(
		'mimes' => '', //允许上传的文件MiMe类型
		'maxSize' => 5 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('jpg', 'gif', 'png', 'jpeg', 'zip', 'rar', 'tar', 'gz', '7z', 'doc', 'docx', 'txt', 'xml', 'mp3', 'wma'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//后台模板图片上传配置
	'TEMPLATE_IMAGE_UPLOAD' => array(
		'maxSize' => 4 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('jpg', 'gif', 'png', 'jpeg'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'subName' => 'Tpl_Image',
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//后台系统图片上传配置
	'SYSTEM_IMAGE_UPLOAD' => array(
		'maxSize' => 4 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('jpg', 'gif', 'png', 'jpeg'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'subName' => 'Bg_Image',
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//用户头像上传配置
	'AVATAR_UPLOAD' => array(
		'maxSize' => 2 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('jpg', 'gif', 'png', 'jpeg'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'subName' => 'Avatar',
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//文件上传配置
	'EZFORM_UPLOAD' => array(
		'maxSize' => 8000000, //上传的文件大小限制 (0-不做限制)
		'uploadReplace' => true, // 存在同名是否覆盖
		'exts' => array('jpg', 'gif', 'png', 'jpeg'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//编辑器上传配置
	'EDITOR_UPLOAD' => array(
		'mimes' => '', //允许上传的文件MiMe类型
		'maxSize' => 5 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('gif', 'jpg', 'jpeg', 'png', 'bmp', 'swf', 'flv', 'mp3', 'wav', 'wma', 'wmv', 'mid', 'avi', 'mpg', 'asf', 'rm', 'rmvb', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'htm', 'html', 'txt', 'zip', 'rar', 'gz', 'bz2'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//企业号上传配置
	'WECHAT_UPLOAD' => array(
		'mimes' => '', //允许上传的文件MiMe类型
		'maxSize' => 5 * 1024 * 1024, //上传的文件大小限制 (0-不做限制)
		'exts' => array('gif', 'jpg', 'jpeg', 'png', 'bmp', 'swf', 'flv', 'mp3', 'wav', 'wma', 'wmv', 'amr', 'mid', 'avi', 'mpg', 'asf', 'rm', 'rmvb', 'mpeg', 'mp4', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'htm', 'html', 'xml', 'txt', 'pdf', 'zip', 'rar', 'gz', 'bz2'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),
	//简历上传配置
	'RESUME_UPLOAD' => array(
		'mimes' => '', //允许上传的文件MiMe类型
		'exts' => array('gif', 'jpg', 'jpeg', 'png', 'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'htm', 'html', 'txt', 'zip', 'rar', 'gz', 'bz2'), //允许上传的文件后缀
		'autoSub' => true, //自动子目录保存文件
		'subName' => 'resume',
		'rootPath' => C('UPLOAD_PATH'), //保存路径
	),

	//上传文件驱动配置
	'FILE_UPLOAD_TYPE' => 'oss',
	'UPLOAD_TYPE_CONFIG' => array(
		'access_id' => 'xxxxxxxxx', //阿里云Access Key ID
		'access_key' => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', //阿里云Access Key Secret
		'bucket' => 'qjwd', //空间名称
		'endpoint' => 'oss-cn-shenzhen.aliyuncs.com', //OSS域名节点网地址
		'timeout' => 90, //超时时间
	),
);
