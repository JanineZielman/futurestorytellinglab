import { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient, getPrismicLang } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
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

  const agenda = await client
    .getByUID("now", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("now", uid).catch(() => notFound());
    });

  // <SliceZone> renders the person's slices.
  return (
    <div className="page">
      <h1>{agenda.data.title}</h1>
      <PrismicNextImage field={agenda.data.image} />
      <SliceZone slices={agenda.data.slices} components={components} />
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

  const agenda = await client
    .getByUID("now", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("now", uid).catch(() => notFound());
    });

  return {
    title: agenda.data.title,
    description: agenda.data.meta_description,
    openGraph: {
      title: agenda.data.meta_title ?? undefined,
      images: [{ url: agenda.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all persons/residents from Prismic
  const agendaItems = await client.getAllByType("now");

  return agendaItems.map((item) => ({ uid: item.uid }));
}