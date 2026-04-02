import { User } from './user.model';

export interface ChatMessage {
  id?: number;
  maTkA: User;
  maTkB: User;
  noiDung: string;
  thoiGian: Date;
  trangThai: string;
  maMedia?: Media;
}


export interface Media {
  id: number;
  tenFile: string;
  loaiFile: string;
  duongDan: string;
  kichThuoc: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: number[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface TypingIndicator {
  userId: number;
  isTyping: boolean;
  timestamp: Date;
}
