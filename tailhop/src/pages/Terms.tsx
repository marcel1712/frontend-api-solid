import { Link } from 'react-router-dom'
import { LegalPage, type LegalSection } from '@/components/LegalPage'
import { CONTROLLER_NAME, PRIVACY_EMAIL, TERMS_UPDATED_AT } from '@/lib/legal'

const mail = <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>

const SECTIONS: LegalSection[] = [
  {
    id: 'o-que-e',
    title: 'O que é o Tailhop',
    content: (
      <>
        <p>
          O Tailhop é uma vitrine gratuita onde ONGs de proteção animal
          publicam pets disponíveis para adoção, e onde quem quer adotar os
          encontra por cidade. O projeto é mantido por{' '}
          <strong>{CONTROLLER_NAME}</strong>.
        </p>
        <p>
          O Tailhop <strong>não intermedeia a adoção</strong>. O contato
          acontece direto entre quem quer adotar e a ONG, pelo WhatsApp dela, e
          todo o processo — entrevista, visita, termo de adoção, entrega do
          animal — é conduzido pela ONG, que é a responsável por ele.
        </p>
        <p>
          Ao usar o site, você concorda com estes termos e com a{' '}
          <Link to="/privacidade">Política de privacidade</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'quem-adota',
    title: 'Para quem quer adotar',
    content: (
      <>
        <p>
          Buscar pets e falar com as ONGs é gratuito e não exige cadastro. As
          informações de cada pet são publicadas pela ONG responsável. O
          Tailhop verifica as ONGs antes de liberá-las, mas não examina os
          animais nem garante que as informações estejam completas ou
          atualizadas — confirme tudo com a ONG antes de decidir.
        </p>
        <p>
          Se algum anúncio parecer falso, pedir dinheiro de forma suspeita ou
          envolver maus-tratos, avise pelo e-mail {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'quem-pode-cadastrar',
    title: 'Quem pode cadastrar uma ONG',
    content: (
      <>
        <p>
          Podem se cadastrar entidades sem fins lucrativos que atuam na
          proteção animal e têm <strong>CNPJ ativo</strong>, representadas por
          um responsável maior de 18 anos com poderes para isso.
        </p>
        <p>
          Antes de os pets aparecerem na busca, a ONG passa por verificação:
          conferimos o CNPJ na Receita Federal e analisamos o estatuto social e
          a ata de eleição da diretoria. O Tailhop pode recusar um cadastro que
          não comprove ser uma ONG de proteção animal, e informa o motivo da
          recusa.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilidades-da-ong',
    title: 'Responsabilidades da ONG',
    content: (
      <>
        <p>Ao publicar no Tailhop, a ONG se compromete a:</p>
        <ul>
          <li>manter os dados da conta verdadeiros e atualizados;</li>
          <li>
            anunciar só animais que estejam sob seus cuidados e realmente
            disponíveis para adoção;
          </li>
          <li>
            marcar o pet como adotado assim que ele deixar de estar
            disponível;
          </li>
          <li>
            publicar só fotos e textos que tenha o direito de usar, sem expor
            terceiros;
          </li>
          <li>
            responder com respeito quem a procurar pelo Tailhop e conduzir a
            adoção de forma responsável;
          </li>
          <li>guardar a própria senha e não compartilhar o acesso à conta.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'proibido',
    title: 'O que não é permitido',
    content: (
      <ul>
        <li>
          <strong>Vender animais</strong> ou usar o Tailhop para qualquer
          comércio de animais. Contribuições que a ONG pedir para cobrir
          custos, como vacinas ou castração, são de responsabilidade dela e
          devem ser informadas com transparência a quem adota.
        </li>
        <li>Publicar informações falsas ou se passar por outra pessoa ou entidade.</li>
        <li>
          Publicar conteúdo violento, ofensivo, discriminatório, que mostre
          maus-tratos ou que viole a lei.
        </li>
        <li>
          Tentar acessar contas de outras pessoas, sobrecarregar o site ou
          coletar dados dele de forma automatizada.
        </li>
      </ul>
    ),
  },
  {
    id: 'conteudo',
    title: 'Conteúdo publicado pela ONG',
    content: (
      <p>
        As fotos e os textos continuam sendo da ONG. Ao publicá-los, a ONG
        autoriza o Tailhop a exibi-los, gratuitamente, no site e nos e-mails
        do serviço, pelo tempo em que estiverem publicados. Quando o pet ou a
        conta é removido, o conteúdo deixa de ser exibido.
      </p>
    ),
  },
  {
    id: 'suspensao',
    title: 'Suspensão e encerramento',
    content: (
      <>
        <p>
          O Tailhop pode tirar do ar anúncios ou suspender contas que
          descumpram estes termos, especialmente em caso de suspeita de golpe,
          venda de animais ou maus-tratos.
        </p>
        <p>
          A ONG pode encerrar a conta quando quiser, pedindo pelo e-mail{' '}
          {mail}. Os dados são tratados como descrito na Política de
          privacidade.
        </p>
      </>
    ),
  },
  {
    id: 'limites',
    title: 'Limites de responsabilidade',
    content: (
      <>
        <p>
          O Tailhop é oferecido gratuitamente e no estado em que se encontra.
          Trabalhamos para mantê-lo no ar e seguro, mas ele pode ficar fora do
          ar ou apresentar falhas.
        </p>
        <p>
          Como não participa da adoção, o Tailhop não responde pelas
          informações publicadas pelas ONGs, pelo estado de saúde ou
          comportamento dos animais, nem pelo que for combinado entre quem
          adota e a ONG. Nada disso afasta direitos que a lei garanta a você e
          que não possam ser afastados por contrato.
        </p>
      </>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nestes termos',
    content: (
      <p>
        Estes termos podem mudar. A data no topo indica a versão em vigor. Se a
        mudança for relevante, as ONGs cadastradas são avisadas por e-mail
        antes de ela valer.
      </p>
    ),
  },
  {
    id: 'lei',
    title: 'Lei aplicável e contato',
    content: (
      <p>
        Estes termos seguem a legislação brasileira. Dúvidas, denúncias ou
        pedidos: {mail}.
      </p>
    ),
  },
]

export function Terms() {
  return (
    <LegalPage
      title="Termos de uso"
      updatedAt={TERMS_UPDATED_AT}
      intro={
        <p>
          As regras para usar o Tailhop, tanto para quem procura um pet quanto
          para as ONGs que publicam. São curtas de propósito: leia antes de
          criar a conta da sua ONG.
        </p>
      }
      sections={SECTIONS}
      related={{ to: '/privacidade', label: 'Política de privacidade' }}
    />
  )
}
