<?php

/**
 * 应用市场基本数据模型，提供应用市场基本数据的处理
 * Time : 20140210 11:20
 */
class AppStoreModel extends CommonModel {

	/**
	 * 获取单个发布应用的详细信息
	 * @param	int		$id	发布项目的ID
	 * @return	array 	返回单个发布项目的详细信息，一维数组
	 */
	public function getAReleaseProjectInfo($id) {
		if (!$id)
			return 0;

		$pro_info = $this -> table(C('DB_PREFIX').'user_site') -> where("id=$id") -> field('id,siteName,price,addTime,user_name,thumbPath,imgPreviewList,siteDescription') -> find();
		
		return $pro_info ? $pro_info : array();
	}

	/**
	 * 获取发布应用的评论总数
	 * @param	int		$id 项目的发布ID
	 * @param	int		$comment_display 显示评论的级别筛选
	 * @return	int		返回评论总数
	 */
	public function getAReleaseProjectCommentNum($id, $comment_display = 0) {
		if ($id == 0)
			return 0;

		switch ($comment_display) {
			case 1 :
				$condition = "projectID=" . $id . " and commentGrade=1";
				break;
			case 2 :
				$condition = "projectID=" . $id . " and commentGrade=2";
				break;
			case 3 :
				$condition = "projectID=" . $id . " and commentGrade=3";
				break;
			case 0 :
				$condition = "projectID=" . $id;
				break;
			default :
				$condition = "projectID=" . $id;
				break;
		}
		$comments_num = $this -> table(C('DB_PREFIX').'comment') -> where($condition) -> getField('count(ID) as Num');

		return $comments_num ? $comments_num : 0;
	}

	/**
	 * 获取发布应用的评论信息
	 * @param	int		$id 项目的发布ID
	 * @param	int		$comment_display 显示评论的级别筛选
	 * @return array	返回评论信息数据，二维数组
	 */
	public function getAReleaseProjectCommentInfo($id, $comment_display = 0) {
		if ($id == 0)
			return array();

		switch ($comment_display) {
			case 1 :
				$condition = "projectID=" . $id . " and commentGrade=1";
				break;
			case 2 :
				$condition = "projectID=" . $id . " and commentGrade=2";
				break;
			case 3 :
				$condition = "projectID=" . $id . " and commentGrade=3";
				break;
			case 0 :
				$condition = "projectID=" . $id;
				break;
			default :
				$condition = "projectID=" . $id;
				break;
		}
		$comments_info = $this -> table(C('DB_PREFIX').'comment') -> where($condition) -> field("commentUser, commentGrade, FROM_UNIXTIME(commentTime,'%Y-%m-%d %H:%i:%s') as commentTime, content") -> order('commentTime DESC') -> select();
		
		return $comments_info ? $comments_info : array();
	}

	/**
	 * 存储用户对发布应用的评论信息
	 * @param	string		$user_name 评论用户
	 * @param	int			$id 评论的项目发布ID
	 * @param	int			$comment_grade	评论级别 3-差评 2-中评 1-好评
	 * @param	string		$comment_content 评论内容
	 * @return	int			返回评论成功保存标识
	 */
	public function saveUserComment($user_name, $id, $comment_grade = 1, $comment_content = '') {
		if ($user_name == '' || $id == 0)
			return 0;

		$data['projectID'] = $id;
		$data['commentUser'] = $user_name;
		$data['commentGrade'] = $comment_grade;
		$data['commentTime'] = time();
		$data['content'] = $comment_content;
		$cid = $this -> table(C('DB_PREFIX').'comment') -> data($data) -> add();	
		unset($data);

		return $cid ? 1 : 0;
	}
	
	/**
	 * 获取单个订单的详细信息
	 * @param	int		$order_id 订单ID
	 * @return	array 	返回单个订单的详细信息，一维数组
	 */
	public function getAOrderDetails($order_id) {
		if ($order_id == 0)
			return array();
		$order_info = M('trade_info') -> where("ID=" . $order_id) -> field("orderNo, proID, userNum, dayNum, appPrice, FROM_UNIXTIME(orderTime,'%Y-%m-%d %H:%i:%s') as orderTime, tradeMoney, orderStatus") -> find();
		$app_info = M('project_release') -> where("ID=" . $order_info['releaseID']) -> field('projectName, projectImage') -> find();
		$order_info['projectName'] = $app_info['projectName'];
		$order_info['projectLogo'] = $app_info['projectImage'];
		unset($app_info);
		
		return $order_info ? $order_info : array();
	}

	/**
	 * 获取应用市场中最热门的5个应用
	 * @return	array 	返回应用的基本信息，二维数组
	 */
	public function getHottestAppInfo() {
		
		$pros_info = M() -> table('cc_project_release as R') -> join('cc_project_images as I on R.projectImage=I.ID') -> field('R.ID, R.projectID, R.projectName, R.projectPrice, I.imgPath') -> order('R.saleNum DESC') -> limit(0, 5) -> select();
		
		return $pros_info ? $pros_info : array();
	}
	
	/**
	 * 更新订单信息
	 * @param	string		$order_no 订单的订单号
	 * @return	boolen		返回订单信息修改成功标识
	 */
	public function updAOrderInfo($order_no) {
		if ($order_no == '')
			return 0;
			
		$data = array();
		$data['orderStatus'] = 1;
		$data['payTime'] = time();	
		
		$res = M('trade_info') -> where("orderNo='$order_no'") -> data($data) -> save();
		unset($data);
		
		return $res ? 1: 0;
	}
	 

}
?>