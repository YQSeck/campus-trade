// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pricingRoutes = require('./src/skills/pricingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'campus-trade-secret-key';

app.use(cors());
app.use(express.json());

// ==================== 鍐呭瓨鏁版嵁搴?====================
const db = {
  users: [
    { id: '1', email: 'admin@campus.edu', password: 'admin123', role: 'admin', nickname: '绠＄悊鍛?, phone: '13800000001', school: 'XX澶у', banned: false, createdAt: '2026-06-20T10:30:00.000Z' },
    { id: '2', email: 'user@campus.edu', password: 'user123', role: 'user', nickname: '寮犱笁', phone: '13800000002', school: 'XX澶у', banned: false, createdAt: '2026-06-20T10:30:00.000Z' },
    { id: '3', email: 'lisi@campus.edu', password: 'user123', role: 'user', nickname: '鏉庡洓', phone: '13800000003', school: 'XX澶у', banned: false, createdAt: '2026-06-21T10:30:00.000Z' }
  ],
  products: [
    { id: '1', title: '楂樼瓑鏁板鏁欐潗绗竷鐗?, description: '鍙敤浜嗕竴瀛︽湡锛屽嚑涔庡叏鏂帮紝绗旇寰堝皯', category: '涔︾睄', price: 25, originalPrice: 49, condition: '鍑犱箮鍏ㄦ柊', images: [], sellerId: '2', status: 'active', createdAt: '2026-06-22T10:30:00.000Z' },
    { id: '2', title: 'iPad Air 4 64G', description: '浣跨敤涓€骞达紝鏃犲垝鐥曪紝閰嶄欢榻愬叏', category: '鐢靛瓙浜у搧', price: 2000, originalPrice: 4399, condition: '杞诲井浣跨敤', images: [], sellerId: '2', status: 'active', createdAt: '2026-06-23T14:30:00.000Z' },
    { id: '3', title: 'LED 鍙扮伅', description: '涓夋。璋冨厜锛屽鑸嶅繀澶?, category: '鐢熸椿鐢ㄥ搧', price: 15, originalPrice: 39, condition: '鏄庢樉浣跨敤', images: [], sellerId: '3', status: 'active', createdAt: '2026-06-24T09:00:00.000Z' },
    { id: '4', title: 'Python缂栫▼浠庡叆闂ㄥ埌瀹炶返', description: '缁忓吀鍏ラ棬涔︾睄锛岃交寰瑪璁?, category: '涔︾睄', price: 30, originalPrice: 89, condition: '杞诲井浣跨敤', images: [], sellerId: '3', status: 'active', createdAt: '2026-06-25T11:00:00.000Z' },
    { id: '5', title: '鏈烘閿洏 Keychron K2', description: '闈掕酱锛岀敤浜嗗崐骞达紝澹伴煶娓呰剢', category: '鐢靛瓙浜у搧', price: 150, originalPrice: 350, condition: '杞诲井浣跨敤', images: [], sellerId: '2', status: 'active', createdAt: '2026-06-25T16:00:00.000Z' }
  ],
  orders: [
    { id: '1', buyerId: '3', sellerId: '2', productId: '1', status: 'pending', price: 25, createdAt: '2026-06-26T08:00:00.000Z' },
    { id: '2', buyerId: '1', sellerId: '2', productId: '5', status: 'shipped', price: 150, createdAt: '2026-06-25T15:00:00.000Z' },
    { id: '3', buyerId: '2', sellerId: '3', productId: '3', status: 'completed', price: 15, createdAt: '2026-06-24T12:00:00.000Z' },
    { id: '4', buyerId: '3', sellerId: '2', productId: '2', status: 'cancelled', price: 2000, createdAt: '2026-06-23T10:00:00.000Z' }
  ]
};

// ==================== JWT 涓棿浠?====================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '鏈彁渚涜璇佷护鐗? });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: '浠ょ墝鏃犳晥鎴栧凡杩囨湡' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '鏉冮檺涓嶈冻锛岄渶瑕佺鐞嗗憳韬唤' });
  }
  next();
}

// ==================== 璁よ瘉璺敱 ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(function(u) { return u.email === email && u.password === password; });
  if (!user) {
    return res.status(401).json({ message: '閭鎴栧瘑鐮侀敊璇? });
  }
  if (user.banned) {
    return res.status(403).json({ message: '璐﹀彿宸茶灏佺' });
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token: token, user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname } });
});

