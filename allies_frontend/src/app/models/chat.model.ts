export interface ChatMessage {
  id?: number;
  maTkA: any;
  maTkB: any;
  noiDung: string;
  thoiGian: Date;
  trangThai: string;
  maMedia?: any;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: number[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}
