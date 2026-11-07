"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const DEFAULT_PIN = process.env.ADMIN_PIN || "1234";

export const loginAdmin = async ({
  slug,
  pin,
}: {
  slug: string;
  pin: string;
}) => {
  const cleanPin = pin.trim();

  if (cleanPin !== DEFAULT_PIN) {
    return {
      success: false,
      message: "Senha ou PIN de acesso incorreto.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(`admin_access_${slug}`, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12 horas de sessão para o turno da cozinha
    path: "/",
  });

  revalidatePath(`/${slug}/admin`);
  return { success: true };
};

export const logoutAdmin = async ({ slug }: { slug: string }) => {
  const cookieStore = await cookies();
  cookieStore.delete(`admin_access_${slug}`);
  revalidatePath(`/${slug}/admin`);
  return { success: true };
};
