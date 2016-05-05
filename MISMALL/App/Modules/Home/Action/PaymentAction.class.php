<?php

/**
 * 用户支付模块控制器
 */
class PaymentAction extends Action {

	//在类初始化方法中，引入相关类库
	public function _initialize() {
		importORG('Pay');
		importORG('Pay.PayVo');
	}

	public function index() {
		E("Access Denied");
	}

	/**
	 * 生成支付按钮
	 */
	public function payForm() {
		if (IS_POST || IS_GET) {
			//页面上通过表单选择在线支付类型，支付宝为alipay 财付通为tenpay
			$paytype = I('param.paytype');
			$order_sn = I('param.out_trade_no');
			//获取订单信息
			$order = D('TradeInfo')->getOrderInfoBySN($order_sn);
			if (!$order) {
				echo '订单不存在';exit;
			}
			//订单关联产品
			$order['product'] = D('TradeInfo')->getUserOrderRelationInfo($order['releaseID'], $order['orderType']);
			// 商品展示地址
			if ($order['orderType'] == 2) {
				// 模板预览页
				$order['product']['showUrl'] = "http://" . $_SERVER['SERVER_NAME'] . "/" . $order['product']['siteUrlPath'];
			} else {
				$order['product']['showUrl'] = "http://" . $_SERVER['SERVER_NAME'] . "/AppStore/shop_detail.html?id=" . $order['releaseID'];
			}

			//添加日志
			$paylog = D('TradeInfo')->addPayLog($order_sn, $order['tradeMoney'], $paytype);
			if ($paylog === 'SUCCESS') {
				redirect(U("Home/MyCenter/my_order"), 3, '订单已经支付成功');
			}

			$pay = new Pay($paytype, C('payment.' . $paytype));

			$vo = new PayVo();
			//其他参数
			$param = array(
				'order_id' => $order['ID'],
				'order_sn' => $order_sn,
				'totalPrice' => $order['tradeMoney'],
				/*"logistics_fee" => '0.00',                     //物流费用
				"logistics_type"    => 'EXPRESS',               //物流类型
				"logistics_payment" => "SELLER_PAY",    //物流支付方式*/
				"show_url" => $order['product']['showUrl'], //商品展示地址
			);

			$vo->setBody($order['product']['projectName'])
			   ->setFee($order['tradeMoney']) //支付金额
			   ->setOrderNo($order_sn)
			   ->setTitle($order['product']['projectName'])
			   //->setCallback('Home/Payment/pay')
			   ->setParam($param);
			echo $pay->buildRequestForm($vo);
		} else {
			//在此之前goods1的业务订单已经生成，状态为等待支付
			//$this->display();
			E("Access Denied");
		}
	}

	/**
	 * 支付结果返回
	 */
	public function notify() {
		$apitype = I('get.apitype');

		$pay = new Pay($apitype, C('payment.' . $apitype));
		if (IS_POST && !empty($_POST)) {
			$notify = $_POST;
		} elseif (IS_GET && !empty($_GET)) {
			$notify = $_GET;
			unset($notify['method']);
			unset($notify['apitype']);
		} else {
			exit('Access Denied');
		}
		//LOG 日志
		Log::record("【接收到的notify通知】:\n" . $notify . "\n", Log::DEBUG);
		Log::save(C('LOG_TYPE'), C('LOG_PATH') . 'pay_' . date('y_m_d') . '.log');

		//验证
		if ($pay->verifyNotify($notify)) {
			//获取订单信息
			$info = $pay->getInfo();
			//返回支付状态1成功0失败
			if ($info['status']) {
				//更改订单状态
				$order = D('TradeInfo')->getOrderInfoBySN($info['out_trade_no']);
				if ($order['orderStatus'] == 0) {
					$set = array(
						'orderStatus' => 1,
						'payTime' => time(),
					);
					M("TradeInfo")->where(array('ID' => $order['ID']))->save($set);
				}
				//支付日志
				$set = array(
					'status' => 1,
					'data' => unserialize($notify),
					'update_time' => time(),
				);
				M('PaymentLog')->where(array('order_sn' => $info['out_trade_no']))->save($set);

				//支付成功后跳转
				if (I('get.method') == "return") {
					redirect(U("Home/MyCenter/my_order"));
				} else {
					$pay->notifySuccess();
				}
			} else {
				$this->error("支付失败！");
			}
		} else {
			E("Access Denied");
		}
	}

	/**
	 * 检验订单支付状态
	 */
	public function checkOrderPaymentStatus() {
		//$order_id = I('post.oid', 'intval');
		$order_sn = I('post.sn', '');
		$return = array(
			'error' => 1,
			'message' => '',
		);

		if (!$order_sn) {
			$return['message'] = '订单号不能为空';
		} else {
			$order = D('TradeInfo')->getOrderInfoBySN($order_sn);
			if (!$order) {
				$return['message'] = '订单不存在';
			} else {
				$return['error'] = 0;
				$return['message'] = $order['orderStatus'];
			}
		}
		echo json_encode($return);
	}
}
?>