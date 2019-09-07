// pages/appointment/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status_dict: {
      '1': '待生效',
      '2': '已生效',
      '3': '已失效',
      '4': '已取消'
    },
    image_url_pre: app.globalData.interfaces.get_image + '?url=',
    appointment_list: [],
    pageNum: 1
  },

  onPullDownRefresh: function () {
    
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var thisPage = this;
    var successCallBack = function (res) {
      thisPage.setData({
        "appointment_list": res.data.data.list
      });
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }
    this.setData({
      pageNum: 1
    });
    this.getAppointList(successCallBack);
  },

  onReachBottom: function () {
    var thisPage = this;
    wx.showLoading({
      title: '玩命加载中',
    })
    this.setData({
      pageNum: this.data.pageNum + 1
    });
    var successCallBack = function (res) {
      thisPage.setData({
        "appointment_list": thisPage.data.appointment_list.concat(res.data.data.list)
      });
      wx.hideLoading();
    }
    this.getAppointList(successCallBack);
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    this.getAppointList(function(res){
      thisPage.setData({
        appointment_list: res.data.data.list
      })
    })
    
  },

  getAppointList: function(successCallback){
    var thisPage = this;
    var third_session = wx.getStorageSync('third_session');
    wx.request({
      url: app.globalData.interfaces.my_appoint_list + '?pageNum=' + this.data.pageNum + '&third_session=' + third_session,
      success: function (res) {
        var code = res.data.code;
        if (code === 0){
          if (successCallback) {
            successCallback(res);
          }
        } else if (code === 10200 || code === 10201){
          //未登录或session过期
          app.wx_login(function(){
            getAppointList(successCallback);
          })
        }
      }
    })
  },

})