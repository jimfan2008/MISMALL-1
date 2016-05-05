<?php
/**
 * 订单信息模型
 * 
 * @author cjli
 *
 */
class TradeInfoModel extends Model
{
	/**
	 * 提交用户订单信息
	 * @param	int		$id 发布项目的ID
	 * @param	float	$app_price 购买应用单价
	 * @param	int		$user_id 购买用户的ID
	 * @param	int		$user_num 购买应用使用人数
	 * @param	int		$day_num 购买应用使用天数
	 * @param	int		$order_type 订单类型 1:form,2:site,3:flow,4:app
	 * @return	int		返回订单保存成功标识
	 */
	public function saveUserOrderInfo($id, $app_price, $user_id, $user_num = 1, $day_num = 30, $order_type = 2) {
		if ($id == 0 || $user_id == 0)
			return 0;
		
		$data['orderNo'] = date('YmdHis', time()) . rand(10000, 99999);
		$data['releaseID'] = $id;
		$data['userID'] = $user_id;
		$data['userNum'] = $user_num;
		$data['dayNum'] = $day_num;
		$data['appPrice'] = $app_price;
		$data['orderTime'] = time();
		$data['tradeMoney'] = $app_price * $user_num * $day_num;
		$data['orderStatus'] = 0;
		$data['orderType'] = $order_type;
		$tid = $this -> data($data) -> add();
		unset($data);
		
		return $tid ? $tid : 0;
	}
	
	/**
	 * 获取用户订单数量
	 * @param	int		$user_id 当前登录用户ID
	 * @param	int		$order_status 订单状态
	 * @param	int		$order_type 订单类型 1:form,2:site,3:flow,4:app
	 * @return	int 	返回用户订单数量
	 */
	public function getUserOrderNum($post)
	{
		$where = array(
			'userID' => isset($post['userID']) ? intval($post['userID']) : 0,
			'orderStatus' => isset($post['orderStatus']) ? intval($post['orderStatus']) : null,
			'orderType' => isset($post['orderType']) ? intval($post['orderType']) : null,
		);
		if (! $where['userID'] ) {
			return 0;
		}
			
		foreach($where as $key => $val) {
			if(is_null($val)) {
				unset($where[$key]);
			}
		}

		$orders_num = $this -> where($where) -> count();
		
		return $orders_num ? $orders_num : 0;
	}
	
	/**
	 * 获取用户订单列表
	 * @param array $post
	 * @return Array
	 */
	public function getUserOrderList( $post , $page = 0, $pageRows = 5)
	{
		$where = array(
			'userID' => isset($post['userID']) ? intval($post['userID']) : 0,
			'orderStatus' => isset($post['orderStatus']) ? intval($post['orderStatus']) : null,
			'orderType' => isset($post['orderType']) ? intval($post['orderType']) : null,
			'siteTempType' => isset($post['siteTempType']) ? intval($post['siteTempType']) : null,
		);
		if (! $where['userID'] ) {
			return array();
		}
			
		foreach($where as $key => $val) {
			if(is_null($val)) {
				unset($where[$key]);
			}
		}
		
		$this->where($where);
		$this->order('id DESC');
		//分页
		if($page) {
			$this->page($page, $pageRows);
		}
		$orderList = $this->select();
		if($orderList) {
			foreach($orderList as &$order) {
				//根据订单类型查相应内容
				$info = $this->getUserOrderRelationInfo($order['releaseID'], $order['orderType']);
				$order['projectName'] = $info['projectName'];
				$order['projectImage'] = $info['projectImage'];
				$order['siteUrlPath']	= $info['siteUrlPath'];
				$order['preView'] = isset($info['preView']) ? $info['preView'] : '';
			}
			unset($info, $order);
		}

		return $orderList;
	}
	
	/**
	 * 获取订单对应的产品信息
	 * @param int $pro_id 项目ID
	 * @param int $order_type 订单类型 1:form,2:site,3:flow,4:app
	 * @return string|mixed
	 */
	
