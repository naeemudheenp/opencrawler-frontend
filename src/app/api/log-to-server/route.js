import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { url } = await req.json();
    const log = await prisma.logs.create({
      data: { name: url },
    });
    return new Response(JSON.stringify({ success: true, log }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error logging URL:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to log URL" }),
      { status: 500 }
    );
  }
}