import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PARTNERS } from "@/lib/content";

export function PartnersLogos() {
  if (PARTNERS.length === 0) return null;

  return (
    <section
      aria-labelledby="partners-logos-heading"
      className="border-t border-paper/15 bg-navy-dark py-16 md:py-20"
    >
      <Container>
        <h2 id="partners-logos-heading" className="text-3xl font-bold md:text-4xl">
          شركاؤنا
        </h2>
        <ul className="mt-10 grid grid-cols-2 border-s border-t border-paper/15 sm:grid-cols-3 lg:grid-cols-4">
          {PARTNERS.map((partner) => {
            const logo = (
              <Image
                src={partner.logo}
                alt={partner.name}
                width={200}
                height={100}
                className="h-14 w-auto object-contain"
              />
            );
            return (
              <li key={partner.name} className="grid place-items-center border-b border-e border-paper/15 p-8">
                {partner.href ? (
                  <a href={partner.href} target="_blank" rel="noopener noreferrer">
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
