var ItemDefine = {
    //包裹类型定义
    PACKAGETYPE:
    {
        PACKAGE_EQUIP: 1,      //装备道具背包
        PACKAGE_USEREQUIP: 2,      //装备栏
        PACKAGE_COMMON: 3,      //通用道具包裹
        PACKAGE_PETEQUIP1: 4,      //佣兵1装备包裹(战士)
        PACKAGE_PETEQUIP2: 5,      //佣兵2装备包裹（法师
        PACKAGE_PETEQUIP3: 6,      //佣兵3装备包裹（猎人）
        PACKAGE_PETEQUIP4: 7,
        PACKAGE_PETEQUIP5: 8,
        PACKAGE_PETEQUIP6: 9,
        PACKAGE_MAX: 10,      //最大包裹，以后添加包裹需修改最大值
    },

    //道具类型定义
    ITEMTYPE:
    {
        ItemType_Normal: 1,//普通道具
        ItemType_Stone: 2,//宝石道具
        ItemType_Gift: 3,//礼包道具
        ItemType_God: 4,//神器道具
        ItemType_Quest: 5,//任务道具
        ItemType_Exp: 6,//神奇经验石
        ItemType_Hole: 7,//打孔道具
        ItemType_Key: 8,//钥匙道具
        ItemType_Pet: 9,//佣兵道具
        ItemType_Fuben: 10,//副本道具
        ItemType_Suit: 11,//套装道具
        ItemType_GiftBag: 12,//gift
        ItemType_JokeBox: 13,//jokebox
        ItemType_BossFight: 14,//Boss挑战卷
        ItemType_GodData: 15,//神器残片道具
        ItemType_HuoliDan: 16,//活力丹
        ItemType_StarStone: 17,//升星石道具
        ItemType_FameItem: 18,//声望道具
        ItemType_Huwei: 19,//护卫令
        ItemType_Flower: 20,//鲜花
        ItemType_QiYue: 21,//收花契约
        ItemType_LockGoldBag: 22,//锁住的金袋
        ItemType_ProtectGuard: 23,//护镖令
        ItemType_Miansiling: 24,//免死金牌
        ItemType_SongQiYue: 25,//送花契约
        ItemType_RedEnvelope: 26,   //红包
        ItemType_Envelope: 27,   // 信封
        ItemType_FlowerBox: 28,   // 花盒
        ItemType_Vip: 29, //vip道具
        ItemType_PetTicket: 31,//精灵召唤券
        ItemType_Knife: 101,//刀
        ItemType_KnifeAssistant: 102,//刀副手
        ItemType_Bow: 103,//弓
        ItemType_BowAssistant: 104,//弓副手
        ItemType_Stick: 105,//杖
        ItemType_StickAssistant: 106,//杖副手
        ItemType_Fan: 107,//扇
        ItemType_FanAssistant: 108,//扇副手
        ItemType_Wrister: 109,//护腕
        ItemType_Trousers: 110,//裤子
        ItemType_Shoes: 111,//鞋子
        ItemType_Helmet: 112,//头盔 
        ItemType_Necklace: 113,//项链
        ItemType_Clothes: 114,//衣服
        ItemType_Belt: 115,//腰带
        ItemType_Ring: 116,//戒指
        ItemType_PetWeapon: 119,//精灵武器
        ItemType_PetWrister: 120,//精灵护腕
        ItemType_PetTrousers: 121,//精灵护腿
        ItemType_PetShoes: 122,//精灵鞋子
        ItemType_PetHelmet: 123,//精灵头盔 
        ItemType_PetNecklace: 124,//精灵项链
        ItemType_PetClothes: 125,//精灵衣服
        ItemType_PetBelt: 126,//精灵腰带
        ItemType_PetRing: 127,//精灵戒指
        ItemType_PetWing1: 128,//精灵翅膀1
    },

    //道具颜色定义
    ITEMCOLOR:
    {
        Item_White: 1,      //白色
        Item_Green: 2,      //绿色
        Item_Blue: 3,       //蓝色
        Item_Purple: 4,     //紫色
        Item_Orange: 5,     //橙色
        Item_Red: 6,        //红色
        Item_Yellow: 7,        //黄色
    },

    //一级属性定义
    FOURPROP:
    {
        FourProp_Str: 1,//力量
        FourProp_dex: 2,//敏捷
        FourProp_men: 3,//智力
        FourProp_dur: 4,//耐力
    },
    ITEM_SPECIAL_PROP:
    {
        gold: "gold",
        silver: "silver",
        exp: "exp",
        honor: "honor",
        build: "build",
    },
    SPECIALITEM_TYPE: {
        TYPE_GOLD: 109,
        TYPE_MONEY: 108,
        TYPE_YUANBAO: 323,
        TYPE_HONOR: 282,
        TYPE_FAME: 282,
        TYPE_SMELT: 355,
        TYPE_EXP: 244,
        TYPE_TENDRAW: 473,
        TYPE_EQUIP: 486,
    },
    //神器类型定义
    NEWGODTYPE:
    {
        //武器
        NGod_Weapon_AttackAdd: 1,//攻击增加，提升攻击力n%
        //副手
        NGod_Assistant_StoneAdd: 2,//宝石属性百分比
        //护腕
        NGod_Wrister_CritUp: 3,//暴击值提升
        //裤子
        NGod_Trousers_MresisUp: 4,//魔抗提升
        //鞋子
        NGod_Shoe_DodgeUp: 5,//闪避提升，提高闪避值n%
        //头盔
        NGod_Helmet_Presis: 6,//物抗百分比
        //项链
        NGod_Necklace_StarSuitUp: 7,//主属性百分比
        //衣服
        NGod_Cloth_DefUp: 8,//护甲值百分比
        //腰带
        NGod_Belt_AddHp: 9,//生命提升
        //戒指
        NGod_Ring_MP_ADD: 10,//魔法值加成，提升魔法值%
    },
    STONE_TYPE: {
        TYPE_START: 1,
        TYPE_POWER: 1,
        TYPE_QUICK: 2,
        TYPE_INTELL: 3,
        TYPE_ENDURANCE: 4,
        TYPE_END: 5,
    }
}

module.exports = ItemDefine;