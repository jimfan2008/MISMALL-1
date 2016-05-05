<?php
/**
 * 数据库备份还原控制器
 */
class DatabaseAction extends AdminAction {

	/**
	 * 数据库备份/还原列表
	 * @param  String $type import-还原，export-备份
	 */
	public function index($type = null) {
		switch ($type) {
			/* 数据还原 */
			case 'import':
				//列出备份文件列表
				$path = realpath(C('DATA_BACKUP_PATH'));
				$flag = FilesystemIterator::KEY_AS_FILENAME;
				$glob = new FilesystemIterator($path, $flag);

				$list = array();
				foreach ($glob as $name => $file) {
					if (preg_match('/^\d{8,8}-\d{6,6}-\d+\.sql(?:\.gz)?$/', $name)) {
						$name = sscanf($name, '%4s%2s%2s-%2s%2s%2s-%d');

						$date = "{$name[0]}-{$name[1]}-{$name[2]}";
						$time = "{$name[3]}:{$name[4]}:{$name[5]}";
						$part = $name[6];

						if (isset($list["{$date} {$time}"])) {
							$info = $list["{$date} {$time}"];
							$info['part'] = max($info['part'], $part);
							$info['size'] = $info['size'] + $file->getSize();
						} else {
							$info['part'] = $part;
							$info['size'] = $file->getSize();
						}
						$extension = strtoupper(pathinfo($file->getFilename(), PATHINFO_EXTENSION));
						$info['compress'] = ($extension === 'SQL') ? '-' : $extension;
						$info['time'] = strtotime("{$date} {$time}");

						$list["{$date} {$time}"] = $info;
					}
				}
				$title = '数据还原';
				break;

			/* 数据备份 */
			case 'export':
				$Db = Db::getInstance();
				$list = $Db->query('SHOW TABLE STATUS');
				$list = array_map('array_change_key_case', $list);
				$title = '数据备份';
				break;

			default:
				$this->error('参数错误！');
		}

		//渲染模板
		$this->assign('meta_title', $title);
		$this->assign('list', $list);
		$this->display($type);
	}

	/**
	 * 优化表
	 * @param  String $tables 表名
	 */
	public function optimize($tables = null) {
		if ($tables) {
			$Db = Db::getInstance();
			if (is_array($tables)) {
				$tables = implode('`,`', $tables);
				$list = $Db->query("OPTIMIZE TABLE `{$tables}`");

				if ($list) {
					$this->success("数据表优化完成！");
				} else {
					$this->error("数据表优化出错请重试！");
				}
			} else {
				$list = $Db->query("OPTIMIZE TABLE `{$tables}`");
				if ($list) {
					$this->success("数据表'{$tables}'优化完成！");
				} else {
					$this->error("数据表'{$tables}'优化出错请重试！");
				}
			}
		} else {
			$this->error("请指定要优化的表！");
		}
	}

	/**
	 * 修复表
	 * @param  String $tables 表名
	 */
	public function repair($tables = null) {
		if ($tables) {
			$Db = Db::getInstance();
			if (is_array($tables)) {
				$tables = implode('`,`', $tables);
				$list = $Db->query("REPAIR TABLE `{$tables}`");

				if ($list) {
					$this->success("数据表修复完成！");
				} else {
					$this->error("数据表修复出错请重试！");
				}
			} else {
				$list = $Db->query("REPAIR TABLE `{$tables}`");
				if ($list) {
					$this->success("数据表'{$tables}'修复完成！");
				} else {
					$this->error("数据表'{$tables}'修复出错请重试！");
				}
			}
		} else {
			$this->error("请指定要修复的表！");
		}
	}

	/**
	 * 删除备份文件
	 * @param  Integer $time 备份时间
	 */
	public function del($time = 0) {
		if ($time) {
			$name = date('Ymd-His', $time) . '-*.sql*';
			$path = realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR . $name;
			array_map("unlink", glob($path));
			if (count(glob($path))) {
				$this->success('备份文件删除失败，请检查权限！');
			} else {
				$this->success('备份文件删除成功！');
			}
		} else {
			$this->error('参数错误！');
		}
	}

