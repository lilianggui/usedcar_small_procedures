// var server_ip = 'http://192.168.0.117:8080';
// var server_ip = 'http://127.0.0.1:8080';
var server_ip = 'http://47.99.126.200:8080';
var appid = 'wxc41ae6a26ee4cf60';
var wx_login_url = server_ip + '/wx/login?appid=' + appid;

App({
  globalData: {
    //不同店铺需要修改appid，wx.getAccountInfoSync()兼容性不好，先使用配置方式
    appid: appid,
    server_ip: server_ip,
    interfaces: {
      'wx_login': wx_login_url,
      'get_image': server_ip + '/getImage',
      'get_shop_info': server_ip + '/wx/getWxShopInfo',
      'car_list': server_ip + '/wx/wxListCar',
      'car_detail': server_ip + '/wx/wxCarDetail',
      'car_appoint': server_ip + '/wx/wxCarAppoint',
      'my_business_card': server_ip + '/wx/myBusinessCard',
      'cancel_appoint': server_ip + '/wx/cancelAppoint',
      'change_appoint_date': server_ip + '/wx/changeAppointDate',
      'update_business_card': server_ip + '/wx/updateBusinessCard',
      'my_appoint_list': server_ip + '/wx/myAppointList',
    }
  },

  need_login_req: function (url, method, successCallback) {


  },

  get_appid: function () {
    return this.globalData.appid;
  },

  wx_login: function (callback) {
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: wx_login_url,
            method: 'post',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              jsCode: res.code
            },
            success: function (res) {
              if (res.data.code === 0) {
                //登陆成功
                wx.setStorage({
                  key: "third_session",
                  data: res.data.data.third_Session
                });
                if (callback) {
                  callback();
                }
              } else {
                wx.showToast({ title: '登陆失败', icon: 'none', duration: 2000, mask: true });
              }
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },

  onLaunch: function () {
    this.wx_login();
  },


  dateFormat: function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
  },



  parseDate: function (dateStr) {
    var year = dateStr.substr(0, 4);//2012-12-12 00:00:00
    var month = parseInt(dateStr.substr(5, 2)) - 1;
    var day = parseInt(dateStr.substr(8, 2));
    var hour = parseInt(dateStr.substr(11, 2));
    var menute = parseInt(dateStr.substr(14, 2));
    var second = parseInt(dateStr.substr(17));
    var date = new Date();
    date.setFullYear(year, month, day);
    date.setHours(hour);
    date.setMinutes(menute);
    date.setSeconds(second);
    return date;
  },


  powerDrawer: function (e, page, openclose, closeOrOpen) {
    var currentStatu = closeOrOpen || e.currentTarget.dataset.statu;
    this.util(currentStatu, page, openclose)
  },
  util: function (currentStatu, page, openclose) {
    /* 动画部分 */
    // 第1步：创建动画实例   
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear", //线性  
      delay: 0  //0则不延迟  
    });

    // 第2步：这个动画实例赋给当前的动画实例  
    page.animation = animation;

    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存  
    page.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画  
    setTimeout(function () {
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象  
      page.setData({
        animationData: animation
      })

      //关闭  
      if (currentStatu == "close") {
        openclose(page, false)
      }
    }.bind(page), 200)

    // 显示  
    if (currentStatu == "open") {
      openclose(page, true);
    }
  },

  isEmptyStr: function (str) {
    return !str || str.replace(/\s/g, "") === ''
  }
})