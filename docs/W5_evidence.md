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
![VPC Endpoints Screenshot](./images/w5/mh1/vpc-endpoints.png)
> **Note:** Chúng tôi đã cấu hình VPC Endpoints cho `ecr.api`, `ecr.dkr`, `logs`, `secretsmanager`, `elasticfilesystem` (Interface) và `s3` (Gateway).

### 2. Network Firewall / Security Groups
![Network Firewall Screenshot](./images/w5/mh2/firewall-sg.png)
> **Note:** Hệ thống sử dụng Security Groups kiểm soát chặt chẽ (ECS chỉ nhận từ ALB, RDS/EFS chỉ nhận từ ECS).

---

## (3) MH3: Shared Application Storage (EFS)
*(Bằng chứng EFS mount vào ECS và thực hiện thao tác Read/Write thực tế)*

### 1. Cấu hình EFS và Mount Target
![EFS Config Screenshot](./images/w5/mh3/efs-config.png)
> **Note:** Amazon EFS được cấu hình Mount Target tại các Private Subnets.

### 2. Bằng chứng Read/Write Data trên Container
![EFS Mount Screenshot](./images/w5/mh3/efs-mount.png)
> **Note:** Lệnh `cat` trong container chứng minh file CSV được xuất ra thành công và lưu trữ bền vững trên EFS.

---

## (4) Restore Test (AWS Backup)
*(Bằng chứng quá trình Khôi phục dữ liệu từ AWS Backup cho EFS, RDS và EC2/EBS)*

### 1. AWS Backup Plan
![Backup Plan Screenshot](./images/w5/mh3/aws-backup.png)
> **Note:** Plan `xbrain-daily-backup` bảo vệ toàn bộ tài nguyên quan trọng.

### 2. Restore Job Completed
![Restore Jobs Screenshot](./images/w5/mh3/restore-job.png)
> **Note:** Trạng thái `Completed` chứng minh khả năng phục hồi thảm họa.

### 3. Đọc dữ liệu sau khi Restore (EFS/RDS)
![Restore Validation Screenshot](./images/w5/mh3/after-restore.png)
> **Note:** Dữ liệu sau khi restore vẫn nguyên vẹn và có thể truy cập được.

---

## (5) MH4 & MH5: Serverless Security & Scaling

### 1. API Gateway REST API với API Key (MH4)
![API Gateway Key Screenshot](./images/w5/mh4/api-gateway-key.png)
> **Note:** API Gateway yêu cầu API Key hợp lệ để truy cập.

### 2. Lambda Reserved Concurrency & Throttling (MH5)
![Lambda Concurrency Screenshot](./images/w5/mh5/lambda-concurrency.png)
> **Note:** CloudWatch ghi nhận Throttling khi vượt quá Reserved Concurrency.

---

## (6) Bonus (Optional: IaC & Automation)

* **Terraform CI/CD Implementation:**
Toàn bộ hạ tầng được quản lý qua code.
* **Git Commit Link:** [G9-X/Merxly-XB9 Terraform W5 Hardening](https://github.com/G9-X/Merxly-XB9/commits/main)
