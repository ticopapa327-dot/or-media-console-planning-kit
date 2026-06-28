import type { TopologyCatalog } from "./types";

export const STANDARD_TOPOLOGY: TopologyCatalog = {
  version: "0.1.0",
  generatedFrom: "docs/prelaunch/13_设备清单与电气连接设计.md",
  rooms: [
    {
      id: "room-or-standard",
      name: "标准版手术室端",
      type: "operating_room",
      description: "标准版手术室音视频采集、路由、控制和本地显示区域"
    },
    {
      id: "room-teaching-hall",
      name: "示教报告厅",
      type: "teaching_hall",
      description: "集中示教、报告厅显示、音频扩声和多手术间信号接入区域"
    },
    {
      id: "room-remote-teaching",
      name: "远程示教端",
      type: "remote_teaching",
      description: "主任办公室、办公室电脑和移动终端等院内远程观看区域"
    },
    {
      id: "room-server-core",
      name: "服务器侧",
      type: "server_room",
      description: "应用服务器、存储服务器、UPS/PDU 和院内网络接入区域"
    }
  ],
  devices: [
    {
      id: "OR-MTX-01",
      roomId: "room-or-standard",
      name: "8x8 视频矩阵",
      category: "matrix",
      quantity: 1,
      purpose: "HDMI 视频切换和分发",
      status: "online",
      ports: [
        { id: "OR-MTX-01-IN-01", deviceId: "OR-MTX-01", name: "输入 1", direction: "input", kind: "hdmi" },
        { id: "OR-MTX-01-IN-02", deviceId: "OR-MTX-01", name: "输入 2", direction: "input", kind: "hdmi" },
        { id: "OR-MTX-01-IN-03", deviceId: "OR-MTX-01", name: "输入 3", direction: "input", kind: "hdmi" },
        { id: "OR-MTX-01-IN-04", deviceId: "OR-MTX-01", name: "输入 4", direction: "input", kind: "hdmi" },
        { id: "OR-MTX-01-IN-08", deviceId: "OR-MTX-01", name: "输入 8", direction: "input", kind: "hdmi" },
        { id: "OR-MTX-01-OUT-01", deviceId: "OR-MTX-01", name: "输出 1/2", direction: "output", kind: "hdmi" },
        { id: "OR-MTX-01-OUT-03", deviceId: "OR-MTX-01", name: "输出 3..7", direction: "output", kind: "hdmi" },
        { id: "OR-MTX-01-OUT-08", deviceId: "OR-MTX-01", name: "输出 8", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-SW-01",
      roomId: "room-or-standard",
      name: "16 口千兆 POE 交换机",
      category: "switch",
      quantity: 1,
      purpose: "手术室设备网汇聚",
      status: "online",
      ports: [
        { id: "OR-SW-01-LAN", deviceId: "OR-SW-01", name: "设备网口", direction: "bidirectional", kind: "lan" },
        { id: "OR-SW-01-UPLINK", deviceId: "OR-SW-01", name: "楼层交换机上联", direction: "bidirectional", kind: "lan" }
      ]
    },
    {
      id: "OR-ENC-01",
      roomId: "room-or-standard",
      name: "编码板 1",
      category: "encoder",
      quantity: 1,
      purpose: "DSA/CT 等视频采集和环出",
      status: "online",
      ports: [
        { id: "OR-ENC-01-IN", deviceId: "OR-ENC-01", name: "视频输入", direction: "input", kind: "video" },
        { id: "OR-ENC-01-LOOP", deviceId: "OR-ENC-01", name: "HDMI 环出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-ENC-02",
      roomId: "room-or-standard",
      name: "编码板 2",
      category: "encoder",
      quantity: 1,
      purpose: "腔镜视频采集和环出",
      status: "online",
      ports: [
        { id: "OR-ENC-02-IN", deviceId: "OR-ENC-02", name: "视频输入", direction: "input", kind: "video" },
        { id: "OR-ENC-02-LOOP", deviceId: "OR-ENC-02", name: "HDMI 环出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-ENC-03",
      roomId: "room-or-standard",
      name: "编码板 3",
      category: "encoder",
      quantity: 1,
      purpose: "术野相机视频采集和环出",
      status: "online",
      ports: [
        { id: "OR-ENC-03-IN", deviceId: "OR-ENC-03", name: "视频输入", direction: "input", kind: "video" },
        { id: "OR-ENC-03-LOOP", deviceId: "OR-ENC-03", name: "HDMI 环出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-ENC-04",
      roomId: "room-or-standard",
      name: "编码板 4",
      category: "encoder",
      quantity: 1,
      purpose: "其他视频源采集和环出",
      status: "online",
      ports: [
        { id: "OR-ENC-04-IN", deviceId: "OR-ENC-04", name: "视频输入", direction: "input", kind: "video" },
        { id: "OR-ENC-04-LOOP", deviceId: "OR-ENC-04", name: "HDMI 环出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-ENC-05",
      roomId: "room-or-standard",
      name: "1080P@60Hz 编码板",
      category: "encoder",
      quantity: 1,
      purpose: "监护仪视频源采集",
      status: "online",
      ports: [
        { id: "OR-ENC-05-IN", deviceId: "OR-ENC-05", name: "视频输入", direction: "input", kind: "video" },
        { id: "OR-ENC-05-LOOP", deviceId: "OR-ENC-05", name: "HDMI 环出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-DEC-01",
      roomId: "room-or-standard",
      name: "ARM 解码主机",
      category: "decoder",
      quantity: 1,
      purpose: "网络视频解码到 HDMI",
      status: "online",
      ports: [
        { id: "OR-DEC-01-LAN", deviceId: "OR-DEC-01", name: "设备网", direction: "bidirectional", kind: "lan" },
        { id: "OR-DEC-01-HDMI", deviceId: "OR-DEC-01", name: "HDMI 输出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "OR-FO-01",
      roomId: "room-or-standard",
      name: "光端机（输入端）",
      category: "optical_transceiver",
      quantity: 1,
      purpose: "手术室视频光纤上联",
      status: "online",
      ports: [
        { id: "OR-FO-01-HDMI", deviceId: "OR-FO-01", name: "HDMI 输入", direction: "input", kind: "hdmi" },
        { id: "OR-FO-01-FIBER", deviceId: "OR-FO-01", name: "光纤输出", direction: "output", kind: "fiber" }
      ]
    },
    {
      id: "OR-CTL-01",
      roomId: "room-or-standard",
      name: "控制主机",
      category: "controller",
      quantity: 1,
      purpose: "手术室控制、音频输入输出和本地操作",
      status: "online",
      ports: [
        { id: "OR-CTL-01-LAN", deviceId: "OR-CTL-01", name: "信息网/设备网", direction: "bidirectional", kind: "lan" },
        { id: "OR-CTL-01-AUDIO-IN", deviceId: "OR-CTL-01", name: "音频输入", direction: "input", kind: "audio" },
        { id: "OR-CTL-01-AUDIO-OUT", deviceId: "OR-CTL-01", name: "音频输出", direction: "output", kind: "audio" },
        { id: "OR-CTL-01-USB", deviceId: "OR-CTL-01", name: "USB", direction: "bidirectional", kind: "usb" }
      ]
    },
    {
      id: "OR-DISP-01",
      roomId: "room-or-standard",
      name: "床旁悬吊医学显示器",
      category: "display",
      quantity: 1,
      purpose: "床旁显示",
      status: "online",
      ports: [{ id: "OR-DISP-01-HDMI", deviceId: "OR-DISP-01", name: "HDMI 输入", direction: "input", kind: "hdmi" }]
    },
    {
      id: "OR-DISP-02",
      roomId: "room-or-standard",
      name: "65 寸显示器",
      category: "display",
      quantity: 1,
      purpose: "本地大屏显示",
      status: "online",
      ports: [{ id: "OR-DISP-02-HDMI", deviceId: "OR-DISP-02", name: "HDMI 输入", direction: "input", kind: "hdmi" }]
    },
    {
      id: "OR-CAM-01",
      roomId: "room-or-standard",
      name: "术野相机",
      category: "camera",
      quantity: 1,
      purpose: "术野视频源",
      status: "online",
      ports: [{ id: "OR-CAM-01-VIDEO", deviceId: "OR-CAM-01", name: "视频输出", direction: "output", kind: "video" }]
    },
    {
      id: "OR-CAM-02",
      roomId: "room-or-standard",
      name: "全景相机",
      category: "camera",
      quantity: 1,
      purpose: "手术室全景视频源",
      status: "online",
      ports: [{ id: "OR-CAM-02-LAN", deviceId: "OR-CAM-02", name: "LAN/POE", direction: "bidirectional", kind: "lan" }]
    },
    {
      id: "OR-SRC-01",
      roomId: "room-or-standard",
      name: "DSA/CT 设备等",
      category: "medical_source",
      quantity: 1,
      purpose: "医学影像视频源",
      status: "online",
      ports: [{ id: "OR-SRC-01-VIDEO", deviceId: "OR-SRC-01", name: "视频输出", direction: "output", kind: "video" }]
    },
    {
      id: "OR-SRC-02",
      roomId: "room-or-standard",
      name: "腔镜设备",
      category: "medical_source",
      quantity: 1,
      purpose: "腔镜视频源",
      status: "online",
      ports: [{ id: "OR-SRC-02-VIDEO", deviceId: "OR-SRC-02", name: "视频输出", direction: "output", kind: "video" }]
    },
    {
      id: "OR-MON-01",
      roomId: "room-or-standard",
      name: "监护仪",
      category: "monitor",
      quantity: 1,
      purpose: "监护视频源",
      status: "online",
      ports: [{ id: "OR-MON-01-VIDEO", deviceId: "OR-MON-01", name: "视频输出", direction: "output", kind: "video" }]
    },
    {
      id: "OR-AUD-01",
      roomId: "room-or-standard",
      name: "手术室音频系统",
      category: "audio",
      quantity: 1,
      purpose: "麦克风、功放和吸顶音箱",
      status: "online",
      ports: [
        { id: "OR-AUD-01-MIC", deviceId: "OR-AUD-01", name: "麦克风输出", direction: "output", kind: "audio" },
        { id: "OR-AUD-01-IN", deviceId: "OR-AUD-01", name: "功放输入", direction: "input", kind: "audio" },
        { id: "OR-AUD-01-SPK", deviceId: "OR-AUD-01", name: "音箱输出", direction: "output", kind: "audio" }
      ]
    },
    {
      id: "TH-SW-01",
      roomId: "room-teaching-hall",
      name: "示教室交换机",
      category: "switch",
      quantity: 1,
      purpose: "示教室设备网汇聚",
      status: "online",
      ports: [
        { id: "TH-SW-01-LAN", deviceId: "TH-SW-01", name: "设备网口", direction: "bidirectional", kind: "lan" },
        { id: "TH-SW-01-UPLINK", deviceId: "TH-SW-01", name: "楼层交换机上联", direction: "bidirectional", kind: "lan" }
      ]
    },
    {
      id: "TH-MTX-01",
      roomId: "room-teaching-hall",
      name: "36 进 4 出矩阵",
      category: "matrix",
      quantity: 1,
      purpose: "报告厅多路手术视频矩阵",
      status: "online",
      ports: [
        { id: "TH-MTX-01-IN", deviceId: "TH-MTX-01", name: "矩阵输入", direction: "input", kind: "hdmi" },
        { id: "TH-MTX-01-OUT", deviceId: "TH-MTX-01", name: "矩阵输出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "TH-FO-01",
      roomId: "room-teaching-hall",
      name: "光端机（输出端）",
      category: "optical_transceiver",
      quantity: 1,
      purpose: "接收手术室光纤视频",
      status: "online",
      ports: [
        { id: "TH-FO-01-FIBER", deviceId: "TH-FO-01", name: "光纤输入", direction: "input", kind: "fiber" },
        { id: "TH-FO-01-HDMI", deviceId: "TH-FO-01", name: "HDMI 输出", direction: "output", kind: "hdmi" }
      ]
    },
    {
      id: "TH-CORE-01",
      roomId: "room-teaching-hall",
      name: "示教主机",
      category: "controller",
      quantity: 1,
      purpose: "示教业务、显示和音频输入输出",
      status: "online",
      ports: [
        { id: "TH-CORE-01-LAN", deviceId: "TH-CORE-01", name: "信息网/设备网", direction: "bidirectional", kind: "lan" },
        { id: "TH-CORE-01-HDMI", deviceId: "TH-CORE-01", name: "HDMI 输出", direction: "output", kind: "hdmi" },
        { id: "TH-CORE-01-AUDIO-IN", deviceId: "TH-CORE-01", name: "音频输入", direction: "input", kind: "audio" },
        { id: "TH-CORE-01-AUDIO-OUT", deviceId: "TH-CORE-01", name: "音频输出", direction: "output", kind: "audio" }
      ]
    },
    {
      id: "TH-DISP-01",
      roomId: "room-teaching-hall",
      name: "85 寸 4K 大屏",
      category: "display",
      quantity: 1,
      purpose: "示教报告厅大屏显示",
      status: "online",
      ports: [{ id: "TH-DISP-01-HDMI", deviceId: "TH-DISP-01", name: "HDMI 输入", direction: "input", kind: "hdmi" }]
    },
    {
      id: "TH-CAM-01",
      roomId: "room-teaching-hall",
      name: "示教室全景相机",
      category: "camera",
      quantity: 1,
      purpose: "示教室全景视频源",
      status: "degraded",
      ports: [{ id: "TH-CAM-01-LAN", deviceId: "TH-CAM-01", name: "LAN/POE", direction: "bidirectional", kind: "lan" }]
    },
    {
      id: "RT-PC-01",
      roomId: "room-remote-teaching",
      name: "主任办公室电脑",
      category: "client",
      quantity: 1,
      purpose: "院内远程示教观看和会议",
      status: "online",
      ports: [
        { id: "RT-PC-01-LAN", deviceId: "RT-PC-01", name: "LAN", direction: "bidirectional", kind: "lan" },
        { id: "RT-PC-01-AUDIO", deviceId: "RT-PC-01", name: "耳麦", direction: "bidirectional", kind: "audio" }
      ]
    },
    {
      id: "RT-MOBILE-01",
      roomId: "room-remote-teaching",
      name: "移动终端",
      category: "client",
      quantity: 3,
      purpose: "手机、平板、笔记本院内无线接入",
      status: "unknown",
      ports: [{ id: "RT-MOBILE-01-WIFI", deviceId: "RT-MOBILE-01", name: "Wi-Fi", direction: "bidirectional", kind: "wireless" }]
    },
    {
      id: "SVR-APP-01",
      roomId: "room-server-core",
      name: "应用服务器",
      category: "server",
      quantity: 1,
      purpose: "Web/API、设备目录、示教会议和接口服务",
      status: "online",
      ports: [
        { id: "SVR-APP-01-BIZ", deviceId: "SVR-APP-01", name: "业务网口", direction: "bidirectional", kind: "lan" },
        { id: "SVR-APP-01-STORAGE", deviceId: "SVR-APP-01", name: "存储网口", direction: "bidirectional", kind: "lan" },
        { id: "SVR-APP-01-PWR", deviceId: "SVR-APP-01", name: "电源", direction: "input", kind: "power" }
      ]
    },
    {
      id: "SVR-STO-01",
      roomId: "room-server-core",
      name: "存储服务器",
      category: "storage",
      quantity: 1,
      purpose: "录制文件、截图和文档存储",
      status: "online",
      ports: [
        { id: "SVR-STO-01-BIZ", deviceId: "SVR-STO-01", name: "业务/管理网口", direction: "bidirectional", kind: "lan" },
        { id: "SVR-STO-01-STORAGE", deviceId: "SVR-STO-01", name: "存储网口", direction: "bidirectional", kind: "lan" },
        { id: "SVR-STO-01-PWR", deviceId: "SVR-STO-01", name: "电源", direction: "input", kind: "power" }
      ]
    },
    {
      id: "SVR-UPS-01",
      roomId: "room-server-core",
      name: "UPS/PDU",
      category: "power",
      quantity: 1,
      purpose: "服务器供电、接地和断电保护确认项",
      status: "unknown",
      ports: [{ id: "SVR-UPS-01-PWR", deviceId: "SVR-UPS-01", name: "强电输出", direction: "output", kind: "power" }]
    }
  ],
  connections: [
    {
      id: "CONN-OR-V01",
      fromDeviceId: "OR-SRC-01",
      fromPortId: "OR-SRC-01-VIDEO",
      toDeviceId: "OR-ENC-01",
      toPortId: "OR-ENC-01-IN",
      kind: "video",
      purpose: "医学影像源采集",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V02",
      fromDeviceId: "OR-ENC-01",
      fromPortId: "OR-ENC-01-LOOP",
      toDeviceId: "OR-MTX-01",
      toPortId: "OR-MTX-01-IN-01",
      kind: "hdmi",
      purpose: "医学影像源进入矩阵",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V03",
      fromDeviceId: "OR-SRC-02",
      fromPortId: "OR-SRC-02-VIDEO",
      toDeviceId: "OR-ENC-02",
      toPortId: "OR-ENC-02-IN",
      kind: "video",
      purpose: "腔镜源采集",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V04",
      fromDeviceId: "OR-ENC-02",
      fromPortId: "OR-ENC-02-LOOP",
      toDeviceId: "OR-MTX-01",
      toPortId: "OR-MTX-01-IN-02",
      kind: "hdmi",
      purpose: "腔镜源进入矩阵",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V05",
      fromDeviceId: "OR-CAM-01",
      fromPortId: "OR-CAM-01-VIDEO",
      toDeviceId: "OR-ENC-03",
      toPortId: "OR-ENC-03-IN",
      kind: "video",
      purpose: "术野源采集",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V06",
      fromDeviceId: "OR-ENC-03",
      fromPortId: "OR-ENC-03-LOOP",
      toDeviceId: "OR-MTX-01",
      toPortId: "OR-MTX-01-IN-03",
      kind: "hdmi",
      purpose: "术野源进入矩阵",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V09",
      fromDeviceId: "OR-MON-01",
      fromPortId: "OR-MON-01-VIDEO",
      toDeviceId: "OR-ENC-05",
      toPortId: "OR-ENC-05-IN",
      kind: "video",
      purpose: "监护源采集",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V11",
      fromDeviceId: "OR-DEC-01",
      fromPortId: "OR-DEC-01-HDMI",
      toDeviceId: "OR-MTX-01",
      toPortId: "OR-MTX-01-IN-08",
      kind: "hdmi",
      purpose: "网络视频解码后进入矩阵",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V12",
      fromDeviceId: "OR-MTX-01",
      fromPortId: "OR-MTX-01-OUT-01",
      toDeviceId: "OR-DISP-01",
      toPortId: "OR-DISP-01-HDMI",
      kind: "hdmi",
      purpose: "床旁显示",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V13",
      fromDeviceId: "OR-MTX-01",
      fromPortId: "OR-MTX-01-OUT-03",
      toDeviceId: "OR-DISP-02",
      toPortId: "OR-DISP-02-HDMI",
      kind: "hdmi",
      purpose: "本地大屏显示",
      testRefs: ["TC-CONN-002"]
    },
    {
      id: "CONN-OR-V14",
      fromDeviceId: "OR-MTX-01",
      fromPortId: "OR-MTX-01-OUT-08",
      toDeviceId: "OR-FO-01",
      toPortId: "OR-FO-01-HDMI",
      kind: "hdmi",
      purpose: "送往示教报告厅的光纤视频",
      testRefs: ["TC-CONN-003"]
    },
    {
      id: "CONN-OR-V15",
      fromDeviceId: "OR-FO-01",
      fromPortId: "OR-FO-01-FIBER",
      toDeviceId: "TH-FO-01",
      toPortId: "TH-FO-01-FIBER",
      kind: "fiber",
      purpose: "跨区域视频传输",
      testRefs: ["TC-CONN-003"]
    },
    {
      id: "CONN-TH-V01",
      fromDeviceId: "TH-FO-01",
      fromPortId: "TH-FO-01-HDMI",
      toDeviceId: "TH-MTX-01",
      toPortId: "TH-MTX-01-IN",
      kind: "hdmi",
      purpose: "手术视频进入报告厅矩阵",
      testRefs: ["TC-CONN-004"]
    },
    {
      id: "CONN-TH-V02",
      fromDeviceId: "TH-MTX-01",
      fromPortId: "TH-MTX-01-OUT",
      toDeviceId: "TH-DISP-01",
      toPortId: "TH-DISP-01-HDMI",
      kind: "hdmi",
      purpose: "报告厅大屏显示",
      testRefs: ["TC-CONN-004"]
    },
    {
      id: "CONN-OR-N01",
      fromDeviceId: "OR-CAM-02",
      fromPortId: "OR-CAM-02-LAN",
      toDeviceId: "OR-SW-01",
      toPortId: "OR-SW-01-LAN",
      kind: "lan",
      purpose: "全景相机网络视频/PTZ/供电",
      testRefs: ["TC-CONN-005"]
    },
    {
      id: "CONN-OR-N02",
      fromDeviceId: "OR-CTL-01",
      fromPortId: "OR-CTL-01-LAN",
      toDeviceId: "OR-SW-01",
      toPortId: "OR-SW-01-LAN",
      kind: "lan",
      purpose: "手术室控制和系统通信",
      testRefs: ["TC-CONN-005"]
    },
    {
      id: "CONN-TH-N01",
      fromDeviceId: "TH-CAM-01",
      fromPortId: "TH-CAM-01-LAN",
      toDeviceId: "TH-SW-01",
      toPortId: "TH-SW-01-LAN",
      kind: "lan",
      purpose: "示教室本地视频源",
      testRefs: ["TC-CONN-005"]
    },
    {
      id: "CONN-TH-N02",
      fromDeviceId: "TH-CORE-01",
      fromPortId: "TH-CORE-01-LAN",
      toDeviceId: "TH-SW-01",
      toPortId: "TH-SW-01-LAN",
      kind: "lan",
      purpose: "示教业务和设备通信",
      testRefs: ["TC-CONN-005"]
    },
    {
      id: "CONN-RT-N01",
      fromDeviceId: "RT-PC-01",
      fromPortId: "RT-PC-01-LAN",
      toDeviceId: "SVR-APP-01",
      toPortId: "SVR-APP-01-BIZ",
      kind: "lan",
      purpose: "远程观看和会议",
      testRefs: ["TC-CONN-007"]
    },
    {
      id: "CONN-RT-W01",
      fromDeviceId: "RT-MOBILE-01",
      fromPortId: "RT-MOBILE-01-WIFI",
      toDeviceId: "SVR-APP-01",
      toPortId: "SVR-APP-01-BIZ",
      kind: "wireless",
      purpose: "移动端远程观看和会议",
      testRefs: ["TC-CONN-007"]
    },
    {
      id: "CONN-SVR-N01",
      fromDeviceId: "SVR-APP-01",
      fromPortId: "SVR-APP-01-BIZ",
      toDeviceId: "OR-SW-01",
      toPortId: "OR-SW-01-UPLINK",
      kind: "lan",
      purpose: "应用服务接入院内局域网/楼层交换机",
      testRefs: ["TC-CONN-008"]
    },
    {
      id: "CONN-SVR-N02",
      fromDeviceId: "SVR-APP-01",
      fromPortId: "SVR-APP-01-STORAGE",
      toDeviceId: "SVR-STO-01",
      toPortId: "SVR-STO-01-STORAGE",
      kind: "lan",
      purpose: "应用服务器访问存储服务器",
      testRefs: ["TC-CONN-008"]
    },
    {
      id: "CONN-SVR-P01",
      fromDeviceId: "SVR-UPS-01",
      fromPortId: "SVR-UPS-01-PWR",
      toDeviceId: "SVR-APP-01",
      toPortId: "SVR-APP-01-PWR",
      kind: "power",
      purpose: "应用服务器供电和断电保护确认项",
      testRefs: ["TC-CONN-009"]
    }
  ],
  signalSources: [
    { id: "SRC-DSA-CT", roomId: "room-or-standard", name: "DSA/CT 设备等", deviceId: "OR-SRC-01", status: "online" },
    { id: "SRC-ENDOSCOPE", roomId: "room-or-standard", name: "腔镜设备", deviceId: "OR-SRC-02", status: "online" },
    { id: "SRC-FIELD-CAM", roomId: "room-or-standard", name: "术野相机", deviceId: "OR-CAM-01", status: "online" },
    { id: "SRC-PANORAMA", roomId: "room-or-standard", name: "全景相机", deviceId: "OR-CAM-02", status: "online" },
    { id: "SRC-MONITOR", roomId: "room-or-standard", name: "监护仪", deviceId: "OR-MON-01", status: "online" },
    { id: "SRC-TEACHING-CAM", roomId: "room-teaching-hall", name: "示教室全景相机", deviceId: "TH-CAM-01", status: "degraded" }
  ],
  displayTargets: [
    { id: "DISP-BEDSIDE", roomId: "room-or-standard", name: "床旁悬吊医学显示器", deviceId: "OR-DISP-01", status: "online" },
    { id: "DISP-OR-LARGE", roomId: "room-or-standard", name: "65 寸显示器", deviceId: "OR-DISP-02", status: "online" },
    { id: "DISP-HALL-4K", roomId: "room-teaching-hall", name: "85 寸 4K 大屏", deviceId: "TH-DISP-01", status: "online" }
  ],
  storageVolumes: [
    {
      id: "VOL-REC-PRIMARY",
      serverDeviceId: "SVR-STO-01",
      name: "主录制卷",
      capacityGb: 12288,
      usedGb: 2048,
      status: "online"
    }
  ],
  routeSessions: [
    {
      id: "ROUTE-OR-001",
      sourceId: "SRC-ENDOSCOPE",
      targetId: "DISP-BEDSIDE",
      status: "active",
      label: "腔镜到床旁显示",
      createdBy: "system-seed",
      startedAt: "2026-06-29T00:00:00.000Z"
    },
    {
      id: "ROUTE-TH-001",
      sourceId: "SRC-FIELD-CAM",
      targetId: "DISP-HALL-4K",
      status: "active",
      label: "术野到示教大屏",
      createdBy: "system-seed",
      startedAt: "2026-06-29T00:00:00.000Z"
    }
  ],
  layoutTemplates: [
    {
      id: "LAYOUT-OR-SINGLE",
      roomId: "room-or-standard",
      name: "单画面",
      mode: "single",
      slots: [{ slot: "main", sourceId: "SRC-ENDOSCOPE" }]
    },
    {
      id: "LAYOUT-OR-PIP",
      roomId: "room-or-standard",
      name: "主画面+全景",
      mode: "pip",
      slots: [
        { slot: "main", sourceId: "SRC-ENDOSCOPE" },
        { slot: "pip", sourceId: "SRC-PANORAMA" }
      ]
    },
    {
      id: "LAYOUT-TH-QUAD",
      roomId: "room-teaching-hall",
      name: "四分屏示教",
      mode: "pbp_quad",
      slots: [
        { slot: "1", sourceId: "SRC-DSA-CT" },
        { slot: "2", sourceId: "SRC-ENDOSCOPE" },
        { slot: "3", sourceId: "SRC-FIELD-CAM" },
        { slot: "4", sourceId: "SRC-MONITOR" }
      ]
    }
  ],
  patients: [
    {
      id: "PAT-DEMO-001",
      medicalRecordNo: "MRN-DEMO-001",
      name: "演示患者",
      sex: "未指定",
      age: 0,
      department: "演示科室"
    }
  ],
  surgeries: [
    {
      id: "SURG-DEMO-001",
      patientId: "PAT-DEMO-001",
      roomId: "room-or-standard",
      scheduledAt: "2026-06-29T08:00:00.000Z",
      procedureName: "演示术式",
      surgeon: "演示医生",
      status: "scheduled"
    }
  ],
  recordingTasks: [
    {
      id: "REC-DEMO-001",
      surgeryId: "SURG-DEMO-001",
      sourceId: "SRC-ENDOSCOPE",
      storageVolumeId: "VOL-REC-PRIMARY",
      status: "stopped",
      muted: false,
      startedAt: "2026-06-29T08:30:00.000Z",
      endedAt: "2026-06-29T09:00:00.000Z",
      durationSeconds: 1800
    }
  ],
  mediaAssets: [
    {
      id: "MEDIA-DEMO-001",
      surgeryId: "SURG-DEMO-001",
      patientId: "PAT-DEMO-001",
      recordingTaskId: "REC-DEMO-001",
      type: "video",
      title: "演示腔镜录制",
      storageVolumeId: "VOL-REC-PRIMARY",
      path: "media/demo/MEDIA-DEMO-001.mp4",
      sizeMb: 512,
      checksumStatus: "verified",
      createdAt: "2026-06-29T09:00:00.000Z"
    }
  ]
};
