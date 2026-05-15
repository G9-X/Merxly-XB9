# Evidence Pack — Week 5 (Hardening Architecture)
## (1) Cover
* **Group Name:** G9-X (Merxly)
* **Members:**
  - Trần Văn Đức (XB-DN26-119)
  - Nguyễn Hữu Định (XB-DN26-083)
  - Trần Đình Bảo Long (XB-DN26-050)
  - Nguyễn Đức Chinh (XB-DN26-080)
  - Lê Duy Khánh (XB-DN26-153)
  - Trương Thị Mỹ Quyên (XB-DN26-116)
  - Trọng Tấn (XB-DN26-152)
  - Lê Trung Kiên (XB-DN26-045)
* **Architecture:** Justified Single-VPC with ECS Fargate/EC2, RDS Multi-AZ, EFS, and Serverless Stack.

---

## (2) MH1 & MH2: Networking Foundations & Security
*(Bằng chứng về việc tối ưu mạng nội bộ và chặn truy cập trái phép)*

### 1. VPC Endpoints (Interface & Gateway)
![VPC Endpoints Screenshot](./images/w5/mh1/vpc-endpoints.png)
> **Note:** Cấu hình VPC Endpoints để giảm lưu lượng đi qua NAT Gateway.

### 2. Network Firewall / Security Groups
![Network Firewall Screenshot](./images/w5/mh2/firewall-sg.png)
> **Note:** Security Groups kiểm soát chặt chẽ inbound/outbound cho ECS, RDS và EFS.

---

## (3) MH3: Shared Application Storage (EFS)
*(Bằng chứng EFS mount vào ECS và thực hiện thao tác Read/Write thực tế)*

### 1. Cấu hình EFS và Mount Target
![EFS Config Screenshot](./images/w5/mh3/efs-config.png)
> **Note:** Amazon EFS được cấu hình Mount Target tại các Private Subnets.

### 2. ECS Task Definition với EFS Volume
![ECS Task Def Screenshot](./images/w5/mh3/efs-task-def.png)
> **Note:** Cấu hình Task Definition sử dụng EFS Access Point để phân quyền ghi cho Container.

### 3. Bằng chứng Read/Write Data trên Container
![EFS Mount Screenshot](./images/w5/mh3/efs-mount.png)
> **Note:** Lệnh `cat` trong container chứng minh file CSV được xuất ra thành công và lưu trữ trên EFS.

---

## (4) Restore Test (AWS Backup)
*(Bằng chứng quá trình Khôi phục dữ liệu từ AWS Backup cho EFS, RDS và EC2/EBS)*

### 1. AWS Backup Plan
![Backup Plan Screenshot](./images/w5/mh3/aws-backup.png)
> **Note:** Plan `xbrain-daily-backup` lập lịch backup tự động hằng ngày.

### 2. Recovery Points (Điểm khôi phục)
![Recovery Point Screenshot](./images/w5/mh3/recovery-point.png)
> **Note:** Danh sách các bản backup đã hoàn thành (`Completed`) sẵn sàng để khôi phục.

### 3. Restore Job Completed
![Restore Jobs Screenshot](./images/w5/mh3/restore-job.png)
> **Note:** Trạng thái `Completed` của Restore Job chứng minh khả năng phục hồi thảm họa thành công.

### 4. Kiểm tra dữ liệu sau khi Restore
![Restore Validation Screenshot](./images/w5/mh3/after-restore.png)
> **Note:** Dữ liệu sau khi restore được kiểm tra và xác nhận nguyên vẹn.

---

## (5) MH4 & MH5: Serverless Security & Scaling

### 1. API Gateway REST API với Lambda Authorizer (MH4)
![API Gateway Screenshot](./images/w5/mh4/Api_Gateway.png)
> **Note:** API Gateway được cấu hình với REST API gồm GET method, tích hợp với Lambda, và sử dụng Lambda Authorizer (MyLambdaAuthorizer) để kiểm soát truy cập. Deployment thành công và active cho dev environment.

### 2. Lambda Authorizer Configuration (MH4)
![Authorizers Screenshot](./images/w5/mh4/Authorizers.png)
> **Note:** Authorizer ID: 54hj0t, Lambda function: SimpleAPIAuthorizer (us-west-2). Token được trích xuất từ Authorization header với caching 300 giây để tối ưu performance.

### 3. Lambda Function - Authorization Logic (MH4)
![Lambda Code Screenshot](./images/w5/mh4/Lambda.png)
> **Note:** Hàm SimpleAPIAuthorizer xác thực token "Bearer my-secret-token-123". Nếu hợp lệ, trả về Allow policy cho user; nếu không, trả về Deny policy. Mã code được viết bằng JavaScript với logic kiểm tra token rõ ràng.

### 4. Test Results - Authorization Validation (MH5)
![Test Command Screenshot](./images/w5/mh4/test_cmd.jpg)
> **Note:** Các test command chứng minh:
> - **Test 1 (Valid Token):** curl với "Bearer my-secret-token-123" → HTTP/1.1 200 OK ✓
> - **Test 2 (Invalid Token):** curl với "Bearer fake-token" → HTTP/1.1 403 Forbidden ✓
> - **Test 3 (No Token):** curl không header → HTTP/1.1 401 Unauthorized ✓
> 
> Lambda Authorizer hoạt động chính xác: chỉ cho phép request với token hợp lệ, từ chối request với token không hợp lệ hoặc không có token.

---

## (6) Bonus (Optional: IaC & Automation)

* **Terraform CI/CD Implementation:**
Toàn bộ hạ tầng được quản lý qua code Terraform.
* **Git Commit Link:** [G9-X/Merxly-XB9 Terraform W5 Hardening](https://github.com/G9-X/Merxly-XB9/commits/main)
