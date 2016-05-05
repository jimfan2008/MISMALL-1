<?php
// BAE下固定mysql配置
return array(
	'BUCKET_PREFIX' => 'think-',
	'DB_TYPE' => 'mysql', // 数据库类型
	'DB_HOST' => ServiceConf::$mysql_cfg['host'], // 服务器地址
	'DB_NAME' => ServiceConf::$mysql_cfg['dbname'], // 数据库名,填写你创建的数据库
	'DB_USER' => ServiceConf::$aksk['ak'], // 用户名
	'DB_PWD' => ServiceConf::$aksk['sk'], // 密码
	'DB_PORT' => ServiceConf::$mysql_cfg['port'], // 端口

	'UPLOAD_PATH' => './upload/', // 上传目录

	'UPLOAD_URL' => file_domain('think-upload'),
	'IMAGES_URL' => file_domain('think-images'),

	/* 模板相关配置 */
	'TMPL_PARSE_STRING' => array(
		'__UPLOAD_URL__' => file_domain('think-upload') . '/',
		'/uploads/' => file_domain('think-upload') . '/',
		'__IMAGES_URL__' => file_domain('think-images') . '/',
	),
);
