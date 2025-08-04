# 优雅记事本 🖋️

现代化、安全、美观的记事本应用，支持密码保护、分享功能和优雅设计。基于 Next.js 14 构建，部署在 Vercel 上，使用 Upstash Redis 存储。请多多Star，谢谢了！

## 📸 应用截图

### 🏠 主页界面
![主页界面](images/1.png)

### 📝 创建笔记
![创建笔记](images/2.png)

### 📋 笔记列表
![笔记列表](images/3.png)

### 👀 笔记详情
![笔记详情](images/4.png)

### 🔗 分享页面
![分享页面](images/5.png)

## ✨ 功能特性

- 🔒 **密码保护** - 使用加密技术保护您的敏感笔记
- 🔗 **短链接** - 为您的笔记生成可分享的短链接
- 📥 **Markdown 导出** - 下载精美格式的 .md 文件
- 🎨 **现代化界面** - 简洁响应式设计，支持深色/浅色主题
- ⚡ **极速性能** - 基于 Next.js 14 构建，优化加载速度
- ☁️ **云端存储** - 可靠的 Upstash Redis 存储后端
- 📱 **移动友好** - 响应式设计，适配所有设备
- 🛡️ **安全可靠** - 高级安全功能和数据保护

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Upstash Redis 数据库
- Vercel 账户用于部署

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **设置 Upstash Redis:**
   - 在 [Upstash Console](https://console.upstash.com/) 创建 Redis 数据库
   - 获取连接信息（URL 和 Token）
   - 复制 `env.example` 到 `.env.local` 并填入您的凭据

3. **Run locally:**
   ```bash
   npm run dev
   ```

### Environment Variables

创建 `.env.local` 文件并添加以下变量:

```env
KV_URL=rediss://default:your_token@your-redis.upstash.io:6379
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
REDIS_URL=rediss://default:your_token@your-redis.upstash.io:6379
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Upstash Redis 设置

1. 登录 [Upstash Console](https://console.upstash.com/)
2. 创建新的 Redis 数据库
3. 选择地区（建议选择离用户最近的地区）
4. 从数据库详情页面复制连接信息
5. 将 REST API URL 和 Token 填入环境变量

### Deployment on Vercel

1. **Connect your repository:**
   - Import your GitHub repository to Vercel
   - Configure the environment variables in Vercel dashboard

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - Go to your project settings
   - Add all the environment variables from your `.env.local`

## 🏗️ Project Structure

```
elegant-notepad/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── notes/         # Note management endpoints
│   │   ├── short/         # Short URL endpoints
│   │   └── health/        # Health check endpoint
│   ├── note/[id]/         # Individual note pages
│   ├── notes/             # User notes list page
│   ├── s/[shortUrl]/      # Shared note pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── loading.tsx
│   │   ├── markdown-editor.tsx
│   │   └── textarea.tsx
│   ├── AuthProvider.tsx   # Authentication context
│   ├── CreateNoteModal.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── Header.tsx         # Navigation header
│   ├── LoginModal.tsx
│   ├── PasswordModal.tsx
│   └── ThemeProvider.tsx
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── redis.ts          # Redis database client
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── images/               # Application screenshots
│   ├── 1.png            # Homepage
│   ├── 2.png            # Create note
│   ├── 3.png            # Notes list
│   ├── 4.png            # Note details
│   └── 5.png            # Share page
└── public/              # Static assets
```

## 🔧 API Endpoints

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 笔记管理
- `POST /api/notes` - 创建新笔记
- `GET /api/notes` - 获取用户笔记列表
- `GET /api/notes/[id]` - 根据 ID 获取笔记
- `PUT /api/notes/[id]` - 更新笔记
- `DELETE /api/notes/[id]` - 删除笔记
- `POST /api/notes/[id]/verify` - 验证笔记密码
- `PUT /api/notes/[id]/password` - 设置笔记密码
- `DELETE /api/notes/[id]/password` - 移除笔记密码

### 分享功能
- `GET /api/short/[shortUrl]` - 通过短链接获取笔记

### 系统功能
- `GET /api/health` - 系统健康检查

## 🎨 Tech Stack

- **前端:** Next.js 14, React 18, TypeScript
- **样式:** Tailwind CSS, Framer Motion
- **数据库:** Upstash Redis
- **部署:** Vercel
- **图标:** Lucide React
- **加密:** bcryptjs 密码哈希

## 🎯 主要功能展示

### 🏠 现代化主页
- 简洁优雅的界面设计
- 支持深色/浅色主题切换
- 响应式布局，完美适配各种设备

### 📝 智能编辑器
- 支持 Markdown 语法
- 实时预览功能
- 暗色主题编辑模式
- 字符统计和行数显示

### 🔐 用户认证系统
- 安全的用户注册和登录
- JWT 令牌认证
- 个人笔记管理

### 📋 笔记管理
- 创建、编辑、删除笔记
- 密码保护功能
- 搜索和筛选
- 批量操作

### 🔗 分享功能
- 生成短链接分享
- 密码保护的分享
- 访问统计
- 下载 Markdown 文件

## 🛡️ Security Features

- Password hashing with bcryptjs
- Input sanitization and validation
- XSS protection headers
- Secure environment variable handling
- Automatic note expiration
- Rate limiting considerations

## 📱 Usage

1. **Create a Note:**
   - Click "New Note" or "Start Writing"
   - Enter title and content
   - Optionally set a password and expiration

2. **Share a Note:**
   - Click the share button to copy the short link
   - Share the link with others

3. **Download Notes:**
   - Click the download button to get a Markdown file
   - Perfect for backing up your notes

4. **Password Protection:**
   - Set a password when creating sensitive notes
   - Only those with the password can view the content

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for secure, beautiful note-taking
- Thanks to the open-source community

---

Made with ❤️ for secure and elegant note-taking.
