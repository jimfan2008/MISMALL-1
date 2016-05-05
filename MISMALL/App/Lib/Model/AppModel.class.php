<?php
/**
 * 自定义应用模型，封装对应用的数据操作
 * @author 胡志强
 */

class AppModel extends CommonModel {

	/**
	 * 获取用户部署的所有应用列表
	 * @param	int		$user_id	当前用户ID
	 * @param	int		$site_id 网站ID
	 * @return	array	$app_list 用户所有应用的ID，名称数据，二维数组
	 */
	public function getUserAllAppList($user_id, $site_id=0) {
		if (!$user_id)
			return 0;

		$apps_list = $this -> table("cc_user_app U") -> join("cc_apps P on U.appID=P.ID") 
		-> join("cc_project_release as R on R.ID=P.fromProject") -> join("cc_project_images as I on I.ID=R.projectImage") 
		-> where("U.userID=".$user_id." AND U.userSiteId =".$site_id) -> field('U.appID, P.appName, I.imgPath, P.appVersion, P.appSource, P.imgUrl') 
		-> order('appID') -> select();
		
		return $apps_list ? $apps_list : array();
	}

	/**
	 * 获取用户选中的应用信息
	 * @param	int		$pro_id	当前项目ID
	 * @param	string	$type	查看前端的时候带入项目预览参数
	 * @return	array	$选中应用的数据信息，一维数组
	 */
	public function getUserSelectedApp($pro_id, $type = '') {
		if (!$pro_id)
			return 0;
		
		//判断是正常使用或是项目预览
		if ($type === 'view_project') {
			$app_info = M('projects') -> where("ID=$pro_id") -> field('ID, projectName as appName, createUser') -> find();

		} else if ($type === 'try_project') {
			$app_info = M('try_projects') -> where("pubID=$pro_id") -> field('ID, projectName as appName') -> find();		
		} else {
			$app_info = M('apps') -> where("ID=$pro_id") -> field('ID, appName, createUser') -> find();
		}

		return $app_info ? $app_info : array();
	}

	/**
	 * 获取选中应用的结构信息
	 * @param	int		$pro_id	当前项目ID
	 * @param	string	$type 查看前端的时候带入项目预览参数
	 * @return	array 	应用的完整结构信息
	 */
	public function getAppStructure($pro_id, $type = 'view_project') {
		if (!$pro_id)
			return 0;

		$app_info = $this -> getUserSelectedApp($pro_id, $type);	// 获取当前操作应用信息

		//判断是正常使用或是项目预览
		if($type == 'view_project'){
			$proType = 0;
		} elseif($type == 'site_app') {
			$proType = 2;
		} elseif($type == 'try_project') {
			$proType = 3;
		}
		
		$app_struct = array();		// 定义应用下列表结构
		$mdl_list = M('modules') -> where("proID=" . $app_info['ID'] . " and proType=".$proType) -> field('moduleID, moduleName') -> order('ID') -> select();

		$i = 0;
		foreach ($mdl_list as $value) {
			$app_struct[$i]['moduleID'] = $value['moduleID'];
			$app_struct[$i]['moduleName'] = $value['moduleName'];
			$flow_lists =  M('workflow') -> where("moduleID='" . $value['moduleID'] . "'") -> field('flowID, flowName') -> order('ID') -> select();
			
			$flow_list = array();
			foreach ($flow_lists as $value1) {
				$tnum = M('table_directory') -> where("flowID='" . $value1['flowID'] . "'") -> getField('count(ID) as num');
				$view_opt = 1;
				/*if ($type == 'site_app') {
					$view_opt = 0;
					$viewopt_lists = M('team_form_user_permission') -> where("flowID='" . $value1['flowID'] . "'") -> getField('viewOpt', true);
					foreach ($viewopt_lists as $value2) {
						$view_opt += $value2;
					}
					unset($value2, $viewopt_lists);				
				}*/				
				if ($tnum && $view_opt) {
					array_push($flow_list, $value1);
				}
			}
			unset($value1, $flow_lists);
			
			$app_struct[$i]['child'] = $flow_list;
			++$i;
		}
		unset($value);

		$appInfo['appName'] = $app_info['appName'];
		$appInfo['child'] = $app_struct;

		return $appInfo ? $appInfo : array();
	}

