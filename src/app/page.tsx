import { UtensilsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/prisma";

const HomePage = async () => {
  let restaurants: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    avatarImageUrl: string;
    coverImageUrl: string;
  }> = [];

  try {
    restaurants = await db.restaurant.findMany();
  } catch (error) {
    console.error("Erro ao buscar restaurantes do banco de dados:", error);
  }

  // Se houver apenas 1 restaurante, redireciona automaticamente para sua rota dedicada
  if (restaurants.length === 1) {
    redirect(`/${restaurants[0].slug}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UtensilsIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Escolha seu Restaurante
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Selecione uma de nossas unidades para acessar o cardápio interativo e
            fazer seu pedido com rapidez e praticidade.
          </p>
        </div>

        {/* Lista de Restaurantes */}
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <Image
                    src={restaurant.coverImageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                    <div className="relative h-6 w-6 overflow-hidden rounded-full">
                      <Image
                        src={restaurant.avatarImageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {restaurant.name}
                    </span>
                  </div>
                </div>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {restaurant.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-3">
                  <Button asChild className="w-full rounded-full font-medium">
                    <Link href={`/${restaurant.slug}`}>Acessar Cardápio</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum restaurante encontrado no banco de dados.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/fsw-donalds">Acessar /fsw-donalds</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;
