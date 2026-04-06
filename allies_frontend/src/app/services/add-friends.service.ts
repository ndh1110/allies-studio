// allies_frontend/src/app/services/add-friends.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserLite {
  id: number | string;
  username: string;
  email?: string;
  initials?: string;
  mutualCount?: number;
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELED';

export interface FriendRequest {
  id: number | string;
  fromUser: UserLite;
  toUser: UserLite;
  status: RequestStatus;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AddFriendsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl; // ví dụ: http://localhost:8080/api

  /** Header kèm Bearer token */
  private headers(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ================== USERS SEARCH ==================
  /**
   * Tìm kiếm người dùng theo q.
   * Map “mềm” để chịu được nhiều schema backend khác nhau:
   *  - id | maTk | MA_TK | ma_tk | userId
   *  - username | tenDn | TEN_DN | ten_dn
   *  - email | mail | MAIL
   */
  async searchUsers(q: string): Promise<UserLite[]> {
    const url = `${this.base}/users/search`;

    const raw = await firstValueFrom(
      this.http.get<any[]>(url, {
        params: { q },
        headers: this.headers(),
      })
    );

    return (raw ?? []).map((u: any) => ({
      id:
        u.id ??
        u.maTk ?? u.ma_tk ?? u.MA_TK ??
        u.userId,
      username:
        u.username ??
        u.tenDn ?? u.ten_dn ?? u.TEN_DN,
      email:
        u.email ?? u.mail ?? u.MAIL,
    })) as UserLite[];
  }

  // ================== FRIEND REQUESTS ==================
  /** Gửi lời mời kết bạn */
  sendRequest(toUserId: number | string) {
    const senderId = localStorage.getItem('userId');
    const body = {
      senderId: Number(senderId),
      receiverId: Number(toUserId),
      noiDung: "Hello, I would like to be friends!"
    };
    return firstValueFrom(
      this.http.post(`${this.base}/loimoiketban`, body, { headers: this.headers() })
    );
  }

  /** Lời mời đến */
  getIncoming() {
    const userId = localStorage.getItem('userId') || '';
    return firstValueFrom(
      this.http.get<FriendRequest[]>(`${this.base}/loimoiketban/incoming`, { params: { userId }, headers: this.headers() })
    );
  }

  /** Lời mời đã gửi */
  getOutgoing() {
    const userId = localStorage.getItem('userId') || '';
    return firstValueFrom(
      this.http.get<FriendRequest[]>(`${this.base}/loimoiketban/outgoing`, { params: { userId }, headers: this.headers() })
    );
  }

  /** Chấp nhận lời mời */
  accept(id: number | string) {
    return firstValueFrom(
      this.http.post(`${this.base}/loimoiketban/${id}/accept`, {}, { headers: this.headers() })
    );
  }

  /** Từ chối lời mời */
  decline(id: number | string) {
    return firstValueFrom(
      this.http.post(`${this.base}/loimoiketban/${id}/decline`, {}, { headers: this.headers() })
    );
  }

  /** Hủy lời mời đã gửi */
  cancel(id: number | string) {
    return firstValueFrom(
      this.http.post(`${this.base}/loimoiketban/${id}/cancel`, {}, { headers: this.headers() })
    );
  }

  // ================== SUGGESTIONS ==================
  /** Gợi ý kết bạn */
  getSuggestions() {
    return firstValueFrom(
      this.http.get<UserLite[]>(`${this.base}/loimoiketban/suggestions`, { headers: this.headers() })
    );
  }

  // ================== FRIENDS / QUANHE ==================
  getFriends() {
    const userId = localStorage.getItem('userId') || '';
    return firstValueFrom(
      this.http.get<any[]>(`${this.base}/quanhe/${userId}`, { headers: this.headers() })
    );
  }

  unfriend(friendId: number | string) {
    const userId = localStorage.getItem('userId') || '';
    return firstValueFrom(
      this.http.delete(`${this.base}/quanhe/${userId}/${friendId}`, { headers: this.headers() })
    );
  }
}
