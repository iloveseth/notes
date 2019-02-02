// Mail.js
const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const Tools = require('../Util/Tools');
const Define = require('../Util/Define');
let NotificationController = require('../Controller/NotificationController');
let Item = require('./Item');
let ItemDefine = require('../Util/ItemDefine');

var MailModel = function () {
	this.mails = [];
}

MailModel.prototype.Init = function (cb) {
	NetWorkController.AddListener('msg.RetMailList', this, this.onRetMailList);
	NetWorkController.AddListener('msg.DelMail', this, this.onDelMail);
	NetWorkController.AddListener('msg.retMailRead', this, this.onRetMailRead);

	Tools.InvokeCallback(cb, null);
}
MailModel.prototype.Reload = function (cb) {
	this.mails = [];
	Tools.InvokeCallback(cb, null);
}


/**
 * 对外接口
 */
MailModel.prototype.GetMails = function () {
	return this.mails;
}
MailModel.prototype.GetMailById = function (id) {
	return _.find(this.mails, { id: id });
}

MailModel.prototype.GetMailsByType = function (type) {
	var mailList = _.filter(this.mails, function (o) {
		return o.mtype == type;
	});
	_.sortBy(mailList, function (o) {
		return o.state * 1000000000 + o.createtime;
	});
	return mailList;
}

MailModel.prototype.GetMailsRedDotByType = function (type) {
	if (this.mails) {
		for (var index in this.mails) {
			if (this.mails[index].mtype == type && this.CanMailGetReward(this.mails[index].id)) { // 未领取

				return true;
			}
		}
	}
	return false;
}

MailModel.prototype.GetmailsRedDot = function () {
	for (let i = 0; i < this.mails.length; i++) {
		let mail = this.mails[i];
		if (_.get(mail, 'itemgot', 0) == 1 || _.get(mail, 'state', 1) == Define.MAIL_STATE.MAIL_STATE_NEW) {
			return true;
		}
	}
	return false;
}

MailModel.prototype.GetCanRecieveMailIdsByType = function (type) {
	let mails = _.filter(this.mails, function (o) {
		if (o.state == 1) {
			return false;
		}
		if (o.mtype != type) {
			return false;
		}
		if (o.itemgot != 1) {
			return false;
		}
		return true;
	});
	return _.map(mails, 'id');
}

MailModel.prototype.GetMailsIdByType = function (type) {
	var mailList = [];
	if (this.mails) {
		for (var index in this.mails) {
			if (this.mails[index].mtype == type) {
				mailList.push(this.mails[index].id);
			}
		}
	}
	return mailList;
}
MailModel.prototype.CanMailGetReward = function (id) {
	let mail = this.GetMailById(id);
	return _.get(mail, 'itemgot', 0) == 1 || _.get(mail, 'state', 1) == Define.MAIL_STATE.MAIL_STATE_NEW;
}
MailModel.prototype.HasMailReward = function (id) {

	let mail = this.GetMailById(id);
	let got = _.get(mail, 'itemgot', 0)
	return got == 1 || got == 2;
}
MailModel.prototype.GenerateRewardById = function (id) {
	let ret = [];
	let mail = this.GetMailById(id);
	if (mail.money != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_MONEY), mail.money));
	}
	if (mail.gold != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_GOLD), mail.gold));
	}
	if (mail.fame != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_FAME), mail.fame));
	}
	if (mail.smelt != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_SMELT), mail.smelt));
	}
	if (mail.honor != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_HONOR), mail.honor));
	}
	if (mail.exp != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_EXP), mail.exp));
	}
	if (mail.yuanbao != 0) {
		ret.push(Item.GenerateObjectFromDefine(Item.GetItemConfig(ItemDefine.SPECIALITEM_TYPE.TYPE_YUANBAO), mail.yuanbao));
	}
	ret = _.concat(ret, _.get(mail, 'items', []));
	if (mail.objs) {
		for (var i = 0; i < mail.objs.length; i++) {
			var obj = {};
			obj.baseid = mail.objs[i].id;
			obj.num = mail.objs[i].num;
			ret.push(obj);
		}
	}
	return ret;
}
/**
 * 消息处理接口
 */
MailModel.prototype.onRetMailList = function (msgid, data) {
	// this.mails = data.mail;
	var allmail = data.mail
	for (let i = 0; i < allmail.length; i++) {
		let mail = allmail[i];
		let index = _.findIndex(this.mails, { id: mail.id });
		if (index == -1) {
			this.mails.push(mail);
		} else {
			this.mails[index] = mail;
		}
	}
	this.mails = _.sortBy(this.mails, function (o) {
		return o.state * 1000000000 + o.createtime;
	});
	NotificationController.Emit(Define.EVENT_KEY.MAIL_DETAIL_REFRESH);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

MailModel.prototype.onDelMail = function (msgid, data) {
	let ids = _.get(data, 'mailid', []);
	for (let i = 0; i < ids.length; i++) {
		let index = _.findIndex(this.mails, { id: ids[i] });
		if (index != -1) {
			this.mails.splice(index, 1);
		}
	}
	NotificationController.Emit(Define.EVENT_KEY.MAIL_DETAIL_REFRESH);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

MailModel.prototype.onRetMailRead = function (msgid, data) {
	for (var index in this.mails) {
		var mail = this.mails[index];
		if (_.get(mail, 'mtype', 0) == data.mailtype && _.get(mail, 'itemgot', 0) != 1) {
			this.mails[index].state = 1
		}
	}
	NotificationController.Emit(Define.EVENT_KEY.MAIL_DETAIL_REFRESH);
	NotificationController.Emit(Define.EVENT_KEY.UPDATE_MAINRED);
}

module.exports = new MailModel();