import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

async function main() {
  const count = await db.event.count();
  if (count > 0) {
    console.log("Il database contiene già delle serate: seed saltato.");
    return;
  }

  await db.event.createMany({
    data: [
      {
        name: "Serata paella e sangria",
        description:
          "Una serata dal sapore spagnolo: paella preparata al momento, sangria fresca e musica dal vivo. Porta gli amici!",
        date: inDays(7),
        time: "20:00",
        themeColor: "#ea580c",
        isOpen: true,
      },
      {
        name: "Notte di jazz",
        description:
          "Trio jazz dal vivo, luci soffuse e calici in mano. L'atmosfera perfetta per una serata diversa dal solito.",
        date: inDays(14),
        time: "21:30",
        themeColor: "#2563eb",
        isOpen: true,
      },
      {
        name: "Tombolata di fine estate",
        description:
          "La classica tombolata con premi a sorpresa, buffet e tanta allegria. Adatta a grandi e piccini.",
        date: inDays(21),
        time: "19:30",
        themeColor: "#16a34a",
        isOpen: true,
      },
    ],
  });

  console.log("Seed completato: 3 serate di esempio create.");
}

main().finally(() => db.$disconnect());
