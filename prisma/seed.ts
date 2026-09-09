import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL?.replace(
  "sslmode=require",
  "sslmode=verify-full",
);
if (!connectionString) throw new Error("DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const criteria = [
  ["requirements", "Requirement understanding", "Captures requirements, assumptions, and constraints.", 15],
  ["responsibilities", "Class responsibilities", "Assigns focused behavior to cohesive classes.", 20],
  ["relationships", "Relationships and coupling", "Uses clear relationships with controlled dependencies.", 15],
  ["encapsulation", "Encapsulation and interfaces", "Protects invariants behind meaningful interfaces.", 15],
  ["extensibility", "Extensibility", "Supports likely changes without speculative abstractions.", 15],
  ["edge-cases", "Edge cases and testability", "Addresses failures, boundaries, and observable behavior.", 10],
  ["explanation", "Design explanation", "Explains decisions and trade-offs with evidence.", 10],
] as const;

const problems = [
  {
    slug: "parking-lot",
    title: "Parking Lot",
    summary: "Design a parking facility that assigns spots and calculates fees.",
    context: "A multi-floor parking facility supports motorcycles, cars, and large vehicles. Design the core objects and interactions for entry, spot assignment, exit, and payment.",
    requirements: ["Issue a ticket at entry", "Assign a compatible available spot", "Calculate a fee when a vehicle exits", "Make spot and pricing rules replaceable"],
    evaluationHints: ["State concurrency assumptions", "Keep allocation separate from pricing"],
    difficulty: "BEGINNER" as const,
    estimatedMinutes: 45,
  },
  {
    slug: "vending-machine",
    title: "Vending Machine",
    summary: "Model product selection, payment, dispensing, and refunds.",
    context: "Design the core of a vending machine that stocks products, accepts money, dispenses an item, returns change, and recovers from failed purchases.",
    requirements: ["Select an available product", "Accept incremental payment", "Dispense only after sufficient payment", "Return change or refund safely"],
    evaluationHints: ["Make invalid state transitions explicit", "Separate inventory from transaction state"],
    difficulty: "INTERMEDIATE" as const,
    estimatedMinutes: 60,
  },
  {
    slug: "elevator-system",
    title: "Elevator System",
    summary: "Coordinate elevator requests across a multi-floor building.",
    context: "Design the core domain for multiple elevators serving external floor requests and internal destination requests. Focus on responsibilities and scheduling seams.",
    requirements: ["Accept hall and car requests", "Choose an elevator for a hall request", "Move safely between floors", "Allow scheduling policy changes"],
    evaluationHints: ["Distinguish elevator state from scheduling policy", "Describe conflicting request behavior"],
    difficulty: "ADVANCED" as const,
    estimatedMinutes: 75,
  },
];

async function main() {
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: { ...problem, isPublished: true },
      create: {
        ...problem,
        isPublished: true,
        rubricCriteria: {
          create: criteria.map(([key, title, description, maxScore], position) => ({
            key, title, description, maxScore, position,
          })),
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
