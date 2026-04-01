-- Script để tạo dữ liệu test cho bảng quanhe
-- Chạy script này trong MySQL để tạo một số friendships test

-- Kiểm tra xem có users nào không
SELECT 'Current users:' as info;
SELECT * FROM Taikhoan;

-- Tạo friendships test cho user5 và admin123
-- Thay đổi MA_TK_A và MA_TK_B theo users thật trong database

-- Xóa friendships cũ nếu có
DELETE FROM quanhe WHERE (MA_TK_A = 6 AND MA_TK_B = 7) OR (MA_TK_A = 7 AND MA_TK_B = 6);

-- Tạo friendships test (user5 có MA_TK = 6, admin123 có MA_TK = 7)
INSERT INTO quanhe (MA_TK_A, MA_TK_B, NGAY_KET_BAN) VALUES 
(6, 7, NOW()),  -- user5 và admin123 là bạn
(7, 6, NOW());  -- Bidirectional friendship

-- Tạo thêm friendships với admin (MA_TK = 1)
INSERT INTO quanhe (MA_TK_A, MA_TK_B, NGAY_KET_BAN) VALUES 
(1, 6, NOW()),  -- admin và user5 là bạn
(6, 1, NOW()),  -- Bidirectional friendship
(1, 7, NOW()),  -- admin và admin123 là bạn
(7, 1, NOW());  -- Bidirectional friendship

-- Kiểm tra kết quả
SELECT 'Friendships created:' as info;
SELECT * FROM quanhe;

-- Xem danh sách bạn bè của user5 (MA_TK = 6)
SELECT 'Friends of user5:' as info;
SELECT 
    CASE 
        WHEN q.MA_TK_A = 6 THEN t2.TEN_DN 
        ELSE t1.TEN_DN 
    END as friend_name,
    q.NGAY_KET_BAN
FROM quanhe q
JOIN Taikhoan t1 ON q.MA_TK_A = t1.MA_TK
JOIN Taikhoan t2 ON q.MA_TK_B = t2.MA_TK
WHERE q.MA_TK_A = 6 OR q.MA_TK_B = 6;

-- Xem danh sách bạn bè của admin123 (MA_TK = 7)
SELECT 'Friends of admin123:' as info;
SELECT 
    CASE 
        WHEN q.MA_TK_A = 7 THEN t2.TEN_DN 
        ELSE t1.TEN_DN 
    END as friend_name,
    q.NGAY_KET_BAN
FROM quanhe q
JOIN Taikhoan t1 ON q.MA_TK_A = t1.MA_TK
JOIN Taikhoan t2 ON q.MA_TK_B = t2.MA_TK
WHERE q.MA_TK_A = 7 OR q.MA_TK_B = 7;
