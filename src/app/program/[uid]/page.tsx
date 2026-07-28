import { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient, getPrismicLang } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";

type Params = { uid: string };
type SearchParams = { lang?: string };

export default async function ProgramPage({
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

  const program = await client
    .getByUID("program", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("program", uid).catch(() => notFound());
    });

  // <SliceZone> renders the program's slices.
  return <SliceZone slices={program.data.slices} components={components} />;
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

  const program = await client
    .getByUID("program", uid, lang ? { lang } : undefined)
    .catch(async () => {
      return client.getByUID("program", uid).catch(() => notFound());
    });

  return {
    title: program.data.title,
    description: program.data.meta_description,
    openGraph: {
      title: program.data.meta_title ?? undefined,
      images: [{ url: program.data.meta_image.url ?? "" }],
    },
  };
}

export async function generateStaticParams() {
  const client = createClient();

  // Get all programs from Prismic
  const programs = await client.getAllByType("program");

  return programs.map((program) => ({ uid: program.uid }));
}