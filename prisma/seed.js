const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'User123!';

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const users = [
    { email: 'admin@example.com', name: 'عبدالله سامي', role: 'ADMIN' },
    { email: 'fatima@example.com', name: 'فاطمة علي', role: 'USER' },
    { email: 'mohamed@example.com', name: 'محمد حسن', role: 'USER' },
    { email: 'sara@example.com', name: 'سارة إبراهيم', role: 'USER' },
    { email: 'omar@example.com', name: 'عمر خالد', role: 'USER' },
    { email: 'nora@example.com', name: 'نورة الفالح', role: 'ADMIN' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
      },
    });
  }
  console.log('Seeded', users.length, 'users (password for all:', DEFAULT_PASSWORD + ')');

  const services = [
    { name: 'سباكة وإصلاح الأنابيب', description: 'إصلاح تسربات المياه وتركيب الحمامات والمطابخ', slug: 'plumbing', isActive: true },
    { name: 'كهرباء وإصلاح التيار', description: 'إصلاح الأعطال وتركيب الإنارة والتوصيلات', slug: 'electrical', isActive: true },
    { name: 'نجارة وإصلاح الأثاث', description: 'إصلاح الأثاث والتركيب والأبواب الخشبية', slug: 'carpentry', isActive: true },
    { name: 'تكييف وصيانة المكيفات', description: 'صيانة وملء الفريون وإصلاح المكيفات', slug: 'ac-maintenance', isActive: true },
    { name: 'دهان وطلاء الجدران', description: 'دهان الشقق والجدران والديكورات', slug: 'painting', isActive: true },
    { name: 'تنظيف المنازل', description: 'تنظيف شقق ومنازل بعد الانتقال أو دوري', slug: 'house-cleaning', isActive: true },
    { name: 'نقل عفش وترحيل', description: 'نقل الأثاث بين المنازل داخل المدينة', slug: 'moving', isActive: true },
    { name: 'أقفال وتركيب المفاتيح', description: 'فتح الأقفال وتركيب الأبواب والمفاتيح', slug: 'locksmith', isActive: true },
    { name: 'مكافحة حشرات', description: 'رش ومكافحة الحشرات والقوارض في المنازل', slug: 'pest-control', isActive: true },
    { name: 'سباكة طوارئ', description: 'خدمة طوارئ للسباكة خارج أوقات العمل', slug: 'plumbing-emergency', isActive: true },
    { name: 'عمالة عامة', description: 'عمال يومية للتحميل والتفريغ والترتيب', slug: 'general-labour', isActive: true },
    { name: 'إصلاح أجهزة منزلية', description: 'إصلاح ثلاجات وغسالات وأفران', slug: 'appliance-repair', isActive: true },
    { name: 'تركيب ستائر وبرادي', description: 'تركيب الستائر والبرادي والرول', slug: 'curtains-blinds', isActive: true },
    { name: 'خدمة قديمة - غير متاحة', description: 'خدمة متوقفة مؤقتاً', slug: 'legacy-service', isActive: false },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name,
        description: s.description ?? null,
        slug: s.slug,
        isActive: s.isActive ?? true,
        metadata: s.metadata ?? undefined,
      },
    });
  }
  console.log('Seeded', services.length, 'services');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
