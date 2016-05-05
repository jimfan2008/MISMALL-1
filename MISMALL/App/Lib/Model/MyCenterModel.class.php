<?php

/**
 * 个人中心基本模型，处理个人中心模块数据
 * time : 20140212
 */
class MyCenterModel extends CommonModel 
{
	/**
	 * 获取我发布的项目的总数
	 * @param	int		$user_id 当前用户ID
	 * @return	int		返回当前用户发布的项目总数
	 */
	public function getUserProjectsReleaseNum($user_id) {
		if ($user_id == 0)
			return 0;

		$pro_release_num = M('project_release') -> where("releaseUser=$user_id") -> getField('count(ID) as Num');

		return $pro_release_num ? $pro_release_num : 0;
	}

	/**
	 * 获取我发布的项目的信息
	 * @param	int		$user_id 当前用户ID
	 * @param	int		$page_index 当页开始记录数
	 * @return	array	返回当前用户发布的项目信息，二维数组
	 */
	public function getUserProjectsReleaseInfo($user_id) {
		if ($user_id == 0)
			return array();

		$pros_release_info = $this -> table('cc_project_release U') -> join('cc_project_images P on U.projectImage=P.ID') -> where("releaseUser=$user_id") -> field('U.ID, U.projectName, U.projectImage,P.imgPath') -> order('releaseTime DESC') -> select();
		return $pros_release_info ? $pros_release_info : array();
	}
	
}
?>