import { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient, getPrismicLang } from "@/prismicio";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { PrismicNextImage } from "@prismicio/next";

type Params = { uid: string };
type SearchParams = { lang?: string };

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { uid } = await params;
  const query = await searchParams;
  const lang = getPrismicLang(query.lang);
  const client = createClient();

  const person = await client
    .getByUID("resident", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("resident", uid).catch(() => notFound());
    });

  // <SliceZone> renders the person's slices.
  return (
    <div className="page">
      <h1>{person.data.name}</h1>
      <PrismicRichText field={person.data.text} />
      <SliceZone slices={person.data.slices} components={components} />
    </div>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { uid } = await params;
  const query = await searchParams;
  const lang = getPrismicLang(query.lang);
  const client = createClient();

  const person = await client
    .getByUID("resident", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("resident", uid).catch(() => notFound());
    });

  return {
    title: person.data.name,
    description: person.data.meta_description,
    openGraph: {
      title: person.data.meta_title ?? undefined,
      images: [{ url: person.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all persons/residents from Prismic
  const persons = await client.getAllByType("resident");

  return persons.map((person) => ({ uid: person.uid }));
}