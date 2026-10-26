import { AlertCircle, CheckCircle2, Clock, FileText, Upload } from 'lucide-react'
import { useId, useState } from 'react'
import { ApiError, uploadOrgDocument } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import {
  DOCUMENT_KINDS,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  type ApiOwnOrg,
  type DocumentType,
  type OrgDocumentKind,
} from '@/lib/types'
import { Card } from './OrgShell'
import { buttonClass } from './button-styles'
import { Callout } from './ui'

const DOCUMENT_COPY: Record<OrgDocumentKind, { title: string; description: string }> = {
  Statute: {
    title: 'Estatuto social',
    description: 'O estatuto registrado em cartório, com a finalidade da ONG.',
  },
  BoardMinutes: {
    title: 'Ata de eleição da diretoria',
    description: 'A ata mais recente, mostrando quem representa a ONG hoje.',
  },
}

/** Recusado aqui: o tamanho vai assinado na URL, e o R2 recusaria depois do envio inteiro. */
function describeFile(file: File): string | null {
  if (!DOCUMENT_TYPES.includes(file.type as DocumentType)) {
    return 'Envie um PDF ou uma foto (JPEG ou PNG) do documento.'
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return 'O arquivo passa de 10 MB. Reduza ou envie um PDF mais leve.'
  }
  return null
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

interface DocumentSlotProps {
  kind: OrgDocumentKind
  uploadedAt: string | null
  onUploaded: () => Promise<void>
}

function DocumentSlot({ kind, uploadedAt, onUploaded }: DocumentSlotProps) {
  const inputId = useId()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const copy = DOCUMENT_COPY[kind]

  async function handleFile(file: File) {
    setError(null)

    const problem = describeFile(file)
    if (problem) {
      setError(problem)
      return
    }

    setProgress(0)
    try {
      await uploadOrgDocument(kind, file, setProgress)
      await onUploaded()
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 403
          ? 'Os documentos já estão em análise e não podem mais ser trocados.'
          : cause instanceof Error
            ? cause.message
            : 'Não foi possível enviar o arquivo.',
      )
    } finally {
      setProgress(null)
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-hairline py-4 first:border-t-0 first:pt-0">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${
          uploadedAt ? 'bg-teal/15 text-teal-deep' : 'bg-shell text-ink-soft'
        }`}
      >
        {uploadedAt ? (
          <CheckCircle2 className="size-5" aria-hidden />
        ) : (
          <FileText className="size-5" aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1 basis-56">
        <p className="font-display text-lg">{copy.title}</p>
        <p className="text-sm font-semibold text-ink-soft">
          {uploadedAt ? `Enviado em ${formatDate(uploadedAt)}.` : copy.description}
        </p>
      </div>

      {progress !== null ? (
        <p role="status" className="text-sm font-bold text-ink-soft">
          Enviando… {Math.round(progress * 100)}%
        </p>
      ) : (
        <>
          <input
            id={inputId}
            type="file"
            accept={DOCUMENT_TYPES.join(',')}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void handleFile(file)
            }}
          />
          <label
            htmlFor={inputId}
            className={`${buttonClass({ variant: uploadedAt ? 'ghost' : 'outline', size: 'sm' })} cursor-pointer`}
          >
            <Upload className="size-4" aria-hidden />
            {uploadedAt ? 'Trocar arquivo' : 'Enviar arquivo'}
          </label>
        </>
      )}

      {error ? (
        <p role="alert" className="basis-full text-sm font-bold text-brand-deep">
          {error}
        </p>
      ) : null}
    </li>
  )
}

/**
 * O que falta para a ONG aparecer na busca. Some quando a conta é aprovada:
 * daí em diante o painel é só sobre os pets.
 */
export function OrgVerification({ org }: { org: ApiOwnOrg }) {
  const { refreshOrg } = useAuth()

  if (org.status === 'Approved') return null

  if (org.status === 'UnderReview') {
    return (
      <Card>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
            <Clock className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl">Documentos em análise</h2>
            <p className="mt-2 max-w-lg font-semibold text-ink-soft">
              Recebemos o estatuto e a ata. Avisamos por e-mail assim que a
              análise terminar. Enquanto isso, pode cadastrar os pets: eles
              entram na busca no momento da aprovação.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const uploadedAt = (kind: OrgDocumentKind) =>
    org.documents.find((document) => document.kind === kind)?.uploadedAt ?? null

  return (
    <Card>
      <h2 className="text-2xl">
        {org.status === 'Rejected'
          ? 'Precisamos de novos documentos'
          : 'Falta verificar a sua ONG'}
      </h2>

      {org.status === 'Rejected' && org.rejectionReason ? (
        <div className="mt-4">
          <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
            {org.rejectionReason}
          </Callout>
        </div>
      ) : null}

      <p className="mt-3 max-w-lg font-semibold text-ink-soft">
        Para a ONG aparecer para quem procura adotar, conferimos dois
        documentos. Assim que os dois chegarem, a análise começa sozinha.
      </p>

      <ul className="mt-6">
        {DOCUMENT_KINDS.map((kind) => (
          <DocumentSlot
            key={kind}
            kind={kind}
            uploadedAt={uploadedAt(kind)}
            onUploaded={refreshOrg}
          />
        ))}
      </ul>

      <p className="mt-5 text-sm font-semibold text-ink-soft">
        PDF, JPEG ou PNG, até 10 MB cada. Os arquivos são apagados assim que a
        análise termina; guardamos só o resultado.
      </p>
    </Card>
  )
}
