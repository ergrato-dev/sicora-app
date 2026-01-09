import DocumentoDetailContent from './DocumentoDetailContent';

export const metadata = {
  title: 'Documento | Base de Conocimiento | SICORA',
  description: 'Detalle del documento en la base de conocimiento',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentoDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <DocumentoDetailContent documentId={id} />;
}
