const UIName = require('./UIName');
var Define = {
    Regex: {
        url: '((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?',
        mail: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$',
    },
    EVENT_KEY: {
        TOUCH_END: 1,

        NEW_NOTICE: 10,

        ON_SHOWGAME: 100,
        CONNECT_TO_GATESERVER: 101,
        NET_OPEN: 102,
        NET_CLOSE: 103,
        MUSIC_CHANGE: 104,
        EFFECT_CHANGE: 105,
        REWARD_UPDATE: 106,
        RANDOMPLAYER_UPDATE: 107,
        FUNCTION_OPEN: 108,
        CLOSE_FIGHTSUCCESS: 109,

        TIP_TIPS: 301,
        EFFECT_CLOUDMASK: 302,
        TIP_CONFIRM: 303,
        TIP_WARNPOP: 304,
        TIP_POWERCHANGE: 305,
        TIP_LEVELUP: 306,
        FIRST_OPENFUNCTION: 307,
        UPDATE_MAINRED: 308,
        LOAD_OVER: 309,
        SELECT_SERVER_GET: 310,

        ROLE_CREATE: 400,
        ROLE_LOGINFINISH: 401,
        ROLE_CREATE_RANDOMNAME: 402,

        CHANGE_MAINPAGE: 500,
        STONE_LEVEL_UP: 501,
        RET_STONE_LUCKY: 502,
        FAIRY_RET_EAT_LIST: 503,
        FAIRY_RET_FIGHT_POS: 504,
        FAIRY_ATTRI_TRAIN_RESLUT: 505,
        RET_PET_MAIN_INFO: 506,
        FAIRY_REMOVE_PET: 507,
        CHAT_RET_CHAT_DATA_TO_USER: 508,
        CHAT_RET_CHAT_USER_ONLINE: 509,
        CHAT_CHANNEL_CHAT_USER_CMD: 510,
        CHAT_VIEW_CLOSE: 511,
        CHAT_VIEW_OPEN: 512,
        CHAT_VIEW_OPEN_PRIVATE: 513,
        CHAT_VIEW_ONTOUCH_CHAT: 514,
        CHAT_VIEW_CHAT_HIDE: 515,
        CHAT_VIEW_PRIVATE_RED_DOT: 516,
        UPDATE_FAIRYRED: 517,
        CHAT_VIEW_CLOSEATONCE: 518,


        MAIL_DETAIL_REFRESH: 700,

        TASK_INFO_REFRESH: 800,
        TASK_LUCKYSTAR_REFRESH: 801,
        ESCORTSPAR_INFO_REFRESH: 803,
        KINGTASK_REFRESH: 804,
        ROBBING_INFO_REFRESH: 805,
        BLESS_INFO_REFRESH: 806,
        ROBBINGSPAR_ICON_REFRESH: 807,
        ESCORTSPAR_ICON_REFRESH: 808,
        DIG_ICON_REFRESH: 809,
        JIJIE_ICON_REFRESH: 810,
        JIJIE_NUM_REFRESH: 811,
        JIJIE_LIST_REFRESH: 812,
        ROBBING_BTN_REFRESH: 813,

        SEPT_INFO_REFRESH: 900,
        SEPT_MEMBER_REFRESH: 901,
        SEPT_APPOINT_REFRESH: 902,
        SEPT_ESCORT_REFRESH: 903,

        LEVEL_REMOVEMONSTER: 1000,
        LEVEL_MONSTERANIMAEND: 1001,
        LEVEL_CHARACTERANIMAEND: 1002,
        LEVEL_CHARACTERHITFRAME: 1003,
        LEVEL_SORTUPDATE: 1004,
        LEVEL_COUNTUPDATE: 1005,
        LEVEL_DATAUPDATE: 1006,
        LEVEL_UPDATELEVEL: 1007,
        LEVEL_BEATBOSS: 1008,
        LEVEL_STARTFIGHT: 1009,
        LEVEL_REDUCEHP: 1010,
        LEVEL_ROLEDIE: 1011,
        LEVEL_FASTFIGHTUPDATE: 1012,
        LEVEL_ENEMIESUPDATE: 1013,

        SHOP_DATAUPDATE: 1100,
        SHOP_MONEYUPDATE: 1101,
        SHOP_FREETIMEUPDATE: 1102,
        SHOP_PARTCOUNTDOWNUPDATE: 1103,
        SHOP_LUCKDRAWRET: 1104,

        WORLDBOSS_UPDATE: 1200,
        WORLDBOSS_DAMAGERANKUPDATE: 1201,
        WORLDBOSS_HPUPDATE: 1202,
        WORLDBOSS_CANCLEATTACK: 1203,
        WORLDBOSS_DAMAGEUPDATE: 1204,
        WORLDBOSS_BOSSDIE: 1205,
        WORLDBOSS_CURBOSSINFO: 1206,
        WORLDBOSS_SETAUTOFIGHT: 1207,
        WORLDBOSS_CONFIRMATTACK: 1208,

        BATTLE_RED: 1209,
        BATTLE_PKRED: 1210,

        PK_REWARDUPDATE: 1300,
        SEPTPK_INFOUPDATE: 1301,
        SEPTPK_RECORDUPDATE: 1302,
        SEPTPK_FIGHTUPDATE: 1303,

        BORDER_TEAMLISTUPDATE: 1400,
        BORDER_MYTEAMDETAIL: 1401,
        BORDER_MYTEAMICON: 1401,
        BORDER_ENEMYUPDATE: 1402,
        BORDER_LEAVETEAM: 1403,

        GUIDE_START: 1500,
        GUIDE_END: 1501,
        GUIDE_UPDATE: 1502,
        DIALOGUE_START: 1503,
        TARGET_GUIDE_START: 1550,
        TARGET_GUIDE_END: 1551,
        TARGET_GUIDE_UPDATE: 1552,
        TARGET_FIGHT_BOSS: 1553,
        OPEN_VIEW_EVENT: 1554,

        HOTUPDATE_CHECK: 1601,
        HOTUPDATE_UPDATEFAILED: 1602,

        NATIVE_PAY_RESULT: 1701, //原生调回来的充值结果
        PAY_RESULT: 1702,
        TOKEN_LOGIN: 1703,
        SHARE_RESULT_EVENT: 1704,   //分享回调事件
        GET_SHARE_REWARD: 1705,      //获取分享奖励
        GET_COLLECT_REWARD: 1706,      //获取分享奖励
        COLLECT_RESULT_EVENT: 1707,   //收藏回调事件

        ITEM_REFRESH: 2001,
        OBJECTS_REFRESH: 2002,
        MAINDATA_REFRESH: 2003,
        USERINFO_REFRESH: 2004,
        USERBASEINFO_REFRESH: 2005,
        STRENGTH_REFRESH: 2006,
        LUCKNUM_REFRESH: 2007,
        GOLD_REFRESH: 2008,
        FIGHTVAL_REFRESH: 2009,
        FORGE_REFRESH: 2010,
        MONEY_REFRESH: 2011,
        ITEM_NOTIFY: 2013,

        DIG_RESET_VIEW: 4010,
        DIG_RET_ROBLIST: 4011,
        DIG_RET_ROBDIGINFO: 4012,
        GET_SEL_ITEM: 4002,
        GET_SEL_EQUIP: 4003,

        WELFARE_RET_DAY_GROW_LIST: 6010,
        WELFARE_SEND_SYS_REWARD: 6011,
        WELFARE_RET_DAY_GROW_ACC: 6012,

        ACTIVITY_SEVEN_LOGIN: 7001,
        ACTIVITY_CHANGE_ACT_TYPE: 7002,
        ACTIVITY_HOME_VIEW_REFRESH: 7003,
        ACTIVITY_CONSUME_SORT: 7004,
        ACTIVITY_CONSUME_INFO: 7005,

        

        ACTIVITY_JIJIN: 7014,
        ACTIVITY_HONGLI: 7015,
        ACTIVITY_CHAOJI: 7016,

        ACTIVITY_OPEN_YUEKA: 7010,

        VIP_RET_INFO: 9001,
        VIP_RET_INFO1: 9002,
        VIP_NOTIFY_VIP_EXP: 9003,

        RED_WELFARE: 10001,//试炼
        RED_TARGET: 10002,//目标任务
        RED_DAILY_SIGN: 10003,//每日签到
        RED_DIG: 10004,//庄园
        RED_SEVEN_LOGIN: 10005,//7日登陆
        RED_ACTIVITY: 10006,//活动
        RED_FIGHT_SORT: 10007,//冲榜

        EQUIP_CONTROL_SEL: 20001,   //装备界面选择操作
        EQUIP_DRESS_RED: 20002, //装备穿戴界面红点

    },
    DATA_KEY: {
        HISTORY_ACC: '1',
        DISABLE_MUSIC: '2',
        DISABLE_EFFECT: '3'
    },
    HEART_BEAT: {
        INTERVAL: 5,
        TIMEOUT: 30,
    },
    DEFAULT_SKE_SPEED: 0.7,//0.5,
    MONSTER_ANIMA_STATE: {
        ATTACK: 'attack',
        IDLE: 'idle',
        HURT: 'hurt',
        DIE: 'die',
    },
    CHARACTER_STATE: {
        IDLE: 'idle0',
        RUN: 'run0',
        SIT: 'sit',
        ATTACK: 'attack',
    },
    PET_STATE: {
        IDLE: 'idle',
        ATTACK: 'attack'
    },
    ANIMA_TYPE: {
        TTYPE_NONE: 0,
        TYPE_CC: 1,
        TYPE_DRAGONBONES: 2
    },
    DIRECTION_TYPE: {
        NORTH: 0,
        NORTHEAST: 1,
        EAST: 2,
        SOUTHEAST: 3,
        SOUTH: 4,
        NORTHWEST: 5,
        WEST: 6,
        SOUTHWEST: 7,
    },
    DIRECTION_ROTATION: {
        0: -90,
        1: -45,
        2: 0,
        3: 45,
        4: 90,
        5: -135,
        6: 180,
        7: 135
    },
    DIG_ROB_STATE: {
        DIG_ROB_NONE: 0,//可占领
        DIG_ROB_PROTECT: 1,//对方的矿在保护中 无法占领
        DIG_ROB_BE_CAPTURE: 2,//已经被占领了
    },
    DIG_PK_TYPE: {
        DIG_PK_CAPTURE: 1,//占领
        DIG_PK_ROB: 2,//掠夺
        DIG_PK_RECAPTURE: 3,//夺回
    },
    MSG_ID: {
        GameTimeTimerUserCmd: 258,
        UserGameTimeTimerUserCmd: 770,
        AccessCppGateCmd: 1012,
        stChannelChatUserCmd: 2001,
        stGmChatUserCmd: 2002,
        stServerChatUserCmd: 2003,
        stServerNotifyClient: 2004,
        stReqChatDataUserCmd: 2005,
        stRetChatDataUserCmd: 2006,
        stMessNotify: 2007,
        stUserVerifyVerCmd: 2008,
        stServerReturnLoginFailedCmd: 2009,
        stPasswdLoginUserCmd: 2010,
        stIphoneLoginUserCmd: 2011,
        stNeedCreateRole: 2012,
        stCreateNewRoleUserCmd: 2013,
        stBindAccount: 2014,
        stLoginFailNotice: 2015,
        stLoginKickReconnect: 2016,
        name: 2017,
        stProtoMessage: 2018,
        stProtoMessage_Lua: 2019,
        stDataCharacterMain: 2020,
        stTimeSyncUserCmd: 2021,
        stNotifyUserOnline: 2022,
        stGetRandomName: 2023,
        stRetRandomName: 2024,
        stChangeName: 2025,
        stRetChangeName: 2026,
        stNotifyClientHeartBeat: 2027,
        stNotifyClientOtherLogin: 2028,
        stCreateCharacter: 2029,
        stSelectCharacterInfo: 2030,
        stLoginSelect: 2031,
        stDeleteSelect: 2032,
        stCheckName: 2033,
        stReturnDeleteSelect: 2034,
        stLastLoginInfoSelect: 2035,
        stRoleCreatedSuccess: 2036,
    },
    MAIL_TYPE:                    //邮件分页类型
    {
        MAIL_TYPE_NORMAL: 1,    //普通邮件
        MAIL_TYPE_SYSTEM: 2,    //系统邮件
        MAIL_TYPE_FIGHT: 3,    //战斗邮件
        MAIL_TYPE_AWARD: 4,    //奖励邮件
    },
    MAIL_STATE: {                  //邮件状态
        MAIL_STATE_NEW: 0,    //未读邮件 
        MAIL_STATE_OPEN: 1,    //已读邮件
    },
    HOST: {
        WSPrefix: 'ws://',
        LoginHost: '192.168.30.203:46101',   //'210.73.214.72:7020' '192.168.30.206:7020'  LoginPort: 17002
        LoginSuffix: 'ws_handler',
        RegisteHost: 'http://192.168.30.206:18000/',     //'http://192.168.30.206:18000/'
    },
    EQUIP_SELECT_TYPE: {
        EQUIP_SELECT_CHANGE: 1,    //装备更换
        EQUIP_SELECT_SOUL: 2,       //灵魂升级
        EQUIP_SELECT_TRANSFERSOUL: 3,   //灵魂传承
    },
    MAINPAGESTATE: {
        Page_Pass: 1,                   //关卡
        Page_Main: 2,                   //主城
        Page_Equip: 3,                  //角色
        Page_Pet: 4,                    //精灵
        Page_Bag: 5,                    //包裹
        Page_Fight: 6,                  //战斗
    },
    //失败界面使用
    DEATH_TYPE: {
        DeathType_GuardRob: 1,          //劫镖
        DeathType_Bianjing: 2,          //边境pk
        DeathType_Recap_Mine: 3,        //矿点反占领
        DeathType_Recap_Guard: 4,       //反抢镖车
        DeathType_WBoss: 5,             //世界boss
        DeathType_DigPK: 6,             //挖宝pk
        DeathType_RewardPK: 7,          //复仇奖励
        DeathType_MapUserPK: 8,         //pk过图玩家
        DeathType_SeptBorderPK: 9,      //pk公会守边
        DeathType_CountryWarPK: 10,     //王国战争pk
        DeathType_SeptTreasurePK: 11,   //公会夺宝pk
        DeathType_UserTreasurePK: 12,   //个人宝藏pk
        DeathType_KingFightPK: 13,      //抢王战pk
        DeatnType_SeptPk: 14,           //公会战
        DeatnType_PVP: 15,           //竞技场
    },
    //胜利界面使用
    ENUMF_TYPE: {
        typeRobGuard: 1,                // 劫镖
        typeReRobGuard: 2,              // 劫镖反抢
        typeRevenge: 3,                 // 复仇
        typeReward: 4,                  // 悬赏
        typewboss: 5,                  //世界BOSS
        typedigpk: 6,                  //挖宝pk
        typeMappk: 7,                  //地图Pk
        typeBorder: 8,                  //边境pk
        typeSeptPk: 9,                  //家族战
        typeCountryPk: 10,              //国战pk
        typeKingPk: 11,                 //枪王pk
        typeSeptBorder: 12,             //公会守边
        typePvp: 13,                    //竞技场
    },
    LuckDrawType: {
        LuckDraw_chip: 1,//碎片抽奖
        LuckDraw_gold_once: 2,//金币抽奖一次
        LuckDraw_gold_ten: 3,//金币抽奖十次
        LuckDraw_gold_free: 4,//免费抽奖
        LuckDraw_chip_ten: 5,//碎片抽奖十次
        LuckDraw_item_one: 6,//道具抽奖
        LuckDraw_item_two: 7,//道具抽奖
        LuckDraw_item_three: 8,//道具抽奖
        LuckDraw_count_down: 9,//倒计时给的免费次数
        LuckDraw_free_ten: 10,//赠送免费10连抽
    },
    PRICE_TYPE: {
        DRAWONCE_PART: 1,
        DRAWTEN_PART: 5,
        DRAWONCE_GOLD: 2,
        DRAWTEN_GOLD: 3,
    },

    //排行榜
    ENUM_COMMON_SORT: {
        CommonSort_Zhanshi: 1,
        CommonSort_Fashi: 2,
        CommonSort_GongShou: 3,
        CommonSort_Fight: 4,                //今日战力
        CommonSort_Fight_Yesterday: 23,    // 昨日战力
        CommonSort_Level: 5,               //等级
        CommonSort_MAP: 6,                //推图
        CommonSort_KILL_TODAY: 7,        //今日杀人
        CommonSort_KILL_YESTERDAY: 8,    //昨日杀人

        CommonSort_SendflowerToday: 9,          //今日送花
        CommonSort_SendflowerYesterday: 10,     //昨日送花
        CommonSort_SendflowerHistory: 11,       //历史送花

        CommonSort_RecvflowerToday: 12,        //今日护花
        CommonSort_RecvflowerYesterday: 13,   //昨日护花
        CommonSort_RecvflowerHistory: 14,    //历史护花

        CommonSort_REWARD_KILL_TODAY: 15,   //今日恶人榜
        CommonSort_REWARD_KILL_YESTERDAY: 16,   //昨日恶人榜

        CommonSort_AssistCountToday: 17,   //今日助攻榜
        CommonSort_AssistCountYesterday: 18,   //昨日助攻榜

        CommonSort_ProtectGuard_Today: 19, //护镖今日榜
        CommonSort_ProtectGuard_Yesterday: 20, //护镖昨日榜

        CommonSort_RecvflowerTodaySept: 21,   //公会今日收花榜
        CommonSort_RecvflowerYesterdaySept: 22,   //公会昨日收花榜

        CommonSort_ActivityPointToday: 24,        // 今日活跃度
        CommonSort_ActivityPointYesterday: 25,    //昨日活跃度

        CommonSort_SendRedBagToday: 26,        //今日发红包
        CommonSort_SendRedBagYesterday: 27,    //昨日发红包

        CommonSort_ReceiveRedBagToday: 28,        //今日收红包
        CommonSort_ReceiveRedBagYesterday: 29,    //昨日收红包

        CommonSort_WishToday: 31,    //今日点赞榜 
        CommonSort_WishYestoday: 32,    //昨日点赞榜  

        CommonSort_MAX: 999,   //最大类型
    },
    TASK_TYPE: {
        TASK_CAPTURE: 2,
        TASK_ESCORT: 3,
        TASK_LUCK: 5,
    },
    CstoreItemType: {
        CStoreType_BANZHUAN: 2, //国家太庙
        CStoreType_YUNBIAO: 3, //国家运镖
    },
    BlessType: {
        BlessType_Guard: 0, // 运镖祝福
        BlessType_Dig1: 1, // 挖宝祝福
        BlessType_Dig2: 2,
        BlessType_Dig3: 3,
        BlessType_Dig4: 4,
        BlessType_Dig5: 5,
        BlessType_Dig6: 6,
        BlessType_PURSE: 7, // 钱袋祝福
        BlessType_Temple: 8,
        BlessType_TempleSelf: 9,
        BlessType_Citan: 10,
        BlessType_SeptManor: 11,   //公会庄园
        BlessType_Max: 12,
    },
    DayGrowStatus: {
        DayGrow_UNCOMPLETE: 0,//未完成
        DayGrow_UNGET: 1,//已完成，未领取
        DayGrow_GET: 2,//已领取
    },
    SHOPTAB: {
        Tab_Start: 0,
        // Tab_General: 0,
        Tab_NB: 0,
        Tab_Currency: 1,
        Tab_Pet: 2,
        Tab_End: 3
    },
    SEPTPOSITION: {
        SEPTNORMAL: 0,         //普通成员
        SEPTMASTER: 1,         //会长
        SEPTSECMASTER: 2,      //副会长
    },
    ActivityType: {
        LOGIN_ACTIVITY: 1,              //登陆奖励
        LIMIT_ACTIVITY: 2,        //限时奖励
        SEVEN_ACTIVITY: 3,        //7日福利 1
        INSURANCE_ACTIVITY: 4,        //成长基金
        CHONGZHI_ACTIVITY: 5,      //每日充值
        LEIJI_ACTIVITY: 6,         //累计充值 
        FIGTHBOX_ACTIVITY: 7,        //排行宝箱 1
        COSTSORT_ACTIVITY: 8,        //消费榜 2
        REDBAG_ACTIVITY: 9,        //充值福利
        TURNTABLE_ACTIVITY: 10,        //幸运转盘 2
        YUEKA_ACTIVITY: 11,        //月卡 1
        SMALLTREE_ACTIVITY: 12,    // 树苗 1
        SEVENNUM_ACTIVITY: 13,        //七日数字 1
        ROBFLOOR_ACTIVITY: 14,        //抢楼层
        //8个活动
        GUARD_ACTIVITY: 16,            //护送水晶
        CAPTURECRYSTAL_ACTIVITY: 17,   //夺取水晶
        COLLECTINFO_ACTIVITY: 18,   //收集情报
        JJC_ACTIVITY: 19,           //竞技场
        TEAMBORDER_ACTIVITY: 20,    //组队守边
        SEPTBORDER_ACTIVITY: 21,    //工会守边
        SEPTGUARD_ACTIVITY: 22,     //工会护送水晶
        WORLDBOSS_ACTIVITY: 23,    //世界boss
        FIRSTRECHARGE_ACTIVITY: 24, //首充
        DAILYGIFT_ACTIVITY: 25,     //礼包
        FIGHTRANK_ACTIVITY: 26,     //战力榜
        CDKEY_ACTIVITY: 27,         //兑换码
    },
    RedNotice: {
        RN_SEPTBORDER: 1,          //公会守边
        RN_SEPTTREASURE: 2,        //家长宝藏
        RN_SEPTGUARD: 3,           //公会护送晶石开始
        RN_SEPTGUARDFINISH: 4,     //公会护送晶石结束
        RN_COUNTRYWAR: 5,          //王国战争
        RN_SHOPREFRESH: 6,         //商店刷新
        RN_PERSONTRAIN: 7,         //个人成就试炼
        RN_KINGFIGHT: 8,           //抢王
        RN_PRIVATECHAT: 9,         //个人聊天
        RN_DAYSIGN: 10,            //每日签到
        RN_DAYTRAIN: 11,           //每日试炼
        RN_DIG: 12,                //挖宝红点
        RN_LOGINACT: 13,           //登陆活动
        RN_LIMITACT: 14,           //限量活动
        RN_FIGHTSORTACT: 15,       //战力活动
        RN_UNFINISHTASK: 16,       //任务红点
        RN_BORDERTEAM: 17,         //守卫边疆
        RN_PERSONALTREASURE: 18,   //个人宝藏
        RN_FIGHTSORT: 19,          //战力排行
        RN_FIRSTCHARGE: 20,        //首冲
        RN_DAYCHARGE: 21,          //每日充值
        RN_TOTALCHARGE: 22,        //累计充值
        RN_SEPTPK: 23,          //公会pk
        RN_COSTSORT: 24,          //消费榜
        RN_TREEPLANTAWARD: 25,     //红点奖励
        RN_MONTHCARD: 26,          // 月卡
        RN_TURNTABLE: 27,          //转盘
        RN_HONGLI: 28,          //红立
        RN_TURNDIGITAL: 29,          //七日数字
        RN_PVP: 30,               //pvp红点
        RN_NEWEIGHTACTIVITY1: 31,
        RN_NEWEIGHTACTIVITY2: 32,
        RN_NEWEIGHTACTIVITY3: 33,
        RN_NEWEIGHTACTIVITY4: 34,
        RN_NEWEIGHTACTIVITY5: 35,
        RN_NEWEIGHTACTIVITY6: 36,
        RN_NEWEIGHTACTIVITY7: 37,
        RN_NEWEIGHTACTIVITY8: 38,

        RN_SEPT_MANOR: 39,
        RN_FREE_SPRITE: 40,
        RN_PET_TWO: 41,        //精灵第一个孔
        RN_PET_THREE: 42,      //精灵第二个孔
        RN_PET_FOUR: 43,        //精灵第3个孔
        RN_PET_FIVE: 44,      //精灵第4个孔
        RN_PET_SIX: 45,        //精灵第5个孔
        RN_PET_TRAIN: 46,          //精灵培养红点
        RN_CHARGE_RED: 47,          //精灵培养红点
    },


    NotifyType:
    {
        INFO_TYPE_NORMAL: 0,	            //服务器通用提示
        INFO_TYPE_GAME: 1,	                //服务器公告信息（绿色）
        INFO_TYPE_FAIL: 2,	                //服务器失败提示信息（红色）
        INFO_TYPE_GM: 3,	                //公告
        INFO_TYPE_MSG: 4,                   //弹出框提示
        INFO_TYPE_USER: 5,	                //玩家弹幕
        INFO_TYPE_TEMPLE: 6,	            //太庙提示
        INFO_TYPE_CITAN: 7,	                //刺探提示
        INFO_TYPE_BORDERWORLD: 8,	        //边境提示世界
        INFO_TYPE_BORDERPERSON: 9,	        //边境提示个人
        INFO_TYPE_EQUIP_WHITE: 10,	        //装备提示
        INFO_TYPE_EQUIP_BLUE: 11,
        INFO_TYPE_EQUIP_YELLOW: 12,
        INFO_TYPE_EQUIP_GREEN: 13,
        INFO_TYPE_EQUIP_PURPLE: 14,
        INFO_TYPE_ITEM_ADD: 15,	            //道具提示获得
        INFO_TYPE_ITEM_REMOVE: 16,	        //道具提示扣除
        INFO_TYPE_RUNHORSELAMP_SYS: 17,	    //魂魄石类型
        INFO_TYPE_SENDFLOWER: 18,           //送花公告
        INFO_TYPE_15X: 19,	                //15X公告
        INFO_TYPE_KILLER: 20,	            //杀人榜公告
        INFO_TYPE_NO_EFFECT: 21,	        //荣誉公告无特效
        INFO_TYPE_EQUIPOVERTOP: 22,         //装备超出
    },
    Enum_enumChatType: {
        CHAT_TYPE_ALL: 0,          // 综合频道，仅客户端使用
        CHAT_TYPE_PRIVATE: 1,     //私聊频道
        CHAT_TYPE_SEPT: 2,             //公会频道
        CHAT_TYPE_WORLD: 3,                //世界频道
        CHAT_TYPE_COUNTRY: 4,      //国家频道
        CHAT_TYPE_SYSTEM: 5,               //系统频道
        CHAT_TYPE_BLESS: 6,                //祝福频道
        CHAT_TYPE_TEAM: 7,                 //组队频道
        CHAT_TYPE_FRIEND_ENEMY: 8,   //好友仇人(客户端频道)
    },
    Enum_Titles: {
        //国家，1-5
        TITLE_GUOWANG: 1,
        TITLE_YUANSHUAI: 2,
        TITLE_ZAIXIANG: 3,
        TITLE_BUTOU: 4,
        TITLE_DAFU: 5,
        TITLE_QUEEN: 6,
        TITLE_COUNTRY_MAX: 7,
        //公会， 11-15 
        TITLE_SEPT_MIN: 10,
        TITLE_ZUZHANG: 11,
        TITLE_FUZUZHANG: 12,
        TITLE_FUREN: 13,
        TITLE_ZUHUA: 14,
        TITLE_TASKMGR: 15,
        TITLE_BANZHUAN: 16,
        TITLE_CITAN: 17,
        TITLE_BIAOCHE: 18,
        TITLE_SEPT_MAX: 19,
        TITLE_SEPT_ALL: 20,       //退出公会或被踢时使用，删除所有公会称号
        //任务称号，21-24
        TITLE_HUGUO: 21,

        //鲜花榜
        TITLE_ZHENGTUBABY: 25,   //征途宝贝
        TITLE_RENQIBABY: 26,       //人气宝贝
        TITLE_MEILIBABY: 27,       //魅力宝贝
        TITLE_XIANHUABABY: 28,   //鲜花宝贝
        TITLE_TASK_MAX: 29,



        //护花榜
        TITLE_HUHUAHERO: 40, //护花英雄
        TITLE_HUHUAKNIGHT: 41,//护花骑士
        TITLE_HUHUAMAN: 42,//护花使者

        //等级任务
        TITLE_JIANGHUXIAOXIA: 43,
        TITLE_WULINGXINXIU: 44,
        TITLE_WULINGGAOSHOU: 45,
        TITLE_JIANGHUMINSHI: 46,
        TITLE_JUEDINGGAOSHOU: 47,
        TITLE_MINGMANTIANXIA: 48,
        TITLE_GAISHIWUDI: 49,
        TITLE_DUGUQIUBAI: 50,

        TITLE_ZUCAO: 55,
        TITLE_LAODAO: 56,

    },
    Enum_SysChatType: {
        SYS_CHAT_JIJIE: 1,    //集结系统聊天
        SYS_CHAT_BLESS: 2,    //祝福
        SYS_CHAT_LABA: 3,    //小喇叭
        SYS_CHAT_GUARD: 4,    //公会护送晶石
        SYS_CHAT_BORDER: 5,    //公会守边
        SYS_CHAT_CREATESEPT: 6, //建立公会
        SYS_CHAT_TREASURE: 7,  //召集公会夺宝
        SYS_CHAT_REWARD: 8,    //悬赏
        SYS_CHAT_ASSIST: 9,    //助攻
        SYS_CHAT_PROTECTGUARD: 10, //护镖
        SYS_CHAT_FLOWER: 11,   //收花契约
        SYS_CHAT_HAND: 12,   //送花契约
        SYS_CHAT_REDENVELOPE: 13,//红包
        SYS_CHAT_GUARDJIJIE: 14,//镖车反抢集结
        SYS_CHAT_MISHU: 15,   //小秘书
        SYS_CHAT_FANGYAN: 16, // 方言
        SYS_CHAT_SPYASSIST: 17,//刺探换色
        SYS_CHAT_SHOWUP: 18,//刺探换色
        SYS_CHAT_USERTREASURE: 19, //个人宝藏
        SYS_CHAT_BORDERTEAM: 20, //组队守边
        SYS_CHAT_SEPTMANOR: 21, //工会庄园
        SYS_CHAT_SEPTNORMAL: 22,
    },

    SEPTGUARD_STATE: {
        SEPTGUARD_NONE: 0,        //家族镖零状态
        SEPTGUARD_JIJIE: 1,        //集结状态
        SEPTGUARD_START: 2,        //开始状态
        SEPTGUARD_FINISH: 3,       //结束状态
    },
    FUNCTION_TYPE: {
        TYPE_ARENA: 1,                  //竞技场
        TYPE_BORDER: 2,                 //边境
        TYPE_SPY: 3,                    //刺探
        TYPE_TEMPLE: 4,                 //太庙
        TYPE_ESCORTSPAR: 5,             //运镖
        TYPE_MAZE: 6,                   //迷宫
        TYPE_SEPT: 7,                   //公会
        TYPE_WAR: 8,                    //战争
        TYPE_NBSHOP: 9,                 //高级杂货
        TYPE_NATIONALPOLICY: 10,        //国政
        TYPE_RANK: 11,                  //排行榜
        TYPE_SKILL: 12,                 //技能
        TYPE_DIG: 13,                   //庄园
        TYPE_ESCORT: 14,                //护卫
        TYPE_TASK: 15,                  //任务
        TYPE_PK: 16,                    //pk
        TYPE_FORGE: 17,                 //铁匠铺
        TYPE_CREATESEPT: 18,            //创建工会
        TYPE_JOINSEPT: 19,              //加入工会
        TYPE_WELFARE: 20,               //福利
        TYPE_SEPTACTIVITY: 21,          //工会活跃度 
        TYPE_SEPTPK: 22,                //工会pk
        TYPE_SEPTROB: 23,               //工会掠夺
        TYPE_ASSEMBLE: 24,              //集结
        TYPE_SEPTESCORT: 25,            //工会护送
        TYPE_SEPTBOSS: 26,              //工会boss
        TYPE_PKROB: 27,                 //pk个人掠夺
        TYPE_ROBDART: 28,               //个人截镖
        TYPE_SEPTBORDER: 29,            //公会守边
        TYPE_PKBORDER: 30,              //pk个人守边
        TYPE_TURNBATCH: 31,             //换一批
        TYPE_SEPTONEPIECE: 32,          //工会宝藏
        TYPE_WORLDBOSS: 33,             //世界boss
        TYPE_GUESS: 34,                 //竞猜
        TYPE_PASSWEAK: 35,              //过图虚弱
        TYPE_CAPTUREMINE: 36,           //占矿
        TYPE_BLESS: 37,                 //祝福
        TYPE_STRENGTH: 38,              //强化
        TYPE_SKILL2: 39,                //技能
        TYPE_STARUP: 40,                //升星
        TYPE_GEM: 41,                   //宝石
        TYPE_SOUL: 42,                  //灵魂
        TYPE_EXTEND: 43,                //继承
        TYPE_EXCHANGE: 44,              //更换
        TYPE_SELL: 45,                  //贩卖
        TYPE_MELTING: 46,               //熔炼
        TYPE_ONEPIECE: 47,              //个人宝藏
        TYPE_HANGUPPK: 48,              //挂机pk
        TYPE_COMPETITION: 49,           //比拼
        TYPE_SEPTWAR: 50,               //公会战
        TYPE_FIRSTFAIRY: 51,            //精灵
        TYPE_SECONDFAIRY: 52,           //第二精灵
        TYPE_THIRDFAIRY: 53,            //第三精灵
        TYPE_PASSSKILL: 54,             //过图技能
        TYPE_FAIRYSLOT: 55,             //精灵槽
        TYPE_FOURTHFAIRY: 56,           //第四精灵
        TYPE_FIFTHFAIRY: 57,            //第五精灵
        TYPE_SIXTHFAIRY: 58,            //第六精灵
        TYPE_BAG: 59,                   //包裹
        TYPE_EQUIPADVANCE: 60,          //装备进阶
        TYPE_EQUIPCHANGE: 61,           //装备更换
        TYPE_EQUIPSUIT: 62,             //装备星套
        TYPE_FAIRYCULTURE: 63,          //精灵培养
        TYPE_FAIRYLVUP: 64,             //精灵升级
        TYPE_FAIRYSTARLVUP: 65,         //精灵星级提升
        TYPE_EQUIP: 66,                 //角色
        TYPE_FORGE: 67,                 //铁匠铺
        TYPE_FORGESOUL: 68,             //灵魂打造
        TYPE_BATCHMELTING: 69,          //批量熔炼
        TYPE_EQUIPSTRENGTHEN: 70,       //装备强化
        TYPE_AUTOPASS: 72,              //自动推图
        TYPE_MAINPAGE: 75,              //主城
        TYPE_AUTOPICK: 76,              //自动拾取
    },
    BORDERTEAM_STATE: {
        STATE_TEAMING: 1,
        STATE_FIGHTING: 2,
    },

    //通用红点机制
    RedNotice: {
        RN_SEPTBORDER: 1,          //家族守边
        RN_SEPTTREASURE: 2,        //家长宝藏
        RN_SEPTGUARD: 3,           //家族运镖开始
        RN_SEPTGUARDFINISH: 4,     //家族运镖结束
        RN_COUNTRYWAR: 5,          //国战
        RN_SHOPREFRESH: 6,         //商店刷新
        RN_PERSONTRAIN: 7,         //个人成就试炼
        RN_KINGFIGHT: 8,           //抢王
        RN_PRIVATECHAT: 9,         //个人聊天
        RN_DAYSIGN: 10,            //每日签到
        RN_DAYTRAIN: 11,           //每日试炼
        RN_DIG: 12,                //挖宝红点
        RN_LOGINACT: 13,           //登陆活动
        RN_LIMITACT: 14,           //限量活动
        RN_FIGHTSORTACT: 15,       //战力榜活动
        RN_UNFINISHTASK: 16,       //未完成的任务
        RN_BORDERTEAM: 17,         //守卫边疆
        RN_PERSONALTREASURE: 18,   //个人宝藏
        RN_FIGHTSORT: 19,          //战力排行
        RN_FIRSTCHARGE: 20,        //首冲
        RN_DAYCHARGE: 21,          //每日充值
        RN_TOTALCHARGE: 22,        //累计充值
        RN_SEPTPK: 23,             //家族pk
        RN_CONSUME: 24,            //消费榜红点
        RN_TREEPLANTAWARD: 25,     //红点奖励
        RN_MONTHCARD: 26,          //月卡
        RN_TURNTABLE: 27,          //转盘红点
        RN_HONGLI: 28,             //红利
        RN_TURNDIGITAL: 29,        //7日转数字
        RN_PVP: 30,				//pvp红点
        RN_NEWEIGHTACTIVITY1: 31,   //护送水晶
        RN_NEWEIGHTACTIVITY2: 32,   //夺取水晶
        RN_NEWEIGHTACTIVITY3: 33,   //收集情报
        RN_NEWEIGHTACTIVITY4: 34,   //竞技场
        RN_NEWEIGHTACTIVITY5: 35,   //组队守边
        RN_NEWEIGHTACTIVITY6: 36,   //公会守边
        RN_NEWEIGHTACTIVITY7: 37,   //公会护送水晶
        RN_NEWEIGHTACTIVITY8: 38,   //世界boss
        RN_SEPT_MANOR: 39,         //公会庄园
        RN_FREE_SPRITE: 40,        //免费抽奖
        RN_PET_TWO: 41,            //精灵第二个孔
        RN_PET_THREE: 42,         //精灵第三个孔
        RN_PET_FOUR: 43,
        RN_PET_FIVE: 44,
        RN_PET_SIX: 45,
        RN_PET_TRAIN: 46,          //精灵培养红点
        RN_CHARGE_RED: 47,         //充值福利红点
    },
    Unlock_Type: {
        TYPE_ARENA: 1,               //竞技场
        TYPE_CAPTURE_SPAR: 4,        //夺取晶石
        TYPE_ESCORT_SPAR: 5,         //护送晶石
        TYPE_SEPT: 7,                //公会
        TYPE_SHOP: 9,                //杂货铺
        TYPE_RANK: 11,               //排行榜
        TYPE_DIG: 13,                //庄园
        TYPE_FAIRY: 14,              //精灵
        TYPE_TASK: 15,               //任务
        TYPE_FIGHT: 16,              //战斗
        TYPE_FORGE: 17,              //铁匠铺
        TYPE_CREATE_SEPT: 18,        //创建公会
        TYPE_JOIN_SEPT: 19,          //加入公会
        TYPE_ASSEMBLE: 24,           //集结
        TYPE_SEPT_GUARD: 25,         //公会护送
        TYPE_WORLD_BOSS: 33,         //世界BOSS
        TYPE_CAPTU_REMINE: 36,       //占矿开启
        TYPE_CHAT_BLESS: 37,         //祝福频道
        TYPE_EQUIP_STRENGTH: 38,     //装备强化
        TYPE_EQUIP_STAR: 40,         //装备升星
        TYPE_EQUIP_GEM: 41,          //装备宝石
        TYPE_EQUIP_SOUL: 42,         //装备灵魂
        TYPE_EXCHANGE: 44,           //更换
        TYPE_SMELT: 46,              //单件熔炼
        TYPE_SEPTWAR: 50,            //公会战
        TYPE_FAIYR1: 51,             //第1精灵
        TYPE_FAIYR2: 52,             //第2精灵
        TYPE_FAIYR3: 53,             //第3精灵
        TYPE_FAIYR4: 56,             //第4精灵
        TYPE_FAIYR5: 57,             //第5精灵
        TYPE_FAIYR6: 58,             //第6精灵
        TYPE_PACKAGE: 59,            //包裹
        TYPE_EQUIPADVANCE: 60,       //装备进阶
        TYPE_EQUIP_CHANGE: 61,       //装备更换
        TYPE_EQUIP_SUIT: 62,         //装备星套
        TYPE_FAIRY_CULTURE: 63,      //精灵培养
        TYPE_FAIRY_UPGRADE: 64,      //精灵升级
        TYPE_FAIRY_STAR: 65,         //精灵星级提升
        TYPE_USER: 66,               //角色
        TYPE_GOTO_FORGE: 67,         //前往铁匠铺
        TYPE_SOUL_BUILD: 68,         //灵魂打造
        TYPE_BATCH_SMELT: 72,        //批量熔炼
    },
    MINE_NAMECOLOR: '#FFF9E6',
    MINE_NAMEOUTLINE: '#47260F',

    Channel_Type: { //渠道类型
        Default: 0, //默认渠道（包括内网调试，外网测试）
        DianYou: 1, //典游 ios萝莉挂机大作战 默认
        Qzone_NotIos: 2, //玩吧qzone -安卓 wp 等非ios渠道
        Qzone_Ios: 3, //玩吧qzone -ios
        Common_Android: 4, //典游安卓
        DianYou_Ios_GaungMing: 5, //典游 马甲 ios 光明萝莉大作战
        Quick_Ios: 6,
    },
    BorderStatus: {
        Status_Pedding: 1,
        Status_Waitting: 2,
        Status_Fighting: 3,
    },
    EquipPageType: {
        equip: 1,    //装备
        strong: 2,    //强化
        star: 3,    //升星
        gem: 4,    //宝石
        soul: 5,    //灵魂
    },
    RunSpeed: 180,

    TD_EVENT: {
        EventRegistered: 'EventRegistered',                   // 注册用户数 {success:true}   注册在sdk层          
        EventCreateRole: 'EventCreateRole',                   // 创角用户数 {success:true}
        EventLogin: 'EventLogin',                             // 登录用户数 {success:true} 
        EventLeaveGame: 'EventLeaveGame',                     // 登出游戏
        EventPay: 'EventPay',                                 // 充值 {times:1}
        EventPaySuccess: 'EventPaySuccess',                   // 充值 {times:1}          
        // EventPayMoney:'EventPayMoney',                       // 充值总额   {times:1}
        EventConsume: 'EventConsume',                         // 消费用户数 {times:1}
        EventConsumeMoney: 'EventConsumeMoney',               // 消费总额   {times:1}
        // 充值钻石消费总额
        // 赠送钻石消费总额
        // 消费用户数
        // 充值用户数
        // 用户充值总额
        // 充值用户人数
        // 充值用户充值总额


        EventFairyTen: 'EventFairyTen',                         // 精灵十连抽         {gold:消费钻石,times:次数,userid:角色id}
        EventExchangGold: 'EventExchangGold',                   // 货币兑换           {gold:消费钻石,times:次数,userid:角色id}
        EventGroceriesBuy: 'EventGroceriesBuy',                 // 高级杂货购买        {gold:消费钻石,times:次数,userid:角色id}
        EventGroceriesRefresh: 'EventGroceriesRefresh',         // 高级杂货刷新        {gold:消费钻石,times:次数,userid:角色id}
        EventLuckyStar: 'EventLuckyStar',                       // 发送幸运星          {gold:消费钻石,times:次数,userid:角色id}
        EventArenaBuy: 'EventArenaBuy',                         // 竞技场购买次数      {gold:消费钻石,times:次数,userid:角色id}
        EventSparAwardRefresh: 'EventSparAwardRefresh',         // 晶石护送奖励刷新    {gold:消费钻石,times:次数,userid:角色id}
        EventFastFightBuy: 'EventFastFightBuy',                 // 购买快速战斗        {gold:消费钻石,times:次数,userid:角色id}
        EventFastKeyBuy: 'EventFastKeyBuy',                     // 快捷购买钥匙        {gold:消费钻石,times:次数,userid:角色id}
        EventFastSparBuy: 'EventFastSparBuy',                   // 快捷购买晶石        {gold:消费钻石,times:次数,userid:角色id}    
        EventFastGemBuy: 'EventFastGemBuy',                     // 快捷购买宝石        {gold:消费钻石,times:次数,userid:角色id} 

        EventPlayerLevel: 'EventPlayerLevel',                    // 等级停留统计        {level:玩家等级,userid:角色id}
        EventPlayerVip: 'EventPlayerVip',                        // VIP用户统计         {vip:玩家vip等级,userid:角色id}  
        EventPlayerMap: 'EventPlayerMap',                        // 关卡流失用户数量统计 {mapid:玩家关卡,userid:角色id}
    },
}

module.exports = Define;

//pbjs -t static-module -w commonjs -o ./ProtoMsg.js  *.proto