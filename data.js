// Dữ liệu tĩnh trích xuất từ Nhân_viên.xlsx, Model.xlsx, Target.xlsx
const EMPLOYEES = [
  {
    "name": "Nguyễn Thị Nhật Quỳnh",
    "msnv": "CN0498384",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-8233-ĐMS_HUE_PVA - Phú Đa",
    "shopCode": "8233",
    "shopType": "D"
  },
  {
    "name": "Trương Thị Như Hiền",
    "msnv": "CN0508135",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-370-TGD_HUE_HTR - 11 Cách Mạng Tháng 8",
    "shopCode": "370",
    "shopType": "C"
  },
  {
    "name": "A Viết Thị Xuân",
    "msnv": "CN0498382",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-4576-ĐMM_HUE_ALU - Thị Trấn A Lưới",
    "shopCode": "4576",
    "shopType": "B"
  },
  {
    "name": "Phạm Thị Phượng",
    "msnv": "CN0562558",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-934-TGD_HUE_PXU - 254 Nguyễn Trãi",
    "shopCode": "934",
    "shopType": "B"
  },
  {
    "name": "Ngô Thị Ái Như",
    "msnv": "CN0539704",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-5441-ĐMM_HUE_HTR - Tứ Hạ",
    "shopCode": "5441",
    "shopType": "C"
  },
  {
    "name": "Trần Đào Phương Anh",
    "msnv": "CN0560181",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-10578-ĐMS_HUE_PVA - Phú Hải",
    "shopCode": "10578",
    "shopType": "D"
  },
  {
    "name": "Trần Hoài Nam",
    "msnv": "CN0498387",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-497-ĐML_HUE_THO - 01 Đường Hà Nội",
    "shopCode": "497",
    "shopType": "B"
  },
  {
    "name": "Trương Phước Ri",
    "msnv": "CN0584639",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-9329-ĐMM_HUE_PVA - Vinh Thanh",
    "shopCode": "9329",
    "shopType": "C"
  },
  {
    "name": "Lê Hồng Thiên Thanh",
    "msnv": "VN0002530",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-265-TGD_HUE_THO - 57 Bà Triệu",
    "shopCode": "265",
    "shopType": "B"
  },
  {
    "name": "Hoàng Thị Quỳnh Như",
    "msnv": "VN0002681",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-2420-ĐMM_HUE_QDI - Nguyễn Vịnh (Sịa)",
    "shopCode": "2420",
    "shopType": "C"
  },
  {
    "name": "Nguyễn Thị Hồng Nhung",
    "msnv": "VN0002785",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-959-ĐML_HUE_THO - 185 Hùng Vương",
    "shopCode": "959",
    "shopType": "B"
  },
  {
    "name": "Nguyễn Thị Thuỳ Trang",
    "msnv": "VN0002876",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-2488-ĐMM_HUE_PXU - 128A Lý Thái Tổ",
    "shopCode": "2488",
    "shopType": "C"
  },
  {
    "name": "Trần Ngọc Bảo Uyên",
    "msnv": "VN0003327",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-364-ĐML_HUE_HTH - 1110 Nguyễn Tất Thành",
    "shopCode": "364",
    "shopType": "B"
  },
  {
    "name": "Huỳnh Thị Diễm Ly",
    "msnv": "VN0003329",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-722-ĐML_HUE_PXU - 197 Trần Hưng Đạo",
    "shopCode": "722",
    "shopType": "B"
  },
  {
    "name": "Lê Quốc Cường",
    "msnv": "VN0003330",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-2389-ĐMM_HUE_HTH - 503 Nguyễn Tất Thành",
    "shopCode": "2389",
    "shopType": "D"
  },
  {
    "name": "Nguyễn Thị Ngọc Trúc",
    "msnv": "VN0003384",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-4545-TGD_HUE_HTH - 1119 Nguyễn Tất Thành (Phú Bài)",
    "shopCode": "4545",
    "shopType": "D"
  },
  {
    "name": "Ngô Thị Anh Thư",
    "msnv": "VN0003462",
    "sales": "Nguyễn Hải Đăng",
    "area": "VN5.3.4",
    "shopName": "KA-1160-TGD_HUE_THO - 02 Nguyễn Sinh Cung",
    "shopCode": "1160",
    "shopType": "C"
  }
];

const MODELS = [
  "V70 (8+256)",
  "V70 (12+256)",
  "V70 FE (8+256)",
  "V70 FE (12+256)",
  "Y31d (4+128)",
  "Y31d (6+128)",
  "Y31d (8+128)",
  "Y11d (4+128)",
  "Y11d (6+128)",
  "Y05 (4+64)",
  "Y05 (4+128)",
  "V60 (12+256)",
  "V60 (12+512)",
  "V60lite (8+256)",
  "V60lite (12+512)",
  "Y39 5G (8+256)",
  "Y39 5G (8+128)",
  "Y21d (4+128)",
  "Y21d (6+128)",
  "Y21d (6+256)",
  "X300 Ultra",
  "X300 (12+256)",
  "X300 pro (16+512)"
];

const TARGETS = [
  {
    "shopCode": "4576",
    "msnv": "CN0498382",
    "monthTarget": 45,
    "V70": 4,
    "V70 FE": 7,
    "Y31d": 8,
    "Y05": 10,
    "Y11d": 6,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "2420",
    "msnv": "VN0002681",
    "monthTarget": 25,
    "V70": 1,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 4,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "370",
    "msnv": "CN0508135",
    "monthTarget": 30,
    "V70": 1,
    "V70 FE": 3,
    "Y31d": 7,
    "Y05": 9,
    "Y11d": 6,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "5441",
    "msnv": "CN0539704",
    "monthTarget": 30,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 9,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "934",
    "msnv": "CN0562558",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "8233",
    "msnv": "CN0498384",
    "monthTarget": 30,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "10578",
    "msnv": "CN0560181",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 6,
    "Y05": 8,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "2488",
    "msnv": "VN0002876",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "959",
    "msnv": "VN0002785",
    "monthTarget": 25,
    "V70": 2,
    "V70 FE": 3,
    "Y31d": 6,
    "Y05": 9,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "497",
    "msnv": "CN0498387",
    "monthTarget": 30,
    "V70": 2,
    "V70 FE": 3,
    "Y31d": 7,
    "Y05": 8,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "9329",
    "msnv": "CN0584639",
    "monthTarget": 30,
    "V70": 1,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 4,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "722",
    "msnv": "VN0003329",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 4,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "364",
    "msnv": "VN0003327",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 4,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "4545",
    "msnv": "VN0003384",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 8,
    "Y11d": 4,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "265",
    "msnv": "VN0002530",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 3,
    "Y31d": 5,
    "Y05": 9,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "2389",
    "msnv": "VN0003330",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 7,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  },
  {
    "shopCode": "1160",
    "msnv": "VN0003462",
    "monthTarget": 25,
    "V70": 0,
    "V70 FE": 2,
    "Y31d": 5,
    "Y05": 7,
    "Y11d": 5,
    "V60": 0,
    "Khac": 0
  }
];

const SHIFTS = ["Hành Chánh", "Chiều", "Gãy"];

const COMPETITORS = ["Realme", "SamSung", "Oppo", "Xiaomi"];
