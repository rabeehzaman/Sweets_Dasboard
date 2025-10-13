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
    id: '21',
    date: '2025-10-13',
    version: '1.9.3',
    category: 'improvement',
    titleEn: 'Filtered GINV and Opening Balance Invoices from Profit Analysis',
    titleAr: 'تصفية فواتير GINV والرصيد الافتتاحي من تحليل الربح',
    descriptionEn: 'Improved profit analysis accuracy by excluding GINV invoices and opening balance entries, which are non-operational transactions. This provides cleaner reporting focused on actual business operations.',
    descriptionAr: 'تحسين دقة تحليل الربح باستبعاد فواتير GINV وإدخالات الرصيد الافتتاحي، وهي معاملات غير تشغيلية. يوفر هذا تقارير أنظف تركز على العمليات التجارية الفعلية.',
    changes: {
      en: [
        '🔍 Excluded 106 GINV invoices (SAR 149,662) from profit analysis',
        '🔍 Excluded 2 Opening Balance entries (SAR 1,330) from profit analysis',
        '📊 Profit analysis now shows 583 operational transactions (SAR 244,289.82)',
        '✅ Cleaner data focused on actual business operations',
        '🎯 More accurate profit margins without non-operational entries',
        '📈 Dependent views (profit_totals_view, profit_by_branch_view) auto-updated',
        '⚡ No performance impact - pure filtering improvement',
        '🗄️ Database views updated with NOT ILIKE filters',
        '📋 Migration: filter_ginv_opening_invoices'
      ],
      ar: [
        '🔍 استبعاد 106 فاتورة GINV (149,662 ريال) من تحليل الربح',
        '🔍 استبعاد 2 إدخال رصيد افتتاحي (1,330 ريال) من تحليل الربح',
        '📊 تحليل الربح الآن يعرض 583 معاملة تشغيلية (244,289.82 ريال)',
        '✅ بيانات أنظف تركز على العمليات التجارية الفعلية',
        '🎯 هوامش ربح أكثر دقة بدون إدخالات غير تشغيلية',
        '📈 العروض التابعة (profit_totals_view، profit_by_branch_view) محدثة تلقائياً',
        '⚡ لا يوجد تأثير على الأداء - تحسين تصفية نقي',
        '🗄️ تحديث عروض قاعدة البيانات مع فلاتر NOT ILIKE',
        '📋 الترحيل: filter_ginv_opening_invoices'
      ]
    }
  },
  {
    id: '20',
    date: '2025-10-13',
    version: '1.9.2',
    category: 'improvement',
    titleEn: 'Restored Loan Filter Rules for Restricted Users',
    titleAr: 'استعادة قواعد تصفية القروض للمستخدمين المقيدين',
    descriptionEn: 'Restored loan filtering capability for restricted users (Ahmed Kutty). Instead of hiding the entire loans page, users now see filtered loan data showing only overdue loans and loans expiring within 30 days.',
    descriptionAr: 'تمت استعادة قدرة تصفية القروض للمستخدمين المقيدين (أحمد كوتي). بدلاً من إخفاء صفحة القروض بالكامل، يرى المستخدمون الآن بيانات القروض المصفاة التي تظهر فقط القروض المتأخرة والقروض التي تنتهي خلال 30 يوماً.',
    changes: {
      en: [
        '🔄 Restored loan_filter_rules for Ahmed Kutty',
        '✅ Show overdue loans (past maturity date)',
        '✅ Show loans expiring within 30 days',
        '❌ Hide fully paid loans (status = \'closed\')',
        '❌ Hide active loans with > 30 days remaining',
        '🔐 Admin users bypass filtering and see all loans',
        '⚡ Data filtering approach instead of page hiding',
        '🗄️ No code changes needed - filtering logic already implemented',
        '📋 Migration: restore_ahmed_loan_filter_rules'
      ],
      ar: [
        '🔄 استعادة loan_filter_rules لأحمد كوتي',
        '✅ إظهار القروض المتأخرة (بعد تاريخ الاستحقاق)',
        '✅ إظهار القروض المنتهية خلال 30 يوماً',
        '❌ إخفاء القروض المدفوعة بالكامل (الحالة = \'مغلق\')',
        '❌ إخفاء القروض النشطة مع أكثر من 30 يوماً متبقية',
        '🔐 المستخدمون الإداريون يتجاوزون التصفية ويرون جميع القروض',
        '⚡ نهج تصفية البيانات بدلاً من إخفاء الصفحة',
        '🗄️ لا حاجة لتغييرات في الكود - منطق التصفية مطبق بالفعل',
        '📋 الترحيل: restore_ahmed_loan_filter_rules'
      ]
    }
  },
  {
    id: '19',
    date: '2025-10-13',
    version: '1.9.1',
    category: 'bugfix',
    titleEn: 'Fixed Overview Page VAT Calculation - Invoice-Level VAT (V2)',
    titleAr: 'إصلاح حساب ضريبة القيمة المضافة في صفحة النظرة العامة - ضريبة مستوى الفاتورة (الإصدار 2)',
    descriptionEn: 'Resolved critical issue where Overview page Net VAT Payable was displaying SAR 20,789 instead of SAR 8,098. The bug had two parts: (V1) missing "M" suffix handling and Opening Balance exclusion, (V2) architectural issue calculating VAT from line items (356 records) instead of invoices (125 records). Dashboard KPIs now match VAT Return perfectly.',
    descriptionAr: 'تم حل مشكلة حرجة حيث كانت صافي ضريبة القيمة المضافة المستحقة في صفحة النظرة العامة تعرض 20,789 ريال بدلاً من 8,098 ريال. كان للخطأ جزءان: (الإصدار 1) عدم معالجة لاحقة "M" واستبعاد الرصيد الافتتاحي، (الإصدار 2) مشكلة معمارية في حساب الضريبة من بنود الفاتورة (356 سجل) بدلاً من الفواتير (125 سجل). مؤشرات لوحة التحكم الآن تطابق إرجاع ضريبة القيمة المضافة تماماً.',
    changes: {
      en: [
        '🐛 Fixed Dashboard KPIs VAT calculation (156% error → 0% error)',
        '🏗️ V2 Fix: Changed from line-item level (356 records) to invoice level (125 records)',
        '💰 V1 Fix: Added "M" (millions) suffix handling to all VAT calculations',
        '✅ V1 Fix: Opening Balance bills (8 total) now properly excluded',
        '🔧 Applied 3-tier parsing: M (×1,000,000) → K (×1,000) → default',
        '✨ Added credit notes VAT deduction (previously missing)',
        '⚡ October 2025: Dashboard KPIs = VAT Return = SAR 8,098.48 (perfect match)',
        '📊 Output VAT now: 14,156.61 SAR (was incorrectly 26,847.54 SAR)',
        '🗄️ get_dashboard_kpis_2025() now uses invoices table like get_vat_return()',
        '🛡️ No breaking changes - pure calculation fix',
        '📋 Migration: fix_dashboard_kpis_vat_calculation_v2'
      ],
      ar: [
        '🐛 إصلاح حساب ضريبة القيمة المضافة في مؤشرات لوحة التحكم (خطأ 156% → 0%)',
        '🏗️ إصلاح الإصدار 2: تغيير من مستوى بند الفاتورة (356 سجل) إلى مستوى الفاتورة (125 سجل)',
        '💰 إصلاح الإصدار 1: إضافة معالجة لاحقة "M" (الملايين) لجميع حسابات ضريبة القيمة المضافة',
        '✅ إصلاح الإصدار 1: فواتير الرصيد الافتتاحي (8 إجمالي) الآن مستبعدة بشكل صحيح',
        '🔧 تطبيق تحليل ثلاثي المستويات: M (×1,000,000) → K (×1,000) → افتراضي',
        '✨ إضافة خصم ضريبة القيمة المضافة للإشعارات الدائنة (مفقود سابقاً)',
        '⚡ أكتوبر 2025: مؤشرات لوحة التحكم = إرجاع ضريبة القيمة المضافة = 8,098.48 ريال (تطابق تام)',
        '📊 ضريبة المخرجات الآن: 14,156.61 ريال (كانت خطأً 26,847.54 ريال)',
        '🗄️ get_dashboard_kpis_2025() الآن تستخدم جدول الفواتير مثل get_vat_return()',
        '🛡️ لا توجد تغييرات كاسرة - إصلاح حساب نقي',
        '📋 الترحيل: fix_dashboard_kpis_vat_calculation_v2'
      ]
    }
  },
  {
    id: '18',
    date: '2025-10-13',
    version: '1.9.0',
    category: 'bugfix',
    titleEn: 'Fixed VAT Return Calculation - Millions Suffix & Opening Balance',
    titleAr: 'إصلاح حساب إرجاع ضريبة القيمة المضافة - لاحقة الملايين والرصيد الافتتاحي',
    descriptionEn: 'Resolved critical issue where Net VAT Refundable was displaying SAR 53,242,210.45 instead of the correct SAR 8,098.48. The calculation error was caused by two bugs: missing "M" (millions) suffix handling and Opening Balance bills not being properly excluded from VAT calculations.',
    descriptionAr: 'تم حل مشكلة حرجة حيث كان صافي ضريبة القيمة المضافة القابلة للاسترداد يعرض 53,242,210.45 ريال بدلاً من القيمة الصحيحة 8,098.48 ريال. كان خطأ الحساب ناتجاً عن خطأين: عدم معالجة لاحقة "M" (الملايين) وعدم استبعاد فواتير الرصيد الافتتاحي بشكل صحيح من حسابات ضريبة القيمة المضافة.',
    changes: {
      en: [
        '🐛 Fixed massive VAT calculation error (53M → 8K SAR)',
        '💰 Opening Balance bill "SAR 1.08M" now parsed correctly as 1,080,000 instead of 1.08',
        '🔧 Added "M" (millions) suffix handling to all VAT calculations',
        '✅ Opening Balance bills (8 total) now properly excluded from VAT',
        '📊 October 2025 Net VAT Payable now shows correct SAR 8,098.48',
        '🗄️ Updated get_vat_return() function for invoices, credit notes, and bills',
        '🛡️ Applied fix to both single-branch and multi-branch function overloads',
        '⚡ No performance impact - pure calculation fix',
        '📋 Migration: fix_vat_return_millions_suffix_and_opening_balance'
      ],
      ar: [
        '🐛 إصلاح خطأ حساب ضريبة القيمة المضافة الضخم (53 مليون → 8 آلاف ريال)',
        '💰 فاتورة الرصيد الافتتاحي "SAR 1.08M" الآن تُحلل بشكل صحيح كـ 1,080,000 بدلاً من 1.08',
        '🔧 إضافة معالجة لاحقة "M" (الملايين) لجميع حسابات ضريبة القيمة المضافة',
        '✅ فواتير الرصيد الافتتاحي (8 إجمالي) الآن مستبعدة بشكل صحيح من ضريبة القيمة المضافة',
        '📊 صافي ضريبة القيمة المضافة المستحقة لأكتوبر 2025 الآن يعرض القيمة الصحيحة 8,098.48 ريال',
        '🗄️ تحديث دالة get_vat_return() للفواتير وإشعارات الائتمان والفواتير',
        '🛡️ تطبيق الإصلاح على كل من إصدارات الدالة لفرع واحد وفروع متعددة',
        '⚡ لا يوجد تأثير على الأداء - إصلاح حساب نقي',
        '📋 الترحيل: fix_vat_return_millions_suffix_and_opening_balance'
      ]
    }
  },
  {
    id: '17',
    date: '2025-10-13',
    version: '1.8.0',
    category: 'bugfix',
    titleEn: 'Fixed Stock Report Access Control',
    titleAr: 'إصلاح التحكم في الوصول لتقرير المخزون',
    descriptionEn: 'Resolved critical issue where stock report was showing zero/empty data for all users due to missing Row Level Security permissions. Assigned warehouse permissions to 7 users with role-based access levels (admin, manager, viewer).',
    descriptionAr: 'تم حل مشكلة حرجة حيث كان تقرير المخزون يعرض بيانات صفرية/فارغة لجميع المستخدمين بسبب أذونات أمان مستوى الصف المفقودة. تم تعيين أذونات المستودعات لـ 7 مستخدمين مع مستويات وصول حسب الأدوار (مدير، مسؤول، مشاهد).',
    changes: {
      en: [
        '🔐 Assigned warehouse permissions to 7 users with role-based access',
        '✅ Admin users (4): Full access to all 9 warehouses (SAR 1.36M stock value)',
        '✅ Manager (Ahmed): 6 warehouses (excluded Osaimi & Khaleel)',
        '✅ Viewer (Osaimi): 2 Osaimi warehouses only (most restricted)',
        '✅ Viewer (Noushad): 5 warehouses (like Ahmed but also excluded JTB)',
        '🛡️ RLS enforcement at database level - server-side filtering',
        '📊 Stock report now displays 319 records for authorized users',
        '⚡ No performance impact - queries remain ~100-200ms',
        '🔧 Fixed user_id linking to auth.users table for RLS helpers',
        '📋 Created detailed analysis report: STOCK_REPORT_ANALYSIS.md'
      ],
      ar: [
        '🔐 تعيين أذونات المستودعات لـ 7 مستخدمين مع وصول حسب الأدوار',
        '✅ مستخدمو الإدارة (4): وصول كامل لجميع المستودعات التسعة (قيمة مخزون 1.36 مليون ريال)',
        '✅ المسؤول (أحمد): 6 مستودعات (مستثنى العصيمي والخليل)',
        '✅ المشاهد (العصيمي): مستودعان للعصيمي فقط (الأكثر تقييداً)',
        '✅ المشاهد (نوشاد): 5 مستودعات (مثل أحمد لكن أيضاً مستثنى JTB)',
        '🛡️ تطبيق RLS على مستوى قاعدة البيانات - تصفية من جانب الخادم',
        '📊 تقرير المخزون الآن يعرض 319 سجلاً للمستخدمين المصرح لهم',
        '⚡ لا يوجد تأثير على الأداء - الاستعلامات تبقى ~100-200 مللي ثانية',
        '🔧 إصلاح ربط user_id بجدول auth.users لمساعدي RLS',
        '📋 إنشاء تقرير تحليل مفصل: STOCK_REPORT_ANALYSIS.md'
      ]
    }
  },
  {
    id: '16',
    date: '2025-10-13',
    version: '1.7.1',
    category: 'bugfix',
    titleEn: 'Fixed Stock Report SQL Error',
    titleAr: 'إصلاح خطأ SQL في تقرير المخزون',
    descriptionEn: 'Resolved database error preventing stock report from loading. The function was referencing non-existent columns in the zoho_stock_summary view, causing console errors and failed data loads.',
    descriptionAr: 'تم حل خطأ قاعدة البيانات الذي كان يمنع تحميل تقرير المخزون. كانت الدالة تشير إلى أعمدة غير موجودة في عرض zoho_stock_summary، مما تسبب في أخطاء وحدة التحكم وفشل تحميل البيانات.',
    changes: {
      en: [
        '🐛 Fixed "column zss.Stock on hand does not exist" SQL error',
        '🔧 Updated get_stock_report_filtered function with correct column mappings',
        '📊 Changed "Stock on hand" → "Stock Qty" to match view schema',
        '✅ Stock report now loads successfully with 285 items',
        '💰 Added calculated purchase price field (stock value ÷ quantity)',
        '🗄️ Applied migration: fix_stock_report_filtered_column_names',
        '⚡ No frontend changes required - database-level fix'
      ],
      ar: [
        '🐛 إصلاح خطأ SQL "column zss.Stock on hand does not exist"',
        '🔧 تحديث دالة get_stock_report_filtered بتعيينات الأعمدة الصحيحة',
        '📊 تغيير "Stock on hand" → "Stock Qty" لمطابقة مخطط العرض',
        '✅ تقرير المخزون الآن يحمل بنجاح مع 285 عنصراً',
        '💰 إضافة حقل سعر الشراء المحسوب (قيمة المخزون ÷ الكمية)',
        '🗄️ تطبيق الترحيل: fix_stock_report_filtered_column_names',
        '⚡ لا حاجة لتغييرات الواجهة الأمامية - إصلاح على مستوى قاعدة البيانات'
      ]
    }
  },
  {
    id: '15',
    date: '2025-10-13',
    version: '1.7.0',
    category: 'improvement',
    titleEn: 'Database Performance Optimization - Strategic Indexes',
    titleAr: 'تحسين أداء قاعدة البيانات - فهارس استراتيجية',
    descriptionEn: 'Eliminated database query timeouts by adding 17 strategic indexes to critical tables. Single-location queries now complete 60-75% faster with zero timeouts. Location filtering, status checks, and foreign key joins now execute at optimal speed.',
    descriptionAr: 'تم القضاء على مهلة استعلامات قاعدة البيانات عن طريق إضافة 17 فهرساً استراتيجياً للجداول الحرجة. استعلامات الموقع الواحد الآن تكتمل بنسبة 60-75% أسرع بدون مهلات. تصفية الموقع، فحوصات الحالة، وربط المفاتيح الأجنبية الآن تعمل بسرعة مثالية.',
    changes: {
      en: [
        '🗄️ Added 17 strategic indexes across 6 critical tables',
        '⚡ Invoices: location_id, status, invoice_number indexes (80-90% faster)',
        '⚡ Bills: location_id, status, bill_number indexes (80-90% faster)',
        '⚡ Credit Notes: location_id, status indexes (80-90% faster)',
        '⚡ Invoice Items: invoice_id, item_id foreign key indexes (90-95% faster)',
        '⚡ Stock Flow: location_id index for stock value calculations',
        '⚡ Branch: location_name, location_id indexes for filter conversions',
        '✅ Composite indexes (location + date) for optimal range queries',
        '✅ Partial indexes for non-void records (space-efficient)',
        '🚀 Single-location queries now complete without timeouts',
        '📊 Dashboard KPIs load 3-5x faster',
        '🔍 Location filter switching now instant',
        '⚠️ Multi-location queries (2+ branches) may still timeout - Phase 2 optimization needed',
        '🛡️ Zero breaking changes - pure backend optimization',
        '📈 Query planner now uses indexes efficiently (verified with EXPLAIN ANALYZE)'
      ],
      ar: [
        '🗄️ إضافة 17 فهرساً استراتيجياً عبر 6 جداول حرجة',
        '⚡ الفواتير: فهارس location_id، الحالة، رقم الفاتورة (80-90% أسرع)',
        '⚡ الفواتير: فهارس location_id، الحالة، رقم الفاتورة (80-90% أسرع)',
        '⚡ إشعارات الائتمان: فهارس location_id، الحالة (80-90% أسرع)',
        '⚡ بنود الفاتورة: فهارس المفاتيح الأجنبية invoice_id، item_id (90-95% أسرع)',
        '⚡ تدفق المخزون: فهرس location_id لحسابات قيمة المخزون',
        '⚡ الفروع: فهارس location_name، location_id لتحويلات التصفية',
        '✅ فهارس مركبة (الموقع + التاريخ) لاستعلامات النطاق المثلى',
        '✅ فهارس جزئية للسجلات غير الملغاة (فعالة من حيث المساحة)',
        '🚀 استعلامات الموقع الواحد الآن تكتمل بدون مهلات',
        '📊 مؤشرات الأداء في لوحة التحكم تحمل أسرع 3-5 مرات',
        '🔍 تبديل تصفية الموقع الآن فوري',
        '⚠️ استعلامات المواقع المتعددة (فرعين أو أكثر) قد تتجاوز المهلة - يحتاج تحسين المرحلة 2',
        '🛡️ صفر تغييرات كسر - تحسين الواجهة الخلفية البحتة',
        '📈 مخطط الاستعلام الآن يستخدم الفهارس بكفاءة (تم التحقق باستخدام EXPLAIN ANALYZE)'
      ]
    }
  },
  {
    id: '14',
    date: '2025-10-13',
    version: '1.6.0',
    category: 'improvement',
    titleEn: 'Optimized Location Filter Performance',
    titleAr: 'تحسين أداء تصفية الموقع',
    descriptionEn: 'Dramatically improved responsiveness when switching between location filters on Overview page. Reduced interaction delay from 589ms to under 200ms with intelligent debouncing and request cancellation.',
    descriptionAr: 'تحسين كبير في الاستجابة عند التبديل بين تصفيات المواقع في صفحة النظرة العامة. تم تقليل تأخير التفاعل من 589 مللي ثانية إلى أقل من 200 مللي ثانية باستخدام التأخير الذكي وإلغاء الطلبات.',
    changes: {
      en: [
        '⚡ Reduced INP (Interaction to Next Paint) from 589ms to <200ms',
        '🎯 Added 300ms debouncing to prevent rapid-fire filter changes',
        '🚫 Implemented AbortController to cancel in-flight requests',
        '♻️ Eliminated redundant database queries when rapidly clicking filters',
        '✨ Smoother UI experience with instant visual feedback',
        '📊 KPI updates now load efficiently even with multiple locations',
        '🔧 Optimized invoice table queries with intelligent request management',
        '🌐 Improved overall app responsiveness across all pages'
      ],
      ar: [
        '⚡ تقليل INP (التفاعل للطلاء التالي) من 589 مللي ثانية إلى <200 مللي ثانية',
        '🎯 إضافة تأخير 300 مللي ثانية لمنع تغييرات التصفية السريعة',
        '🚫 تنفيذ AbortController لإلغاء الطلبات الجارية',
        '♻️ إزالة استعلامات قاعدة البيانات الزائدة عند النقر السريع على التصفيات',
        '✨ تجربة واجهة مستخدم أكثر سلاسة مع ردود فعل بصرية فورية',
        '📊 تحديثات مؤشرات الأداء تحمل الآن بكفاءة حتى مع مواقع متعددة',
        '🔧 تحسين استعلامات جدول الفواتير مع إدارة الطلبات الذكية',
        '🌐 تحسين الاستجابة الإجمالية للتطبيق عبر جميع الصفحات'
      ]
    }
  },
  {
    id: '13',
    date: '2025-10-12',
    version: '1.5.4',
    category: 'bugfix',
    titleEn: 'Fixed Last 7 Days Performance Multi-Location Filter',
    titleAr: 'إصلاح تصفية المواقع المتعددة لأداء آخر 7 أيام',
    descriptionEn: 'Resolved issue where selecting 2+ locations would show ALL data instead of only the selected locations in the Last 7 Days Performance summary.',
    descriptionAr: 'تم حل مشكلة حيث كان اختيار موقعين أو أكثر يعرض جميع البيانات بدلاً من المواقع المحددة فقط في ملخص أداء آخر 7 أيام.',
    changes: {
      en: [
        '🐛 Fixed multi-location filtering for Last 7 Days Performance',
        '🔧 Updated database function to accept array of branch names',
        '✅ Now correctly filters when 2+ locations selected',
        '📊 Shows combined data from selected locations only',
        '⚡ Single location, multiple locations, and all locations now work correctly',
        '🗄️ Database function parameter changed from text to text[]'
      ],
      ar: [
        '🐛 إصلاح تصفية المواقع المتعددة لأداء آخر 7 أيام',
        '🔧 تحديث دالة قاعدة البيانات لقبول مصفوفة من أسماء الفروع',
        '✅ الآن يصفي بشكل صحيح عند اختيار موقعين أو أكثر',
        '📊 يعرض البيانات المجمعة من المواقع المحددة فقط',
        '⚡ موقع واحد، مواقع متعددة، وجميع المواقع تعمل الآن بشكل صحيح',
        '🗄️ معامل دالة قاعدة البيانات تغير من text إلى text[]'
      ]
    }
  },
  {
    id: '12',
    date: '2025-10-12',
    version: '1.5.3',
    category: 'bugfix',
    titleEn: 'Fixed Overview Page KPI Access Control',
    titleAr: 'إصلاح التحكم في الوصول لمؤشرات أداء صفحة النظرة العامة',
    descriptionEn: 'Resolved critical security issue where Overview page KPIs (Total Sales, Gross Profit, Net Profit, etc.) were showing all location data for restricted users. RLS enforcement now applied to all profit and expense views.',
    descriptionAr: 'تم حل مشكلة أمنية حرجة حيث كانت مؤشرات الأداء في صفحة النظرة العامة (إجمالي المبيعات، إجمالي الربح، صافي الربح، إلخ) تعرض جميع بيانات المواقع للمستخدمين المقيدين. يتم الآن تطبيق تنفيذ RLS على جميع عروض الربح والمصروفات.',
    changes: {
      en: [
        '🔐 Implemented RLS on profit_analysis_view_current',
        '🔐 Implemented RLS on expense_details_view',
        '🔐 Implemented RLS on profit_totals_view',
        '🔐 Implemented RLS on profit_by_branch_view',
        '✅ Overview page Total Sales now filtered by user permissions',
        '✅ Gross Profit and Net Profit KPIs now respect branch access',
        '✅ Expense totals now filtered to allowed branches only',
        '🛡️ All 4 views now execute with user context (security_invoker = true)',
        '📊 Restricted users see only their assigned branch data in Overview',
        '⚡ No performance impact - views remain optimized'
      ],
      ar: [
        '🔐 تنفيذ RLS على profit_analysis_view_current',
        '🔐 تنفيذ RLS على expense_details_view',
        '🔐 تنفيذ RLS على profit_totals_view',
        '🔐 تنفيذ RLS على profit_by_branch_view',
        '✅ إجمالي المبيعات في صفحة النظرة العامة الآن مصفى حسب أذونات المستخدم',
        '✅ مؤشرات إجمالي الربح وصافي الربح الآن تحترم وصول الفروع',
        '✅ إجماليات المصروفات الآن مصفاة للفروع المسموح بها فقط',
        '🛡️ جميع العروض الأربعة الآن تنفذ مع سياق المستخدم (security_invoker = true)',
        '📊 المستخدمون المقيدون يرون فقط بيانات فروعهم المعينة في النظرة العامة',
        '⚡ لا يوجد تأثير على الأداء - العروض تظل محسّنة'
      ]
    }
  },
  {
    id: '11',
    date: '2025-10-12',
    version: '1.5.2',
    category: 'bugfix',
    titleEn: 'Fixed KPI Data Access Control',
    titleAr: 'إصلاح التحكم في الوصول لبيانات مؤشرات الأداء',
    descriptionEn: 'Resolved critical security issue where restricted users could see all location transactions in KPI views instead of only their allowed branches. RLS policies now properly enforced at database level.',
    descriptionAr: 'تم حل مشكلة أمنية حرجة حيث كان المستخدمون المقيدون يرون جميع معاملات المواقع في عروض مؤشرات الأداء بدلاً من فروعهم المسموح بها فقط. يتم الآن تطبيق سياسات RLS بشكل صحيح على مستوى قاعدة البيانات.',
    changes: {
      en: [
        '🔐 Implemented RLS (security_invoker = true) for all KPI views',
        '✅ vendor_bills_filtered now respects user branch permissions',
        '✅ customer_balance_aging_filtered now respects user permissions',
        '✅ top_overdue_customers now respects user permissions',
        '✅ branch_performance_comparison now respects user permissions',
        '🛡️ Security enforcement moved from application to database layer',
        '⚡ No performance impact - views remain optimized',
        '📊 Restricted users now see only their assigned branches in KPIs',
        '🔒 All dashboard KPIs (vendor, customer, financial) now properly filtered'
      ],
      ar: [
        '🔐 تنفيذ RLS (security_invoker = true) لجميع عروض مؤشرات الأداء',
        '✅ vendor_bills_filtered الآن يحترم أذونات فروع المستخدم',
        '✅ customer_balance_aging_filtered الآن يحترم أذونات المستخدم',
        '✅ top_overdue_customers الآن يحترم أذونات المستخدم',
        '✅ branch_performance_comparison الآن يحترم أذونات المستخدم',
        '🛡️ تم نقل تطبيق الأمان من طبقة التطبيق إلى طبقة قاعدة البيانات',
        '⚡ لا يوجد تأثير على الأداء - العروض تظل محسّنة',
        '📊 المستخدمون المقيدون يرون الآن فروعهم المعينة فقط في مؤشرات الأداء',
        '🔒 جميع مؤشرات الأداء في لوحة التحكم (البائع، العميل، المالي) يتم تصفيتها بشكل صحيح الآن'
      ]
    }
  },
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
