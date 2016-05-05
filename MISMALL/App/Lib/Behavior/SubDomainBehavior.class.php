<?php
defined('THINK_PATH') or exit();
/**
 * 系统行为扩展：站点二级域名伪静态
 * @category   Think
 * @package  Think
 * @subpackage  Behavior
 * @author   cjli <developerlcj@gmail.com>
 */
class SubDomainBehavior extends Behavior {
    // 行为参数定义（默认值） 可在项目配置中覆盖
    protected $options   =  array(
        'URL_SITE_SUB_DOMIN_ON'         => false,   // 是否开启URL二级域名路由
        );

    // 行为扩展的执行入口必须是run
    public function run(&$return){
        // 是否开启站点二级域名路由使用
        if(!C('URL_SITE_SUB_DOMIN_ON')) return $return = false;
       
       //只有一个点
       //if(substr_count($_SERVER['HTTP_HOST'],'.') == 1) return $return = false;
       //子域名
        //$site_name  = strtolower(substr($_SERVER['HTTP_HOST'],0,strpos($_SERVER['HTTP_HOST'],'.')));
        
        $part =  pathinfo($_SERVER['PATH_INFO']);
        if(isset($_SERVER['CEE_VERSIONID'])){
            $part['dirname'] = $part['basename'];
        }
        $dir_name = trim($part['dirname'], DIRECTORY_SEPARATOR);
     	$site_name = strip_tags($dir_name ? $dir_name : $part['filename']);
     	
     	if($site_name && strrpos($site_name, '/') == 0){

            static $siteList;
            
            if($siteList[$site_name]){
            	$site = $siteList[$site_name];
            } else {
            	$site = M('UserSite')->field('userId,sitePath')->where( array('siteUrlPath' => $site_name) )->find();
            	if( ! $site) return $return = false;
            	$siteList[$site_name] = $site;
            }

            //开启路由
            C('URL_ROUTER_ON', true);
            //添加路由
            $site_sub_domain_router = array(
            	'/(\w+)/' =>	'Site/Index/index',//正则路由
            );
            $_GET['site_user_id'] = $site['userId'];
            $_GET['site_path'] = $site['sitePath'];
            //合并路由
            $old_url_router = C('URL_ROUTE_RULES');
            if(! is_array($old_url_router)) $old_url_router = array();
            C('URL_ROUTE_RULES', array_merge($old_url_router, $site_sub_domain_router));
        }
        return $return = true;
    }
}