	/**
	 * 获取选中流程下的表单信息
	 * @param	string	$flow_id 流程ID
	 * @param	string	$type	查看前端的时候带入项目预览参数
	 * @return  array 	返回表单列表信息，一维数组
	 */
	public function getFormListByFlow($flow_id, $type = 'view_project') {	
		if ($flow_id == '')
			return 0;
		
		$user_id = session('uid');		
		$frm_list = M('form_info') -> where("flowID='$flow_id'") -> field('ID, formID, formTitle') -> order('ID') -> select();
		//判断是正常使用或是项目预览
		//TODO prower error
		/*if ($type == 'site_app') {
			$view_list = M('team_form_user_permission') -> where("userID=$user_id and flowID='$flow_id' and viewOpt=1") -> getField('formID', true);
			$frm_num = count($frm_list);
			for ($i=0; $i<$frm_num; $i++) {
				if( !in_array($frm_list[$i]['ID'], $view_list) && !session('is_admin')) {
					unset($frm_list[$i]);
				}
			}
		}*/
		
		return $frm_list ? array_values($frm_list) : array();
	}
	
	/**
	 * 登记用户与部署项目的对应关系
	 * @param	int		$user_id 当前部署的用户ID
	 * @param	int		$pub_id 待部署项目的发布ID
	 * @param	string	$app_name 项目部署之后的名称
	 * @param	int		$site_id 网站ID
	 * @return	返回当前部署应用的应用ID
	 */
	public function addAUserAppInfo($user_id, $pub_id, $app_name, $site_id = 0) {
		if ($user_id == 0 || $pub_id == 0)
			return 0;

		$pro_info = M('project_release') -> where("ID=$pub_id") -> field('projectID, projectName, releaseUser, appVersion,accessToken') -> find();
		$data['appName'] = $app_name;
		$data['appSource'] = $pub_id;
		$data['appDeployTime'] = time();
		$data['appVersion'] = $pro_info ? $pro_info['appVersion'] : 1;
		$data['accessToken']  = unquire_rand(32);
		$app_id = M('apps') -> data($data) -> add();
		unset($data);

		$data['userID'] = $user_id;
		$data['appID'] = $app_id;
		$data['isActivated'] = 1;
		$data['userSiteId'] = intval($site_id);
		M('user_app') -> data($data) -> add();
		unset($data);

		return $app_id;
	}
	
	/**
	 * 复制项目结构信息
	 * @param	int		$app_id 部署后应用ID
	 * @param	int		$pub_id 待部署项目发布ID
	 * @return	boolen	返回结构复制成功标识
	 */
	public function addAppData($app_id, $pub_id) {
		if ($app_id == 0 || $pub_id == 0)
			return 0;
		
		$res = D('Project') -> addAProjectData($app_id, $pub_id, 'deploy');
		
		return $res;
	}
	
	/**
	 * 部署用户应用
	 * @param	int		$user_id 当前部署应用的用户ID
	 * @param	int		$pub_id 部署应用的源发布ID
	 * @param	string	$app_name 部署应用的应用名称
	 * @return	boolen	返回应用部署成功标识
	 */
	public function deployAUserApp($user_id, $pub_id, $app_name) {
		$app_id = $this -> addAUserAppInfo($user_id, $pub_id, $app_name);
		if ($app_id) {
			return $this -> addAppData($app_id, $pub_id);
		} else {
			return 0;
		}
	}
	
	/**
	 * 添加部署应用访问二级域名地址
	 * @param	int		$app_id 部署的应用ID
	 * @param	string	$app_url_name 应用访问的二级域名地址
	 * @return	boolen	返回地址添加成功与否标识
	 */
	public function deployAppUrl($app_id, $app_url_name) {
		if ($app_id == 0)
			return 0;
		$res = M('apps') -> where("ID=$app_id") -> setField('appUrl', $app_url_name);

		return $res ? 1 : 0;
	}
	
	/**
	 * 获取应用的详细登记信息
	 * @param	int		$id 应用ID
	 * @return	array 
	 */
	public function getAAppInfo($id) {
		if ($id == 0)
			return 0;
		
		$app_info = M('apps') -> where("ID=$id") -> field("ID, appName, appUrl, createUser, icoPath, accessToken") -> find();
		
		return $app_info ? $app_info : array();
	}
	
	/**
	 * 删除指定已部署应用
	 * @param	int		$app_id 已部署应用ID
	 * @return boolean
	 */
	public function delAUserApp($app_id) {
		if ($app_id == 0)
			return 0;
		
		$mdl_list = M('modules') -> where("proID=$app_id and proType=2") -> field('moduleID') -> order('ID') -> select();
		foreach ($mdl_list as $value) {
			D('Project') -> delAProjectStructure('module', $value['moduleID']);
		}
		unset($value, $mdl_list);
		
		// 删除用户与应用对应关系
		M('user_app') -> where("appID=$app_id") -> delete();
		// 删除应用登记信息
		M('apps') -> where("ID=$app_id") -> delete();
		
		return 1;
	}
	
}
?>