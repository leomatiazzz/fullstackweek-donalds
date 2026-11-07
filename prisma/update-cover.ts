import { PrismaClient } from "@prisma/client";

// Carrega automaticamente o arquivo .env da raiz
try {
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile();
  }
} catch {
  // Ignora se der erro ao carregar
}

if (!process.env.DATABASE_URL) {
  console.error("\n❌ ERRO: Variável DATABASE_URL não encontrada no arquivo .env!\n");
  process.exit(1);
}

const prisma = new PrismaClient();

async function run() {
  const newCoverUrl =
    "https://archello.s3.eu-central-1.amazonaws.com/images/2022/03/21/aaksen-responsible-aarchitecture-mcdonald--039-s-kiara-artha-restaurants-archello.1647846591.1631.jpg";

  console.log("Conectando ao banco de dados Neon...");
  const updated = await prisma.restaurant.updateMany({
    where: { slug: "fsw-donalds" },
    data: {
      coverImageUrl: newCoverUrl,
    },
  });

  console.log(
    `✅ Banner do restaurante atualizado com sucesso! Registros afetados: ${updated.count}`,
  );
}

run()
  .catch((e) => {
    console.error("Erro ao atualizar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
