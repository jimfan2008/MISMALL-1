<?php
/**
 * 网站规则设计，用于规则操作
 */
class RuleAction extends HomeAction {
	/**
	 * 初始化
	 */
	public function _initialize() {
		parent::_initialize();
	}

	/**
	 * 规则写入编辑
	 *
	 * @param  integer  $site_id 网站ID
	 * @param  string  $page_id 页面ID
	 * @param  json $data 规则数据
	 *
	 * @return JSON
	 */
	public function editRule() {
		$site_id = I('param.siteId', 0, 'intval');
		$page_id = I('param.pageId', '', 'trim');
		$rule_id = I('param.ruleId', 0, 'intval'); //规则ID
		$data = I('param.data', '', 'trim');

		$return = array(
			'status' => 'error',
			'info' => '',
		);
		/*$site_id = 765;
		$page_id = 'ASFESDFGE';
		$data = '{"conditionList":[{"rowLogic":"","condition":[{"logic":"","condRela":"like","condVal":{"type":"system","value":"USERNAME"}},{"logic":"and","paraType":"field","paraVal":"undefined.undefined","condRela":"!=","condVal":{"type":"null","value":"null"}}],"result":{"type":"null","value":"null"}}],"conditionName":"规则1","conditionDesc":"规则测试"}';
		 */
		if (!$rule_id) {
			if (!($site_id && $page_id && $data)) {
				$return['info'] = '参数不能为空';
				echo $this->ajaxReturn($return);
				exit;
			}
		}

		$list = json_decode($data);
		$set = array(
			'siteId' => $site_id,
			'pageId' => $page_id,
			'ruleName' => $list->conditionName,
			'ruleDesc' => $list->conditionDesc,
			'ruleData' => serialize(objectToArray($list->conditionList)),
		);

		/*if ( $rule_id ) {
		unset($set['siteId'], $set['pageId']);
		}
		 */
		$affect = D('Rule')->edit($set, $rule_id);
		$error = D('Rule')->getError();
		if ($affect || empty($error)) {
			$return = array(
				'status' => 'success',
				'info' => $affect,
			);
		} else {
			$return['info'] = $error;
		}
		echo $this->ajaxReturn($return);
	}

	/**
	 * 获取规则信息
	 *
	 * @param  integer $ruleId   规则ID
	 *
	 * @return JSON 结果集
	 */
	public function getInfo() {
		$rule_id = I('param.ruleId', 0, 'intval');

		$info = D('Rule')->info($rule_id);

		echo $this->ajaxReturn($info);
	}

	/**
	 * 获取规则列表
	 *
	 * @param  integer  $siteId 网站ID
	 * @param  string  $pageId 页面ID
	 * @param  integer $status  状态
	 * @param  int  $page    第几页
	 * @param  integer $pageRow 每页个数
	 *
	 * @return JSON
	 */
	public function getlist() {
		$site_id = I('param.siteId', 0, 'intval');
		$page_id = I('param.pageId', '', 'trim');
		$status = I('param.status', 1, 'intval');
		$page = I('param.page', 0, 'intval');
		$pageRow = I('param.pageRow', 10, 'intval');

		$list = D('Rule')->getlist($site_id, $page_id, $status, $page, $pageRow);

		echo $this->ajaxReturn($list);
	}

	/**
	 * 执行规则
	 *
	 * @param  integer 	$ruleId   	规则ID
	 * @param JSON 	$ruleData	规则JSON
	 *
	 * @return JSON 结果集
	 */
	public function execRule() {
		$rule_id = I('param.ruleId', 0, 'intval');
		$rule_json = I('param.ruleData', '', 'trim');

		$return = array(
			'status' => 'error',
			'info' => '',
		);
/*$rule_json = <<<EOF
{
"sort": [
"CallRule3"
],
"actionList": {
"CallRule3": {
"type": "CallRule",
"ctrl": {
"1": {
"fieldValue": ""
}
},
"conditionJson": [
{
"paraVal": "cc_tbfm201502111538222889.CCTextBox1",
"condRela": "gt",
"condVal": {
"type": "constant",
"value": "50"
}
},
{
"paraVal": "cc_tbfm201502111538222889.CCTextBox3",
"condRela": "egt",
"condVal": {
"type": "variable",
"value": "cc_tbfm201502111538222889.CCTextBox3"
}
}
],
"equationValueJson": [
{
"reuleCalType": "addResult",
"fieldTable": "cc_tbfm201501290956317533",
"fields": [
{
"fieldName": "CCTextBox1",
"fieldValue": "44"
}
]
}
]
}
}
}
EOF;*/

		if (empty($rule_json)) {
			$return['info'] = '参数为空';
			echo $this->ajaxReturn($return);
			exit;
		}

		$jsonArr = objectToArray(json_decode($rule_json));
		//dump($jsonArr);
		//条件
		/*$condition = '';
		if ( $jsonArr['conditionJson']['fieldValue'] ===  $jsonArr['ruleJson']['fieldValue']) {
		$condition = '';
		} else {
		$condition = array(
		'field' => $jsonArr['conditionJson']['fieldValue'],
		'condRela' => $jsonArr['ruleJson']['conditSymbol'],
		'value' => $jsonArr['ruleJson']['fieldValue']
		);
		}*/
		//结果
		if (empty($jsonArr['equationValueJson'][0]['fieldTable']) || empty($jsonArr['equationValueJson'][0]['fields'][0]['fieldValue'])) {
			$return['info'] = '结果为空';
			echo $this->ajaxReturn($return);
		}

		$info = D('Rule')->execRule($jsonArr['conditionJson'], $jsonArr['equationValueJson']);

		$return = array(
			'status' => 'success',
			'info' => $info,
		);
		echo $this->ajaxReturn($return);
	}
}