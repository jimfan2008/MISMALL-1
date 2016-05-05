<?php
/**
 * 系统更新SQL
 */
class UpdateAction extends AdminAction {

	public function _initialize() {
		set_time_limit(0);
	}
	//更新ccplatform
	public function update() {
		$file = ROOT_PATH . '/data/db.sql';
		$content = file_get($file);
		//$content = substr($content, 23);
		$sqlArr = explode(PHP_EOL, $content);

		if (is_array($sqlArr) && $sqlArr) {

			//SQL记录ID
			$sql_id = M('Config')->where(array('name' => 'CCPLATFORM_UPDATE_SQL'))->getField('value');

			$count = count($sqlArr);
			$start = $sql_id;
			for ($i = 1; $i > $sql_id, $i <= $count; $i++) {
				if (empty($sqlArr[$i])) {
					continue;
				}

				$affect = M('')->execute($sqlArr[$i]);
				if ($affect) {
					$start++;
				}
			}

			if ($start > $sql_id) {
				M('Config')->where(array('name' => 'CCPLATFORM_UPDATE_SQL'))->save(array('value' => $start));
				$msg = "更新成功";
			}

		}
		$this->success($msg ? $msg : '没有要更新的', U('Index/index'));
	}

	//更新项目数据库
	public function updateProject() {
		
		$page = I("page",1,"intval");
		$file = ROOT_PATH . '/data/project_db.sql';
		$content = file_get($file);
		$sqlArr = explode(PHP_EOL, $content);
		//dump($sqlArr);exit;

		if (is_array($sqlArr) && $sqlArr) {
			//SQL记录ID
			$sql_id = M('Config')->where(array('name' => 'PROJECT_UPDATE_SQL'))->getField('value');

			//所有项目数据库列表
			$pro_lists = M('projects')->field('ID,projectDBLink') -> page($page, 100)->select();

			$count = count($sqlArr);
			$start = intval($sql_id) + 1;
			$m = 0;

			$objm = new Model();
			foreach ($pro_lists as $pro) {
				$db_name = 'ccproject_' . $pro['ID'];
				$res = $objm->query("SELECT COUNT('0') AS tp_count FROM `INFORMATION_SCHEMA`.`SCHEMATA` WHERE SCHEMA_NAME =  '" . $db_name . "'");
				if (!$res['0']['tp_count']) {
					continue;
				}
				//print_r($pro);exit;
				$objm->db('p' . $pro['ID'], $pro['projectDBLink']);

				for ($i = $start; $i <= $count; $i++) {
					if (empty($sqlArr[$i])) {
						continue;
					}
					$objm->execute($sqlArr[$i]);
					//echo 'project ID : ' . $pro['ID'] . '<br/>';
					if ($m == 0) {
						$start++;
					}
				}//endfor

				$m++;
			}//endforeach

			unset($objm, $sqlArr);

			/*if ($start > $sql_id) {
		M('Config')->where(array('name' => 'PROJECT_UPDATE_SQL'))->save(array('value' => $start));
		$msg = "项目数据库更新成功";
		}*/

		}
		$this->success($msg ? $msg : '没有要更新的', U('Index/index'));

	}
}