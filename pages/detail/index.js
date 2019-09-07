var app = getApp();
var getIndex = function(date){
  var now = new Date();
  var x = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  var y = date.getHours();
  var z = parseInt(date.getMinutes() / 10);
  return [x, y, z];
}

Page({
  data: {
    car: {},
    image_url_pre: app.globalData.interfaces.get_image + '?url=',
    showModalStatus: false,//预约时间弹框展示标志位
    showModalCardStatus: false,//我的名片弹框展示标志位
    multiArray: [[],[],[]],
    multiIndex: [0, 0, 0],
    appointmentDate: app.dateFormat(new Date()),
    isShow: true,
    loadingData: '123',
    showLoading: true,
    user: {},
    validateMsg: ''
  },

  showImg: function (event){
    var curent = this.data.image_url_pre + event.currentTarget.dataset.current.url;
    var imgs = [];
    var carImages = this.data.car.carImages;
    for (var i = 0; i < carImages.length; i++){
      imgs.push(this.data.image_url_pre + carImages[i].url);
    }
    wx.previewImage({
      urls: imgs,
      current: curent
    });
  },
  pickerTap: function(){

  },

  setDate: function () {
    var date = new Date();

    var monthDay = ['今天', '明天'];
    var hours = [];
    var minute = [];

    // 月-日
    for (var i = 2; i <= 28; i++) {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + i);
      var md = (date1.getMonth() + 1) + "-" + date1.getDate();
      monthDay.push(md);
    }

    // 时
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }

    // 分
    for (var i = 0; i < 60; i += 10) {
      minute.push(i);
    }

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiArray[0] = monthDay;
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },

  bindPickerChange: function (e) {
    var pv = e.detail.value;
    var date = new Date();
    date.setDate(date.getDate() + pv[0])
    date.setHours(pv[1])
    date.setMinutes(pv[2]*10)
    date.setSeconds('0')
    this.setData({
      multiIndex: e.detail.value,
      appointmentDate: app.dateFormat(date)
    })
  },

  onLoad: function (options) {
    this.loadDetail(options);
  },

  loadDetail: function (param){
    var that = this;
    var third_session = wx.getStorageSync('third_session');
    wx.request({
      url: app.globalData.interfaces.car_detail + '?carId=' + param.carId + '&third_session=' + third_session,
      success: function (res) {
        var code = res.data.code;
        if (code === 0) {
          that.setData({
            "car": res.data.data,
            isShow: false,
            showLoading: false
          })
        } else if (code === 10200 || code === 10201) {
          //未登录或session过期
          app.wx_login(function () {
            loadDetail();
          })
        }
        
      }
    });
  },

  appoint: function(e, closeOrOpen){
    this.setDate();//设置下拉时间选择器
    var that = this;
    var initDate = new Date();
    initDate.setDate(initDate.getDate() + 1)
    initDate.setHours(13)
    initDate.setMinutes(0)
    initDate.setSeconds(0)
    this.setData({
      multiIndex: getIndex(initDate),
      appointmentDate: app.dateFormat(initDate)
    });
    var third_session = wx.getStorageSync('third_session');
    wx.request({
      url: app.globalData.interfaces.my_business_card + '?third_session=' + third_session,
      success: function(res){
        var code = res.data.code;
        if (code === 0) {
          if (res.data.data && res.data.data.userId){
            app.powerDrawer(e, that, function (page, cos) {
              page.setData({ showModalStatus: cos });
            }, closeOrOpen);//打开弹窗
          }else{
            wx.showModal({
              title: '提示',
              content: '你还没填写个人名片，马上前往填写',
              success: function (sm) {
                if(sm.confirm){
                  app.powerDrawer(e, that, function (page, cos) {
                    page.setData({ showModalCardStatus: cos });
                  });//打开名片弹窗
                  // wx.switchTab({
                  //   url: '../mine/index',
                  //   success: function () { },
                  //   fail: function () { },
                  //   conplete: function () { }
                  // })
                }
              }
            }); 
          }
        } else if (code === 10200 || code === 10201) {
          //未登录或session过期
          app.wx_login(function () {
            appoint();
          })
        }
      }
    })
  },

  changeAppoint: function(e){
    this.setDate();//设置下拉时间选择器
    var appd = app.parseDate(this.data.car.appointmentDate);
    this.setData({
      appointmentDate: this.data.car.appointmentDate,
      multiIndex: getIndex(appd)
    });
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalStatus: cos });
    });//打开弹窗
  },

  cancelAppoint: function(){
    var that = this;
    var third_session = wx.getStorageSync('third_session');
    wx.showModal({
      title: '提示',
      content: '确定要取消预约吗？',
      success: function (sm) {
        if (sm.confirm) {
          wx.request({
            method: 'post',
            url: app.globalData.interfaces.cancel_appoint,
            data: {
              'appointmentId': that.data.car.appointmentId,
              'third_session': third_session
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              var code = res.data.code;
              if (code === 0) {
                wx.showToast({ title: '取消预约成功', icon: 'succes', duration: 1000, mask: true });
                that.loadDetail(that.data.car)
              } else if (code === 10200 || code === 10201) {
                //未登录或session过期
                app.wx_login(function () {
                  cancelAppoint();
                })
              }
            }
          });
        } 
      }
    });
    
  },

  appointOrUpdate: function (e) {
    var third_session = wx.getStorageSync('third_session');
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalStatus: cos });
    });
    var that = this;
    var url = app.globalData.interfaces.car_appoint;
    var succMsg = '预约成功';
    var appointmentId = that.data.car.appointmentId;
    var reqDate = {
      'carId': that.data.car.carId,
      'appointmentDate': that.data.appointmentDate,
      'third_session': third_session
    };
    if (appointmentId){
      //修改预约时间
      url = app.globalData.interfaces.change_appoint_date;
      succMsg = '修改预约时间成功';
      reqDate.appointmentId = appointmentId;
    }
    wx.request({
      method: 'post',
      url: url,
      data: reqDate,
      header: {
        'content-type': 'application/x-www-form-urlencoded' 
      },
      success: function (res) {
        var code = res.data.code;
        if (code === 0) {
          wx.showToast({ title: succMsg, icon: 'success', duration: 1000, mask: true });
          that.loadDetail(that.data.car)
        } else if (code === 10200 || code === 10201) {
          //未登录或session过期
          app.wx_login(function () {
            appointOrUpdate(e);
          })
        }
      }
    });
  },

  powerDrawer: function (e){
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalStatus: cos });
    });
  },

  businessCardDrawer: function (e){
    this.setData({
      user: {},
      validateMsg: ''
    })
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalCardStatus: cos });
    });
  },

  updateBusinessCard: function (e) {
    if (!this.bscardFormvalidate()){
      return false;
    }
    var that = this;
    app.powerDrawer(e, this, function (page, cos) {
      page.setData({ showModalCardStatus: cos });
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
        that.appoint(e, 'open')
      }
    })
  },

  sexCahnge: function (e) {
    this.setData({
      'user.sex': e.detail.value
    });
    this.bscardFormvalidate('sex')
  },
  inputUsername: function (e) {
    this.setData({
      'user.username': e.detail.value
    });
    this.bscardFormvalidate('username')
  },

  inputPhone: function (e) {
    this.setData({
      'user.phone': e.detail.value
    });
    this.bscardFormvalidate('phone')
  },

  bscardFormvalidate: function (field) {
    var that = this;
    var setValidateMsg = function (msg) {
      that.setData({
        validateMsg: msg
      })
    }
    var user = this.data.user;
    if (!user.username || app.isEmptyStr(user.username)) {
      if (!field || field === 'username') {
        setValidateMsg('用户名不能为空')
      } else {
        setValidateMsg('')
      }
    } else if (!new RegExp('^[a-zA-Z0-9_\u4E00-\u9FA5-]{1,16}$').test(user.username)) {
      if (!field || field === 'username') {
        setValidateMsg('用户名不能有特殊字符，1-16位')
      } else {
        setValidateMsg('')
      }
    } else if (!user.sex) {
      if (!field || field === 'sex') {
        setValidateMsg('请选择性别')
      } else {
        setValidateMsg('')
      }
    } else if ((!user.phone || app.isEmptyStr(user.phone))) {
      if (!field || field === 'phone') {
        setValidateMsg('手机号不能为空')
      } else {
        setValidateMsg('')
      }
    } else if (!new RegExp('^[1][3,4,5,7,8][0-9]{9}$').test(user.phone)) {
      if (!field || field === 'phone') {
        setValidateMsg('请输入正确的手机号')
      } else {
        setValidateMsg('')
      }
    } else {
      setValidateMsg('')
      return true;
    }

  }

})