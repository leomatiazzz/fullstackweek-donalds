"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/prisma";

const updateOrderStatusSchema = z.object({
  orderId: z.number(),
  status: z.nativeEnum(OrderStatus),
  slug: z.string(),
});

type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateOrderStatus = async (input: UpdateOrderStatusInput) => {
  const { orderId, status, slug } = updateOrderStatusSchema.parse(input);

  await db.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath(`/${slug}/admin`);
  revalidatePath(`/${slug}/orders`);

  return { success: true };
};

