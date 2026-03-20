import { PrismaClient, Role, RequestStatus, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users with different roles
  const hashedPassword = await bcrypt.hash("johndoe123", 10);
  const testPassword = await bcrypt.hash("password123", 10);

  // Admin user (test account)
  const adminUser = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      name: "John Doe",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Created admin user:", adminUser.email);

  // Support user
  const supportUser = await prisma.user.upsert({
    where: { email: "support@example.com" },
    update: {},
    create: {
      email: "support@example.com",
      name: "Sarah Support",
      password: testPassword,
      role: Role.SUPPORT,
    },
  });
  console.log("✅ Created support user:", supportUser.email);

  // Regular user
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Mike User",
      password: testPassword,
      role: Role.USER,
    },
  });
  console.log("✅ Created regular user:", regularUser.email);

  // Viewer user (read-only access)
  const viewerUser = await prisma.user.upsert({
    where: { email: "viewer@example.com" },
    update: {},
    create: {
      email: "viewer@example.com",
      name: "Lisa Viewer",
      password: testPassword,
      role: Role.VIEWER,
    },
  });
  console.log("✅ Created viewer user:", viewerUser.email);

  // Create categories
  const categories = [
    { name: "UI/UX", description: "User interface and experience improvements", color: "#60B5FF" },
    { name: "Performance", description: "Speed and efficiency enhancements", color: "#80D8C3" },
    { name: "Integration", description: "Third-party integrations and APIs", color: "#FF9149" },
    { name: "Reporting", description: "Analytics and reporting features", color: "#A19AD3" },
    { name: "Security", description: "Security and compliance features", color: "#FF6363" },
    { name: "Automation", description: "Workflow automation features", color: "#FF90BB" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Created", categories.length, "categories");

  // Create sample requests
  const uiCategory = await prisma.category.findUnique({ where: { name: "UI/UX" } });
  const perfCategory = await prisma.category.findUnique({ where: { name: "Performance" } });
  const reportCategory = await prisma.category.findUnique({ where: { name: "Reporting" } });

  const sampleRequests = [
    {
      title: "Dark Mode Support",
      description: "Add a dark mode option to reduce eye strain during extended review sessions.",
      requestedBy: "Emma de Vries",
      businessJustification: "Our team often works late hours. Dark mode would improve comfort and productivity.",
      reason: "Eye strain is a common complaint from our reviewers.",
      status: RequestStatus.SUBMITTED,
      categoryId: uiCategory?.id,
      createdById: regularUser.id,
    },
    {
      title: "Bulk Export Feature",
      description: "Allow exporting multiple reviews at once in CSV or PDF format.",
      requestedBy: "Jan Bakker",
      businessJustification: "Monthly reporting requires manual export of 100+ reviews, taking 3+ hours.",
      reason: "Current one-by-one export is extremely time-consuming.",
      status: RequestStatus.UNDER_REVIEW,
      priority: Priority.HIGH,
      categoryId: reportCategory?.id,
      createdById: regularUser.id,
      supportReviewerId: supportUser.id,
      supportNotes: "This is a common request. Should be prioritized for Q2.",
    },
    {
      title: "Faster Search Results",
      description: "Improve search performance to return results in under 1 second.",
      requestedBy: "Sophie Jansen",
      businessJustification: "Current 5-10 second wait times impact team efficiency significantly.",
      reason: "Users are frustrated with slow search.",
      status: RequestStatus.FINAL_REVIEW,
      priority: Priority.CRITICAL,
      categoryId: perfCategory?.id,
      createdById: regularUser.id,
      supportReviewerId: supportUser.id,
      supportNotes: "Confirmed performance issues. Recommended as critical.",
    },
    {
      title: "Mobile Responsive Layout",
      description: "Make the review platform work properly on mobile devices.",
      requestedBy: "Thomas van der Berg",
      businessJustification: "30% of our team works remotely and needs mobile access.",
      reason: "Current mobile experience is broken.",
      status: RequestStatus.ACCEPTED,
      priority: Priority.MEDIUM,
      finalPriority: Priority.HIGH,
      categoryId: uiCategory?.id,
      createdById: regularUser.id,
      supportReviewerId: supportUser.id,
      adminReviewerId: adminUser.id,
      adminNotes: "Approved. Will be included in the next sprint.",
    },
  ];

  for (const req of sampleRequests) {
    await prisma.request.create({ data: req });
  }
  console.log("✅ Created", sampleRequests.length, "sample requests");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
