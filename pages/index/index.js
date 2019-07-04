//index.js
import Toast from '../../miniprogram_npm/vant-weapp/toast/toast';
const app = getApp();
Page({
  data: {
    placeholder: "钢铁侠",
    showSources: false,
    loadmore: false,
    loadComplete: true,
    loading: false,
    data: {
      current: {
        site: "",
        keyword: "",
        page: 1,
        sort: "time"
      },
      results: []
    },
    rules: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    app.onRulesComplete(function(rules) {
      //如果有参数 就直接请求
      if (options != null && options.current != null && options.current.length > 0) {
        console.log(options.current)
        that.setData({
          "data.current": JSON.parse(options.current)
        }, function() {
          that.onSearch()
        })
      } else {
        //没有就初始化
        let last = app.getLastRule()
        that.setData({
          "data.current.site": last == null ? rules[0].site : last.site
        })
      }
    }, function(message) {
      Toast.fail(message);
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    return {
      title: that.data.data.current.keyword.length <= 0 ? '磁力搜' : '磁力搜 - ' + that.data.data.current.keyword,
      path: '/pages/index/index?current=' + JSON.stringify(that.data.data.current),
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  clickItem: function(e) {
    let config = app.globalData.config
    let url = config.trackersEnabled ? e.currentTarget.dataset['tracker'] : e.currentTarget.dataset['src'];
    wx.setClipboardData({
      data: url,
      success: function(res) {
        wx.hideToast();
        Toast.success("链接已复制");
      }
    });
  },
  onLoadMore: function(e) {
    if (this.data.loadComplete) {
      this.setData({
        loadmore: true
      }, function() {
        this.requestSearch();
      })
    }
  },
  clickChangeSource: function(e) {
    this.setData({
      rules: app.globalData.rules,
      showSources: true
    })
  },
  onCloseSourcePicker: function(e) {
    this.setData({
      showSources: false
    })
  },
  onConfirmSource: function(e) {
    app.setLastRule(e.detail.value)
    this.setData({
      showSources: false,
      "data.current.site": e.detail.value.site
    }, function() {
      if (this.data.data.current.keyword.length > 0) {
        this.onSearch()
      }
    })
  },
  onSearchChanged: function(e) {
    this.data.data.current.keyword = e.detail
  },
  onSearch: function(e) {
    this.data.loadComplete = true
    this.setData({
      loadmore: false,
      loading: true,
      "data.results": [],
      "data.current.page": 1,
      "data.current.keyword": this.data.data.current.keyword.length > 0 ? this.data.data.current.keyword : this.data.placeholder
    }, function() {
      this.requestSearch();
    })
  },
  requestSearch: function(e) {
    if (this.data.loadComplete == false) {
      console.log("上次请求未完成")
      return
    }
    console.log("正在请求-->\n" + JSON.stringify(this.data.data.current, null, 2))

    this.data.loadComplete = false
    let that = this
    wx.cloud.callFunction({
      name: 'requestGet',
      data: {
        "uri": "api/search",
        "params": {
          "page": that.data.data.current.page,
          "source": that.data.data.current.site,
          "keyword": that.data.data.current.keyword,
          "sort": that.data.data.current.sort
        }
      },
      success: res => {
        console.log(res.result)
        that.data.loadComplete = true
        if (res.result.success) {
          //每个item放一页的数组 避免单个数组过大
          var pageResults = "data.results[" + that.data.data.results.length + "].items"
          that.setData({
            loading: false,
            loadmore: false,
            "data.trackersString": res.result.data.trackersString,
            "data.current": res.result.data.current,
            [pageResults]: res.result.data.results
          }, function() {
            if (res.result.data.results.length <= 0) {
              Toast.fail("没有更多了");
            } else {
              that.data.data.current.page++;
            }
          })
        } else {
          that.callError(res.result.message)
        }
      },
      fail: err => {
        that.callError("请求失败")
      },
    })
  },
  callError: function (message) {
    this.data.loadComplete = true
    this.setData({
      loading: false,
      loadmore: false,
    })
    Toast.fail(message);
  },
  clickSetting: function() {
    wx.navigateTo({
      url: '/pages/setting/index'
    })
  }
})