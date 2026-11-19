"use server";

import { ComplaintStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

export interface UpdateComplaintStatusParams {
  complaintId: string;
  status: ComplaintStatus;
  slug: string;
}

export const updateComplaintStatus = async ({
  complaintId,
  status,
  slug,
}: UpdateComplaintStatusParams) => {
  try {
    const updated = await db.complaint.update({
      where: { id: complaintId },
      data: { status },
    });

    revalidatePath(`/${slug}/admin`);
    return { success: true, complaint: updated };
  } catch (error) {
    console.error("Erro ao atualizar status da reclamação:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status da reclamação.",
    };
  }
};
