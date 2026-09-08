import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { PetPhotos } from '@/components/PetPhotos'
import { buttonClass } from '@/components/button-styles'
import { Button } from '@/components/ui'
import { fetchPetPage } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatAge, formatSize, formatType } from '@/lib/format'
import type { ApiPetImage } from '@/lib/types'
import { useRequest } from '@/lib/useRequest'

/**
 * Gestão de um pet da ONG. Existe porque a foto só pode ser enviada depois que
 * o pet tem id — logo, não cabe no formulário de cadastro. É também onde a
 * edição do anúncio (`PATCH /pets/:id`) vai morar.
 */
export function ManagePet() {
  const { id = '' } = useParams()
  const { org } = useAuth()
  const navigate = useNavigate()

  const { data, loading, error, reload } = useRequest(
    useCallback(() => fetchPetPage(id), [id]),
  )

  // As fotos passam a viver aqui depois da primeira carga, para o envio e a
  // remoção refletirem na hora sem buscar o pet inteiro de novo.
  const [photos, setPhotos] = useState<ApiPetImage[] | null>(null)

  const onUnauthorized = useCallback(() => {
    navigate('/ong/entrar', { replace: true })
  }, [navigate])

  if (!org) return null

  const pet = data?.pet

  return (
    <OrgShell
      title={pet ? pet.name : 'Pet'}
      subtitle={pet ? `${formatType(pet.type)} · ${formatAge(pet.age)} · ${formatSize(pet.size)}` : undefined}
      actions={
        <Link
          to="/ong/painel"
          className={buttonClass({ variant: 'on-brand', size: 'sm' })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Painel
        </Link>
      }
    >
      <Card>
        {loading ? (
          <div className="flex flex-col gap-4" aria-busy>
            <div className="h-8 w-40 animate-pulse rounded-pill bg-shell" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="aspect-square animate-pulse rounded-2xl bg-shell" />
              <div className="aspect-square animate-pulse rounded-2xl bg-shell" />
            </div>
          </div>
        ) : error || !pet ? (
          <div className="py-6 text-center">
            <h2 className="text-2xl">Não foi possível abrir este pet</h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              {error ?? 'O anúncio pode ter sido removido.'}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={reload}>
                Tentar de novo
              </Button>
              <Link to="/ong/painel" className={buttonClass()}>
                Voltar ao painel
              </Link>
            </div>
          </div>
        ) : pet.orgId !== org.id ? (
          <div className="py-6 text-center">
            <h2 className="text-2xl">Este pet é de outra ONG</h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              Só a ONG que publicou o anúncio pode editá-lo.
            </p>
            <Link to="/ong/painel" className={`${buttonClass()} mt-6`}>
              Voltar ao painel
            </Link>
          </div>
        ) : (
          <>
            <PetPhotos
              petId={pet.id}
              photos={photos ?? pet.photos}
              onChange={setPhotos}
              onUnauthorized={onUnauthorized}
            />

            <div className="mt-8 border-t border-hairline pt-6">
              <Link
                to={`/pets/${pet.id}`}
                className="inline-flex items-center gap-2 rounded-pill text-sm font-bold text-brand hover:underline"
              >
                <ExternalLink className="size-4" aria-hidden />
                Ver o anúncio como quem procura adotar
              </Link>
            </div>
          </>
        )}
      </Card>
    </OrgShell>
  )
}
