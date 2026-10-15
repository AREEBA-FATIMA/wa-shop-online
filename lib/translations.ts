export const translations: Record<string, Record<string, string>> = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav_home: { en: 'Home', ur: 'ہوم', roman_ur: 'Home' },
  nav_chats: { en: 'Chats', ur: 'چیٹس', roman_ur: 'Chats' },
  nav_products: { en: 'Products', ur: 'پروڈکٹس', roman_ur: 'Products' },
  nav_orders: { en: 'Orders', ur: 'آرڈرز', roman_ur: 'Orders' },
  nav_status: { en: 'Status', ur: 'اسٹیٹس', roman_ur: 'Status' },
  nav_analytics: { en: 'Analytics', ur: 'تجزیہ', roman_ur: 'Analytics' },
  nav_subscription: { en: 'Subscription', ur: 'سبسکرپشن', roman_ur: 'Subscription' },
  nav_settings: { en: 'Settings', ur: 'سیٹنگز', roman_ur: 'Settings' },
  nav_subscribe: { en: 'Subscribe', ur: 'سبسکرائب', roman_ur: 'Subscribe' },
  nav_menu: { en: 'Menu', ur: 'مینیو', roman_ur: 'Menu' },
  nav_logout: { en: 'Logout', ur: 'لاگ آؤٹ', roman_ur: 'Logout' },
  nav_broadcast: { en: 'Broadcast', ur: 'براڈکاسٹ', roman_ur: 'Broadcast' },

  // ── Storefront (public) ───────────────────────────────────────────────────────
  shop_order: { en: 'Order on WhatsApp', ur: 'واٹس ایپ پر آرڈر کریں', roman_ur: 'WhatsApp par order karein' },
  shop_empty: { en: 'No products available right now', ur: 'ابھی کوئی پروڈکٹ دستیاب نہیں', roman_ur: 'Abhi koi product available nahi' },
  shop_powered: { en: 'Powered by WA-SHOP', ur: 'WA-SHOP کے ذریعے', roman_ur: 'Powered by WA-SHOP' },
  shop_order_msg: { en: 'Hi! I want to order: ', ur: 'سلام! مجھے آرڈر کرنا ہے: ', roman_ur: 'Assalam o alaikum! Mujhe order karna hai: ' },
  shop_share: { en: 'Share shop', ur: 'دکان شیئر کریں', roman_ur: 'Shop share karein' },
  shop_link_copied: { en: 'Shop link copied!', ur: 'دکان کا لنک کاپی ہوگیا!', roman_ur: 'Shop link copy hogaya!' },

  // ── Broadcast ───────────────────────────────────────────────────────────────
  bc_title: { en: 'Broadcast', ur: 'براڈکاسٹ', roman_ur: 'Broadcast' },
  bc_sub: { en: 'Send one message to all your customers', ur: 'ایک پیغام اپنے تمام گاہکوں کو بھیجیں', roman_ur: 'Ek message apne saare customers ko bhejein' },
  bc_placeholder: { en: 'Write your offer or message…', ur: 'اپنی آفر یا پیغام لکھیں…', roman_ur: 'Apni offer ya message likhein…' },
  bc_send: { en: 'Send to all customers', ur: 'سب گاہکوں کو بھیجیں', roman_ur: 'Sab customers ko bhejein' },
  bc_sending: { en: 'Sending…', ur: 'بھیجا جا رہا ہے…', roman_ur: 'Bhej raha hai…' },
  bc_confirm: { en: 'Send this message to all your customers?', ur: 'یہ پیغام تمام گاہکوں کو بھیجیں؟', roman_ur: 'Ye message sab customers ko bhejein?' },
  bc_result: { en: '{sent} sent, {failed} failed', ur: '{sent} بھیجے، {failed} ناکام', roman_ur: '{sent} bheje, {failed} fail' },
  bc_warn: { en: 'Tip: do not send too often — WhatsApp may flag spam. Keep offers genuine.', ur: 'مشورہ: بہت زیادہ نہ بھیجیں — واٹس ایپ اسپام سمجھ سکتا ہے۔', roman_ur: 'Tip: bohat zyada na bhejein — WhatsApp spam samajh sakta hai.' },
  bc_no_customers: { en: 'No customers yet — broadcast needs at least one chat.', ur: 'ابھی کوئی گاہک نہیں — کم از کم ایک چیٹ چاہیے۔', roman_ur: 'Abhi koi customer nahi — kam az kam ek chat chahiye.' },
  bc_connect_first: { en: 'Connect WhatsApp first', ur: 'پہلے واٹس ایپ کنیکٹ کریں', roman_ur: 'Pehle WhatsApp connect karein' },

  // ── WhatsApp Status ─────────────────────────────────────────────────────────
  wa_connected: { en: 'WhatsApp Connected', ur: 'واٹس ایپ کنیکٹڈ', roman_ur: 'WhatsApp Connected' },
  wa_disconnected: { en: 'Connect WhatsApp', ur: 'واٹس ایپ کنیکٹ کریں', roman_ur: 'Connect WhatsApp' },
  wa_reconnecting: { en: 'Reconnecting...', ur: 'دوبارہ کنیکٹ ہو رہا ہے...', roman_ur: 'Reconnecting...' },
  wa_alert: { en: 'New WhatsApp session connected — your session is secure', ur: 'نیا واٹس ایپ سیشن کنیکٹ ہوا — آپ کا سیشن محفوظ ہے', roman_ur: 'Naya WhatsApp session connect hua — aapka session secure hai' },
  wa_alert_ok: { en: 'OK', ur: 'ٹھیک ہے', roman_ur: 'OK' },

  // ── Dashboard Home ──────────────────────────────────────────────────────────
  dash_greeting: { en: 'Hello, {name}!', ur: 'السلام علیکم، {name}!', roman_ur: 'Assalam-o-Alaikum, {name}!' },
  dash_title: { en: 'Dashboard', ur: 'ڈیش بورڈ', roman_ur: 'Dashboard' },
  dash_today_orders: { en: "Today's Orders", ur: 'آج کے آرڈرز', roman_ur: "Aaj kay Orders" },
  dash_today_revenue: { en: "Today's Revenue", ur: 'آج کی کمائی', roman_ur: "Aaj ki Kamai" },
  dash_active_chats: { en: 'Active Chats', ur: 'ایکٹو چیٹس', roman_ur: 'Active Chats' },
  dash_products: { en: 'Products', ur: 'پروڈکٹس', roman_ur: 'Products' },
  dash_low_stock: { en: 'Low Stock Alert', ur: 'کم اسٹاک الرٹ', roman_ur: 'Low Stock Alert' },
  dash_quick_actions: { en: 'Quick Actions', ur: 'فوری کارروائیاں', roman_ur: 'Quick Actions' },
  dash_recent: { en: 'Recent Activity', ur: 'حالیہ سرگرمیاں', roman_ur: 'Recent Activity' },

  // ── Auth ────────────────────────────────────────────────────────────────────
  auth_login_title: { en: 'Login', ur: 'لاگ ان', roman_ur: 'Login' },
  auth_login_sub: { en: 'Welcome back to your account', ur: 'اپنے اکاؤنٹ میں واپس آئیں', roman_ur: 'Apne account mein wapas aayein' },
  auth_register_title: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں', roman_ur: 'Account Banayein' },
  auth_register_sub: { en: 'Free 7-day trial — no card required', ur: '7 دن فری — کوئی کارڈ نہیں', roman_ur: 'Free 7 din trial — koi card nahi' },
  auth_phone: { en: 'Phone Number', ur: 'فون نمبر', roman_ur: 'Phone Number' },
  auth_password: { en: 'Password', ur: 'پاس ورڈ', roman_ur: 'Password' },
  auth_name: { en: 'Your Name', ur: 'آپ کا نام', roman_ur: 'Aapka Naam' },
  auth_language: { en: 'Language', ur: 'زبان', roman_ur: 'Language / Zaban' },
  auth_no_account: { en: "Don't have an account?", ur: 'اکاؤنٹ نہیں ہے؟', roman_ur: 'Account nahi hai?' },
  auth_has_account: { en: 'Already have an account?', ur: 'پہلے سے اکاؤنٹ ہے؟', roman_ur: 'Pehle se account hai?' },
  auth_register_link: { en: 'Register here', ur: 'رجسٹر کریں', roman_ur: 'Register karein' },
  auth_login_link: { en: 'Login here', ur: 'لاگ ان کریں', roman_ur: 'Login karein' },
  auth_welcome_back: { en: 'Welcome Back!', ur: 'خوش آمدید!', roman_ur: 'Wapas Aajayein!' },
  auth_welcome_sub: { en: 'Manage your WhatsApp business with AI', ur: 'اپنا واٹس ایپ بزنس AI کے ساتھ چلائیں', roman_ur: 'Apne WhatsApp business ko AI ke sath manage karein' },
  auth_login_cta: { en: 'Login', ur: 'لاگ ان کریں', roman_ur: 'Login' },
  auth_login_failed: { en: 'Login failed', ur: 'لاگ ان نہیں ہوا', roman_ur: 'Login nahi hua' },
  auth_create_cta: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں', roman_ur: 'Account Banayein' },
  auth_register_failed: { en: 'Registration failed', ur: 'رجسٹریشن نہیں ہوئی', roman_ur: 'Registration nahi hui' },
  auth_join: { en: 'Join Thousands of Sellers', ur: 'ہزاروں سیلرز میں شامل ہوں', roman_ur: 'Hazaaron sellers mein shaamil hon' },
  auth_join_sub: { en: 'Start your AI-powered WhatsApp shop today', ur: 'آج ہی اپنی AI واٹس ایپ دکان شروع کریں', roman_ur: 'Aaj apni AI WhatsApp dukaan shuru karein' },

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin_title: { en: 'Admin', ur: 'ایڈمن', roman_ur: 'Admin' },
  admin_sub: { en: 'Manage users, plans & payments', ur: 'صارفین، پلانز اور ادائیگیاں', roman_ur: 'Users, plans aur payments manage karein' },
  admin_secret_placeholder: { en: 'Admin Secret', ur: 'ایڈمن سیکرٹ', roman_ur: 'Admin Secret' },
  admin_total_users: { en: 'Total Users', ur: 'کل صارفین', roman_ur: 'Total Users' },
  admin_wa_connected: { en: 'WA Connected', ur: 'WA کنیکٹڈ', roman_ur: 'WA Connected' },
  admin_paid_users: { en: 'Paid Users', ur: 'ادا کرنے والے', roman_ur: 'Paid Users' },
  admin_pending_payments: { en: 'Pending Payments', ur: 'زیر التواء ادائیگیاں', roman_ur: 'Pending Payments' },
  admin_search: { en: 'Search users...', ur: 'صارفین تلاش کریں...', roman_ur: 'Users dhoondein...' },
  admin_no_users: { en: 'No users found', ur: 'کوئی صارف نہیں', roman_ur: 'Koi user nahi mila' },
  admin_no_payments: { en: 'No payment requests', ur: 'کوئی ادائیگی کی درخواست نہیں', roman_ur: 'Koi payment request nahi' },
  admin_approve: { en: 'Approve', ur: 'منظور کریں', roman_ur: 'Approve' },
  admin_reject: { en: 'Reject', ur: 'مسترد کریں', roman_ur: 'Reject' },

  // ── Products ────────────────────────────────────────────────────────────────
  prod_title: { en: 'Products', ur: 'پروڈکٹس', roman_ur: 'Products' },
  prod_add: { en: 'Add Product', ur: 'پروڈکٹ شامل کریں', roman_ur: 'Product Add Karein' },
  prod_edit: { en: 'Edit Product', ur: 'پروڈکٹ میں ترمیم', roman_ur: 'Product Edit Karein' },
  prod_new: { en: 'New Product', ur: 'نیا پروڈکٹ', roman_ur: 'Naya Product' },
  prod_no_products: { en: 'No products yet', ur: 'ابھی تک کوئی پروڈکٹ نہیں', roman_ur: 'Abhi tak koi product nahi' },
  prod_no_products_sub: { en: 'Add your first product to get started', ur: 'شروع کرنے کے لیے پہلا پروڈکٹ شامل کریں', roman_ur: 'Shuru karne ke liye pehla product add karein' },
  prod_name: { en: 'Product Name', ur: 'پروڈکٹ کا نام', roman_ur: 'Product Ka Naam' },
  prod_description: { en: 'Description', ur: 'تفصیل', roman_ur: 'Description' },
  prod_price: { en: 'Price (Rs.)', ur: 'قیمت (Rs.)', roman_ur: 'Price (Rs.)' },
  prod_sale_price: { en: 'Sale Price (Rs.)', ur: 'سیل قیمت (Rs.)', roman_ur: 'Sale Price (Rs.)' },
  prod_floor_price: { en: 'Floor Price (Rs.)', ur: 'فلور قیمت (Rs.)', roman_ur: 'Floor Price (Rs.)' },
  prod_stock: { en: 'Stock', ur: 'اسٹاک', roman_ur: 'Stock' },
  prod_category: { en: 'Category', ur: 'زمرہ', roman_ur: 'Category' },
  prod_image: { en: 'Product Image', ur: 'پروڈکٹ کی تصویر', roman_ur: 'Product Ki Tasveer' },
  prod_active: { en: 'Active', ur: 'فعال', roman_ur: 'Active' },
  prod_hidden: { en: 'Hidden', ur: 'پوشیدہ', roman_ur: 'Hidden' },
  prod_save: { en: 'Save', ur: 'محفوظ کریں', roman_ur: 'Save' },
  prod_update: { en: 'Update', ur: 'اپ ڈیٹ کریں', roman_ur: 'Update' },
  prod_add_photo: { en: 'Add photo', ur: 'تصویر شامل کریں', roman_ur: 'Photo add karein' },
  prod_include_status: { en: 'Include in daily status', ur: 'روزانہ اسٹیٹس میں شامل کریں', roman_ur: 'Rozana status mein shaamil karein' },
  prod_include_status_sub: { en: 'Auto-post to WhatsApp status', ur: 'واٹس ایپ اسٹیٹس پر خودکار پوسٹ', roman_ur: 'WhatsApp status par auto-post' },
  prod_floor_tip: { en: 'Minimum price — AI never reveals this to customers', ur: 'کم سے کم قیمت — AI یہ گاہک کو کبھی نہیں بتاتا', roman_ur: 'Minimum price — AI ye customer ko kabhi nahi batata' },
  prod_floor_label: { en: 'Floor', ur: 'فلور', roman_ur: 'Floor' },
  prod_left: { en: 'left', ur: 'باقی', roman_ur: 'baqi' },
  prod_out_of_stock: { en: 'Out of stock', ur: 'اسٹاک ختم', roman_ur: 'Stock khatam' },
  common_delete_confirm: { en: 'Delete this?', ur: 'حذف کریں؟', roman_ur: 'Delete karein?' },

  // ── Orders ──────────────────────────────────────────────────────────────────
  order_title: { en: 'Orders', ur: 'آرڈرز', roman_ur: 'Orders' },
  order_search: { en: 'Search orders...', ur: 'آرڈرز تلاش کریں...', roman_ur: 'Orders dhoondein...' },
  order_no_orders: { en: 'No orders found', ur: 'کوئی آرڈر نہیں', roman_ur: 'Koi order nahi' },
  order_all: { en: 'All', ur: 'سب', roman_ur: 'All' },
  order_pending: { en: 'Pending', ur: 'زیر التواء', roman_ur: 'Pending' },
  order_confirmed: { en: 'Confirmed', ur: 'تصدیق شدہ', roman_ur: 'Confirmed' },
  order_shipped: { en: 'Shipped', ur: 'بھیج دیا گیا', roman_ur: 'Shipped' },
  order_delivered: { en: 'Delivered', ur: 'ڈلیورڈ', roman_ur: 'Delivered' },
  order_cancelled: { en: 'Cancelled', ur: 'منسوخ', roman_ur: 'Cancelled' },
  order_status: { en: 'Status', ur: 'اسٹیٹس', roman_ur: 'Status' },
  order_cancel: { en: 'Cancel', ur: 'منسوخ کریں', roman_ur: 'Cancel' },
  order_view_location: { en: 'View location', ur: 'لوکیشن دیکھیں', roman_ur: 'Location dekhein' },
  common_unknown: { en: 'Unknown', ur: 'نامعلوم', roman_ur: 'Unknown' },
  order_receipt: { en: 'Send receipt', ur: 'رسید بھیجیں', roman_ur: 'Receipt bhejein' },
  order_receipt_sent: { en: 'Receipt sent ✓', ur: 'رسید بھیج دی ✓', roman_ur: 'Receipt bhej di ✓' },
  order_receipt_fail: { en: 'Could not send receipt', ur: 'رسید نہیں بھیجی جا سکی', roman_ur: 'Receipt nahi bheji ja saki' },

  // ── Chats ───────────────────────────────────────────────────────────────────
  chat_search: { en: 'Search chats...', ur: 'چیٹس تلاش کریں...', roman_ur: 'Chats dhoondein...' },
  chat_no_chats: { en: 'No chats yet', ur: 'ابھی تک کوئی چیٹ نہیں', roman_ur: 'Abhi tak koi chat nahi' },
  chat_no_chats_sub: { en: 'Messages from customers will appear here', ur: 'گاہکوں کے پیغامات یہاں ظاہر ہوں گے', roman_ur: 'Customers ke messages yahan aayein ge' },
  chat_no_messages: { en: 'No messages yet', ur: 'ابھی تک کوئی پیغام نہیں', roman_ur: 'Abhi tak koi message nahi' },
  chat_placeholder: { en: 'Type a message...', ur: 'پیغام لکھیں...', roman_ur: 'Message likhein...' },
  chat_ai_suggestion: { en: 'AI Suggestion', ur: 'AI تجویز', roman_ur: 'AI Suggestion' },
  chat_send: { en: 'Send', ur: 'بھیجیں', roman_ur: 'Send' },
  chat_edit: { en: 'Edit', ur: 'ترمیم', roman_ur: 'Edit' },
  chat_dismiss: { en: 'Dismiss', ur: 'ختم کریں', roman_ur: 'Dismiss' },
  crm_title: { en: 'Customer notes', ur: 'گاہک کے نوٹس', roman_ur: 'Customer notes' },
  crm_notes_ph: { en: 'Private notes (size, preference, address…)', ur: 'ذاتی نوٹس (سائز، پسند، پتہ…)', roman_ur: 'Private notes (size, pasand, address…)' },
  crm_tags_ph: { en: 'Tags (comma separated)', ur: 'ٹیگز (کاما سے الگ)', roman_ur: 'Tags (comma se alag)' },
  crm_save: { en: 'Save', ur: 'محفوظ کریں', roman_ur: 'Save' },
  crm_saved: { en: 'Saved ✓', ur: 'محفوظ ✓', roman_ur: 'Save ✓' },
  crm_repeat: { en: 'Repeat customer', ur: 'بار بار آنے والا گاہک', roman_ur: 'Repeat customer' },

  // ── Status ──────────────────────────────────────────────────────────────────
  status_title: { en: 'Status', ur: 'اسٹیٹس', roman_ur: 'Status' },
  status_sub: { en: 'Auto-post products from stock to WhatsApp status daily', ur: 'اسٹاک سے پروڈکٹس روزانہ واٹس ایپ اسٹیٹس پر لگائیں', roman_ur: 'Stock se products rozana WhatsApp status par auto-post karein' },
  status_products_per_day: { en: 'Products per day', ur: 'یومِیہ پروڈکٹس', roman_ur: 'Products per day' },
  status_auto_schedule: { en: 'Auto Schedule', ur: 'آٹو شیڈول', roman_ur: 'Auto Schedule' },
  status_post_time: { en: 'Post time', ur: 'پوسٹ کرنے کا وقت', roman_ur: 'Post time' },
  status_days: { en: 'Days', ur: 'دن', roman_ur: 'Days' },
  status_post_now: { en: 'Post Now', ur: 'ابھی پوسٹ کریں', roman_ur: 'Post Now' },
  status_schedule: { en: 'Schedule', ur: 'شیڈول کریں', roman_ur: 'Schedule' },
  status_mon: { en: 'Mon', ur: 'پیر', roman_ur: 'Mon' },
  status_tue: { en: 'Tue', ur: 'منگل', roman_ur: 'Tue' },
  status_wed: { en: 'Wed', ur: 'بدھ', roman_ur: 'Wed' },
  status_thu: { en: 'Thu', ur: 'جمعرات', roman_ur: 'Thu' },
  status_fri: { en: 'Fri', ur: 'جمعہ', roman_ur: 'Fri' },
  status_sat: { en: 'Sat', ur: 'ہفتہ', roman_ur: 'Sat' },
  status_sun: { en: 'Sun', ur: 'اتوار', roman_ur: 'Sun' },
  status_scheduled: { en: 'Scheduled', ur: 'شیڈولڈ', roman_ur: 'Scheduled' },
  status_at: { en: 'at', ur: 'بجے', roman_ur: 'par' },
  status_products_word: { en: 'products', ur: 'پروڈکٹس', roman_ur: 'products' },
  common_remove: { en: 'Remove', ur: 'ہٹائیں', roman_ur: 'Remove' },

  // ── Analytics ───────────────────────────────────────────────────────────────
  analytics_title: { en: 'Analytics', ur: 'تجزیہ', roman_ur: 'Analytics' },
  analytics_sub: { en: 'Your business performance', ur: 'آپ کے کاروبار کی کارکردگی', roman_ur: 'Aapke business ki performance' },
  analytics_total_revenue: { en: 'Total Revenue', ur: 'کل آمدنی', roman_ur: 'Total Revenue' },
  analytics_total_orders: { en: 'Total Orders', ur: 'کل آرڈرز', roman_ur: 'Total Orders' },
  analytics_summary: { en: 'Summary', ur: 'خلاصہ', roman_ur: 'Summary' },
  analytics_total_chats: { en: 'Total Chats', ur: 'کل چیٹس', roman_ur: 'Total Chats' },
  analytics_products: { en: 'Products', ur: 'پروڈکٹس', roman_ur: 'Products' },
  analytics_pending_orders: { en: 'pending orders', ur: 'زیر التواء آرڈرز', roman_ur: 'pending orders' },
  analytics_pending_sub: { en: 'Update status in the Orders page', ur: 'آرڈرز پیج میں اسٹیٹس اپ ڈیٹ کریں', roman_ur: 'Orders page mein status update karein' },
  analytics_low_stock_products: { en: 'Low Stock Products', ur: 'کم اسٹاک پروڈکٹس', roman_ur: 'Low Stock Products' },
  analytics_conv: { en: 'Conversion Rate', ur: 'کنورژن ریٹ', roman_ur: 'Conversion Rate' },
  analytics_aov: { en: 'Avg Order Value', ur: 'اوسط آرڈر ویلیو', roman_ur: 'Avg Order Value' },
  analytics_resp: { en: 'Response Time', ur: 'ریسپانس ٹائم', roman_ur: 'Response Time' },
  analytics_ai_replies: { en: 'AI Replies', ur: 'AI جوابات', roman_ur: 'AI Replies' },
  analytics_best_sellers: { en: 'Best Sellers', ur: 'سب سے زیادہ بکنے والے', roman_ur: 'Best Sellers' },
  analytics_revenue_7d: { en: 'Revenue — last 7 days', ur: 'آمدنی — پچھلے 7 دن', roman_ur: 'Revenue — pichle 7 din' },
  analytics_orders_word: { en: 'orders', ur: 'آرڈرز', roman_ur: 'orders' },
  analytics_no_data: { en: 'Not enough data yet', ur: 'ابھی کافی ڈیٹا نہیں', roman_ur: 'Abhi kaafi data nahi' },

  // ── Settings ────────────────────────────────────────────────────────────────
  settings_title: { en: 'Settings', ur: 'سیٹنگز', roman_ur: 'Settings' },
  settings_sub: { en: 'Manage your account', ur: 'اپنا اکاؤنٹ مینیج کریں', roman_ur: 'Apna account manage karein' },
  set_name: { en: 'Name', ur: 'نام', roman_ur: 'Name' },
  set_phone: { en: 'Phone', ur: 'فون', roman_ur: 'Phone' },
  set_reply_lang: { en: 'Reply language', ur: 'جواب کی زبان', roman_ur: 'Reply language' },
  set_disconnect: { en: 'Disconnect', ur: 'منقطع کریں', roman_ur: 'Disconnect' },
  set_save: { en: 'Save Changes', ur: 'تبدیلیاں محفوظ کریں', roman_ur: 'Save Changes' },
  set_saved: { en: 'Saved!', ur: 'محفوظ ہوگیا!', roman_ur: 'Save hogaya!' },

  // ── Subscription ────────────────────────────────────────────────────────────
  sub_title: { en: 'Subscription', ur: 'سبسکرپشن', roman_ur: 'Subscription' },
  sub_sub: { en: 'Premium plans unlock all features', ur: 'پرییمیم پلانز تمام فیچرز کھول دیتے ہیں', roman_ur: 'Premium plans saare features unlock karte hain' },
  sub_current: { en: 'Current Plan', ur: 'موجودہ پلان', roman_ur: 'Current Plan' },
  sub_buy: { en: 'Buy {plan}', ur: '{plan} خریدیں', roman_ur: 'Buy {plan}' },
  sub_processing: { en: 'Processing...', ur: 'پروسیسنگ...', roman_ur: 'Processing...' },
  sub_payment_details: { en: 'Payment Details', ur: 'ادائیگی کی تفصیلات', roman_ur: 'Payment Details' },
  sub_pending_orders: { en: 'Pending Orders', ur: 'زیر التواء آرڈرز', roman_ur: 'Pending Orders' },

  // ── Connect WA ──────────────────────────────────────────────────────────────
  connect_title: { en: 'Connect WhatsApp', ur: 'واٹس ایپ کنیکٹ کریں', roman_ur: 'Connect WhatsApp' },
  connect_phone: { en: 'Phone', ur: 'فون', roman_ur: 'Phone' },
  connect_qr: { en: 'QR Code', ur: 'کیو آر کوڈ', roman_ur: 'QR Code' },
  connect_skip: { en: 'Skip — connect later', ur: 'چھوڑیں — بعد میں کنیکٹ کریں', roman_ur: 'Skip — baad mein connect karna hai' },
  connect_security: { en: 'Your WhatsApp session is encrypted — no one else can access it', ur: 'آپ کا واٹس ایپ سیشن انکرپٹڈ ہے — کوئی اور آپ کا واٹس ایپ استعمال نہیں کر سکتا', roman_ur: 'Aapka WhatsApp session encrypted hai — koi aur aapka WhatsApp use nahi kar sakta' },

  // ── Landing page ────────────────────────────────────────────────────────────
  landing_badge: { en: 'AI-Powered WhatsApp Store', ur: 'AI WhatsApp Dukaan', roman_ur: 'AI-Powered WhatsApp Store' },
  landing_title: { en: 'Your WhatsApp,\nNow a Smart Shop', ur: 'Apna WhatsApp,\nAb Smart Dukaan', roman_ur: 'Apna WhatsApp,\nAb Smart Dukaan' },
  landing_sub: { en: 'Auto-post daily status, let AI answer customers, confirm orders — all without WhatsApp API.', ur: 'Roz auto status, AI se jawab, orders track — sab ek jagah se. Koi API key nahi chahiye.', roman_ur: 'Roz auto status, AI se jawab, orders track — sab ek jagah. Koi API key nahi chahiye.' },
  landing_start_free: { en: 'Start Free', ur: 'Free Shuru', roman_ur: 'Free Shuru Karein' },
  landing_see_demo: { en: 'See Demo', ur: 'Demo Dekho', roman_ur: 'Demo Dekho' },
  landing_login: { en: 'Login', ur: 'لاگ ان', roman_ur: 'Login' },
  landing_register: { en: 'Register', ur: 'رجسٹر', roman_ur: 'Register' },
  landing_features: { en: 'Features', ur: 'فیچرز', roman_ur: 'Features' },
  landing_pricing: { en: 'Pricing', ur: 'پرائسنگ', roman_ur: 'Pricing' },
  landing_pricing_sub: { en: 'No risk — start with free trial', ur: 'کوئی رسک نہیں — فری ٹرائل سے شروع کریں', roman_ur: 'Koi risk nahi — free trial se start karein' },
  landing_monthly: { en: 'Monthly', ur: 'ماہانہ', roman_ur: 'Monthly' },
  landing_yearly: { en: 'Yearly', ur: 'سالانہ', roman_ur: 'Yearly' },
  landing_save: { en: 'Save 20%', ur: '20% بچائیں', roman_ur: '20% bachayein' },
  landing_popular: { en: 'Most Popular', ur: 'مشہور ترین', roman_ur: 'Sab se zyada pasand kiya gaya' },
  landing_contact: { en: 'Contact us to know more', ur: 'مزید جاننے کے لیے رابطہ کریں', roman_ur: 'Aur janne ke liye raabta karein' },
  landing_privacy: { en: 'Privacy', ur: 'پرائیویسی', roman_ur: 'Privacy' },
  landing_copyright: { en: "Pakistan's first AI WhatsApp reseller platform. © 2025", ur: 'پاکستان کا پہلا AI WhatsApp ری سیلر پلیٹ فارم۔ © 2025', roman_ur: "Pakistan ka pehla AI WhatsApp reseller platform. © 2025" },
};

export function t(key: string, lang: string = 'en', vars?: Record<string, string>): string {
  const entry = translations[key];
  if (!entry) return key;
  let text = entry[lang] || entry['en'] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

export type Lang = 'en' | 'roman_ur' | 'ur';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'roman_ur', label: 'Roman Urdu', short: 'RU' },
  { code: 'ur', label: 'اردو', short: 'اردو' },
];

const LANG_KEY = 'wa_lang';

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'roman_ur';
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'roman_ur' || v === 'ur') return v;
    // migrate from older wa_user.language if present
    const u = JSON.parse(localStorage.getItem('wa_user') || '{}');
    if (u.language === 'en' || u.language === 'roman_ur' || u.language === 'ur') return u.language;
  } catch {}
  return 'roman_ur';
}

export function setLangStore(l: Lang) {
  try { localStorage.setItem(LANG_KEY, l); } catch {}
}

export function getDir(l: string): 'rtl' | 'ltr' {
  return l === 'ur' ? 'rtl' : 'ltr';
}
