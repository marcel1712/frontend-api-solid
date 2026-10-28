import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout, TextAreaField } from '@/components/ui'
import { recheckOrgCnpj, deleteOrg, fetchOrgsForReview, reviewOrg } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatCnpj } from '@/lib/cnpj'
import type { ApiOrgForReview, CnpjCheck, OrgStatus } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'
import { NotFound } from './NotFound'

const TABS: { status: OrgStatus; label: string }[] = [
  { status: 'UnderReview', label: 'Em análise' },
  { status: 'Pending', label: 'Sem documentos' },
  { status: 'Rejected', label: 'Recusadas' },
  { status: 'Approved', label: 'Aprovadas' },
]

const DOCUMENT_LABEL = { Statute: 'Estatuto social', BoardMinutes: 'Ata da diretoria' }

const MIN_REASON = 10

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-bold ${
        ok ? 'bg-teal/15 text-teal-deep' : 'bg-brand-soft text-brand-deep'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="size-4" aria-hidden />
      ) : (
        <XCircle className="size-4" aria-hidden />
      )}
      {label}
    </li>
  )
}

/** O que a Receita diz, ao lado do que a ONG declarou — a decisão é de quem lê. */
function CnpjReport({ orgId, initial }: { orgId: string; initial: CnpjCheck | null }) {
  const [check, setCheck] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function recheck() {
    setLoading(true)
    setError(null)
    try {
      setCheck(await recheckOrgCnpj(orgId))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'A consulta falhou.')
    } finally {
      setLoading(false)
    }
  }

  const record = check?.record

  return (
    <div className="rounded-2xl bg-shell p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink-soft">
          {check
            ? `Receita Federal, consultada em ${new Date(check.checkedAt).toLocaleString('pt-BR')}`
            : 'A consulta à Receita falhou no cadastro.'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => void recheck()} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
          {loading ? 'Consultando…' : 'Consultar de novo'}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm font-bold text-brand-deep">
          {error}
        </p>
      ) : null}

      {check && !record ? (
        <p className="mt-3 font-bold text-brand-deep">A Receita não encontrou este CNPJ.</p>
      ) : null}

      {record && check.flags ? (
        <>
          <ul className="mt-3 flex flex-wrap gap-2">
            <Flag ok={check.flags.active} label={`Situação: ${record.registrationStatus}`} />
            <Flag ok={check.flags.nonProfit} label={record.legalNature} />
            <Flag
              ok={check.flags.cityMatches}
              label={`${record.city} / ${record.state}`}
            />
          </ul>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-bold text-ink-soft">Razão social</dt>
            <dd className="font-semibold">{record.legalName}</dd>
            {record.tradeName ? (
              <>
                <dt className="font-bold text-ink-soft">Nome fantasia</dt>
                <dd className="font-semibold">{record.tradeName}</dd>
              </>
            ) : null}
            <dt className="font-bold text-ink-soft">Atividade principal</dt>
            <dd className="font-semibold">{record.mainActivity}</dd>
            {record.openedAt ? (
              <>
                <dt className="font-bold text-ink-soft">Aberta em</dt>
                <dd className="font-semibold">
                  {new Date(`${record.openedAt}T12:00:00`).toLocaleDateString('pt-BR')}
                </dd>
              </>
            ) : null}
          </dl>
        </>
      ) : null}
    </div>
  )
}

