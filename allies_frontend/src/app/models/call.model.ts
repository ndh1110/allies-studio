export interface Call {
  id: number;
  loaiGoi: string;
  thoiGianBatDau: Date;
  thoiGianKetThuc?: Date;
  nguoiTaoCall: any;
  trangThai: string;
  tongThoiLuongGiay?: number;
  maNhom?: any;
}

export interface CallData {
  callerId: string;
  receiverId: string;
  callType: string;
}

export interface CallAnswer {
  callId: number;
  answer: 'accept' | 'reject';
}
