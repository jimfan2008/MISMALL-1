<?php
return array(
	//SAE下固定mysql配置
	'DB_TYPE' => 'mysql', // 数据库类型
	'DB_DEPLOY_TYPE' => 1,
	'DB_RW_SEPARATE' => true,
	'DB_HOST' => SAE_MYSQL_HOST_M . ',' . SAE_MYSQL_HOST_S, // 服务器地址
	'DB_NAME' => SAE_MYSQL_DB, // 数据库名
	'DB_USER' => SAE_MYSQL_USER, // 用户名
	'DB_PWD' => SAE_MYSQL_PASS, // 密码
	'DB_PORT' => SAE_MYSQL_PORT, // 端口

	'UPLOAD_URL' => file_domain('uploads'),
	//'PUBLIC_URL'	=>	file_domain('public'),
	'IMAGES_URL' => file_domain('images'),

	/* 模板相关配置 */
	'TMPL_PARSE_STRING' => array(
		'__UPLOAD_URL__' => file_domain('uploads') . '/',
		//'__PUBLIC__'		=> file_domain('public'),
		// '/public/'		=> file_domain('public') . '/',
		'/uploads/' => file_domain('uploads') . '/',
		'__IMAGES_URL__' => file_domain('images') . '/',
	),
);