function OrgReviewCard({
  org,
  onDecided,
}: {
  org: ApiOrgForReview
  onDecided: (message: string) => void
}) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deletingSaving, setDeletingSaving] = useState(false)

  async function decide(decision: 'approve' | 'reject') {
    setSaving(true)
    setError(null)
    try {
      await reviewOrg(
        org.id,
        decision === 'approve' ? { decision } : { decision, reason: reason.trim() },
      )
      onDecided(
        decision === 'approve'
          ? `${org.name} foi aprovada e já aparece na busca.`
          : `${org.name} foi recusada. O motivo foi enviado por e-mail.`,
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a decisão.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeletingSaving(true)
    setError(null)
    try {
      await deleteOrg(org.id, deleteReason.trim())
      onDecided(`${org.name} foi excluída. O e-mail e o WhatsApp não podem se cadastrar de novo.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir.')
      setDeletingSaving(false)
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">{org.name}</h2>
        <p className="text-sm font-bold text-ink-soft">
          Cadastro em {new Date(org.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="font-bold text-ink-soft">CNPJ</dt>
        <dd className="font-semibold">{org.cnpj ? formatCnpj(org.cnpj) : '—'}</dd>
        <dt className="font-bold text-ink-soft">E-mail</dt>
        <dd className="font-semibold break-all">{org.email}</dd>
        <dt className="font-bold text-ink-soft">WhatsApp</dt>
        <dd className="font-semibold">{org.whatsapp}</dd>
        <dt className="font-bold text-ink-soft">Endereço</dt>
        <dd className="font-semibold">
          {org.address} — {org.city}
        </dd>
        {org.rejectionReason ? (
          <>
            <dt className="font-bold text-ink-soft">Última recusa</dt>
            <dd className="font-semibold">{org.rejectionReason}</dd>
          </>
        ) : null}
      </dl>

      <div className="mt-5">
        <CnpjReport orgId={org.id} initial={org.cnpjCheck} />
      </div>

      {org.documents.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {org.documents.map((document) => (
            <li key={document.kind}>
              {/* Link assinado de 10 minutos: recarregue a lista se expirar. */}
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className={buttonClass({ variant: 'outline', size: 'sm' })}
              >
                <ExternalLink className="size-4" aria-hidden />
                {DOCUMENT_LABEL[document.kind]}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {org.status === 'UnderReview' ? (
        <div className="mt-6 border-t border-hairline pt-5">
          {rejecting ? (
            <div className="flex flex-col gap-4">
              <TextAreaField
                label="Motivo da recusa"
                hint="Vai para a ONG por e-mail, do jeito que estiver aqui. Diga o que corrigir."
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void decide('reject')}
                  disabled={saving || reason.trim().length < MIN_REASON}
                >
                  <X className="size-4" aria-hidden />
                  {saving ? 'Recusando…' : 'Recusar e avisar a ONG'}
                </Button>
                <Button variant="ghost" onClick={() => setRejecting(false)} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="accent" onClick={() => void decide('approve')} disabled={saving}>
                <Check className="size-4" aria-hidden />
                {saving ? 'Aprovando…' : 'Aprovar'}
              </Button>
              <Button variant="outline" onClick={() => setRejecting(true)} disabled={saving}>
                Recusar
              </Button>
            </div>
          )}
          <p className="mt-3 text-sm font-semibold text-ink-soft">
            Aprovar ou recusar apaga os documentos. Fica só a decisão.
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-hairline pt-5">
        {deleting ? (
          <div className="flex flex-col gap-4">
            <TextAreaField
              label="Motivo da exclusão"
              hint="Fica registrado junto ao bloqueio do e-mail e do WhatsApp. Não é enviado para ninguém."
              rows={3}
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void handleDelete()}
                disabled={deletingSaving || deleteReason.trim().length < MIN_REASON}
              >
                <Trash2 className="size-4" aria-hidden />
                {deletingSaving ? 'Excluindo…' : 'Excluir e bloquear'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDeleting(false)}
                disabled={deletingSaving}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setDeleting(true)}>
            <Trash2 className="size-4" aria-hidden />
            Excluir cadastro
          </Button>
        )}
        <p className="mt-3 text-sm font-semibold text-ink-soft">
          Apaga a ONG, os pets e os documentos dela. O e-mail e o WhatsApp usados ficam
          bloqueados para um novo cadastro — use para contas falsas ou de má-fé.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-brand-deep">
          {error}
        </p>
      ) : null}
    </Card>
  )
}

export function AdminReview() {
  const { org } = useAuth()
  const [status, setStatus] = useState<OrgStatus>('UnderReview')
  const [notice, setNotice] = useState<string | null>(null)
  const [decided, setDecided] = useState<string[]>([])

  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchOrgsForReview(status), [status]),
    { enabled: Boolean(org?.isAdmin) },
  )

  // Quem não é admin não fica sabendo que a página existe; a API recusa de
  // qualquer forma.
  if (!org?.isAdmin) return <NotFound />

  const orgs = (data ?? []).filter((item) => !decided.includes(item.id))

  return (
    <OrgShell
      title="Verificação de ONGs"
      subtitle="Confira o CNPJ e os documentos antes de liberar os pets na busca."
      actions={
        <Link to="/ong/painel" className={buttonClass({ variant: 'on-brand', size: 'sm' })}>
          <ArrowLeft className="size-4" aria-hidden />
          Painel
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        <div role="tablist" className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              role="tab"
              aria-selected={status === tab.status}
              onClick={() => {
                setStatus(tab.status)
                setNotice(null)
              }}
              className={`rounded-pill px-4 py-2 text-sm font-bold transition-colors ${
                status === tab.status
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink-soft shadow-card hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div aria-live="polite">
          {notice ? (
            <Callout icon={<Check className="size-5" aria-hidden />}>{notice}</Callout>
          ) : null}
        </div>

        {loading ? (
          <Card>
            <div className="h-8 w-48 animate-pulse rounded-pill bg-shell" />
            <div className="mt-4 h-24 animate-pulse rounded-2xl bg-shell" />
          </Card>
        ) : error ? (
          <Card>
            <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
              {error}
            </Callout>
            <div className="mt-4">
              <Button variant="outline" onClick={reload}>
                Tentar de novo
              </Button>
            </div>
          </Card>
        ) : orgs.length ? (
          orgs.map((item) => (
            <OrgReviewCard
              key={item.id}
              org={item}
              onDecided={(message) => {
                setDecided((current) => [...current, item.id])
                setNotice(message)
              }}
            />
          ))
        ) : (
          <Card>
            <h2 className="text-2xl">Nada por aqui</h2>
            <p className="mt-2 font-semibold text-ink-soft">
              {status === 'UnderReview'
                ? 'Nenhuma ONG esperando análise.'
                : 'Nenhuma ONG neste status.'}
            </p>
          </Card>
        )}
      </div>
    </OrgShell>
  )
}
