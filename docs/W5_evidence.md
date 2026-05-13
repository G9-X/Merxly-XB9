# Evidence Pack — Week 5 (Hardening Architecture)
## (1) Cover
* **Group Name:** G9-X (Merxly)
* **Members:** 
  - Lê Hoàng Trung Kiên
  - [Thành viên 2]
  - [Thành viên 3]
* **Architecture:** Justified Single-VPC with ECS Fargate/EC2, RDS Multi-AZ, EFS, and Serverless Stack.

---

## (2) MH1 & MH2: Networking Foundations & Security
*(Bằng chứng về việc tối ưu mạng nội bộ và chặn truy cập trái phép)*

### 1. VPC Endpoints (Interface & Gateway)
![VPC Endpoints Screenshot](./images/w5/vpc-endpoints.png)
> **Note:** Chúng tôi đã cấu hình VPC Endpoints cho `ecr.api`, `ecr.dkr`, `logs`, `secretsmanager`, `elasticfilesystem` (Interface) và `s3` (Gateway) để đảm bảo lưu lượng nội bộ không đi qua NAT Gateway (giảm chi phí và tăng bảo mật).

### 2. Network Firewall / Security Groups
![Network Firewall Screenshot](./images/w5/firewall-sg.png)
> **Note:** Hệ thống sử dụng Security Groups kiểm soát chặt chẽ (ECS chỉ nhận từ ALB, RDS/EFS chỉ nhận từ ECS). *(Thêm ảnh rule Firewall nếu có cấu hình AWS Network Firewall)*.

---

## (3) MH3: Shared Application Storage (EFS)
*(Bằng chứng EFS mount vào ECS và thực hiện thao tác Read/Write thực tế)*

### 1. Cấu hình EFS và Mount Target
![EFS Config Screenshot](./images/w5/efs-config.png)
> **Note:** Amazon EFS được khởi tạo ở chế độ mã hóa (Encrypted) và Mount Target được đặt ở Private App Subnets, chỉ cho phép kết nối qua cổng TCP 2049 từ Backend Security Group.

### 2. Bằng chứng Read/Write Data trên Container
![EFS Mount Screenshot](./images/w5/efs-mount.png)
> **Note:** Chụp màn hình Terminal (SSM Session Manager) truy cập vào ECS Container. Lệnh `cat /mnt/efs/exports/orders.csv` in ra thành công nội dung Export Order từ Database, chứng minh quyền Read/Write EFS hoàn toàn hoạt động.

---

## (4) Restore Test (AWS Backup)
*(Bằng chứng quá trình Khôi phục dữ liệu từ AWS Backup cho EFS, RDS và EC2/EBS)*

### 1. AWS Backup Plan
![Backup Plan Screenshot](./images/w5/backup-plan.png)
> **Note:** Backup plan `xbrain-daily-backup` được lập lịch chạy hằng ngày với Retention 7 ngày, gán tag bảo vệ cho EFS, RDS và EC2.

### 2. Restore Job Completed
![Restore Jobs Screenshot](./images/w5/restore-jobs-completed.png)
> **Note:** Cả 3 job Restore On-demand (cho EFS, RDS, EC2) đều hoàn thành thành công (Status: Completed).

### 3. Đọc dữ liệu sau khi Restore (EFS/RDS)
![Restore Validation Screenshot](./images/w5/restore-validation.png)
> **Note:** 
> - **EFS:** Đã mount ổ EFS được phục hồi (`fs-xxx`) vào EC2 Test Instance, dữ liệu file export vẫn nguyên vẹn.
> - **RDS:** Kết nối thành công vào DB Instance mới `xbrain-rds-restored` và query được bảng Orders.

---

## (5) MH4 & MH5: Serverless Security & Scaling

### 1. API Gateway REST API với API Key (MH4)
![API Gateway Key Screenshot](./images/w5/api-gateway-key.png)
![API Gateway Postman Screenshot](./images/w5/api-gateway-postman.png)
> **Note:** Rest API Gateway được cấu hình yêu cầu x-api-key. Ảnh 1: Postman gọi không có key trả về `403 Forbidden`. Ảnh 2: Postman gọi kèm header `x-api-key` trả về `200 OK`.

### 2. Lambda Reserved Concurrency & Throttling (MH5)
![Lambda Concurrency Screenshot](./images/w5/lambda-concurrency.png)
![Lambda Throttles CloudWatch Screenshot](./images/w5/lambda-throttles.png)
> **Note:** Giới hạn hàm Lambda Chatbot với Reserved Concurrency = 2. Khi dùng vòng lặp gửi 10 requests đồng thời, CloudWatch Metrics ghi nhận biểu đồ `Throttles` tăng vọt, chứng tỏ hệ thống đã chủ động từ chối request để bảo vệ tài nguyên.

---

## (6) Bonus (Optional: IaC & Automation)

* **Terraform CI/CD Implementation:**
Toàn bộ EFS, VPC Endpoints, IAM Policy và ECS Mount Configuration đều được triển khai tự động qua Terraform CI/CD Workflow.
* **Git Commit Link:** [Link tới commit chứa file terraform trên GitHub]
