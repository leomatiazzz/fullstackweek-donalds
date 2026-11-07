"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { logoutAdmin } from "../actions/auth-admin";

interface AdminLogoutButtonProps {
  slug: string;
}

export const AdminLogoutButton = ({ slug }: AdminLogoutButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin({ slug });
      toast.info("Painel bloqueado com sucesso.");
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 rounded-full text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
      onClick={handleLogout}
      disabled={isPending}
      title="Sair / Bloquear Painel"
    >
      <LogOutIcon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Bloquear</span>
    </Button>
  );
};

