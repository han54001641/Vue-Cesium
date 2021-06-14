<template>
  <div id="container"></div>
</template>


<script>
export default {
  mounted() {
    this.showGlobe();
  },
  methods: {
    showGlobe() {
      // 天地图服务
      var tdtUrl = "https://t{s}.tianditu.gov.cn/";
      var cesiumAsset =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzU4MTBmYy1mYWVjLTRmZWYtODBkMC00M2E4YjRiMTE0NDciLCJpZCI6NDU3NTAsImlhdCI6MTYxOTEwMjgxNX0.BvGEskDDsf4HdUoEPOK2lb1Q-0WSGRcv9134odi_cSg";
      var tiandituTk = "0fbbd9c427c34f19dae19537109beaae";
      // 服务负载子域
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
      Cesium.Ion.defaultAccessToken = cesiumAsset;
      var viewer = new Cesium.Viewer("container", {
        animation: false, //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: true, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: true, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: true, //是否显示点击要素之后显示的信息
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url:
            "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        }), //高德影像底图
      });
      document.querySelector(".cesium-viewer-bottom").style.display = "none"; //隐藏cesiumicon图标

      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url:
            "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
          //            layer: "tdtAnnoLayer",
          //            style: "default",
          //            format: "image/jpeg",
          //            tileMatrixSetID: "GoogleMapsCompatible"
        })
      );
      // 高德街道底图
      //   viewer.imageryLayers.addImageryProvider(
      //     new Cesium.UrlTemplateImageryProvider({
      //       url:
      //         "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      //       //            layer: "tdtAnnoLayer",
      //       //            style: "default",
      //       //            format: "image/jpeg",
      //       //            tileMatrixSetID: "GoogleMapsCompatible"
      //     })
      //   );
      // 天地图叠加地形服务
      var terrainUrls = new Array();

      for (var i = 0; i < subdomains.length; i++) {
        var url =
          tdtUrl.replace("{s}", subdomains[i]) +
          "mapservice/swdx?tk=0fbbd9c427c34f19dae19537109beaae";
        terrainUrls.push(url);
      }
      var provider = new Cesium.GeoTerrainProvider({
        urls: terrainUrls,
      });
      viewer.terrainProvider = provider;
      // 将三维球定位到中国
      viewer.camera.flyTo({
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