	/**
	 * 备份数据库
	 * @param  String  $tables 表名
	 * @param  Integer $id     表ID
	 * @param  Integer $start  起始行数
	 */
	public function export($tables = null, $id = null, $start = null) {
		if (IS_POST && !empty($tables) && is_array($tables)) {
			//初始化
			//读取备份配置
			$config = array(
				'path' => realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR,
				'part' => C('DATA_BACKUP_PART_SIZE'),
				'compress' => C('DATA_BACKUP_COMPRESS'),
				'level' => C('DATA_BACKUP_COMPRESS_LEVEL'),
			);
			//检查是否有正在执行的任务
			$lock = "{$config['path']}backup.lock";
			if (is_file($lock)) {
				$this->error('检测到有一个备份任务正在执行，请稍后再试！');
			} else {
				//创建锁文件
				file_put_contents($lock, NOW_TIME);
			}

			//检查备份目录是否可写
			is_writeable($config['path']) || $this->error('备份目录不存在或不可写，请检查后重试！');
			session('backup_config', $config);

			//生成备份文件信息
			$file = array(
				'name' => date('Ymd-His', NOW_TIME),
				'part' => 1,
			);
			session('backup_file', $file);

			//缓存要备份的表
			session('backup_tables', $tables);

			//创建备份文件
			import('@.ORG.Database');
			$Database = new Database($file, $config);
			if (false !== $Database->create()) {
				$tab = array('id' => 0, 'start' => 0);
				$this->success('初始化成功！', '', array('tables' => $tables, 'tab' => $tab));
			} else {
				$this->error('初始化失败，备份文件创建失败！');
			}
		} elseif (IS_GET && is_numeric($id) && is_numeric($start)) {
			//备份数据
			$tables = session('backup_tables');
			//备份指定表
			import('@.ORG.Database');
			$Database = new Database(session('backup_file'), session('backup_config'));
			$start = $Database->backup($tables[$id], $start);
			if (false === $start) {
				//出错
				$this->error('备份出错！');
			} elseif (0 === $start) {
				//下一表
				if (isset($tables[++$id])) {
					$tab = array('id' => $id, 'start' => 0);
					$this->success('备份完成！', '', array('tab' => $tab));
				} else {
					//备份完成，清空缓存
					unlink(session('backup_config.path') . 'backup.lock');
					session('backup_tables', null);
					session('backup_file', null);
					session('backup_config', null);
					$this->success('备份完成！');
				}
			} else {
				$tab = array('id' => $id, 'start' => $start[0]);
				$rate = floor(100 * ($start[0] / $start[1]));
				$this->success("正在备份...({$rate}%)", '', array('tab' => $tab));
			}

		} else {
			//出错
			$this->error('参数错误！');
		}
	}

	/**
	 * 还原数据库
	 */
	public function import($time = 0, $part = null, $start = null) {
		if (is_numeric($time) && is_null($part) && is_null($start)) {
			//初始化
			//获取备份文件信息
			$name = date('Ymd-His', $time) . '-*.sql*';
			$path = realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR . $name;
			$files = glob($path);
			$list = array();
			foreach ($files as $name) {
				$basename = basename($name);
				$match = sscanf($basename, '%4s%2s%2s-%2s%2s%2s-%d');
				$gz = preg_match('/^\d{8,8}-\d{6,6}-\d+\.sql.gz$/', $basename);
				$list[$match[6]] = array($match[6], $name, $gz);
			}
			ksort($list);

			//检测文件正确性
			$last = end($list);
			if (count($list) === $last[0]) {
				session('backup_list', $list); //缓存备份列表
				$this->success('初始化完成！', '', array('part' => 1, 'start' => 0));
			} else {
				$this->error('备份文件可能已经损坏，请检查！');
			}
		} elseif (is_numeric($part) && is_numeric($start)) {
			$list = session('backup_list');
			import('@.ORG.Database');
			$db = new Database($list[$part], array(
				'path' => realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR,
				'compress' => $list[$part][2]));

			$start = $db->import($start);

			if (false === $start) {
				$this->error('还原数据出错！');
			} elseif (0 === $start) {
				//下一卷
				if (isset($list[++$part])) {
					$data = array('part' => $part, 'start' => 0);
					$this->success("正在还原...#{$part}", '', $data);
				} else {
					session('backup_list', null);
					$this->success('还原完成！');
				}
			} else {
				$data = array('part' => $part, 'start' => $start[0]);
				if ($start[1]) {
					$rate = floor(100 * ($start[0] / $start[1]));
					$this->success("正在还原...#{$part} ({$rate}%)", '', $data);
				} else {
					$data['gz'] = 1;
					$this->success("正在还原...#{$part}", '', $data);
				}
			}

		} else {
			$this->error('参数错误！');
		}
	}

