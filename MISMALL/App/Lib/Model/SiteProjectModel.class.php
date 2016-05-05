<?php
/**
 * 网站与项目、应用关联
 *
 * @author cjli
 *
 */
class SiteProjectModel extends Model {

	/**
	 * 开发者使用现有网站创建项目
	 * @param 	int 	$from_site_id 源网站ID
	 * @param 	int 	$to_site_id 新网站ID
	 * @return	int
	 */
	public function copyAppToProject($from_site_id, $to_site_id) {
		$user_id = session('uid');

		//表单项目关联ID, 获取源站点对应项目ID
		$from_project_id = D('UserSite') -> getSiteInfo($from_site_id, 'userProjectId');
		
		if (!$from_project_id) {
			return -1;
		}

		//获取源项目信息
		$project_info = D('PlatForm') -> getAProjectDetails($from_project_id);
		if (!$project_info) {
			return -2;
		}

		//登记project
		$to_project_id = D('PlatForm') -> addAProjectInfo($user_id, $project_info['projectName'], $to_site_id);
		if (!$to_project_id) {
			return -3;
		}
		//创建结构
		$status = D('PlatForm') -> createProjectDB($to_project_id, $from_project_id);
		if (!$status) {
			return -4;
		} else {
			D('UserSite') -> editSite($to_site_id, array('userProjectId' => $to_project_id));
		}

		return 1;
	}

	/**
	 * 使用者(站长)购买网站时创建应用
	 * @param 	int 	$from_site_id 源网站ID
	 * @param 	int 	$to_site_id 新网站ID
	 * @return	int
	 */
	public function copyAppToApp($from_site_id, $to_site_id) {
		$user_id = session('uid');

		//表单项目关联ID, 获取源站点对应项目ID
		$from_project_id = D('UserSite') -> getSiteInfo($from_site_id, 'userProjectId');
		if (!$from_project_id) {
			return -1;
		}

		//获取源项目信息
		$project_info = D('PlatForm') -> getAProjectDetails($from_project_id);
		if (!$project_info) {
			return -2;
		}

		//登记project
		$to_project_id = D('PlatForm') -> addAProjectInfo($user_id, $project_info['projectName'], $to_site_id);
		if (!$to_project_id) {
			return -3;
		}

		//复制结构信息
		$status = D('PlatForm') -> createProjectDB($to_project_id, $from_project_id);
		if (!$status) {
			return -4;
		} else {
			D('UserSite') -> editSite($to_site_id, array('userProjectId' => $to_project_id));
		}

		return 1;
	}

	/**
	 * 开发者出售分享网站时创建项目
	 * @param 	int 	$from_site_id 源网站ID
	 * @param	int 	$to_site_id 新网站ID
	 * @return	int
	 */
	public function copyProjectToApp($from_site_id, $to_site_id) {
		$user_id = session('uid');
		
			//复制首页设置那些
		$index_set_db = M("index_set");
		$index_set = $index_set_db->where("siteId ='$from_site_id'")->find();
		if(!empty($index_set)){
			$index_set['siteId'] = $to_site_id;
			unset($index_set['id']);
			$re = $index_set_db->add($index_set);
			if(!$re){
				return -5;//复制首页设置出错
			}
		}
		
		//表单项目关联ID, 获取源站点对应项目ID
		$from_project_id = D('UserSite') -> getSiteInfo($from_site_id, 'userProjectId');
		if (!$from_project_id) {
			return -1;
		}
		
		//获取源项目信息
		$project_info = D('PlatForm') -> getAProjectDetails($from_project_id);
		if (!$project_info) {
			return -2;
		}
		
		//登记project
		$to_project_id = D('PlatForm') -> addAProjectInfo($user_id, $project_info['projectName'], $to_site_id);
		if (!$to_project_id) {
			return -3;
		}
		
		//复制结构信息
		$status = D('PlatForm') -> createProjectDB($to_project_id, $from_project_id);
		if (!$status) {
			return -4;
		} else {
			D('UserSite') -> editSite($to_site_id, array('userProjectId' => $to_project_id));
		}
		
	
		
		
		return 1;
	}

}
