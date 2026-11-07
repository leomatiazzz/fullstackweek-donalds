"use client";

import {
  ArrowLeftIcon,
  ChefHatIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAdmin } from "../actions/auth-admin";

interface AdminLoginFormProps {
  slug: string;
  restaurantName: string;
  avatarImageUrl: string;
}

const AdminLoginForm = ({
  slug,
  restaurantName,
  avatarImageUrl,
}: AdminLoginFormProps) => {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      toast.error("Por favor, digite o PIN de acesso.");
      return;
    }

    startTransition(async () => {
      const result = await loginAdmin({ slug, pin });
      if (result.success) {
        toast.success("Acesso autorizado! Bem-vindo à cozinha.");
        router.refresh();
      } else {
        toast.error(result.message || "Senha incorreta.");
      }
    });
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image
                src={avatarImageUrl}
                alt={restaurantName}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-xl font-bold">
                Cozinha & Gestão
              </CardTitle>
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                <ChefHatIcon className="h-3 w-3 text-primary" /> KDS
              </span>
            </div>
            <CardDescription className="text-xs pt-1">
              Acesso exclusivo para os atendentes e cozinheiros do{" "}
              <strong className="text-foreground">{restaurantName}</strong>.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="pin-input"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <KeyRoundIcon className="h-3.5 w-3.5 text-muted-foreground" />
                PIN ou Senha de Acesso da Equipe
              </Label>
              <div className="relative">
                <Input
                  id="pin-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite o código da cozinha..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="rounded-xl pr-10 text-center tracking-widest font-mono text-base"
                  autoFocus
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                PIN padrão de demonstração:{" "}
                <span className="font-mono font-bold text-foreground">
                  1234
                </span>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full gap-2 rounded-full font-medium"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <LockIcon className="h-4 w-4" />
              )}
              Acessar Painel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href={`/${slug}`}>
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Voltar para o Cardápio
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginForm;