	/**
	 * 备份项目数据库
	 * @param  String  $tables 表名
	 * @param  Integer $id     表ID
	 * @param  Integer $start  起始行数
	 */
	public function projectExport() {
		if (IS_POST) {
			$site_id = I('post.siteId', 0, 'intval');
			$user_id = I('post.userId', 0, 'intval');
			/*$site_id = 1281;
			$user_id = 2;*/
			if ($site_id == 0 || $user_id == 0) {
				$this->error('请输入网站ID和用户ID');
			}
			$siteInfo = D('UserSite')->getSiteInfo($site_id);
			//dump($siteInfo);exit;
			if (!$siteInfo) {
				$this->error('备份网站不存在!');
			}
			
			//初始化
			//读取备份配置
			$config = array(
				'path' => realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR,
				'part' => C('DATA_BACKUP_PART_SIZE'),
				'compress' => 0,
				'level' => C('DATA_BACKUP_COMPRESS_LEVEL'),
			);
			//检查是否有正在执行的任务
			$lock = "{$config['path']}backup.lock";
			
			if (is_file($lock)) {
				print_r("检测到有一个备份任务正在执行，请稍后再试！");
				exit;
				$this->error('检测到有一个备份任务正在执行，请稍后再试！');
			} else {
				//创建锁文件
				file_put_contents($lock, NOW_TIME);
			}
			//检查备份目录是否可写
			if(!is_writeable($config['path'])){
				print_r("备份目录不存在或不可写，请检查后重试！");
				exit;
				$this->error('备份目录不存在或不可写，请检查后重试！');
			}
			//is_writeable($config['path']) || $this->error('备份目录不存在或不可写，请检查后重试！');
			session('backup_config', $config);
			//生成备份文件信息
			$file = array(
				'name' => date('Ymd-His', NOW_TIME),
				'part' => 1,
			);
			session('backup_file', $file);

			$plat_sql[] = "INSERT INTO `cc_projects`(`createUser`, `projectName`,`projectDbLink`) VALUES (" . $user_id . ", '" . $siteInfo['siteName'] . "', '');\n";
			$plat_sql[] = "-- -----------------------------\n";
			$plat_sql[] = "set @project_id=0;\n";
			$plat_sql[] = "SELECT @project_id:= id FROM `cc_projects` ORDER BY `id` DESC limit 1;\n";
			$plat_sql[] = "INSERT INTO `cc_user_site` (`sitePath`, `siteName`, `siteUrlPath`, `domain`, `siteDbName`, `userProjectId`, `parentSiteId`, `expire`, `userId`, `publish`, `orderNo`, `addTime`, `publishTime`, `status`, `siteCategoryId`, `siteTypeId`, `thumbPath`, `colorId`, `user_name`, `price`, `clickCount`, `siteCount`, `isShare`, `siteTempType`, `siteDescription`, `imgPreviewList`, `wechatId`, `config`) VALUES ( '" . $siteInfo['sitePath'] . "', '" . $siteInfo['siteName'] . "', '" . $siteInfo['siteUrlPath'] . "', '', '',  @project_id, 0, 0,  " . $user_id . ", 0, '', " . $siteInfo['addTime'] . ", 0, 1, " . $siteInfo['siteCategoryId'] . ", " . $siteInfo['siteTypeId'] . ", '" . $siteInfo['thumbPath'] . "', " . $siteInfo['colorId'] . ", '" . $siteInfo['user_name'] . "', " . $siteInfo['price'] . ", 0, 0, -1, " . $siteInfo['siteTempType'] . ", '" . $siteInfo['siteDescription'] . "', '" . $siteInfo['imgPreviewList'] . "', 0, '" . $siteInfo['config'] . "');\n\n";
			$plat_sql[] = "set @site_id=0;\n";
			$plat_sql[] = "SELECT @site_id:= id FROM `cc_user_site` ORDER BY `id` DESC limit 1;\n";
			$plat_sql[] = "INSERT INTO `cc_user_projects` ( `userID`, `projectID`, `userType`, `isActivated`, `siteID`, `projectType`) VALUES(" . $user_id . ", @project_id, 1, 1, @site_id, '');\n";
			$plat_sql[] = "@@@@@@@@@@@@;\n";

			//创建备份文件
			import('@.ORG.Database');
			$Database = new Database($file, $config);
			if (false !== $Database->create()) {
				$count = count($plat_sql);
				for ($i = 0; $i < $count; $i++) {
					$Database->write($plat_sql[$i]);
				}
				$cdn = 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $siteInfo['userProjectId'];
				$db = Db::getInstance($cdn);

				$tables = $db->query("SHOW TABLES"); // 获取应用对应发布数据库中所有数据表
				$tables = array_value_recursive('Tables_in_ccproject_' . $siteInfo['userProjectId'], $tables);
				$start = 0;
				foreach ($tables as $key => $table) {
					$start = $this->_project_backup($db, $Database, $tables[$key], $start);
				}

				/* 下载 */
				$backuppath = $config['path'];
				$filename = "{$backuppath}{$file['name']}-{$file['part']}.sql";
				if ($config['compress']) {
					$filename = "{$filename}.gz";
				}

				$file = array(
					'type' => filetype($filename),
					'size' => strlen(file_get_contents($filename)),
					'name' => basename($filename),
				);
				//dump($file);exit;

				/* 执行下载 *///TODO: 大文件断点续传
				header("Content-Description: File Transfer");
				header('Content-type: ' . $file['type']);
				header('Content-Length:' . $file['size']);
				if (preg_match('/MSIE/', $_SERVER['HTTP_USER_AGENT'])) {
					//for IE
					header('Content-Disposition: attachment; filename="' . rawurlencode($file['name']) . '"');
				} else {
					header('Content-Disposition: attachment; filename="' . $file['name'] . '"');
				}
				readfile($filename);
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															
				//备份完成，清空缓存
				print_r(session('backup_config.path'));
				unlink(session('backup_config.path') . 'backup.lock');
				session('backup_tables', null);
				session('backup_file', null);
				session('backup_config', null);
				unlink($filename);

				//$this->success('备份成功！');
			} else {
				print_r('备份失败，备份文件创建失败！');
				exit;
				$this->error('备份失败，备份文件创建失败！');
			}
		} else {
			$this->display('project_export');
		}
	}

