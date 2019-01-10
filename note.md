# NOTE--FirClient

## 1214

- 发送请求
```js
Game.NetWorkController.SendProto('msg.ReqDigPk', msg);
```

- 获取json数据
```js
Game.ConfigController.GetConfig(sheetname);
Game.ConfigController.GetConfigById(sheetname,id,idName);
```

- 获取玩家信息
```js
Game.UserModel.GetGold();//获取玩家金币
Game.UserModel.GetMoney();//获取玩家银币
Game.UserModel.GetUserMainInfo().fightval;//战力
```

- 道具信息
```js
Game.ItemModel.GetItemConfig(baseid);//获取道具信息（无论玩家是否拥有都可以获取到）
Game.ItemModel.GetItemNumById(baseid);//获取道具数量
Game.ItemModel.GetItemByBaseId(baseid);//获取玩家拥有的道具信息（只有玩家拥有才可以获取到）
```

- 监听和移除监听
```js
initNotification() {
    Game.NetWorkController.AddListener('msg.insufficientNotice', this, this.onInsufficientNotice);
    Game.NetWorkController.AddListener('msg.RefreshObject', this, this.onRefreshObject);
},
removeNotification() {
    Game.NetWorkController.RemoveListener('msg.insufficientNotice', this, this.onInsufficientNotice);
    Game.NetWorkController.RemoveListener('msg.RefreshObject', this, this.onRefreshObject);
},
```

- 打开界面
```js
//需要继承Game.Component
this.openView(Game.UIName.UI_SHOPVIEW, Game.Define.SHOPTAB.Tab_Currency);
this.gotoPage(Game.Define.MAINPAGESTATE.Page_Fight);
this.changeMainPage(Game.Define.MAINPAGESTATE.Page_Pass);
//直接打开
Game.ViewController.OpenView(Game.UIName.UI_DIGVIEW,"ViewLayer",data);
```

- 获取品质Icon
```
this.Sprite_quality.SetSprite(Game.ItemModel.GetItemQualityIcon(cfg.color));
```

- tableView
```
this.table_accept.initTableView(data.buyname.length,{ array: data.buyname, target: this });
```
- 单位转换
```
Game.Tools.UnitConvert(num);
```

- 充值
```
Game.Platform.RequestPay(id);
```

