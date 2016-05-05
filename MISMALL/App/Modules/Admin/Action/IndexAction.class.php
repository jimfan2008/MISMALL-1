<?php
class IndexAction extends AdminAction {
	//后台管理主页面
	public function index() {
		//统计信息
		/*$userCount = M('Users')->count();
		$forumPostCount = M('ForumPost')->count();
		$userSiteCount = M('UserSite')->count();
		$userProjectCount = M('ProjectRelease')->count();

		$this->assign('userCount', $userCount);
		$this->assign('forumPostCount', $forumPostCount);
		$this->assign('userSiteCount', $userSiteCount);
		$this->assign('userProjectCount', $userProjectCount);*/

		$dt = I('dt', 'week');

		$daysList = array();
		$days = array(); //日期

		$typeList = array(
			'user' => array(
				'title' => '会员数',
				'all_title' => '会员总数',
				'table' => 'Users',
				'field' => 'regTime',
			),
			'wechat' => array(
				'title' => '微信用户数',
				'all_title' => '微信用户总数',
				'table' => 'WechatMember',
				'field' => 'regTime',
			),
			'forum' => array(
				'title' => '论坛帖子数',
				'all_title' => '帖子总数',
				'table' => 'ForumPost',
				'field' => 'create_time',
			),
			'site' => array(
				'title' => '应用数',
				'all_title' => '应用总数',
				'table' => 'UserSite',
				'field' => 'addTime',
			),
/*            'form' => array(
'title' => '部署项目数',
'table' => 'ProjectRelease',
'field' =>  'releaseTime',
),*/
		);

		//日期
		switch ($dt) {
			case 'week':	//每周
				for ($i = 7; $i > 0; $i--) {
					$day = date("Y-m-d", strtotime("-{$i} day"));
					$days[$day] = array(
						'start' => strtotime($day),
						'end' => strtotime($day . ' 23:59:59'),
					);
					$daysList[] = $day;
				}
				break;
			case 'month':	//每月
				for ($i = 30; $i > 0; $i--) {
					$day = date("Y-m-d", strtotime("-{$i} day"));
					$days[$day] = array(
						'start' => strtotime($day),
						'end' => strtotime($day . ' 23:59:59'),
					);
					$daysList[] = $day;
				}
				break;
			case 'year':	//每年
				for ($i = 11; $i >= 0; $i--) {
					$day = date("Y-m", strtotime("-{$i} month"));
					$days[$day] = array(
						'start' => strtotime($day . '-01'),
						'end' => strtotime(date("Y-m-d", strtotime("$day +1 month -1 day")) . ' 23:59:59'),
					);
					$daysList[] = $day;
				}
				break;
			default:
				$this->error('日期差错');
				break;
		}

		//统计数量
		$series = array();
		foreach ($typeList as $type) {
			$counts = array();
			foreach ($days as $day => $val) {
				$where = array(
					$type['field'] => array(
						array('egt', $val['start']),
						array('lt', $val['end']),
					),
				);

				if ($type['table'] == 'WechatMember') {
					$where['isActivated'] = 1;
					$where['userType'] = 5;
					$counts[] = M('Users')->where($where)->count('distinct `openId`');
				} else {
					$counts[] = M($type['table'])->where($where)->count('0');
				}
			}
			if ($type['table'] == 'WechatMember') {
				$where['subscribe'] = 1;
				$where['userType'] = 5;
				$all_count = M($type['table'])->count('distinct `openId`');
			} else {
				$all_count = M($type['table'])->count('0');
			}

			//统计显示数据
			$series[] = array(
				'name' => $type['title'],
				'all_name' => $type['all_title'],
				'data' => '[' . join(',', $counts) . ']',
				'total' => array_sum($counts),
				'all_total' => $all_count,
			);
		}
		$this->assign('daysList', json_encode($daysList));
		$this->assign('series', $series);
		$this->assign('dt', $dt);
		$this->display('SiteStat/statictis');
	}

}