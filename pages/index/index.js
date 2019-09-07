var app = getApp();
Page({
  data: {
    "car_list": [],
    "shop_info": {},
    image_url_pre: app.globalData.interfaces.get_image + '?url=',
    shop_image: '',
    pageNum: 1

    
  },
  aa : function(){
    return this.data.image_url_pre;
  },

  showImage: function(){
    wx.previewImage({
      urls: [this.data.image_url_pre + this.data.shop_info.shopImage]
    });
  },

  onPullDownRefresh: function () {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;
    var successCallBack = function (res){
      that.setData({
        "car_list": res.data.data.list
      });
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }
    this.setData({
      pageNum: 1
    });
    this.getCarList(successCallBack);
  },

  onReachBottom: function () {
    var that = this;
    wx.showLoading({
      title: '玩命加载中',
    })
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    var successCallBack = function (res) {
      that.setData({
        "car_list": that.data.car_list.concat(res.data.data.list)
      });
      wx.hideLoading();
    }
    this.getCarList(successCallBack);
  },

  to_detail: function (event) {
    var car = event.currentTarget.dataset.car;
    wx.navigateTo({
      url: '../detail/index?carId=' + car.carId,
      success: function () { },
      fail: function () { },
      conplete: function () { }
    })
  },
  onLoad:function(){
    var that = this
    wx.request({
      url: app.globalData.interfaces.get_shop_info + '?appid=' + app.get_appid(),
      success: function (res) {
        var data = res.data.data;
        that.setData({
          "shop_info": data
        });
        wx.setNavigationBarTitle({
          title: data.shopName
        })
      }
    });
    this.getCarList(function (res){
      that.setData({
        "car_list": res.data.data.list
      });
    });
  },

  getCarList: function (successCallBack){
    var that = this
    wx.request({
      url: app.globalData.interfaces.car_list + '?pageNum=' + this.data.pageNum + '&appid=' + app.get_appid() ,
      success: function (res) {
        if (successCallBack){
          successCallBack(res)
        }
      }
    })
  },

  

  onReady: function () {
    

  }
  
})

