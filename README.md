# Hướng dẫn cài đặt

1. Cài đặt ngrok

   a. Tải và cài đặt ngrok
   
      Truy cập trang web ngrok:[ Ngrok Download.](https://ngrok.com/downloads/windows)

      Tải phiên bản phù hợp với hệ điều hành của bạn (Windows, macOS, hoặc Linux).

    Cài đặt ngrok:

    Đối với Windows: Giải nén và di chuyển tệp .exe vào thư mục có trong PATH.

    Đối với macOS/Linux: Mở terminal và gõ:
   
         brew install ngrok

    b. Đăng ký và lấy token ngrok
   
      Tạo tài khoản ngrok tại: [Ngrok Sign Up.](https://dashboard.ngrok.com/login)

      Lấy Auth Token từ trang Dashboard của bạn.

      Cấu hình Auth Token cho ngrok: Sau khi cài đặt ngrok, mở terminal và chạy lệnh sau để cấu hình token:
   
          ngrok authtoken <your-ngrok-token>

      Chạy lệnh sau để chạy domain:

         ngrok http 3000

      Coppy domain hiển thị để xử dụng lấy mật khẩu ứng dụng
3. Cài đặt NodeJs

   a. Cài đặt Node.js

    Truy cập trang web chính thức: [Node.js](https://nodejs.org/en)
  
    Tải xuống và cài đặt phiên bản LTS (Long Term Support).

  b. Kiểm tra cài đặt
    Sau khi cài đặt xong, mở Terminal và chạy các lệnh sau để kiểm tra  

    node -v
    npm -v
    
  Kết quả sẽ trả về phiên bản của Node.js và npm.

  4. Cài đặt MySQL

     Cài đặt MySQL trên Windows
     
     Tải MySQL Installer:

     Truy cập trang chính thức: [MySQL Downloads](https://dev.mysql.com/downloads/installer/)

     Tải MySQL Installer (dạng .msi).

     Cài đặt MySQL:

        Chạy tệp tải về và chọn MySQL Server.

        Trong quá trình cài đặt, chọn Developer Default hoặc Server only.

     Cấu hình các bước:

        Set root password: Đặt mật khẩu cho user root.
        
        Port: Chọn cổng mặc định là 3306.

     Configuration: Chọn NT Authentication (nếu muốn cài cho máy tính Windows).

     Kiểm tra MySQL:
      
     Mở Command Prompt hoặc MySQL Command Line Client và nhập:

         mysql -u root -p  

     Nhập mật khẩu của user root để đăng nhập vào MySQL.

     Tạo Schema và bảng để lưu token:

         CREATE DATABASE bitrix_oauth;

         USE bitrix_oauth;
         CREATE TABLE tokens (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            access_token VARCHAR(255) NOT NULL,
            refresh_token VARCHAR(255) NOT NULL,
            expires_in INT NOT NULL,
            obtained_at BIGINT NOT NULL,
          );

       

6. Lấy mật khẩu ứng dụng Bitrix ( Cách cá nhân, nếu có sẵn mật khẩu và id ứng dụng có thể bỏ qua bước này)

   Truy cập [Bitrix for Developer](https://vendors.bitrix24.com/)

   Đăng ký tài khoản và đăng nhập.
   
   Giao diện sẽ hiển thị như sau:

   ![image](https://github.com/user-attachments/assets/db8d826a-4c6f-4619-9475-438fcdfa8843)

     + Chọn New Application
     + Chọn Worldwide (Cách làm hiện tại)
     + Ở mục Application nhân create
     + Quyền sẽ chọn CRM, User
     + ![image](https://github.com/user-attachments/assets/9d369c18-8f9b-4632-bb67-fe8e5b4768ac)
     + Gán link lấy từ ngrok( Đã đề cập ở trên)
     + Với instal thêm /install
     + link cuối cùng tạm thời chưa dùng
    
7. Clone repository từ github về:

   + Mở terminal: gõ lệnh

         git clone https://github.com/kt-founder/AASCTest1.git

   + Chỉnh sửa file cấu hình .env ở thư mục gốc:

      ![image](https://github.com/user-attachments/assets/8d779bbe-bc42-4a86-9a49-26ed081a7cb8)

       Thay thông tin bằng thông tin của mình: Bao gồm mật khẩu mysql và các phần cơ bản của bitrix24
     
   + Sau khi chạy xong: Tiến hành cài đặt Back-end

         cd .\AASCTest1\Back-end\
         npm install
     
   + Khi cài đặt hoàn tất:

     Gõ lệnh:

         node index.js

     Ứng dụng đã chạy và hoạt động trên http://localhost:3000 và domain ngrok

     Bây giờ đã có thể cài đặt ứng dụng

     ![image](https://github.com/user-attachments/assets/6d08f09b-fe20-4101-9198-3e544195d7d2)

     Sau khi cài xong và mở ứng dụng -> access token đã được lưu

     Hiện tại đang gặp lỗi grant_type khi dùng refresh token( nếu hết token cần cài đặt lại): Đã làm đúng trên apidocs:

           ![image](https://github.com/user-attachments/assets/5bb9dabf-caf5-4dad-983c-3f4e13b640b0)


   + Tiếp đó cài đặt Frond-end: Mở terminal chạy lệnh

         cd ..
         cd .\AASCTest1\Frond-end\
         npm install

   + Khi cài đặt hoàn tất: Chạy lệnh

         npm run dev

     Để chạy ứng dụng -> Sau đó vào http://localhost:3333

     Kết quả sẽ hiển thị giao diện:

        ![image](https://github.com/user-attachments/assets/d1f32ef3-acfb-446f-953b-4d0bc38f4e88)
  
        Thêm mới có thể thêm nhiều email, web, phone giống mô tả

        ![image](https://github.com/user-attachments/assets/d918d605-8ffe-41d2-bb9d-8e683ffd0fb5)



     



      

     

      
     


     

     
         


     


   
   
