import { AlertCircle, ImagePlus, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { ApiError, deletePetPhoto, uploadPetPhoto } from '@/lib/api'
import {
  MAX_PHOTOS_PER_PET,
  UPLOADABLE_TYPES,
  type ApiPetImage,
  type UploadableType,
} from '@/lib/types'
import { Callout } from './ui'
import { buttonClass } from './button-styles'

/**
 * Recusado aqui e não no servidor: a assinatura só cobre os três tipos, e um
 * arquivo grande atravessa a rede inteira antes de o R2 dizer não.
 */
const MAX_FILE_BYTES = 8 * 1024 * 1024

function describeFile(file: File): string | null {
  if (!UPLOADABLE_TYPES.includes(file.type as UploadableType)) {
    return `${file.name}: envie uma imagem JPEG, PNG ou WebP.`
  }
  if (file.size > MAX_FILE_BYTES) {
    return `${file.name}: a foto passa de 8 MB. Reduza antes de enviar.`
  }
  return null
}

interface PetPhotosProps {
  petId: string
  photos: ApiPetImage[]
  onChange: (photos: ApiPetImage[]) => void
  onUnauthorized: () => void
}

export function PetPhotos({ petId, photos, onChange, onUnauthorized }: PetPhotosProps) {
  const inputId = useId()
  const [progress, setProgress] = useState<number | null>(null)
  const [current, setCurrent] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [removing, setRemoving] = useState<string | null>(null)

  const remaining = MAX_PHOTOS_PER_PET - photos.length

  async function handleFiles(files: FileList) {
    setErrors([])

    const chosen = [...files]
    const problems = chosen.map(describeFile).filter((message) => message !== null)

    // Mais arquivos do que vagas: sobem os que cabem e o resto é dito na cara,
    // em vez de subir tudo para o servidor recusar no meio.
    const valid = chosen.filter((file) => describeFile(file) === null)
    const accepted = valid.slice(0, remaining)
    const dropped = valid.length - remaining
    if (dropped > 0) {
      problems.push(
        dropped === 1
          ? `Um pet aceita no máximo ${MAX_PHOTOS_PER_PET} fotos, então uma delas não foi enviada.`
          : `Um pet aceita no máximo ${MAX_PHOTOS_PER_PET} fotos, então ${dropped} delas não foram enviadas.`,
      )
    }

    let published = photos

    for (const file of accepted) {
      setCurrent(file.name)
      setProgress(0)

      try {
        const image = await uploadPetPhoto(petId, file, setProgress)
        published = [...published, image]
        onChange(published)
      } catch (cause) {
        if (cause instanceof ApiError && cause.isUnauthorized) {
          onUnauthorized()
          return
        }
        problems.push(
          `${file.name}: ${cause instanceof Error ? cause.message : 'não foi possível enviar.'}`,
        )
      }
    }

    setCurrent(null)
    setProgress(null)
    setErrors(problems)
  }

  async function remove(image: ApiPetImage) {
    setRemoving(image.id)
    setErrors([])

    try {
      await deletePetPhoto(petId, image.id)
      onChange(photos.filter((photo) => photo.id !== image.id))
    } catch (cause) {
      if (cause instanceof ApiError && cause.isUnauthorized) {
        onUnauthorized()
        return
      }
      setErrors([
        cause instanceof Error ? cause.message : 'Não foi possível remover a foto.',
      ])
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-2xl">Fotos</h2>
        <p className="text-sm font-bold text-ink-soft">
          {photos.length} de {MAX_PHOTOS_PER_PET}
        </p>
      </div>

      <p className="mt-2 max-w-md font-semibold text-ink-soft">
        A primeira foto é a que aparece na busca. Fotos com o rosto do pet em luz
        natural funcionam melhor.
      </p>

      {photos.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="relative overflow-hidden rounded-2xl bg-shell">
              <img
                src={photo.url}
                alt={`Foto ${index + 1} do pet`}
                className="aspect-square w-full object-cover"
              />
              {index === 0 ? (
                <span className="absolute top-2 left-2 rounded-pill bg-surface/90 px-2.5 py-1 text-xs font-bold text-ink">
                  Capa
                </span>
              ) : null}
              <button
                type="button"
                disabled={removing === photo.id}
                onClick={() => void remove(photo)}
                aria-label={`Remover foto ${index + 1}`}
                className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-surface/90 text-brand-deep transition-colors hover:bg-surface disabled:opacity-60"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {progress !== null ? (
        <div className="mt-6" aria-live="polite">
          <p className="text-sm font-bold text-ink-soft">
            Enviando {current}… {Math.round(progress * 100)}%
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-pill bg-shell">
            <div
              className="h-full rounded-pill bg-brand transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      ) : remaining > 0 ? (
        <div className="mt-6">
          <input
            id={inputId}
            type="file"
            accept={UPLOADABLE_TYPES.join(',')}
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) void handleFiles(event.target.files)
              // Permite reenviar o mesmo arquivo depois de um erro.
              event.target.value = ''
            }}
          />
          <label htmlFor={inputId} className={`${buttonClass({ variant: 'outline' })} cursor-pointer`}>
            <ImagePlus className="size-5" aria-hidden />
            {photos.length ? 'Adicionar outra foto' : 'Adicionar fotos'}
          </label>
        </div>
      ) : (
        <p className="mt-6 text-sm font-semibold text-ink-soft">
          Este pet já tem as {MAX_PHOTOS_PER_PET} fotos permitidas. Remova uma para
          trocar.
        </p>
      )}

      {errors.length ? (
        <div className="mt-4 flex flex-col gap-2">
          {errors.map((message) => (
            <Callout
              key={message}
              tone="error"
              icon={<AlertCircle className="size-5" aria-hidden />}
            >
              {message}
            </Callout>
          ))}
        </div>
      ) : null}
    </div>
  )
}
