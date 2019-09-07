// pages/mine/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex_dict: {
      '1': '先生',
      '2': '女士'
    },
    user: {},
    showModalStatus:false,
    validateMsg: ''
  },

  sexCahnge: function(e){
    this.setData({
      'user.sex': e.detail.value
    });
    this.bscardFormvalidate('sex');
  },
  inputUsername: function(e){
    this.setData({
      'user.username': e.detail.value
    });
    this.bscardFormvalidate('username');
  },

  inputPhone: function (e) {
    this.setData({
      'user.phone': e.detail.value
    });
    this.bscardFormvalidate('phone');
  },

  updateBusinessCard: function(e){
    if (!this.bscardFormvalidate()){return false}
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalStatus: cos });
    });//关闭弹窗
    var third_session = wx.getStorageSync('third_session');
    wx.request({
      method: 'post',
      url: app.globalData.interfaces.update_business_card + '?third_session=' + third_session + '&appid=' + app.get_appid(),
      data: this.data.user,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.showToast({ title: '操作成功', icon: 'succes', duration: 1000, mask: true });
      }
    })
  },

  bscardFormvalidate: function(field){
    var that = this;
    var setValidateMsg = function (msg) { 
      that.setData({
        validateMsg: msg
      })
    }
    var user = this.data.user;
    if (!user.username || app.isEmptyStr(user.username)){
      if (!field || field === 'username'){
        setValidateMsg('用户名不能为空')
      }else{
        setValidateMsg('')
      }
    } else if (!new RegExp('^[a-zA-Z0-9_\u4E00-\u9FA5-]{1,16}$').test(user.username)){
      if (!field || field === 'username') {
        setValidateMsg('用户名不能有特殊字符，1-16位')
      } else {
        setValidateMsg('')
      }
    } else if (!user.sex){
      if (!field || field === 'sex') {
        setValidateMsg('请选择性别')
      } else {
        setValidateMsg('')
      }
    }else if ((!user.phone || app.isEmptyStr(user.phone))){
      if (!field || field === 'phone') {
        setValidateMsg('手机号不能为空')
      } else {
        setValidateMsg('')
      }
    } else if (!new RegExp('^[1][3,4,5,7,8][0-9]{9}$').test(user.phone)){
      if (!field || field === 'phone') {
        setValidateMsg('请输入正确的手机号')
      } else {
        setValidateMsg('')
      }
    }else{
      setValidateMsg('')
      return true;
    }
    
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    
    wx.getUserInfo({
      success: function (res) {
        thisPage.setData({
          userInfo: res.userInfo
        })
      }
    });
    var third_session = wx.getStorageSync('third_session');
    wx.request({
      url: app.globalData.interfaces.my_business_card + '?third_session=' + third_session,
      success: function (res) {
        if (res.data.code === 0 && res.data.data){
          thisPage.setData({
            user: res.data.data
          })
        }
        
      }
    })
  },

  //我的预约列表跳转
  toMyAppointment:function(){
    wx.navigateTo({
      url: '../appointment/index',
      success: function () { },
      fail: function () { },
      conplete: function () { }
    })
  },

  //小程序定制页面跳转
  toCustomized:function(){
    wx.navigateTo({
      url: '../customized/index',
      success: function () { },
      fail: function () { },
      conplete: function () { }
    })
  },
  powerDrawer: function(e){
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalStatus: cos });
    });
  },
  editBusinessCard: function(e){
    this.setData({
      validateMsg: ''
    })
    this.powerDrawer(e);
  },

  onPullDownRefresh: function () {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    var that = this;

    var third_session = wx.getStorageSync('third_session');
    wx.request({
      url: app.globalData.interfaces.my_business_card + '?third_session=' + third_session,
      success: function (res) {
        if (res.data.code === 0) {
          if (res.data.data){
            that.setData({
              user: res.data.data
            })
          }else{
            that.setData({
              user: {}
            })
          }
        }
        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();
      }
    })
  }
})