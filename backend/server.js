// 购销单管理系统 - 后端API示例
// 部署到 Render.com 的 Node.js Express 服务
// https://render.com/docs/deploy-express-with-render

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB 连接（使用 MongoDB Atlas 或本地 MongoDB）
// 在 Render.com 环境中，建议使用 MongoDB Atlas 免费层
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/purchase-order-system';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✓ MongoDB 连接成功'))
    .catch(err => console.error('MongoDB 连接失败:', err));

// ==================== 数据模型 ====================

// 用户模型
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 20 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 订单模型
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    projectKey: { type: String, required: true }, // 购货方+文档类型，用于分组显示
    purchaserName: { type: String, default: '' }, // 购货方名称
    docType: { type: String, default: '预算' },
    creatorName: { type: String, default: '未知' },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 创建索引（用于查询和排序，非唯一索引）
// 允许同一个用户的项目有多个版本记录
orderSchema.index({ userId: 1, projectKey: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

// ==================== 认证中间件 ====================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效或过期的令牌' });
        }
        req.user = user;
        next();
    });
};

// ==================== API 路由 ====================

// 根路径
app.get('/', (req, res) => {
    res.json({
        name: '购销单管理系统 API',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout'
            },
            orders: {
                list: 'GET /api/orders',
                create: 'POST /api/orders',
                delete: 'DELETE /api/orders/:id'
            }
        }
    });
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 验证输入
        if (!name || !email || !password) {
            return res.status(400).json({ message: '请提供用户名、邮箱和密码' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少需要6位' });
        }
        
        // 检查邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: '邮箱格式不正确' });
        }
        
        // 检查用户是否已存在
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });
        
        await user.save();
        
        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log(`✓ 新用户注册成功: ${email}`);
        
        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('注册错误:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ message: '该邮箱已被注册' });
        }
        
        res.status(500).json({ message: '服务器错误，注册失败' });
    }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 验证输入
        if (!email || !password) {
            return res.status(400).json({ message: '请提供邮箱和密码' });
        }
        
        // 查找用户
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }
        
        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log(`✓ 用户登录成功: ${email}`);
        
        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误，登录失败' });
    }
});

// 用户登出（客户端清除token即可，此接口用于记录）
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    console.log(`✓ 用户登出: ${req.user.email}`);
    res.json({ message: '登出成功' });
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取用户的所有订单
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .select('-__v');
        
        console.log(`✓ 获取订单列表: ${req.user.email} (${orders.length}个订单)`);
        
        res.json({ orders });
    } catch (error) {
        console.error('获取订单错误:', error);
        res.status(500).json({ message: '服务器错误，获取订单失败' });
    }
});

// 创建新订单（每次保存都创建新版本）
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { orderId, projectKey, purchaserName, docType, creatorName, data } = req.body;

        if (!projectKey || !data) {
            return res.status(400).json({ message: '缺少必要参数' });
        }

        // 每次保存都创建新记录（允许同一项目有多个版本）
        const order = new Order({
            userId: req.user.userId,
            orderId: orderId,
            projectKey: projectKey,
            purchaserName: purchaserName || '',
            docType: docType || '预算',
            creatorName: creatorName || req.user.name || '未知',
            data: data
        });
        await order.save();

        console.log(`✓ 创建新版本: ${req.user.email} - ${projectKey} - ${order._id}`);
        res.json({
            message: '订单保存成功（新版本已创建）',
            isUpdate: false,
            order: {
                id: order._id,
                orderId: order.orderId,
                projectKey: order.projectKey,
                purchaserName: order.purchaserName,
                docType: order.docType,
                creatorName: order.creatorName,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('保存订单错误:', error);
        res.status(500).json({ message: '服务器错误，保存订单失败' });
    }
});

// 删除订单
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        
        const order = await Order.findOneAndDelete({
            _id: orderId,
            userId: req.user.userId
        });
        
        if (!order) {
            return res.status(404).json({ message: '订单不存在或无权删除' });
        }
        
        console.log(`✓ 删除订单: ${req.user.email} - ${orderId}`);
        
        res.json({ message: '订单删除成功', orderId });
        
    } catch (error) {
        console.error('删除订单错误:', error);
        res.status(500).json({ message: '服务器错误，删除订单失败' });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('======================================');
    console.log('  购销单管理系统 API 服务器');
    console.log('======================================');
    console.log(`✓ 服务器运行在端口 ${PORT}`);
    console.log(`✓ 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ 数据库: ${MONGODB_URI ? 'MongoDB' : '未配置'}`);
    console.log('');
});

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    await mongoose.connection.close();
    process.exit(0);
});