app.get('/api/auth/profile', authMiddleware, function(req, res) {
  var user = db.users.find(function(u) { return u.id === req.user.id; });
  if (!user) return res.status(404).json({ message: '鐢ㄦ埛涓嶅瓨鍦? });
  var result = { id: user.id, email: user.email, role: user.role, nickname: user.nickname, phone: user.phone, school: user.school };
  res.json(result);
});

// ==================== 鍟嗗搧璺敱 ====================
app.get('/api/products', function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || 10;
  var search = req.query.search || '';
  var category = req.query.category || '';

  var filtered = db.products.filter(function(p) {
    if (category && p.category !== category) return false;
    if (search && p.title.indexOf(search) === -1 && p.description.indexOf(search) === -1) return false;
    return true;
  });

  var total = filtered.length;
  var start = (page - 1) * limit;
  var items = filtered.slice(start, start + limit);

  res.json({ products: items, total: total, page: page, limit: limit });
});

// ==================== 璁㈠崟璺敱 ====================
app.get('/api/orders', authMiddleware, function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || 50;
  var status = req.query.status || '';
  var userId = req.user.role === 'admin' ? (req.query.userId || '') : req.user.id;

  var filtered = db.orders.filter(function(o) {
    if (status && o.status !== status) return false;
    if (userId) {
      if (req.user.role === 'admin' && req.query.userId) {
        return o.buyerId === userId || o.sellerId === userId;
      }
      return o.buyerId === userId || o.sellerId === userId;
    }
    return true;
  });

  var total = filtered.length;
  var start = (page - 1) * limit;
  var items = filtered.slice(start, start + limit);

  var enriched = items.map(function(o) {
    var product = db.products.find(function(p) { return p.id === o.productId; });
    var buyer = db.users.find(function(u) { return u.id === o.buyerId; });
    var seller = db.users.find(function(u) { return u.id === o.sellerId; });
    return {
      id: o.id,
      productTitle: product ? product.title : '鏈煡鍟嗗搧',
      productCategory: product ? product.category : '鏈煡',
      buyerName: buyer ? buyer.nickname : '鏈煡',
      sellerName: seller ? seller.nickname : '鏈煡',
      status: o.status,
      price: o.price,
      createdAt: o.createdAt
    };
  });

  res.json({ orders: enriched, total: total, page: page, limit: limit });
});

// ==================== 鐢ㄦ埛绠＄悊璺敱 ====================
app.put('/api/users/:id/ban', authMiddleware, adminMiddleware, function(req, res) {
  var user = db.users.find(function(u) { return u.id === req.params.id; });
  if (!user) return res.status(404).json({ message: '鐢ㄦ埛涓嶅瓨鍦? });
  if (user.role === 'admin') return res.status(400).json({ message: '涓嶈兘灏佺绠＄悊鍛樿处鍙? });
  user.banned = true;
  res.json({ message: '鐢ㄦ埛宸插皝绂?, userId: user.id, nickname: user.nickname });
});

app.put('/api/users/:id/unban', authMiddleware, adminMiddleware, function(req, res) {
  var user = db.users.find(function(u) { return u.id === req.params.id; });
  if (!user) return res.status(404).json({ message: '鐢ㄦ埛涓嶅瓨鍦? });
  user.banned = false;
  res.json({ message: '鐢ㄦ埛宸茶В灏?, userId: user.id, nickname: user.nickname });
});

app.get('/api/users', authMiddleware, adminMiddleware, function(req, res) {
  var page = parseInt(req.query.page) || 1;
  var limit = parseInt(req.query.limit) || 20;
  var list = db.users.map(function(u) { return { id: u.id, email: u.email, role: u.role, nickname: u.nickname, banned: u.banned, createdAt: u.createdAt }; });
  var total = list.length;
  var start = (page - 1) * limit;
  res.json({ users: list.slice(start, start + limit), total: total, page: page, limit: limit });
});

// ==================== 缁熻璺敱 ====================
app.get('/api/admin/stats', authMiddleware, adminMiddleware, function(req, res) {
  res.json({
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    totalUsers: db.users.length,
    recentOrders: db.orders.filter(function(o) {
      var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return o.createdAt >= weekAgo;
    }).length
  });
});

// ==================== Skill 璺敱 ====================
app.use('/api/skills', pricingRoutes);

// ==================== 鍚姩鏈嶅姟鍣?====================
if (require.main === module) {
  app.listen(PORT, function() {
    console.log('CampusTrade 鍚庣宸插惎鍔? http://localhost:' + PORT);
    console.log('绠＄悊鍛樿处鍙? admin@campus.edu / admin123');
    console.log('鏅€氱敤鎴?   user@campus.edu  / user123');
  });
}

module.exports = app;
