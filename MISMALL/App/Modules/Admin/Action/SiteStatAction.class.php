<?php
/**
 * 网站统计管理
 * 
 * @author cjli
 *
 */
class SiteStatAction extends AdminAction
{
	public function index()
	{
	//	$type = I('type', 'user');
		$dt = I('dt','week');
		
	//	$curr_day = date('Y-m-d', time());
		
	/*	if($type == 'user'){
			$title = '用户数据统计';
			$model = M('Users');
			$field = 'regTime';
		}*/
		$daysList = array();
		$days = array();//日期

		$typeList = array(
			'user' => array(
				'title' => '会员数',
				'table' => 'Users',
				'field'	=>	'regTime',
			),
			'forum' => array(
				'title' => '论坛帖子',
				'table' => 'ForumPost',
				'field'	=>	'create_time',
			),
			'site' => array(
				'title' => '站点数',
				'table' => 'UserSite',
				'field'	=>	'addTime',
			),
			'form' => array(
				'title' => '部署项目数',
				'table' => 'ProjectRelease',
				'field'	=>	'releaseTime',
			),
		);

		//日期
		switch($dt){
			case 'week' : //每周
				for($i = 7; $i>0; $i--){
					$day = date("Y-m-d", strtotime("-{$i} day"));
					$days[$day] = array(
						'start' => strtotime($day),
						'end'	=> strtotime($day.' 23:59:59'),
					);
					$daysList[] = $day;
				}
				break;
			case 'month' : //每月
				for($i = 30; $i>0; $i--){
					$day = date("Y-m-d", strtotime("-{$i} day"));
					$days[$day] = array(
						'start' => strtotime($day),
						'end'	=> strtotime($day.' 23:59:59'),
					);
					$daysList[] = $day;
				}
				break;
			case 'year' : //每年
				for($i = 11; $i>=0; $i--){
					$day = date("Y-m", strtotime("-{$i} month"));
					$days[$day] = array(
						'start' => strtotime($day.'-01'),
						'end'	=> strtotime(date("Y-m-d", strtotime("$day +1 month -1 day")).' 23:59:59'),
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
		foreach($typeList as $type){
			$counts = array();
			foreach ($days as $day => $val){
				$where = array(
					$type['field'] => array(
						array('egt', $val['start']),
						array('lt', $val['end']),
					)
				);
				$counts[] = M($type['table'])->where($where)->count('0');
				//echo M($type['table'])->getLastSql().'<br/>';
			}
			
			//统计显示数据
			$series[] = array(
				'name' => $type['title'],
				'data' => '['.join(',', $counts).']',
				'total' => array_sum($counts),
			);
		}
		$this->assign('daysList', json_encode($daysList));
		$this->assign('series', $series);
		$this->assign('dt', $dt);
		$this->display('statictis');
	}
}