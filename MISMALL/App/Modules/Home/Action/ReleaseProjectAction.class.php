<?php

/**
 * 项目发布模型控制器
 * 提供数据给项目发布模块，处理项目发布数据
 *
 */
class ReleaseProjectAction extends HomeAction {

	/**
	 * 获取项目类别
	 * @param	string	$keyword 关键字
	 * @return	json 	$cate_list ID，类别，二维数组格式
	 */
	public function getProjectCate() {
		$keyword = I('post.keyword', '', 'trim');

		echo json_encode_cn( D('ReleaseProject') -> getProjectCate($keyword));
	}

	/**
	 * 上传项目发布图像
	 * @param	int		$proid 发布项目ID
	 * @param	int		$img_index 上传图像类别 0-项目logo 1-客服logo  >=2-项目截图
	 * @param	string	$img_src 上传的图像地址
	 * @return	int		返回图像保存登记ID
	 */
	public function addAReleaseProjectImage() {
		$proid = session('pid');
		$img_index = I('post.img_index', 0, 'intval');
		$img_src = I('post.img_src', '', 'trim');

		echo D('ReleaseProject') -> addAReleaseProjectImage($proid, $img_index, $img_src);
	}

	/**
	 * 发布项目信息
	 * @param	int		$user_id 项目发布人ID
	 * @param	array 	$pub_info 发布项目的基本信息
	 * @return	boolen	发布成功返回1，失败返回0
	 */
	public function ReleaseAProject() {
		$user_id = session('uid');

		$pub_info['ID'] = I('post.pubid', 0, 'intval');
		$pub_info['proID'] = session('pid');
		$pub_info['name'] = I('post.project_name', '', 'trim');
		$pub_info['cate'] = I('post.project_type', '', 'trim');
		$pub_info['logo'] = I('post.project_image', 0, 'intval');
		$pub_info['customer'] = I('post.customer_image', 0, 'intval');
		$pub_info['price'] = I('post.project_price', 0.00, 'floatval');
		$pub_info['version'] = I('post.project_version', '', 'trim');
		$pub_info['desc'] = I('post.project_desc', '', 'trim');

		echo D('ReleaseProject') -> ReleaseAProject($user_id, $pub_info);
	}

	/**
	 * 返回当前发布项目详细信息
	 * @param	int		$id 项目的发布ID
	 * @return	json	项目的详细登记信息
	 */
	public function getAReleaseProjectDetailInfo() {
		$id = I('post.id', 0, 'intval');

		echo json_encode_cn( D('ReleaseProject') -> getAReleaseProjectDetailInfo($id));
	}

}
?>