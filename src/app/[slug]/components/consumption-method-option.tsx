import { ConsumptionMethod } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConsumptionMethodOptionProps {
  slug: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  option: ConsumptionMethod;
}

const ConsumptionMethodOption = ({
  slug,
  imageAlt,
  imageUrl,
  buttonText,
  option,
}: ConsumptionMethodOptionProps) => {
  return (
    <Card className="transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-6 p-6 md:gap-8 md:p-8">
        <div className="relative h-[80px] w-[80px] md:h-[100px] md:w-[100px]">
          <Image
            src={imageUrl}
            fill
            alt={imageAlt}
            className="object-contain"
          />
        </div>
        <Button variant="secondary" className="w-full rounded-full" asChild>
          <Link href={`/${slug}/menu?consumptionMethod=${option}`}>
            {buttonText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConsumptionMethodOption;