	private function _project_backup($db, $database, $table, $start) {
		//备份表结构
		if (0 == $start) {
			$result = $db->query("SHOW CREATE TABLE `{$table}`");
			$sql = "\n";
			$sql .= "-- -----------------------------\n";
			$sql .= "-- Table structure for `{$table}`\n";
			$sql .= "-- -----------------------------\n";
			$sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
			$sql .= trim($result[0]['Create Table']) . ";\n\n";
			if (false === $database->write($sql)) {
				return false;
			}
		}

		//数据总数
		$result = $db->query("SELECT COUNT(*) AS count FROM `{$table}`");
		$count = $result['0']['count'];

		//备份表数据
		if ($count) {
			//写入数据注释
			if (0 == $start) {
				$sql = "-- -----------------------------\n";
				$sql .= "-- Records of `{$table}`\n";
				$sql .= "-- -----------------------------\n";
				$database->write($sql);
			}

			//备份数据记录
			$result = $db->query("SELECT * FROM `{$table}` LIMIT {$start}, 1000");
			foreach ($result as $row) {
				$row = array_map('mysql_real_escape_string', $row);
				$sql = "INSERT INTO `{$table}` VALUES ('" . implode("', '", $row) . "');\n";
				if (false === $database->write($sql)) {
					return false;
				}
			}

			//还有更多数据
			if ($count > $start + 1000) {
				return array($start + 1000, $count);
			}
		}

		//备份下一表
		return 0;
	}

