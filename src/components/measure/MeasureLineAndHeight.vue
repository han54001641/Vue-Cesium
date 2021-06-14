
<template>
  <!-- 天地图底图 -->
  <div id="container">
    <Button class="addline" @click="addLinenew">空间距离</Button>
    <Button class="addWaterPolygon" @click="measureHeight">高度差</Button>
    <Button class="clearHandle" @click="clearHandle">清除</Button>
    <!--<Button type="primary" class="clearWaterHandle" @click="clearWaterHandle">清除水域</Button>-->
    <div id="ToolTip"></div>
  </div>
</template>

<script>
// 加载天地图叠加地形时,需在index.html中引入天地图的js文件
//地址是:"http://api.tianditu.gov.cn/cdn/plugins/cesium/cesiumTdt.js"
export default {
  data() {
    return {
      viewer: null,
      pointData: [],
      pointArrays: [],
      lineArrays: [],
      lineEntity: {},
      polygonEntity: {},
      isDraw: false,
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

    //笛卡尔坐标系转WGS84坐标系
    Cartesian3_to_WGS84(point) {
      var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
      var cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var alt = cartographic.height;
      return { lat: lat, lng: lng, alt: alt };
    },

    //WGS84坐标系转笛卡尔坐标系
    WGS84_to_Cartesian3(point) {
      var car33 = Cesium.Cartesian3.fromDegrees(
        point.lng,
        point.lat,
        point.alt
      );
      var x = car33.x;
      var y = car33.y;
      var z = car33.z;
      return { x: x, y: y, z: z };
    },

    //画线按钮
    addLinenew() {
      var _this = this;
      this.drawLineString(function (positions) {
        let wgs84_positions = [];
        for (let i = 0; i < positions.length; i++) {
          let wgs84_point = _this.Cartesian3_to_WGS84({
            x: positions[i].x,
            y: positions[i].y,
            z: positions[i].z,
          });
          wgs84_positions.push(wgs84_point);
        }
        console.log(wgs84_positions);
        _this.viewer.entities.remove(
          _this.viewer.entities.getById("lineEntity")
        );
        var newpositions = positions.slice(0, positions.length - 2);
        _this.showLine(newpositions);
      });
    },
    showLine(arrays) {
      var viewer = this.viewer;
      viewer.entities.add({
        polyline: {
          positions: arrays,
          clampToGround: true,
          width: 5,
          material: Cesium.Color.RED.withAlpha(0.5),
        },
      });
    },

    //获取俩点的距离，返回公里单位值
    getLineDis(startCartographic, endCartographic) {
      //使用cesium的对象中的方法获取距离数据，而不是根据坐标转换计算，
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(startCartographic, endCartographic);
      var lengthInMeters = Math.round(geodesic.surfaceDistance * 100) / 100; //数学，四舍五入，
      return lengthInMeters; //单位米
    },

    //距离累加
    sum(arr) {
      var s = 0;
      for (var i = arr.length - 1; i >= 0; i--) {
        s = Number(s) + Number(arr[i]);
      }
      return s;
    },

    //画线
    drawLineString(callback) {
      var isDraw = this.isDraw; //是否是画线操作
      var disNums = []; //线路长度之和
      var _this = this;
      var polylinePath = []; //点集合，存放当前点和上一个点
      var PolyLinePrimitive = (function () {
        function _(positions) {
          this.options = {
            id: "lineEntity",
            polyline: {
              positions: [],
              material: Cesium.Color.RED.withAlpha(0.5),
              width: 3,
            },
          };
          this.positions = positions;
          this._init();
        }
        _.prototype._init = function () {
          var _self = this;
          var _update = function () {
            return _self.positions;
          };
          //实时更新polyline.positions
          this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
          );
          _this.viewer.entities.add(this.options);
        };
        return _;
      })();
      var handler = new Cesium.ScreenSpaceEventHandler(
        _this.viewer.scene.canvas
      );
      var positions = [];
      var poly = undefined;
      //鼠标左键单击画点
      handler.setInputAction(function (movement) {
        let ray = _this.viewer.camera.getPickRay(movement.position),
          cartesians = _this.viewer.scene.globe.pick(ray, _this.viewer.scene),
          cartographic = Cesium.Cartographic.fromCartesian(cartesians),
          lng = Cesium.Math.toDegrees(cartographic.longitude), //经度值
          lat = Cesium.Math.toDegrees(cartographic.latitude), //纬度值
          mapPosition = { x: lng, y: lat, z: cartographic.height }, //cartographic.height的值为地形高度。
          //把三维坐标转成笛卡尔坐标，供添加实体时使用
          newposition = Cesium.Cartesian3.fromDegrees(
            mapPosition.x,
            mapPosition.y,
            mapPosition.z
          );
        console.log(cartographic);
        if (positions.length == 0) {
          positions.push(newposition.clone());
        }
        positions.push(newposition);
        var viewer = _this.viewer;
        isDraw = true;
        //世界坐标转地理坐标（弧度）
        if (cartographic) {
          polylinePath.push(cartographic); //加点
          if (isDraw && polylinePath.length == 1) {
            var strartpoint = viewer.entities.add({
              position: newposition,
              point: {
                color: Cesium.Color.RED,
                pixelSize: 3,
              },
              label: {
                text: "起点",
                font: "14pt monospace",
                showBackground: true,
              },
            });
          }
          if (isDraw && polylinePath.length > 1) {
            var text = 0;
            text =
              _this.sum(disNums) +
              Number(_this.getLineDis(polylinePath[0], polylinePath[1]));
            disNums.push(_this.getLineDis(polylinePath[0], polylinePath[1]));
            var temppoint;
            if (text < 1000) {
              temppoint = viewer.entities.add({
                position: newposition,
                point: {
                  color: Cesium.Color.RED,
                  pixelSize: 3,
                },
                label: {
                  text: text.toFixed(2) + "米",
                  font: "14pt monospace",
                  showBackground: true,
                },
              });
            } else if (text >= 1000) {
              temppoint = viewer.entities.add({
                position: newposition,
                point: {
                  color: Cesium.Color.RED,
                  pixelSize: 3,
                },
                label: {
                  text: (text / 1000).toFixed(2) + "公里",
                  font: "14pt monospace",
                  showBackground: true,
                },
              });
            }
            var lastpoint = polylinePath[polylinePath.length - 1];
            polylinePath = [lastpoint];
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      //鼠标移动
      handler.setInputAction(function (movement) {
        let ray = _this.viewer.camera.getPickRay(movement.endPosition),
          cartesians = _this.viewer.scene.globe.pick(ray, _this.viewer.scene),
          cartographic = Cesium.Cartographic.fromCartesian(cartesians),
          lng = Cesium.Math.toDegrees(cartographic.longitude), //经度值
          lat = Cesium.Math.toDegrees(cartographic.latitude), //纬度值
          mapPosition = { x: lng, y: lat, z: cartographic.height }, //cartographic.height的值为地形高度。
          //把三维坐标转成笛卡尔坐标，供添加实体时使用
          newposition = Cesium.Cartesian3.fromDegrees(
            mapPosition.x,
            mapPosition.y,
            mapPosition.z
          );
        var cartesian = newposition;
        if (positions.length >= 2) {
          if (!Cesium.defined(poly)) {
            poly = new PolyLinePrimitive(positions);
          } else {
            if (cartesian != undefined) {
              positions.pop();
              cartesian.y += 1 + Math.random();
              positions.push(cartesian);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //单击鼠标右键结束画线
      handler.setInputAction(function (movement) {
        handler.destroy();
        callback(positions);
        _this.viewer.trackedEntity = undefined;
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },

    //清除所有Entity和ImageryLayers
    clearHandle() {
      //移除所有实体Entity
      this.viewer.entities.removeAll(); //清除点、线、面
    },

    // 面积计算暂无法使用
    // 面积计算
    // measureArea() {
    //   var viewer = this.viewer;
    //   var tooltip = document.getElementById("ToolTip");
    //   var isDraw = false;
    //   var positions = [];
    //   var polygon = null;
    //   var tempPoints = [];
    //   var cartographicArry = [];
    //   var handler = viewer.screenSpaceEventHandler;
    //   handler.setInputAction(function (movement) {
    //     //新增部分
    //     var position1;
    //     var cartographic;

    //     var ray = viewer.scene.camera.getPickRay(movement.endPosition);
    //     if (ray) position1 = viewer.scene.globe.pick(ray, viewer.scene);
    //     if (position1)
    //       cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
    //         position1
    //       );
    //     if (cartographic) {
    //       //海拔
    //       var height = viewer.scene.globe.getHeight(cartographic);
    //       var point = Cesium.Cartesian3.fromDegrees(
    //         (cartographic.longitude / Math.PI) * 180,
    //         (cartographic.latitude / Math.PI) * 180,
    //         height
    //       );
    //       if (isDraw) {
    //         tooltip.style.left = movement.endPosition.x + 10 + "px";
    //         tooltip.style.top = movement.endPosition.y + 20 + "px";
    //         tooltip.style.display = "block";

    //         if (positions.length < 2) {
    //           return;
    //         }
    //         if (!Cesium.defined(polygon)) {
    //           positions.push(point);
    //           polygon = new CreatePolygon(positions, Cesium);
    //         } else {
    //           polygon.path.pop();
    //           polygon.path.push(point);
    //         }
    //         if (positions.length >= 2) {
    //           tooltip.innerHTML = "<p>双击确定终点</p>";
    //         }
    //       }
    //     }
    //   }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //   handler.setInputAction(function (movement) {
    //     isDraw = true;
    //     //新增部分
    //     var position1;
    //     var cartographic;
    //     var ray = viewer.scene.camera.getPickRay(movement.position);
    //     if (ray) position1 = viewer.scene.globe.pick(ray, viewer.scene);
    //     if (position1)
    //       cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(
    //         position1
    //       );
    //     var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    //     var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    //     var heightString = cartographic.height;
    //     tempPoints.push({
    //       lon: longitudeString,
    //       lat: latitudeString,
    //       hei: heightString,
    //     });
    //     if (cartographic) {
    //       //海拔
    //       cartographicArry.push(cartographic);
    //       var height = viewer.scene.globe.getHeight(cartographic);
    //       var point = Cesium.Cartesian3.fromDegrees(
    //         (cartographic.longitude / Math.PI) * 180,
    //         (cartographic.latitude / Math.PI) * 180,
    //         height
    //       );
    //       if (isDraw) {
    //         positions.push(position1);
    //         var tmep = viewer.entities.add({
    //           position: point,
    //           point: {
    //             show: true,
    //             color: Cesium.Color.SKYBLUE,
    //             pixelSize: 3,
    //             outlineColor: Cesium.Color.YELLOW,
    //             outlineWidth: 1,
    //           },
    //         });
    //       }
    //     }
    //   }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //   handler.setInputAction(function () {
    //     handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //     handler.removeInputAction(
    //       Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    //     );

    //     if (positions.length >= 2) {
    //       var label = getArea(tempPoints);
    //       // var label = String(countAreaInCartesian3(polygon.path));
    //       label = label.substr(0, label.indexOf(".", 0));
    //       var text;
    //       if (label.length < 6) text = label + "平方米";
    //       else {
    //         label = String(label / 1000000);
    //         label = label.substr(0, label.indexOf(".", 0) + 3);
    //         text = label + "平方公里";
    //       }
    //       var textArea = text;
    //       var lastpoint = viewer.entities.add({
    //         name: "多边形面积",
    //         position: polygon.path[polygon.path.length - 1],
    //         point: {
    //           pixelSize: 5,
    //           color: Cesium.Color.RED,
    //           outlineColor: Cesium.Color.WHITE,
    //           outlineWidth: 2,
    //           heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //         },
    //         label: {
    //           text: textArea,
    //           font: "18px sans-serif",
    //           fillColor: Cesium.Color.GOLD,
    //           style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //           outlineWidth: 2,
    //           verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    //           pixelOffset: new Cesium.Cartesian2(20, -40),
    //         },
    //       });
    //     }
    //     viewer.trackedEntity = undefined;
    //     isDraw = false;
    //     tooltip.style.display = "none";
    //   }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //   var CreatePolygon = (function () {
    //     function _(positions, cesium) {
    //       if (!Cesium.defined(positions)) {
    //         throw new Cesium.DeveloperError("positions is required!");
    //       }
    //       if (positions.length < 3) {
    //         throw new Cesium.DeveloperError("positions 的长度必须大于等于3");
    //       }

    //       this.options = {
    //         polygon: {
    //           hierarchy: undefined,
    //           outline: true,
    //           material: Cesium.Color.RED.withAlpha(0.4),
    //         },
    //       };
    //       this.path = positions;
    //       this.hierarchy = positions;
    //       this._init();
    //     }

    //     _.prototype._init = function () {
    //       var _self = this;
    //       var _update = function () {
    //         return _self.hierarchy;
    //       };
    //       //实时更新polygon.hierarchy
    //       this.options.polygon.hierarchy = new Cesium.CallbackProperty(
    //         _update,
    //         false
    //       );
    //       var oo = viewer.entities.add(this.options);
    //     };
    //     return _;
    //   })();

    //   //微元法求面积
    //   var countAreaInCartesian3 = function (ps) {
    //     var s = 0;
    //     for (var i = 0; i < ps.length; i++) {
    //       var p1 = ps[i];
    //       var p2;
    //       if (i < ps.length - 1) p2 = ps[i + 1];
    //       else p2 = ps[0];
    //       s += p1.x * p2.y - p2.x * p1.y;
    //     }
    //     return Math.abs(s);
    //   };
    //   var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
    //   var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

    //   //计算多边形面积
    //   function getArea(points) {
    //     console.log(points);
    //     var res = 0;
    //     //拆分三角曲面
    //     //经观测，points.length = positions.length-1
    //     //points有重复的一个点，去掉
    //     var len = points.length;
    //     var newpoints = points.slice(0, len - 1);
    //     for (var i = 0; i < newpoints.length - 2; i++) {
    //       var j = i + 1;
    //       var k = i + 2;
    //       var totalAngle = Angle(newpoints[j], newpoints[0], newpoints[k]);
    //       //cartographicArry存放弧面坐标
    //       var dis_temp1 = distance(cartographicArry[j], cartographicArry[0]);
    //       var dis_temp2 = distance(cartographicArry[0], cartographicArry[k]);
    //       res += (dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))) / 2;
    //     }
    //     return res.toFixed(4);
    //   }
    //   /*角度*/
    //   function Angle(p1, p2, p3) {
    //     var bearing21 = Bearing(p2, p1);
    //     var bearing23 = Bearing(p2, p3);
    //     var angle = bearing21 - bearing23;
    //     if (angle < 0) {
    //       angle += 360;
    //     }
    //     //Math.sin方法识别的时弧度，所以返回转成弧度制的数据
    //     return Math.abs((angle - 360) * radiansPerDegree);
    //   }
    //   /*方向*/
    //   function Bearing(from, to) {
    //     var lat1 = from.lat * radiansPerDegree;
    //     var lon1 = from.lon * radiansPerDegree;
    //     var lat2 = to.lat * radiansPerDegree;
    //     var lon2 = to.lon * radiansPerDegree;
    //     var angle = -Math.atan2(
    //       Math.sin(lon1 - lon2) * Math.cos(lat2),
    //       Math.cos(lat1) * Math.sin(lat2) -
    //         Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    //     );
    //     if (angle < 0) {
    //       angle += Math.PI * 2.0;
    //     }
    //     angle = angle * degreesPerRadian; //角度
    //     return angle;
    //   }
    //   function distance(point1cartographic, point2cartographic) {
    //     // var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    //     // var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    //     /**根据经纬度计算出距离**/
    //     var geodesic = new Cesium.EllipsoidGeodesic();
    //     geodesic.setEndPoints(point1cartographic, point2cartographic);
    //     var s = geodesic.surfaceDistance;
    //     //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    //     //返回两点之间的距离
    //     s = Math.sqrt(
    //       Math.pow(s, 2) +
    //         Math.pow(point2cartographic.height - point1cartographic.height, 2)
    //     );
    //     return s;
    //   }
    //   var PolygonPrimitive = (function () {
    //     function _(positions) {
    //       this.options = {
    //         name: "多边形",
    //         polygon: {
    //           hierarchy: [],
    //           // perPositionHeight : true,
    //           material: Cesium.Color.GREEN.withAlpha(0.5),
    //           // heightReference:20000
    //         },
    //       };

    //       this.hierarchy = positions;
    //       this._init();
    //     }

    //     _.prototype._init = function () {
    //       var _self = this;
    //       var _update = function () {
    //         return _self.hierarchy;
    //       };
    //       //实时更新polygon.hierarchy
    //       this.options.polygon.hierarchy = new Cesium.CallbackProperty(
    //         _update,
    //         false
    //       );
    //       viewer.entities.add(this.options);
    //     };

    //     return _;
    //   })();
    // },

    //****************************高度测量 第一个点的经纬度，第二个点的高度，两点水平距离为半径************************************************//

    measureHeight() {
      var isDraw = this.isDraw; //是否是画线操作
      var disNums = []; //线路长度之和
      var _this = this;
      var polylinePath = []; //点集合，存放当前点和上一个点
      var PolyLinePrimitive = (function () {
        function _(positions) {
          this.options = {
            id: "lineEntity",
            polyline: {
              positions: [],
              material: Cesium.Color.RED.withAlpha(0.5),
              width: 3,
            },
          };
          this.positions = positions;
          this._init();
        }
        _.prototype._init = function () {
          var _self = this;
          var _update = function () {
            return _self.positions;
          };
          //实时更新polyline.positions
          this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
          );
          _this.viewer.entities.add(this.options);
        };
        return _;
      })();
      var handler = new Cesium.ScreenSpaceEventHandler(
        _this.viewer.scene.canvas
      );
      var positions = [];
      var poly = undefined;
      //鼠标移动
      handler.setInputAction(function (movement) {
        let ray = _this.viewer.camera.getPickRay(movement.endPosition),
          cartesians = _this.viewer.scene.globe.pick(ray, _this.viewer.scene),
          cartographic = Cesium.Cartographic.fromCartesian(cartesians),
          lng = Cesium.Math.toDegrees(cartographic.longitude), //经度值
          lat = Cesium.Math.toDegrees(cartographic.latitude), //纬度值
          mapPosition = { x: lng, y: lat, z: cartographic.height }, //cartographic.height的值为地形高度。
          //把三维坐标转成笛卡尔坐标，供添加实体时使用
          newposition = Cesium.Cartesian3.fromDegrees(
            mapPosition.x,
            mapPosition.y,
            mapPosition.z
          );
        var cartesian = newposition;
        if (positions.length >= 2) {
          if (!Cesium.defined(poly)) {
            poly = new PolyLinePrimitive(positions);
          } else {
            if (cartesian != undefined) {
              positions.pop();
              cartesian.y += 1 + Math.random();
              positions.push(cartesian);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //鼠标左键单击画点
      handler.setInputAction(function (movement) {
        //移除单击事件，是得只能取点一次，然后双击结束
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        let ray = _this.viewer.camera.getPickRay(movement.position),
          cartesians = _this.viewer.scene.globe.pick(ray, _this.viewer.scene),
          cartographic = Cesium.Cartographic.fromCartesian(cartesians),
          lng = Cesium.Math.toDegrees(cartographic.longitude), //经度值
          lat = Cesium.Math.toDegrees(cartographic.latitude), //纬度值
          mapPosition = { x: lng, y: lat, z: cartographic.height }, //cartographic.height的值为地形高度。
          //把三维坐标转成笛卡尔坐标，供添加实体时使用
          newposition = Cesium.Cartesian3.fromDegrees(
            mapPosition.x,
            mapPosition.y,
            mapPosition.z
          );
        if (positions.length == 0) {
          positions.push(newposition.clone());
        }
        positions.push(newposition);
        var viewer = _this.viewer;
        isDraw = true;
        //世界坐标转地理坐标（弧度）
        if (cartographic) {
          polylinePath.push(cartographic); //加点
          var strartpoint = viewer.entities.add({
            position: newposition,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 3,
            },
            label: {
              text: "起点",
              font: "14pt monospace",
              showBackground: true,
            },
          });
          var lastpoint = polylinePath[polylinePath.length - 1];
          polylinePath = [lastpoint];
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      //单击鼠标右键结束画线
      handler.setInputAction(function (movement) {
        // handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );

        let ray = _this.viewer.camera.getPickRay(movement.position),
          cartesians = _this.viewer.scene.globe.pick(ray, _this.viewer.scene),
          cartographic = Cesium.Cartographic.fromCartesian(cartesians),
          lng = Cesium.Math.toDegrees(cartographic.longitude), //经度值
          lat = Cesium.Math.toDegrees(cartographic.latitude), //纬度值
          mapPosition = { x: lng, y: lat, z: cartographic.height }, //cartographic.height的值为地形高度。
          //把三维坐标转成笛卡尔坐标，供添加实体时使用
          newposition = Cesium.Cartesian3.fromDegrees(
            mapPosition.x,
            mapPosition.y,
            mapPosition.z
          );
        if (positions.length == 0) {
          positions.push(newposition.clone());
        }
        positions.push(newposition);
        var viewer = _this.viewer;
        isDraw = true;
        //世界坐标转地理坐标（弧度）
        if (cartographic) {
          polylinePath.push(cartographic); //加点
          var text = 0;
          text =
            _this.sum(disNums) +
            Number(_this.getLineDis(polylinePath[0], polylinePath[1]));
          disNums.push(_this.getLineDis(polylinePath[0], polylinePath[1]));
          var heighta = polylinePath[0].height;
          var heightb = polylinePath[1].height;
          var cha = Math.abs(heighta - heightb);
          var temppoint = viewer.entities.add({
            position: newposition,
            point: {
              color: Cesium.Color.RED,
              pixelSize: 6,
            },
            label: {
              text: "高度差：" + cha.toFixed(2) + "米",
              font: "14pt monospace",
              showBackground: true,
            },
          });
          // var lastpoint = polylinePath[polylinePath.length - 1];
          // polylinePath = [lastpoint];
        }
        handler.destroy();
        viewer.trackedEntity = undefined;
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },
  },
};
</script>

<style lang="scss" scoped>
#container {
  position: relative;
  .addpoint {
    position: absolute;
    top: 150px;
    right: 50px;
    z-index: 10;
  }
  .addline {
    position: absolute;
    top: 190px;
    right: 50px;
    z-index: 10;
  }
  .addWaterPolygon {
    position: absolute;
    top: 220px;
    right: 50px;
    z-index: 10;
  }
  .clearHandle {
    position: absolute;
    top: 250px;
    right: 50px;
    z-index: 10;
  }
}
button {
  background-color: slategray;
  color: white;
}
#ToolTip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}
.cesium-infoBox {
  display: none !important;
}
</style>