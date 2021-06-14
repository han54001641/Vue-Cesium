
<template>
  <!-- 天地图底图 -->
  <div id="container"></div>
</template>

<script>
// 加载天地图叠加地形时,需在index.html中引入天地图的js文件
//地址是:"http://api.tianditu.gov.cn/cdn/plugins/cesium/cesiumTdt.js"
export default {
  data() {
    return {
      viewer: null,
    };
  },
  mounted() {
    this.showGlobe();
  },
  methods: {
    // 显示地球
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

      // 叠加影像服务
      var imgMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=img_w&x={x}&y={y}&l={z}&tk=" + tiandituTk,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
      });
      this.viewer.imageryLayers.addImageryProvider(imgMap);

      // 全球影像中文注记服务
      this.viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url:
            "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
            tiandituTk,
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible",
          show: false,
        })
      );

      // // 全球矢量中文注记服务
      // this.viewer.imageryLayers.addImageryProvider(
      //   new Cesium.WebMapTileServiceImageryProvider({
      //     url:
      //       "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
      //       tiandituTk,
      //     layer: "tdtAnnoLayer",
      //     style: "default",
      //     format: "image/jpeg",
      //     tileMatrixSetID: "GoogleMapsCompatible",
      //   })
      // );

      // 叠加国界服务
      var iboMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=" + tiandituTk,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 10,
      });
      this.viewer.imageryLayers.addImageryProvider(iboMap);

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
  },
};
</script>

<style lang="scss" scoped>
</style>