<template>
  <div id="container">
    <el-select v-model="value" placeholder="请选择" @change="changed">
      <el-option v-for="(item, index) in options" :key="index" :value="item">
      </el-option>
    </el-select>
  </div>
</template>

<script>
import BaiduImageryProvider from "../../assets/js/baidu";
export default {
  data() {
    return {
      options: ["天地图", "ArcGis", "高德底图", "百度底图"],
      value: "天地图",
      viewer: null,
      a: null,
    };
  },
  mounted() {
    this.showGlobe();
    this.showTianditu();
  },
  methods: {
    // 初始化加载天地图显示地球
    showGlobe() {
      var tdtUrl = "https://t{s}.tianditu.gov.cn/";
      var cesiumAsset =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzU4MTBmYy1mYWVjLTRmZWYtODBkMC00M2E4YjRiMTE0NDciLCJpZCI6NDU3NTAsImlhdCI6MTYxOTEwMjgxNX0.BvGEskDDsf4HdUoEPOK2lb1Q-0WSGRcv9134odi_cSg";
      var tiandituTk = "0fbbd9c427c34f19dae19537109beaae";
      // 服务负载子域
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
      Cesium.Ion.defaultAccessToken = cesiumAsset;

      this.viewer = new Cesium.Viewer("container", {
        animation: false, //动画
        homeButton: true, //home键
        geocoder: true, //地址编码
        baseLayerPicker: false, //图层选择控件
        timeline: false, //时间轴
        fullscreenButton: true, //全屏显示
        infoBox: true, //点击要素之后浮窗
        sceneModePicker: true, //投影方式  三维/二维
        navigationInstructionsInitiallyVisible: false, //导航指令
        navigationHelpButton: false, //帮助信息
        selectionIndicator: false, // 选择
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          //影像底图
          url:
            "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
            tiandituTk,
          subdomains: subdomains,
          layer: "tdtImgLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible", //使用谷歌的瓦片切片方式
          show: true,
        }),
      });
      this.viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏cesium ion

      // 抗锯齿
      this.viewer.scene.postProcessStages.fxaa.enabled = false;
      // 水雾特效
      this.viewer.scene.globe.showGroundAtmosphere = true;
      // 设置最大俯仰角，[-90,0]区间内，默认为-30，单位弧度
      this.viewer.scene.screenSpaceCameraController.constrainedPitch = Cesium.Math.toRadians(
        -20
      );
      // 取消默认的双击事件
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );

      // 叠加地形服务
      var terrainUrls = new Array();

      for (var i = 0; i < subdomains.length; i++) {
        var url =
          tdtUrl.replace("{s}", subdomains[i]) +
          "mapservice/swdx?tk=" +
          tiandituTk;
        terrainUrls.push(url);
      }
      var provider = new Cesium.GeoTerrainProvider({
        urls: terrainUrls,
      });
      this.viewer.terrainProvider = provider;

      // 将三维球定位到中国
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(103.84, 31.15, 17850000),
        orientation: {
          heading: Cesium.Math.toRadians(348.4202942851978),
          pitch: Cesium.Math.toRadians(-89.74026687972041),
          roll: Cesium.Math.toRadians(0),
        },
        complete: function callback() {
          // 定位完成之后的回调函数
        },
      });
    },

    // 天地图中文注记图层
    zhCNMap() {
      return new Cesium.WebMapTileServiceImageryProvider({
        url:
          "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=0fbbd9c427c34f19dae19537109beaae",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false,
      });
    },

    // 天地图国界图层
    countryLine() {
      var tdtUrl = "https://t{s}.tianditu.gov.cn/";
      var tiandituTk = "0fbbd9c427c34f19dae19537109beaae";
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
      return new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=" + tiandituTk,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 10,
      });
    },

    // 加载天地图
    showTianditu() {
      var tdtUrl = "https://t{s}.tianditu.gov.cn/";
      var tiandituTk = "0fbbd9c427c34f19dae19537109beaae";
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
      // 删除之前所有图层,之后加载新图层
      this.viewer.imageryLayers.removeAll();
      // 天地图影像
      var tiandituBaseMap = new Cesium.WebMapTileServiceImageryProvider({
        //影像底图
        url:
          "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
          tiandituTk,
        subdomains: subdomains,
        layer: "tdtImgLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible", //使用谷歌的瓦片切片方式
        show: true,
      });
      // 影像叠加服务
      var imgMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + tiandituTk,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
      });
      this.viewer.imageryLayers.addImageryProvider(tiandituBaseMap);
      this.viewer.imageryLayers.addImageryProvider(imgMap);
      this.viewer.imageryLayers.addImageryProvider(this.zhCNMap());
      this.viewer.imageryLayers.addImageryProvider(this.countryLine());
    },

    //加载Arcgis底图
    showArcgis() {
      // 删除之前所有图层,之后加载新图层
      this.viewer.imageryLayers.removeAll();
      var arcgisBaseMap = new Cesium.ArcGisMapServerImageryProvider({
        url:
          "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      });
      var arcgisStreeMap = new Cesium.ArcGisMapServerImageryProvider({
        url:
          "http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
      });
      this.viewer.imageryLayers.addImageryProvider(arcgisBaseMap);
      this.viewer.imageryLayers.addImageryProvider(arcgisStreeMap);
      this.viewer.imageryLayers.addImageryProvider(this.zhCNMap());
      this.viewer.imageryLayers.addImageryProvider(this.countryLine());
    },

    // 加载百度底图
    showBaidu() {
      // 删除之前所有图层,然后加载新图层
      this.viewer.imageryLayers.removeAll();
      var baiduBaseMap = new BaiduImageryProvider({
        url:
          "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
      });
      this.viewer.imageryLayers.addImageryProvider(baiduBaseMap);
    },

    // 加载高德底图
    showGaode() {
      this.viewer.imageryLayers.removeAll();
      var gaodeBaseMap = new Cesium.UrlTemplateImageryProvider({
        url:
          "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      }); //高德影像底图
      var gaodeMap = new Cesium.UrlTemplateImageryProvider({
        url:
          "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
        //            layer: "tdtAnnoLayer",
        //            style: "default",
        //            format: "image/jpeg",
        //            tileMatrixSetID: "GoogleMapsCompatible"
      });
      this.viewer.imageryLayers.addImageryProvider(gaodeBaseMap);
      this.viewer.imageryLayers.addImageryProvider(gaodeMap);
    },
    // 选择更换时触发
    changed() {
      console.log(this.value);
      if (this.value === "天地图") {
        this.showTianditu();
      } else if (this.value == "ArcGis") {
        this.showArcgis();
      } else if (this.value == "百度底图") {
        this.showBaidu();
      } else {
        this.showGaode();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#container {
  position: relative;
  .el-select {
    position: absolute;
    top: 10px;
    left: 20px;
    z-index: 10;
  }
}
</style>