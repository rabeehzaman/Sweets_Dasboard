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
