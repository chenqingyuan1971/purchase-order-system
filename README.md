---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022039700b2b274d6315fa691ea310e95cae6b42c5d6ca11d738cf0529e12e819859022100a8de86763e42771a6f93f9b004c799027156cc0647115a34f8d9d4c28da7f3d0
    ReservedCode2: 3046022100f49caefaf5ad88e37e24605c6b38b8f47b240f45a699ae92b3a85e0d37690f7c022100cb98f917be3cbd95e7bf94bcf4d05ccbb3be87ced97a1dd20bc64bd3c09e3fb7
---

# 购销单管理系统 V2.0

## 项目简介
购销单管理系统V2.0云端版是一款功能完善的订单管理工具，支持用户注册登录、云端保存订单、历史订单管理等功能。

## 功能特性
- **用户认证**：支持邮箱注册和登录
- **云端存储**：订单数据保存到Firebase云端数据库
- **历史管理**：查看、加载、删除历史订单
- **数据同步**：支持多设备同步访问
- **打印导出**：支持打印和导出PDF

## 快速开始

### 1. 配置Firebase

本项目使用Firebase作为后端服务，需要进行以下配置：

#### 步骤1：创建Firebase项目
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"，输入项目名称
3. 按照提示完成项目创建（可以禁用Google Analytics以简化流程）

#### 步骤2：启用Authentication
1. 在Firebase控制台左侧菜单中，选择"构建" → "Authentication"
2. 点击"开始"或"Sign-in method"
3. 点击"邮箱/密码"提供程序
4. 启用"邮箱/密码"
5. 点击"保存"

#### 步骤3：创建Firestore Database
1. 在Firebase控制台左侧菜单中，选择"构建" → "Firestore Database"
2. 点击"创建数据库"
3. 选择位置（建议选择asia-east1或asia-northeast1）
4. 选择"以测试模式启动"（开发环境）或配置安全规则（生产环境）
5. 点击"完成"

#### 步骤4：获取配置信息
1. 在Firebase控制台，点击项目概览旁边的"设置"图标
2. 向下滚动，找到"您的应用"部分
3. 点击Web图标（</>）
4. 注册应用（可以输入任意应用名称）
5. 复制Firebase配置对象

#### 步骤5：更新代码配置
打开 `purchase-order-system.html`，找到约第1680行的Firebase配置部分，替换为您的配置：

```javascript
const firebaseConfig = {
    apiKey: "您的API_KEY",
    authDomain: "您的PROJECT_ID.firebaseapp.com",
    projectId: "您的PROJECT_ID",
    storageBucket: "您的PROJECT_ID.appspot.com",
    messagingSenderId: "您的SENDER_ID",
    appId: "您的APP_ID"
};
```

### 2. 配置安全规则（可选）

为了保护数据安全，建议配置Firestore安全规则：

在Firebase控制台的Firestore Database中，选择"规则"标签页，使用以下规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. 添加授权域名（可选）

如果部署到GitHub Pages，需要添加授权域名：

1. 在Firebase控制台，进入"项目设置"
2. 找到"安全域名"部分
3. 点击"添加域名"
4. 输入您的GitHub Pages域名，例如：`yourusername.github.io`

## 部署到GitHub Pages

### 方法1：直接上传文件

1. 在GitHub上创建新仓库（如 `purchase-order-system`）
2. 将 `purchase-order-system.html` 上传至仓库根目录
3. 进入仓库"Settings" → "Pages"
4. 在"Source"下选择"main"分支
5. 点击"Save"
6. 等待部署完成，访问生成的链接

### 方法2：使用Git命令行

```bash
# 克隆仓库
git clone https://github.com/您的用户名/purchase-order-system.git
cd purchase-order-system

# 添加文件
cp /path/to/purchase-order-system.html .

# 提交并推送
git add .
git commit -m "Initial commit: Purchase Order System V2.0"
git push origin main

# 启用GitHub Pages（在GitHub仓库设置中操作）
```

## 使用说明

### 注册/登录
1. 点击页面右上角的"注册"按钮
2. 输入用户名、邮箱和密码
3. 点击注册完成账户创建
4. 使用注册的邮箱和密码登录

### 保存订单
1. 填写购销单的各项信息
2. 点击"保存到云端"按钮
3. 订单将保存到您的云端账户

### 查看历史订单
1. 登录后点击"历史订单"按钮
2. 右侧会滑出历史订单面板
3. 可以查看、加载或删除历史订单

## 技术栈
- **前端**：HTML5、CSS3、JavaScript (ES6+)
- **后端服务**：Google Firebase
  - Firebase Authentication（用户认证）
  - Cloud Firestore（云端数据库）
- **部署**：GitHub Pages

## 浏览器兼容性
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 注意事项
1. Firebase服务需要有效的网络连接
2. 请妥善保管您的账户信息
3. 首次使用需要配置Firebase配置
4. 建议在生产环境中配置完善的安全规则

## 许可证
MIT License

## 联系方式
如有问题或建议，请提交Issue或联系开发者。
