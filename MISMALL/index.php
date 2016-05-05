<?php
//定义项目名称和路径
define('APP_NAME', 'App');
define('APP_PATH', './App/');
define('APP_DEBUG', true);

define('ROOT_PATH', dirname(__FILE__)); //根目录

/**
 * 目录分隔符
 */
define('DS', DIRECTORY_SEPARATOR);

//定义云引擎
define('ENGINE_NAME', 'cluster');

//$_SERVER['HTTP_HOST'] = 'www.diyapp.in';

/**
 * 定义常量域名
 */
define('SERVER_NAME', $_SERVER['HTTP_HOST']);
//域名
define('DOMAIN_NAME', 'http://' . SERVER_NAME);

// 加载框架入口文件
require "./ThinkPHP3.1.3/ThinkPHP.php";