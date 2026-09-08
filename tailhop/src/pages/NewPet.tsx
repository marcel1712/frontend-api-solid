import { AlertCircle, ArrowLeft, CheckCircle2, ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, OrgShell } from '@/components/OrgShell'
import { buttonClass } from '@/components/button-styles'
import { Button, Callout, Field, SelectField, TextAreaField } from '@/components/ui'
import { ApiError, createPet } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatSize, formatType } from '@/lib/format'
import type { AnimalSize, AnimalType } from '@/lib/types'

const SIZES: AnimalSize[] = ['Small', 'Medium', 'Large']

/**
 * `Ferret` fica de fora de propósito: o schema do Prisma define `Ferret`, mas o
 * controller de cadastro valida contra `"Furret"`. Nenhuma das duas grafias
 * passa pelas duas camadas, então a opção só produziria erro. Volta à lista
 * quando o backend acertar a grafia.
 */
const TYPES: AnimalType[] = [
  'Dog',
  'Cat',
  'Bird',
  'Fish',
  'Turtle',
  'Rabbit',
  'Hamster',
  'Chinchilla',
]

/**
 * O backend ainda não guarda imagem. O campo fica visível e desabilitado, com o
 * motivo escrito: some a dúvida de "cadê a foto?" e o lugar dela no formulário
 * já está definido para quando o upload existir.
 */
function PhotoField() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold">Foto do pet</span>
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-hairline bg-canvas p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-shell text-ink-soft">
          <ImagePlus className="size-6" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-ink-soft">
          O envio de fotos ainda está sendo construído. Por enquanto o anúncio
          entra com a ilustração padrão do Tailhop.
        </p>
      </div>
    </div>
  )
}

export function NewPet() {
  const { org } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [size, setSize] = useState<AnimalSize>('Small')
  const [type, setType] = useState<AnimalType>('Dog')
  const [bio, setBio] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  if (!org) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const pet = await createPet({
        name: name.trim(),
        age: Number(age),
        size,
        type,
        bio: bio.trim() || undefined,
      })
      setCreated(pet.name)
    } catch (cause) {
      if (cause instanceof ApiError && cause.isUnauthorized) {
        navigate('/ong/entrar', { replace: true })
        return
      }
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível publicar o pet. Tente de novo.',
      )
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <OrgShell title="Pet publicado" subtitle={`${created} já está na busca.`}>
        <Card>
          <div className="py-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-deep">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl">{created} está anunciado</h2>
            <p className="mx-auto mt-3 max-w-sm font-semibold text-ink-soft">
              Quem buscar por pets em {org.city} já encontra o anúncio, e o
              contato chega no WhatsApp da ONG.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/ong/painel" className={buttonClass()}>
                Ver meus pets
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setCreated(null)
                  setName('')
                  setAge('')
                  setBio('')
                  setSubmitting(false)
                }}
              >
                Cadastrar outro
              </Button>
            </div>
          </div>
        </Card>
      </OrgShell>
    )
  }

  return (
    <OrgShell
      title="Cadastrar um pet"
      subtitle="Estes dados são o que a pessoa vê antes de decidir chamar a ONG."
      actions={
        <Link
          to="/ong/painel"
          className={buttonClass({ variant: 'on-brand', size: 'sm' })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Link>
      }
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error ? (
            <Callout tone="error" icon={<AlertCircle className="size-5" aria-hidden />}>
              {error}
            </Callout>
          ) : null}

          <Field
            label="Nome"
            name="name"
            required
            maxLength={60}
            placeholder="Como a ONG chama o pet"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Idade"
              name="age"
              type="number"
              required
              min={0}
              max={30}
              step={1}
              hint="Em anos; 0 para filhotes."
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            <SelectField
              label="Porte"
              name="size"
              value={size}
              onChange={(event) => setSize(event.target.value as AnimalSize)}
            >
              {SIZES.map((option) => (
                <option key={option} value={option}>
                  {formatSize(option)}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Espécie"
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as AnimalType)}
            >
              {TYPES.map((option) => (
                <option key={option} value={option}>
                  {formatType(option)}
                </option>
              ))}
            </SelectField>
          </div>

          <TextAreaField
            label="Sobre o pet"
            name="bio"
            rows={5}
            maxLength={600}
            hint="Temperamento, convivência com crianças e outros animais, castração, vacinas."
            placeholder="Conte o que alguém precisa saber antes de levar o pet para casa."
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />

          <PhotoField />

          <Button type="submit" size="lg" full disabled={submitting}>
            {submitting ? 'Publicando…' : 'Publicar pet'}
          </Button>
        </form>
      </Card>
    </OrgShell>
  )
}