	public function projectImport() {

		if (!IS_POST) {
			$this->error('error');
		}
		$file = $_FILES['sqlgz']['tmp_name'];
		$compress = 0;
		//还原数据
		$db = Db::getInstance();

		if ($compress) {
			$gz = gzopen($file, 'r');
			$size = 0;
		} else {
			$size = filesize($file);
			$gz = fopen($file, 'r');
		}

		$sql = '';
		while (!feof($gz)) {
			$sql .= $compress ? gzgets($gz) : fgets($gz);
			if (preg_match('/.*;$/', trim($sql))) {
				if (strpos($sql, "@@@@@@@@@@@@") !== false) {
					$sql = '';
					//$project_id = M('Projects')->order('id DESC')->getField('id');
					$siteInfo = M('UserSite')->order('id DESC')->find();
					$project_id = $siteInfo['userProjectId'];
					//创建应用数据库
					$sql = <<<sql
				DROP DATABASE IF EXISTS `ccproject_$project_id`;
				CREATE DATABASE `ccproject_$project_id` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
				GRANT ALL PRIVILEGES ON ccproject_$project_id.* TO webuser@`%` IDENTIFIED BY 'webuser';
sql;
					$mysqli = new mysqli(C('DB_HOST'), C('DB_USER'), C('DB_PWD'), '', C('DB_PORT'));
					$mysqli->multi_query($sql);
					$mysqli->close();
					unset($sql, $mysqli);
					//切换项目数据库
					$cdn = 'mysql://' . C('DB_USER') . ':' . C('DB_PWD') . '@' . C('DB_HOST') . ':' . C('DB_PORT') . '/ccproject_' . $project_id;
					$db = Db::getInstance($cdn);
					$sql = '';
					continue;
				}
				$db->query($sql);
				/*if (false === $db->query($sql)) {
				$this->error('导入数据库出错！');
				}*/
				$sql = '';
			}
		}
		fclose($gz);

		//生成微信公众号应用
		$wechat_id = C('SUPPER_WECHAT_ID');
		$set = array(
			'name' => $siteInfo['siteName'],
			'icon' => $siteInfo['thumbPath'],
			'siteId' => $siteInfo['id'],
			'description' => $siteInfo['siteDescription'],
		);
		D('Apps/Wechat')->editWechatApp($wechat_id, $set);
		D('UserSite')->editSite($siteInfo['id'], array('wechatId' => $wechat_id));

		$this->success("导入数据库成功！");
	}

	public function download($time = 0) {
		if ($time) {
			$name = date('Ymd-His', $time) . '-1.sql' . (C('DATA_BACKUP_COMPRESS') ? '.gz' : '');
			$filename = realpath(C('DATA_BACKUP_PATH')) . DIRECTORY_SEPARATOR . $name;

			$file = array(
				'type' => filetype($filename),
				'size' => filesize($filename),
				'name' => basename($filename),
			);

			/* 执行下载 *///TODO: 大文件断点续传
			header("Content-Description: File Transfer");
			header('Content-type: ' . $file['type']);
			header('Content-Length:' . $file['size']);
			if (preg_match('/MSIE/', $_SERVER['HTTP_USER_AGENT'])) {
				//for IE
				header('Content-Disposition: attachment; filename="' . rawurlencode($file['name']) . '"');
			} else {
				header('Content-Disposition: attachment; filename="' . $file['name'] . '"');
			}
			readfile($filename);
			array_map("unlink", glob($filename));
			exit;
		} else {
			$this->error('参数错误！');
		}
	}

}