	public function getUserOrderRelationInfo($pro_id, $order_type = 1)
	{
		switch($order_type)
		{
			case 2 : //ezSite
				//$tpl = M('UserSite')->field('siteName as projectName, thumbPath as projectImage')->find($pro_id);
				//if($tpl) {
				//	$tpl['projectImage'] = getThumbImage($tpl['projectImage'],210,170,true);
				//}
				$siteInfo = D('UserSite')->getSiteInfo($pro_id);
				$tpl = array();
				if($siteInfo) {
					$tpl['projectName'] = $siteInfo['siteName'];
					$tpl['projectImage'] = $siteInfo['thumbPath'];
					$tpl['preView'] = $siteInfo['preView'];
				}
				return $tpl;
				break;
			case 1 : //ezForm
			default :
				$model = M('project_release pr');
				$model->join(C('DB_PREFIX').'project_images pi ON pr.projectImage = pi.ID');
				$model->field('projectName, releaseUser, imgCate, imgPath');
				$model->where( array('pr.ID' => $pro_id));
				$app = $model->find();
				
				if($app) {
					$info['projectImage'] = getImageUrl($app['imgPath']);
				}
				$info['projectName'] = $app['projectName'];
				$info['releaseUser'] = $app['releaseUser'];
				
				return $info;
				break;
		}
	}
	
	/**
	 * 返回订单信息
	 * @param int $order_id 订单ＩＤ
	 * @return array
	 */
	public function getUserOrderInfo($order_id,$uid)
	{
		$order = $this->find($order_id);
		if($order['userID'] != $uid){
			//$this->error("bushinide order","Client/index");
		}
		if($order) {
			//根据订单类型查相应内容
			$info = $this->getUserOrderRelationInfo($order['releaseID'], $order['orderType']);
	
			$order['projectName'] = $info['projectName'];
			$order['projectImage'] = $info['projectImage'];
			
			$userInfo = D('User')->getAUser( array('user_id' => $info['releaseUser']));
			$order['releaseUser'] = $userInfo ? $userInfo['userName'] : '';
		}
		return $order;
	}
	
	/**
	 * 删除单个订单信息
	 * @param	int		$order_id 需要删除的订单
	 * @return	int		返回订单删除状态
	 */
	public function deleteUserOrder($order_id)
	{
		if ($order_id == 0)
			return 0;

		$res = $this -> where("ID=$order_id") -> delete();

		return $res ? 1 : 0;
	}
	
	/**
	 * 根据订单号获取订单信息
	 * 
	 * @param string $order_sn
	 * @return array 成功时返回订单内容，否则返回false
	 */
	public function getOrderInfoBySN( $order_sn )
	{
		if( ! $order_sn)
			return false;
			
		$order = $this->where( array( 'orderNo' => $order_sn))->find();
		
		return $order ? $order : false;
	}

	/**
	 * 生成支付日志
	 * 
	 * @param string $order_sn 订单号
	 * @param float $order_money	订单金额
	 * @param stirng $pay_type 支付方式
	 * 
	 */
	public function addPayLog($order_sn, $order_money, $pay_type)
	{
		$model = M('PaymentLog');
		$info = $model->where( array('order_sn' => $order_sn) )->find();
		//查询日志是否生成
		if($info) {
			//如果已经支付直接返回
			if( $info['status'] ) {
				return 'SUCCESS';
			}
			//更新日志日期
			$affect = $model->where( array('order_sn' => $order_sn) )-> save( array('create_time' => time() ) );
			return $affect;
		}
		//支付日志
		$set = array(
			'order_sn' => $order_sn,
			'pay_fee' => $order_money,
			'user_id' => session('uid'),
			'payment' => $pay_type,
			'status' => 0,
			'data' => '',
			'create_time' => time(),
			'update_time' => time(),
		);
		$model->add($set);
		return true;
	}
}