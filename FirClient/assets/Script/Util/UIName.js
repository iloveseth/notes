var UIName = {
    //View
    UI_Main: 'Prefab/View/MainView',
    UI_MAINMINI: 'Prefab/View/MainMiniMapView',
    UI_EQUIP: 'Prefab/View/EquipView',
    UI_LEVEL: 'Prefab/View/LevelView',
    UI_FIGHTFAIL: 'Prefab/View/FightFailView',
    UI_MINILEVEL: 'Prefab/View/MiniLevelView',
    UI_EQUIPSELECT: 'Prefab/View/EquipSelectView',
    UI_PACKAGE: 'Prefab/View/PackageView',
    UI_DIGVIEW: 'Prefab/View/DigView',//玩家本身庄园界面
    UI_DIG_OTHER_VIEW: 'Prefab/View/DigOtherView',//其他玩家庄园界面
    UI_EQUIPINFO: 'Prefab/View/EquipInfoView',
    UI_SHOPVIEW: 'Prefab/View/ShopView',
    UI_MAILVIEW: 'Prefab/View/MailView',
    UI_GMVIEW: 'Prefab/View/GmView',
    UI_EQUIP_SMELTING_SELECT_VIEW: 'Prefab/View/EquipSmeltingSelectView',
    UI_FORGEVIEW: 'Prefab/View/ForgeView',
    UI_MAIL_DETAIL_VIEW: 'Prefab/View/MailSystemView',
    UI_GEM_UPGRADE_VIEW: 'Prefab/View/GemUpgreadeView',
    UI_BATTLEVIEW: 'Prefab/View/BattleView',
    UI_WORLDBOSSLIST: 'Prefab/View/WorldBossView',          //世界boss列表
    UI_WORLDBOSSFIGHT: 'Prefab/View/WorldBossFightView',    //世界boss战斗界面
    UI_WORLDBOSSRANKING: 'Prefab/View/WorldBossRankingtView',
    UI_DEFENBORDER: 'Prefab/View/DefenBorderMapView',
    UI_SEPTPKVIEW: 'Prefab/View/SeptPkMapView',
    UI_SEPTPKRECORD: 'Prefab/Node/SeptPkRecordNode',
    UI_DAILYTASKVIEW: 'Prefab/View/DailytasksView',      //每日任务界面
    UI_FAIRYVIEW: 'Prefab/View/FairyView',
    UI_FAIRYOBSERVEVIEW: 'Prefab/View/FairyObserveView',
    UI_FAIRY_ARRAYVIEW: 'Prefab/View/FairyArrayView',
    UI_FAIRY_CULTIVATEVIEW: 'Prefab/View/FairyCultivateView',
    UI_FAIRY_STARVIEW: 'Prefab/View/FairyStarView',
    UI_FAIRY_UPGRADEVIEW: 'Prefab/View/FairyUpgradeView',
    UI_FAIRY_SELECTVIEW: 'Prefab/View/FairySelectView',
    UI_FAIRY_SHOW: 'Prefab/Node/FairyShowNode',
    UI_FAIRY_PICTUREVIEW: 'Prefab/View/FairyPictureView',
    UI_REWARDPREVIEW: 'Prefab/Node/RewardNode',
    UI_REWARDPREVIEW: 'Prefab/View/RewardPreviewView',
    UI_REWARDLISTPREVIEW: 'Prefab/View/RewardListPreviewView',
    UI_REWARDSHOW: 'Prefab/View/RewardShowView',
    UI_LUCKYSTARSENDVIEW: 'Prefab/View/LuckyStarSendView',
    UI_LUCKYSTARPLAYERVIEW: 'Prefab/View/LuckyStarPlayerView',
    UI_LUCKYSTAROPENVIEW: 'Prefab/View/LuckyStarOpenView',
    UI_ESCORTSPARVIEW: 'Prefab/View/EscortSparView',     //护送水晶
    UI_ROBBINGSPARVIEW: 'Prefab/View/RobbingSparView',  //夺取水晶
    UI_BLESSVIEW: 'Prefab/View/BlessView',  //祝福界面
    UI_BLESSVIEW_TEMP: 'Prefab/View/BlessViewTemp',  //祝福界面
    UI_BLESSVIEW_CELL_NODE: 'Prefab/Node/BlessDescCellNodeTemp',  //祝福界面
    UI_SEPTMAINVIEW: 'Prefab/View/SeptMainView',    //工会主界面
    UI_SEPTJOINVIEW: 'Prefab/View/SeptJoinView',
    UI_SEPTRANKINGVIEW: 'Prefab/View/SeptRankingView',
    UI_SEPTMEMBERVIEW: 'Prefab/View/SeptMemberView',
    UI_SEPTINFORMATIONVIEW: 'Prefab/View/SeptInformationView',
    UI_SEPTAPPOINTVIEW: 'Prefab/View/SeptAppointView',
    UI_SEPTESCORTVIEW: 'Prefab/View/SeptEscortView',
    UI_OBSERVATIONPLAYER: 'Prefab/View/ObservationPlayerView',
    UI_CHATVIEW: 'Prefab/View/ChatView',

    UI_TIPVIP4VIEW: 'Prefab/Tip/Tipvip4View',
    UI_TIP_BT_FIRSTLOGIN_VIEW: 'Prefab/Tip/TipBTenterView',

    UI_AGGREGATIONVIEW: 'Prefab/View/AggregationView',//集结
    UI_FIRSTRECHARGEVIEW: 'Prefab/View/Activity_shouchongView',//首充
    UI_DAILYGIFTVIEW: 'Prefab/View/ActivitymeirilibaoView',//礼包
    UI_FIGHTRANKVIEW: 'Prefab/View/Activity_zhanliView',//战力榜

    UI_EQUIPADVANCEDVIEW: 'Prefab/View/EquipAdvancedView',//装备进阶

    //Node
    UI_ITEMTIPSNODE: 'Prefab/Node/ItemTipsNode',
    UI_EQUIPINLAYNODE: 'Prefab/Node/EquipInlayNode',
    UI_EQUIPINLAYSELNODE: 'Prefab/Node/EquipInlaySelNode',
    UI_USERPROERTYNODE: 'Prefab/Node/UserPropertyNode',
    UI_EQUIPSTARATTRIBUTENODE: 'Prefab/Node/EquipStarAttributeNode',
    UI_DIG_SETTING_NODE: 'Prefab/Node/DigSettingNode',//庄园种植界面
    UI_DIG_HARVEST_NODE: 'Prefab/Node/DigHarvestNode',//庄园收获界面
    UI_DIG_SELECT_NODE: 'Prefab/Node/DigSelectNode',//庄园可占领列表界面
    UI_DIG_OCCUPATION_NODE: 'Prefab/Node/DigOccupationNode',//庄园占领or夺回界面
    UI_DIG_CAPSUCC_NODE: 'Prefab/Node/DigCapSuccNode',//庄园占领成功界面
    UI_FAIRY_PROPERTY_NODE: 'Prefab/Node/FairyPropertyNode',
    UI_FIGHT_RESULT_EFFECT_NODE: 'Prefab/Node/FightResultEffectNode',//胜利界面
    UI_FIGHT_RESULT_LOSE_NODE: 'Prefab/Node/FightResultLoseNode',//失败界面
    UI_RANKING_LIST_NODE: 'Prefab/Node/RankingListNode',//排行榜界面
    UI_PERSONAL_SETTING_VIEW: 'Prefab/View/PersonalSettingsView',//个人信息设置界面
    UI_PERSONAL_TITLE_NODE: 'Prefab/Node/PersonalTitleNode',//个人称号设置界面
    UI_PERSONAL_TAG_NODE: 'Prefab/Node/PersonalTagNode',//个人标签设置界面
    UI_PERSONAL_YIMIN_NODE: 'Prefab/Node/PersonalYiMinNode',//个人移民界面
    UI_GYM_RECORD_NODE: 'Prefab/Node/GymJiLuNode',//竞技场记录界面
    UI_GYM_FIGHT_LIST_VIEW: 'Prefab/View/GymFightListView',//竞技场挑战，排行榜界面
    UI_GYM_ANIMATION_VIEW: 'Prefab/View/GymAnimationView',//竞技场pk表现界面
    UI_GYM_REWARD_VIEW: 'Prefab/View/GymRewardView',//竞技场排名奖励界面
    UI_WELFAREVIEW: 'Prefab/View/WelfareView',//试炼列表界面
    UI_TARGET_TASK_NODE: 'Prefab/Node/TargetTaskNode',//目标任务界面
    UI_SEPTCREATENODE: 'Prefab/Node/SeptCreateNode',
    UI_SEPTSEARCHNODE: 'Prefab/Node/SeptSearchNode',
    UI_SEPTINVITATIONNODE: 'Prefab/Node/SeptInvitationNode',
    UI_SEPTSETEVENTNODE: 'Prefab/Node/SeptSetEventNode',
    UI_SEPTCONDITIONNODE: 'Prefab/Node/SeptConditionNode',
    UI_NOTENOUGHNODE: 'Prefab/Node/NotEnoughNode',//道具不足界面
    UI_STONEXCHANGENODE: 'Prefab/Node/StonExchangeNode',//兑换界面
    UI_UPGRADESTARNODE: 'Prefab/Node/UpgradeStarNode',//道具升星
    UI_OFFLINEREPORTNODE: 'Prefab/Node/OfflineReportNode',  //离线报告
    UI_JIJIENODE: 'Prefab/Node/JijieNode',
    UI_FASTFIGHTNODE: 'Prefab/Node/FastFightNode',
    UI_TIPOTHERCHARVIEW: 'Prefab/Tip/TipOtherView',

    UI_SETUPNODE: 'Prefab/Node/SetUpNode',  //设置

    UI_DAILY_SIGN_VIEW: 'Prefab/View/DailySignView',//每日签到界面
    UI_DAILY_SIGN_SCROLL_NODE: 'Prefab/Node/DailySignScrollNode',//每日签到单位node
    UI_ACTIVITY_SEVEN_LOGIN_VIEW: 'Prefab/View/ActivitySevenLoginView',//七日登录


    UI_ACTIVITY_HOME_VIEW: 'Prefab/View/ActivityHomeView',//活动---总显示界面
    UI_ACTIVITY_HOME_SCROLL_NODE: 'Prefab/Node/ActivityHomeCellNode',//活动---单位node
    UI_ACTIVITY_HOME_SEVENWEAL_NODE: 'Prefab/Node/ActivityHome_SevenWeal_Node',//活动---七日福利
    UI_ACTIVITY_LEIJI_NODE: 'Prefab/Node/ActivityLeiJiNode',//活动---累计充值
    UI_ACTIVITY_XIANSHI_NODE: 'Prefab/Node/ActivityXianShiNode',//活动---限时奖励
    UI_ACTIVITY_JIJIN_NODE: 'Prefab/Node/ActivityJijinNode',//活动---成长基金
    UI_ACTIVITY_XIAOFEI_NODE: 'Prefab/Node/ActivityXiaoFeiNode',//活动---消费榜
    UI_ACTIVITY_MONTH_CARD_NODE: 'Prefab/Node/ActivityMonthCardNode',//活动---月卡
    UI_ACTIVITY_CDKEY: 'Prefab/Node/ActivityCdKeyNode',

    UI_VIP_RECHARGE_VIEW: 'Prefab/View/VIpRechargeView',//VIP特权，充值界面
    UI_VIP_RECHARGE_ITEM: 'Prefab/Node/VIpRechargeItemCellNode',//充值item
    UI_VIP_PRIVILEGE_ITEM: 'Prefab/Node/VIpRechargePrivilegeCellNode',//特权item
    UI_VIP_GIFT_ITEM: 'Prefab/Node/VIpRechargeGiftCell',//特权礼包item
    UI_RECHARGE_SHADE_NODE: 'Prefab/Node/RechargeShadeNode',//充值遮罩层

    UI_REWARD_SHARE_NODE: 'Prefab/Node/RewardShareNode',//分享界面
    UI_REWARD_COLLECT_NODE: 'Prefab/Node/RewardCollectNode',//收藏到桌面界面 qzone平台用

}

module.exports = UIName;