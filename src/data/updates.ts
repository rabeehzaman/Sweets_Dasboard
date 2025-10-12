export type UpdateCategory = 'feature' | 'bugfix' | 'improvement' | 'breaking'

export interface Update {
  id: string
  date: string // ISO date format
  version?: string
  category: UpdateCategory
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  changes?: {
    en: string[]
    ar: string[]
  }
}

export const updates: Update[] = [
  {
    id: '10',
    date: '2025-10-12',
    version: '1.5.1',
    category: 'bugfix',
    titleEn: 'Fixed VAT Return Multi-Branch Filtering',
    titleAr: 'إصلاح تصفية الفروع المتعددة في إقرار ضريبة القيمة المضافة',
    descriptionEn: 'Resolved issue where selecting multiple branches on VAT Return page would only show data from the first selected branch instead of all selected branches.',
    descriptionAr: 'تم حل مشكلة حيث كان اختيار عدة فروع في صفحة إقرار ضريبة القيمة المضافة يعرض البيانات من الفرع الأول المحدد فقط بدلاً من جميع الفروع المحددة.',
    changes: {
      en: [
        '🐛 Fixed multi-branch selection on VAT Return page',
        '✅ All selected branches now included in calculations',
        '📊 VAT summary and tables now show combined data from all selected branches',
        '🔧 Updated database function call to support branch array parameter',
        '⚡ No performance impact - database already optimized for multiple branches'
      ],
      ar: [
        '🐛 إصلاح اختيار الفروع المتعددة في صفحة إقرار ضريبة القيمة المضافة',
        '✅ جميع الفروع المحددة الآن مدرجة في الحسابات',
        '📊 ملخص ضريبة القيمة المضافة والجداول تعرض الآن البيانات المجمعة من جميع الفروع المحددة',
        '🔧 تحديث استدعاء دالة قاعدة البيانات لدعم معامل مصفوفة الفروع',
        '⚡ لا يوجد تأثير على الأداء - قاعدة البيانات محسّنة بالفعل للفروع المتعددة'
      ]
    }
  },
  {
    id: '9',
    date: '2025-10-12',
    version: '1.5.0',
    category: 'feature',
    titleEn: 'Customer Owner Filtering System',
    titleAr: 'نظام تصفية مالك العميل',
    descriptionEn: 'Added comprehensive customer owner filtering capability to the Customers page. Users can now filter all customer aging data, KPIs, and reports by specific customer owners with persistent selections.',
    descriptionAr: 'تمت إضافة إمكانية تصفية شاملة لمالك العميل إلى صفحة العملاء. يمكن للمستخدمين الآن تصفية جميع بيانات تقادم العملاء ومؤشرات الأداء والتقارير حسب مالكي عملاء محددين مع اختيارات ثابتة.',
    changes: {
      en: [
        '👥 New Customer Owner filter with multi-select dropdown',
        '🔍 Search functionality to quickly find specific owners',
        '💾 Persistent filter selections stored in localStorage',
        '📊 All components respond to filter: KPI cards, aging tables, charts',
        '🔐 RLS-aware: Restricted users see only their assigned owners',
        '⚡ Optimized queries for better performance',
        '🌐 Full bilingual support (English/Arabic)',
        '✨ Visual feedback showing active filter count',
        '📱 Responsive design for mobile and desktop'
      ],
      ar: [
        '👥 مرشح مالك العميل الجديد مع قائمة منسدلة متعددة الاختيار',
        '🔍 وظيفة البحث للعثور بسرعة على المالكين المحددين',
        '💾 اختيارات التصفية الثابتة المخزنة في localStorage',
        '📊 جميع المكونات تستجيب للمرشح: بطاقات KPI، جداول التقادم، الرسوم البيانية',
        '🔐 مدرك لـ RLS: المستخدمون المقيدون يرون فقط المالكين المعينين لهم',
        '⚡ استعلامات محسّنة لأداء أفضل',
        '🌐 دعم كامل ثنائي اللغة (الإنجليزية/العربية)',
        '✨ ردود فعل بصرية تعرض عدد المرشحات النشطة',
        '📱 تصميم متجاوب للهاتف المحمول وسطح المكتب'
      ]
    }
  },
  {
    id: '8',
    date: '2025-10-12',
    version: '1.4.2',
    category: 'bugfix',
    titleEn: 'Fixed Last 7 Days Performance Table Alignment',
    titleAr: 'إصلاح محاذاة جدول أداء آخر 7 أيام',
    descriptionEn: 'Resolved alignment issues in the Last 7 Days Performance table where all columns were appearing left-aligned instead of centered. All 7 columns now display with proper center alignment for improved readability.',
    descriptionAr: 'تم حل مشاكل المحاذاة في جدول أداء آخر 7 أيام حيث كانت جميع الأعمدة تظهر محاذية لليسار بدلاً من المنتصف. جميع الأعمدة السبعة تعرض الآن بمحاذاة مركزية مناسبة لتحسين القراءة.',
    changes: {
      en: [
        '🎨 Fixed column alignment - all 7 columns now properly centered',
        '🔧 Applied inline CSS styles to override conflicting alignment rules',
        '✅ Equal column widths maintained (14.28% each for 7 columns)',
        '📱 Consistent alignment across both header and data rows',
        '🌐 Alignment fix works correctly in both English and Arabic'
      ],
      ar: [
        '🎨 إصلاح محاذاة الأعمدة - جميع الأعمدة السبعة الآن في المنتصف بشكل صحيح',
        '🔧 تطبيق أنماط CSS مباشرة لتجاوز قواعد المحاذاة المتعارضة',
        '✅ الحفاظ على عرض متساوٍ للأعمدة (14.28% لكل عمود من 7 أعمدة)',
        '📱 محاذاة متسقة عبر صفوف الرأس والبيانات',
        '🌐 إصلاح المحاذاة يعمل بشكل صحيح في كل من الإنجليزية والعربية'
      ]
    }
  },
  {
    id: '7',
    date: '2025-10-12',
    version: '1.4.1',
    category: 'improvement',
    titleEn: 'Enhanced Last 7 Days Performance Table',
    titleAr: 'تحسين جدول أداء آخر 7 أيام',
    descriptionEn: 'Updated the Last 7 Days Performance table to show 7 detailed columns including Cost of Goods Sold and Net Profit, providing complete financial visibility.',
    descriptionAr: 'تم تحديث جدول أداء آخر 7 أيام لإظهار 7 أعمدة تفصيلية بما في ذلك تكلفة البضاعة المباعة وصافي الربح، مما يوفر رؤية مالية كاملة.',
    changes: {
      en: [
        '📊 Added Cost of Goods Sold column showing actual product costs',
        '💰 Added Net Profit column (Gross Profit - Expenses)',
        '📈 Reordered columns for better financial flow: Total Sales → Taxable Sales → COGS → Gross Profit → GP% → Expenses → Net Profit',
        '✨ Enhanced data accuracy with proper expense tracking',
        '🔧 Fixed database function to use correct expense view columns',
        '🌐 Full bilingual support maintained (English/Arabic)',
        '✅ All 7 columns respond to location filter as expected'
      ],
      ar: [
        '📊 إضافة عمود تكلفة البضاعة المباعة يعرض التكاليف الفعلية للمنتجات',
        '💰 إضافة عمود صافي الربح (إجمالي الربح - المصروفات)',
        '📈 إعادة ترتيب الأعمدة لتدفق مالي أفضل: إجمالي المبيعات → المبيعات الخاضعة للضريبة → تكلفة البضاعة → إجمالي الربح → نسبة الربح → المصروفات → صافي الربح',
        '✨ تحسين دقة البيانات مع تتبع المصروفات بشكل صحيح',
        '🔧 إصلاح دالة قاعدة البيانات لاستخدام أعمدة عرض المصروفات الصحيحة',
        '🌐 الحفاظ على الدعم الكامل ثنائي اللغة (الإنجليزية/العربية)',
        '✅ جميع الأعمدة السبعة تستجيب لتصفية الموقع كما هو متوقع'
      ]
    }
  },
  {
    id: '6',
    date: '2025-10-12',
    version: '1.4.0',
    category: 'feature',
    titleEn: 'User Access Management - Noushad Permissions',
    titleAr: 'إدارة وصول المستخدم - أذونات نوشاد',
    descriptionEn: 'Configured restricted access permissions for Noushad with selective branch access. Noushad can now access 3 branches with full customer, vehicle, and loan management capabilities.',
    descriptionAr: 'تم تكوين أذونات الوصول المقيد لنوشاد مع وصول انتقائي للفروع. يمكن لنوشاد الآن الوصول إلى 3 فروع مع قدرات كاملة لإدارة العملاء والمركبات والقروض.',
    changes: {
      en: [
        '🔐 Added Noushad user permissions (noushadm.online@gmail.com)',
        '🏢 Branch Access: 3 branches (Frozen, Nashad-Frozen, Nisam-Frozen)',
        '🚫 JTB 5936 branch restricted (key difference from Ahmed Kutty)',
        '👥 Customer Owners: 4 owners (Nashad: 13, Nisam: 7, Frozen Counter: 1, Unassigned: 2)',
        '🚗 Vehicle Departments: Frozen department only (9 vehicles)',
        '💰 Loan Filtering: Overdue loans + loans expiring within 30 days',
        '🌐 Preferred Language: English',
        '✅ All permissions enforced via RLS at database level'
      ],
      ar: [
        '🔐 إضافة أذونات مستخدم نوشاد (noushadm.online@gmail.com)',
        '🏢 الوصول للفروع: 3 فروع (الثلاجة، نشاد-الثلاجة، نسام-الثلاجة)',
        '🚫 فرع JTB 5936 مقيد (الفرق الرئيسي عن أحمد كوتي)',
        '👥 أصحاب العملاء: 4 أصحاب (نشاد: 13، نسام: 7، عداد المجمدات: 1، غير معين: 2)',
        '🚗 أقسام المركبات: قسم الثلاجة فقط (9 مركبات)',
        '💰 تصفية القروض: القروض المتأخرة + القروض التي تنتهي خلال 30 يوماً',
        '🌐 اللغة المفضلة: الإنجليزية',
        '✅ جميع الأذونات مطبقة عبر RLS على مستوى قاعدة البيانات'
      ]
    }
  },
  {
    id: '5',
    date: '2025-10-12',
    version: '1.3.0',
    category: 'feature',
    titleEn: 'Last 7 Days Performance Summary',
    titleAr: 'ملخص أداء آخر 7 أيام',
    descriptionEn: 'Added a new summary table showing key performance metrics for the last 7 days. This table provides quick insights into recent sales, expenses, and profitability trends.',
    descriptionAr: 'تمت إضافة جدول ملخص جديد يعرض مقاييس الأداء الرئيسية للأيام السبعة الماضية. يوفر هذا الجدول رؤى سريعة حول المبيعات والمصروفات واتجاهات الربحية الأخيرة.',
    changes: {
      en: [
        '📊 New summary table positioned above detailed analysis tables',
        '💰 Shows Total Sales, Taxable Sales, Expenses, Gross Profit, and GP%',
        '📅 Always displays last 7 calendar days from today',
        '🏢 Responds to branch/location filter (master filter)',
        '🚫 Does NOT respond to date range picker - fixed 7-day window',
        '⚡ Real-time calculation with optimized database function',
        '🌐 Bilingual support with RTL layout for Arabic',
        '✅ RLS policies enforced for user permissions'
      ],
      ar: [
        '📊 جدول ملخص جديد موضوع فوق جداول التحليل التفصيلي',
        '💰 يعرض إجمالي المبيعات، المبيعات الخاضعة للضريبة، المصروفات، إجمالي الربح، ونسبة الربح الإجمالي',
        '📅 يعرض دائماً آخر 7 أيام تقويمية من اليوم',
        '🏢 يستجيب لتصفية الفرع/الموقع (التصفية الرئيسية)',
        '🚫 لا يستجيب لمحدد نطاق التاريخ - نافذة ثابتة 7 أيام',
        '⚡ حساب في الوقت الفعلي مع دالة قاعدة بيانات محسّنة',
        '🌐 دعم ثنائي اللغة مع تخطيط RTL للعربية',
        '✅ تطبيق سياسات RLS لأذونات المستخدم'
      ]
    }
  },
  {
    id: '4',
    date: '2025-10-12',
    version: '1.2.1',
    category: 'improvement',
    titleEn: 'Accurate Vendor Payables - Opening Stock Excluded',
    titleAr: 'حسابات دقيقة للموردين - استبعاد المخزون الافتتاحي',
    descriptionEn: 'Fixed vendor payables calculation by excluding "Opening Stock" vendor, which represents initial inventory value rather than actual liabilities. This provides a more accurate financial position.',
    descriptionAr: 'تم إصلاح حساب مستحقات الموردين باستبعاد مورد "المخزون الافتتاحي" الذي يمثل قيمة المخزون الأولي وليس التزامات فعلية. يوفر هذا وضعاً مالياً أكثر دقة.',
    changes: {
      en: [
        '💰 Excluded "Opening Stock" vendor from vendor payables (SAR 1,009,309 reduction)',
        '📊 More accurate Total Liabilities on Balance Sheet',
        '✅ Net Worth now reflects true financial position',
        '🔒 RLS policies still apply - users see only their allowed branches',
        '🗄️ Database view updated with security_invoker maintained',
        '📈 Improved financial reporting accuracy'
      ],
      ar: [
        '💰 استبعاد مورد "المخزون الافتتاحي" من مستحقات الموردين (تخفيض 1,009,309 ريال)',
        '📊 إجمالي الالتزامات أكثر دقة في الميزانية العمومية',
        '✅ صافي القيمة يعكس الآن الوضع المالي الحقيقي',
        '🔒 سياسات RLS لا تزال سارية - يرى المستخدمون فروعهم المسموح بها فقط',
        '🗄️ تحديث عرض قاعدة البيانات مع الحفاظ على security_invoker',
        '📈 تحسين دقة التقارير المالية'
      ]
    }
  },
  {
    id: '3',
    date: '2025-10-12',
    version: '1.2.0',
    category: 'improvement',
    titleEn: 'Automated What\'s New Updates',
    titleAr: 'تحديثات تلقائية لصفحة ما الجديد',
    descriptionEn: 'Implemented comprehensive documentation protocol to ensure all features, bug fixes, and improvements are automatically tracked and communicated to users.',
    descriptionAr: 'تم تنفيذ بروتوكول توثيق شامل لضمان تتبع وإبلاغ جميع الميزات والإصلاحات والتحسينات للمستخدمين تلقائياً.',
    changes: {
      en: [
        '📋 Added comprehensive What\'s New update protocol to CLAUDE.md',
        '✅ Defined clear triggers for when to create updates',
        '🌐 Included bilingual (English/Arabic) guidelines',
        '📝 Created structured templates for consistency',
        '🎯 Established priority levels for different update types',
        '✨ Provided emoji guidelines for visual clarity'
      ],
      ar: [
        '📋 إضافة بروتوكول شامل لتحديثات ما الجديد إلى CLAUDE.md',
        '✅ تحديد المحفزات الواضحة لإنشاء التحديثات',
        '🌐 تضمين إرشادات ثنائية اللغة (الإنجليزية/العربية)',
        '📝 إنشاء قوالب منظمة للاتساق',
        '🎯 إنشاء مستويات أولوية لأنواع التحديثات المختلفة',
        '✨ توفير إرشادات الرموز التعبيرية للوضوح البصري'
      ]
    }
  },
  {
    id: '2',
    date: '2025-10-09',
    version: '1.1.0',
    category: 'improvement',
    titleEn: 'VAT Return Month Filter Enhancement',
    titleAr: 'تحسين تصفية شهر إرجاع ضريبة القيمة المضافة',
    descriptionEn: 'Improved VAT Return filtering with a streamlined month-only selector that displays only months with actual transactions.',
    descriptionAr: 'تم تحسين تصفية إرجاع ضريبة القيمة المضافة باستخدام محدد شهري مبسط يعرض فقط الأشهر التي تحتوي على معاملات فعلية.',
    changes: {
      en: [
        '📅 Replaced date range picker with simplified month selector',
        '🎯 Shows only current year (2025) months with transactions',
        '📊 Displays transaction count for each available month',
        '⚡ Auto-selects current month by default',
        '🔍 Improved user experience with fewer filter options',
        '✨ Faster filtering with optimized database queries'
      ],
      ar: [
        '📅 استبدال محدد نطاق التاريخ بمحدد شهري مبسط',
        '🎯 يعرض فقط أشهر السنة الحالية (2025) التي تحتوي على معاملات',
        '📊 يعرض عدد المعاملات لكل شهر متاح',
        '⚡ يختار الشهر الحالي تلقائياً بشكل افتراضي',
        '🔍 تجربة مستخدم محسّنة مع خيارات تصفية أقل',
        '✨ تصفية أسرع مع استعلامات قاعدة بيانات محسّنة'
      ]
    }
  },
  {
    id: '1',
    date: '2025-10-09',
    version: '1.0.0',
    category: 'feature',
    titleEn: 'Initial Release - Sweets Dashboard',
    titleAr: 'الإصدار الأولي - لوحة تحكم الحلويات',
    descriptionEn: 'Welcome to Ghadeer Al Sharq Trading EST dashboard! This initial release includes comprehensive financial analytics and management tools.',
    descriptionAr: 'مرحباً بك في لوحة تحكم مؤسسة غدير الشرق التجارية! يتضمن هذا الإصدار الأولي تحليلات مالية وأدوات إدارة شاملة.',
    changes: {
      en: [
        '🔐 Authentication system with role-based access control',
        '📊 Real-time dashboard with KPIs and analytics',
        '💰 Profit analysis by item, customer, and invoice',
        '📈 Customer aging reports with risk categorization',
        '🏢 Vendor management and payment tracking',
        '💳 Expense tracking across branches',
        '📑 Financial reports (Profit & Loss, Balance Sheet)',
        '🏪 Multi-branch support with filtering',
        '🌐 Bilingual support (English/Arabic)',
        '🎨 Dark mode and responsive design',
        '📱 Progressive Web App (PWA) support',
        '⚡ Database-optimized views for performance',
        '🔄 Auto-refresh and real-time data updates',
        '📥 Export functionality for reports and tables'
      ],
      ar: [
        '🔐 نظام مصادقة مع التحكم في الوصول حسب الأدوار',
        '📊 لوحة تحكم في الوقت الفعلي مع مؤشرات الأداء والتحليلات',
        '💰 تحليل الربح حسب الصنف والعميل والفاتورة',
        '📈 تقارير تقادم العملاء مع تصنيف المخاطر',
        '🏢 إدارة الموردين وتتبع المدفوعات',
        '💳 تتبع المصروفات عبر الفروع',
        '📑 التقارير المالية (الربح والخسارة، الميزانية العمومية)',
        '🏪 دعم متعدد الفروع مع التصفية',
        '🌐 دعم ثنائي اللغة (الإنجليزية/العربية)',
        '🎨 الوضع الداكن والتصميم المتجاوب',
        '📱 دعم تطبيق الويب التقدمي (PWA)',
        '⚡ عروض محسّنة لقاعدة البيانات للأداء',
        '🔄 التحديث التلقائي وتحديثات البيانات في الوقت الفعلي',
        '📥 وظيفة التصدير للتقارير والجداول'
      ]
    }
  }
]
