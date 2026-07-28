import { Role } from "../generated/prisma/enums";
import config from "../src/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    });

    if (isExistSuperAdmin) {
      console.log("Super admin already exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.admin.password as string,
      Number(config.bcrypt_salt_rounds),
    );

    const superAdminData = await prisma.user.create({
      data: {
        email: config.admin.email as string,
        password: hashedPassword,
        role: Role.ADMIN,
        status: "ACTIVE",
        name: "Super Admin",
      },
    });

    console.log("Super Admin Created Successfully!", superAdminData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
