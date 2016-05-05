<?php
/**
 * 网站规则设计数据模型
 */
class RuleModel extends Model {
	/* 自动验证规则 */
	protected $_validate = array(
		array('ruleName', 'require', '规则名称必须', self::MUST_VALIDATE, 'regex', self::MODEL_BOTH),
		//array('ruleName', '', '规则名称已经存在', self::MUST_VALIDATE, 'unique', self::MODEL_BOTH),
		array('siteId', 'require', '网站ID必须', self::MUST_VALIDATE, 'regex', self::MODEL_BOTH),
		array('pageId', 'require', '页面ID必须', self::MUST_VALIDATE, 'regex', self::MODEL_BOTH),
	);

	/* 自动完成规则 */
	protected $_auto = array(
		array('status', 1, self::MODEL_INSERT, 'string'),
		array('ruleSort', 0, self::MODEL_INSERT, 'string'),
		array('ruleType', 0, self::MODEL_INSERT, 'string'),
		array('createTime', 'time', self::MODEL_INSERT, 'function'),
		array('updateTime', 'time', self::MODEL_BOTH, 'function'),
	);

	// 数据库表达式
	protected $comparison = array('eq' => '=', 'neq' => '!=', 'gt' => '>', 'egt' => '>=', 'lt' => '<', 'elt' => '<=', 'notlike' => 'NOT LIKE', 'like' => 'LIKE', 'in' => 'IN', 'notin' => 'NOT IN');

	protected $project_id = 0;

	//protected $dbName = 'ccproject_555';

	/**
	 * 初始化
	 */
	public function _initialize() {
		/*$this->dbName = 'ccproject_733';
		session('pid', 733);*/

		if (I('session.pid', 0)) {
			$this->project_id = I('session.pid', 0);
		} else {
			echo 0;
			exit();
		}
		$project_info = D('PlatForm')->getAProjectDetails($this->project_id);
		if (!$project_info) {
			exit(0);
		}

		$this->dbName = "ccproject_{$this->project_id}";
		unset($project_info);

	}

	/**
	 * 编辑规则
	 *
	 * @param array $post POST数据
	 * @param  integer $id   规则ID
	 *
	 * @return integer|boolean 影响的结果
	 */
	public function edit($post, $id = 0) {
		$data = $this->create($post);
		if ($id) {
			$affect = $this->where(array('id' => $id))->save($data);
		} else {
			$affect = $this->add($data);
		}

		if ($affect) {
			$cache_id = md5('rule_' . $this->project_id . '_' . $id);
			S($cache_id, NULL);
		}
		return $affect;
	}

	/**
	 * 获取规则信息
	 *
	 * @param  integer $id   规则ID
	 *
	 * @return array 结果集
	 */
	public function info($id) {
		$cache_id = md5('rule_' . $this->project_id . '_' . $id);

		if (!$info = S($cache_id)) {
			$info = $this->where(array('status' => 1))->find($id);
			if ($info && $info['ruleData']) {
				$info['ruleData'] = unserialize($info['ruleData']);
			}
			S($cache_id, $info);
		}

		return $info;
	}

	/**
	 * 获取规则列表
	 *
	 * @param  integer  $site_id 网站ID
	 * @param  string  $page_id 页面ID
	 * @param  integer $status  状态
	 * @param  int  $page    第几页
	 * @param  integer $pageRow 每页个数
	 *
	 * @return array
	 */
	public function getlist($site_id, $page_id, $status = 1, $page = NULL, $pageRow = 10) {
		$where = array(
			'siteId' => intval($site_id),
			'status' => intval($status),
		);

		if ($page_id) {
			$where['pageId'] = $page_id;
		}
		if ($page) {
			$this->page($page, $pageRow);
		}
		$list = $this->field('id')->where($where)->order('ruleSort DESC, id ASC')->select();
		if ($list) {
			foreach ($list as &$rule) {
				$rule = $this->info($rule['id']);
			}
			unset($rule);
		}

		return $list;
	}

	/**
	 * 执行规则
	 *
	 * @param  integer $ruleId   规则ID
	 * @param array  $condition 条件
	 * @param string $action 操作方式
	 * @param  array $result 结果
	 *
	 * @return mixed
	 */
	public function execRule($conditionArr, $resultArr) {

		if (is_array($conditionArr) && $conditionArr) {
			foreach ($conditionArr as $condition) {
				//判断逻辑符号是否已经定义
				if (isset($this->comparison[$condition['condRela']]) && $this->comparison[$condition['condRela']]) {
					$where[$condition['paraVal']] = array(
						$condition['condRela'],
						$condition['condVal']['value'],
					);
				}
			}

			//$tables[] = substr($condition['field'], 0, strpos($condition['field'], '.'));
			//$tables[] = substr($condition['value'], 0, strpos($condition['value'], '.'));
		}

		//$tables[] = substr($result['field'], 0, strpos($result['field'], '.'));

		//$tables = array_reverse(array_filter(array_unique($tables)));
		//结果
		foreach ($resultArr as $result) {
			//dump($result);
			$table = $result['fieldTable'];

			switch ($result['reuleCalType']) {
				case 'addResult':	//添加数据

					//$curr_user = session('wechat_openid');

					$set = array();
					foreach ($result['fields'] as $key => $field) {
						$set[$field['fieldName']] = $field['fieldValue'];
					}
					//$set[$result['fields'][0]['fieldName']] = $curr_user;

					$res = D('Project')->getFormDataInfo($table, '', '', '', $where);

					if (!empty($res)) {
						$affect = D('Project')->saveFormDataInfo($table, 0, $set);
					}

					break;
				case 'updateResult':	//更新数据

					$res = D('Project')->getFormDataInfo($table, '', '', '', $where);
					if (empty($res)) {
						$affect = false;
					}

					$res = reset($res);

					$set = array();
					foreach ($result['fields'] as $key => $field) {
						$set[$field['fieldName']] = $field['fieldValue'];
					}

					//TODO写死第一个为好评率
					/*if ($set[$result['fields'][0]['fieldName']] > 100) {
				$set[$result['fields'][0]['fieldName']] = 100;
				}*/
					$id = $res['ID'];
					if (!empty($res)) {
						$affect = D('Project')->saveFormDataInfo($table, $id, $set);
					}

					break;
				case 'loadResult':	//获取值
					//$affect = D('Project')->getFormDataInfo($tables, '', '', $result_field);
					break;
				default:

					break;
			}
		}
		return $affect ? $affect : false;
	}
}