import { notFound } from "next/navigation";
import { SeminarDetailPage } from "@/components/SeminarDetailPage";
import { SEMINARS, getSeminar } from "@/lib/seminars";

export function generateStaticParams() {
  return SEMINARS.map((s) => ({ slug: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getSeminar(slug)) notFound();
  return <SeminarDetailPage slug={slug} />;
}
