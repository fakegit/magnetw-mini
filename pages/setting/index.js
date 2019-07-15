//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
var util = require('../../utils/util.js');

const app = getApp();
Page({
  data: {
    config: null,
    placeholder: null,
    lastRuleModified: null
  },
  onLoad: function() {
    this.setData({
      lastRuleModified: util.formatTime(new Date(app.globalData.config.lastRuleModified)),
      config: app.globalData.config
    });

  },
  onRuleInput: function(e) {
    this.setData({
      "config.ruleUrl": e.detail.value
    });
  },
  onTrackersEnabled: function(e) {
    let that = this
    this.setData({
      "config.trackersEnabled": !that.data.config.trackersEnabled
    }, function() {
      app.applyConfig(that.data.config)
    });
  },
  reloadRule: function(e) {
    Toast.loading({
      duration: 0,
      message: '正在更新规则'
    });
    //先获取规则
    app.requestMagnetRule(function() {
      Toast.success("规则更新成功");
    }, function(message) {
      Toast.fail(message);
    });
  },
  clickHelp: function() {
    wx.navigateTo({
      url: '/pages/help/index'
    })
  }
})