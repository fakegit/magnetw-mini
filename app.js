//app.js
App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'magnet-mini',
        traceUser: true,
      })
      //初始化配置
      let config = wx.getStorageSync("config")
      if (typeof config == 'object') {
        this.globalData.config = config;
      }
      this.requestMagnetRule(function() {
        console.log("初始化更新缓存成功-->")
      }, function() {
        console.log("初始化更新缓存失败-->")
      })
    }


  },
  /**
   * 供页面调用 全局数据完成后
   */
  onRulesComplete: function(callback, error) {
    let rules = wx.getStorageSync("rules")
    if (rules != null && rules.length > 0) {
      console.log("从缓存加载规则-->")
      this.globalData.rules = rules
      callback(rules)
    } else {
      console.log("没有缓存，从网络获取规则-->")
      this.requestMagnetRule(callback, error)
    }
  },
  /**
   * 请求规则列表 只更新缓存
   */
  requestMagnetRule: function(callback, error) {
    wx.showNavigationBarLoading()
    let that = this
    wx.cloud.callFunction({
      name: 'requestGet',
      data: {
        "uri": "api/source"
      },
      success: res => {
        wx.hideNavigationBarLoading()
        if (res.result.success) {
          console.log(res.result)
          callback(res.result.data)
          that.globalData.rules = res.result.data
          //更新缓存
          wx.setStorageSync('rules', res.result.data);
        } else {
          error("规则载入失败");
        }
      },
      fail: err => {
        error("规则载入失败");
      },
    })
  },
  setLastRule: function(e) {
    wx.setStorage({
      key: 'last-rule',
      data: e
    })
  },
  getLastRule: function(e) {
    let last = wx.getStorageSync("last-rule")
    return last != null && last.length <= 0 ? null : last;
  },
  applyConfig: function(newConfig) {
    this.globalData.config = newConfig
    wx.setStorage({
      key: 'config',
      data: newConfig
    });
  },
  globalData: {
    rules: [],
    config: {
      trackersEnabled: true
    }
  }
})