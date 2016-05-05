<?php
/**
 * 团队管理
 * @author cjli
 *
 */
class TeamManageAction extends HomeAction
{
	public function teamList()
	{
		redirect(U('AppCenter/index'), 2, '建设中...');
	}
}