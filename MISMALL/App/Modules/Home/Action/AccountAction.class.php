<?php
/**
 * 会员中心管理
 * @author 皮振华
 * 创建时间：2013-10-15
 * 作废
 */
class AccountAction extends HomeAction 
{
 	/**
 	 * 初始化会员中心
 	 */
	public function _initialize()
 	{
 		parent::_initialize();
 		
 		//获取用户信息
 		if( ! session('uid')) {
 			$this->redirect("Index/index");
 		}
 	}
 	
 	/**
 	 * 会员中心首页
 	 */
    public function userCenter()
    {
    	$user_id = session('uid');
    	//获取用户站点列表
        $siteList = D('UserSite')->getUserSiteList($user_id);
        $this->assign('siteList', $siteList);
        
        $templateList = D('Template')->getTemplateList(array(),1,6);
        $this->assign('templateList', $templateList);
        
        $this->display();
    }
    
    /**
	 *获取用户创建过的站点 
	 */
    public function getUserSiteList()
    {
		//获取用户站点列表
        $userSiteModel = D('UserSite');
        $siteList = $userSiteModel->getUserSiteList(session('uid'));

        if($siteList){
           echo json_encode_cn($siteList); 
        }else{
           echo 0;
        }           
    }
    
     /**
	  * 删除用户创建过的站点
	  */
    public function deleteUserSiteInfo()
    {
    	$flag = 0;	//1成功 0出错
    	
        $user_id = session('uid');
        $site_id = isset($_POST["siteId"]) ? intval($_POST["siteId"]) : 0;

        if($user_id && $site_id) {
        	//删除用户站点
			$userSiteModel = D("UserSite");
            $flag = $userSiteModel->deleteSite($site_id);
        }
       	echo $flag;exit;
    }
    
    /**
     * 编辑会员站点信息
     */
    public function editUserSite()
    {
    	$site_id = intval($_GET['id']);
    	$field = isset($_GET['name']) ? trim($_GET['name']) : '';
    	$field_value = isset($_GET['value']) ? trim($_GET['value']) : '';    	
    	$fieldArray = array('sitePath','domain');
    	
    	$result = array(
    		'error' => 1,
    		'info' => ''
    	);
    	
    	if($site_id==0 || empty($field) || empty($field_value) || !in_array($field, $fieldArray)) {
    		$result['info'] = '参数错误';
    	} else {
    		
    		if($field == 'sitePath'){
    			$field = 'siteDisplayName';
    		} else{
    			import('ORG.Util.Validate');
    			if(! Validate::check($field_value, 'url')) {
    				$result['info'] = '域名格式不正确';
    				echo json_encode($result);exit;
    			}
    		}
    		
    		$site_model = D('UserSite');
    		$siteInfo = $site_model->getSiteInfo($site_id);
    		if(!$siteInfo) {
    			$result['info'] = '站点不存在';
    		} else {
    			
    			if($siteInfo[$field] != $field_value){
    				$set = array(
    					$field => $field_value,
    				);
    				$status = $site_model->editSite($site_id, $set);
    				if(! $status) {
    					$result['info'] = '修改失败';
    				} else{
    					$result['error'] = 0;
    					$result['info'] = '修改成功';
    				}
    			} else {
    				$result['error'] = 0;
    				$result['info'] = '修改成功';
    			}
    		}
    	}

    	echo json_encode($result);
    }
   
}