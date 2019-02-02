// // ScrollView_.js

// var ScrollView_ = cc.Class({
// 	extends: cc.ScrollView,
//     editor: CC_EDITOR && {
//         menu: 'i18n:MAIN_MENU.component.ui/ScrollView',
//         help: 'i18n:COMPONENT.help_url.scrollview',
//         executeInEditMode: false,
//     },

//     properties: {


//     	cacheNumber:0,

//     },

//     onLoad: function () {
//         window.s = this;
//         var self = this;
//         scrollview._scrollview.push(this);

//         //当销毁tableView的时候，回收cell
//         var destroy = this.node.destroy;
//         this.node.destroy = function () {
//             self.clear();
//             destroy.call(self.node);
//         }

//         var _onPreDestroy = this.node._onPreDestroy;
//         this.node._onPreDestroy = function () {
//             self.clear();
//             _onPreDestroy.call(self.node);
//         }


//     },
//     onDestroy: function () {
//         for (var key in scrollview._scrollview) {
//             if (scrollview._scrollview[key] === this) {
//                 scrollview._scrollview.splice(key);
//                 return;
//             }
//         }
//     },

//     setCacheNumber:function(number, cls){
//     	if(number <= 0){
//     		cc.log("You have to set number larger than zero");
//     		return;
//     	}

//     	this.cacheNumber = number;
//     	this.cacheData = {};
//     	for (var i = 0; i < this.cacheNumber; i++) {
//     		// Things[i]
    		
//     	}

//     },


// // 	self.cacheNumber = number
// // 	self.cacheData = {}
// // 	for i = 1, self.cacheNumber do
// //         local class = import(app.packageRoot .. ".ui." .. cls)
// //         local item = class.new()
// //         assert(not item.used, "Class object should remove used member")
// //         item.used = false
// //         item:setVisible(false)
// //         self.content:addChild(item)

// //         table.insert(self.buffer, item)
// //         self.itemContentSize = item:getContentSize()
// // 	end

// // 	return self.itemContentSize, self.buffer
// // end





// });
// scrollview._scrollview = [];