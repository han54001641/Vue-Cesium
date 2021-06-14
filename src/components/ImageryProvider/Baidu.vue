<template>
  <!-- 百度底图 -->
  <div id="container"></div>
</template>

<script>
import BaiduImageryProvider from "../../assets/js/baidu";
export default {
  data() {
    return {};
  },
  mounted() {
    this.showGlobe();
  },
  methods: {
    showGlobe() {
      var cesiumAsset =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYzU4MTBmYy1mYWVjLTRmZWYtODBkMC00M2E4YjRiMTE0NDciLCJpZCI6NDU3NTAsImlhdCI6MTYxOTEwMjgxNX0.BvGEskDDsf4HdUoEPOK2lb1Q-0WSGRcv9134odi_cSg";
      Cesium.Ion.defaultAccessToken = cesiumAsset;
      var viewer = new Cesium.Viewer("container", {
        selectionIndicator: false,
        animation: false,
        baseLayerPicker: false,
        timeline: false,
        sceneModePicker: true,
        navigationHelpButton: false,
        useDefaultRenderLoop: true,
        showRenderLoopErrors: true,
        fullscreenButton: false,
        infoBox: false,
        imageryProvider: new BaiduImageryProvider({
          url:
            "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
        }),
      });
      document.querySelector(".cesium-viewer-bottom").style.display = "none"; //隐藏cesiumicon图标

      //  设置初始位置
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(116.46, 39.92, 10000000.0),
      });

      // 分辨率调整函数
      let adjustmentPixel = function () {
        // 判断是否支持图像渲染像素化处理
        var supportsImageRenderingPixelated =
          viewer.cesiumWidget._supportsImageRenderingPixelated;
        if (supportsImageRenderingPixelated) {
          // 直接拿到设备的像素比例因子 - 如我设置的1.25
          var vtxf_dpr = window.devicePixelRatio;
          // 这个while我们在后面会做一个说明，但不是解决问题的说明
          while (vtxf_dpr >= 2.0) {
            vtxf_dpr /= 2.0;
          }
          // 设置渲染分辨率的比例因子
          viewer.resolutionScale = vtxf_dpr;
        }
      };
      adjustmentPixel();
      viewer.scene.postProcessStages.fxaa.enabled = false;
      // viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.fxaa = false;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (event) {
        let earthPosition = viewer.camera.pickEllipsoid(
          event.position,
          viewer.scene.globe.ellipsoid
        );
        if (Cesium.defined(earthPosition)) {
          let ellipsoid = viewer.scene.globe.ellipsoid;
          let cartographic = ellipsoid.cartesianToCartographic(earthPosition);
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let lon = Cesium.Math.toDegrees(cartographic.longitude);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>