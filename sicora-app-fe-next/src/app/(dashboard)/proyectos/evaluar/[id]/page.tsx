import EvaluarContent from './EvaluarContent';

export const metadata = {
  title: 'Evaluar Entrega | SICORA',
  description: 'Evaluación de entrega de proyecto formativo',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluarPage({ params }: PageProps) {
  const { id } = await params;
  return <EvaluarContent submissionId={id} />;
}
