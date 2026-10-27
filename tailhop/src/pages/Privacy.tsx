import { LegalPage, type LegalSection } from '@/components/LegalPage'
import { CONTROLLER_NAME, PRIVACY_EMAIL, TERMS_UPDATED_AT } from '@/lib/legal'

const mail = <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>

/*
 * Cada item descreve o que o sistema faz hoje — o que a API grava, por quanto
 * tempo, com quem fala. Mudou o comportamento, muda o texto, e com ele
 * `TERMS_VERSION` (lib/legal.ts) e `CURRENT_TERMS_VERSION` na API.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'quem-somos',
    title: 'Quem cuida dos seus dados',
    content: (
      <>
        <p>
          O Tailhop é um projeto independente, mantido por{' '}
          <strong>{CONTROLLER_NAME}</strong>, pessoa física, que é o controlador
          dos dados pessoais tratados no site, nos termos da Lei Geral de
          Proteção de Dados (Lei nº 13.709/2018, a LGPD).
        </p>
        <p>
          Para qualquer assunto sobre os seus dados, escreva para {mail}. É
          também o canal do encarregado de dados.
        </p>
      </>
    ),
  },
  {
    id: 'quem-visita',
    title: 'Se você só está procurando um pet',
    content: (
      <>
        <p>
          Para buscar pets e falar com uma ONG você <strong>não precisa de
          conta</strong>, e o Tailhop não pede nenhum dado seu. Não usamos
          cookies de publicidade nem ferramentas de análise de visitas.
        </p>
        <p>
          A conversa sobre a adoção acontece no WhatsApp da ONG, fora do
          Tailhop: o que você disser por lá fica entre você, a ONG e o
          WhatsApp, e não passa por nós.
        </p>
        <p>
          Como em qualquer site, o servidor registra dados técnicos de cada
          acesso — endereço IP, data, hora e a página pedida — para segurança e
          para limitar abusos, como tentativas repetidas de login. Esses
          registros não são usados para identificar quem navega.
        </p>
      </>
    ),
  },
  {
    id: 'dados-das-ongs',
    title: 'Dados que coletamos das ONGs',
    content: (
      <>
        <p>Quando uma ONG se cadastra e usa o painel, guardamos:</p>
        <ul>
          <li>
            <strong>Dados da conta:</strong> nome da ONG, e-mail, WhatsApp,
            cidade, endereço e CNPJ.
          </li>
          <li>
            <strong>Senha:</strong> nunca guardada como você digitou, só um
            resumo cifrado (hash bcrypt) que não permite recuperá-la.
          </li>
          <li>
            <strong>Dados públicos do CNPJ</strong> na Receita Federal — razão
            social, situação cadastral, natureza jurídica, município e
            atividade —, consultados no cadastro para ajudar na verificação.
          </li>
          <li>
            <strong>Documentos de verificação:</strong> estatuto social e ata de
            eleição da diretoria. Eles costumam trazer nomes e números de
            documento dos dirigentes da ONG.
          </li>
          <li>
            <strong>Resultado da verificação:</strong> aprovação ou recusa, a
            data e, na recusa, o motivo.
          </li>
          <li>
            <strong>Aceite destes termos:</strong> a versão aceita e a data, como
            prova do consentimento.
          </li>
          <li>
            <strong>Pets publicados:</strong> nome, espécie, idade, porte,
            descrição e fotos.
          </li>
          <li>
            <strong>Dados técnicos da sessão:</strong> identificadores cifrados
            de login, de confirmação de e-mail e de troca de senha.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'para-que',
    title: 'Para que usamos e com que base legal',
    content: (
      <table>
        <thead>
          <tr>
            <th>Uso</th>
            <th>Base legal (LGPD, art. 7º)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Criar e manter a conta da ONG, permitir o login e a publicação de pets</td>
            <td>Execução do contrato com a ONG (inciso V)</td>
          </tr>
          <tr>
            <td>
              Mostrar a quem quer adotar o nome, a cidade, o endereço e o
              WhatsApp da ONG, junto dos pets
            </td>
            <td>Execução do contrato (inciso V) — é o serviço que a ONG contrata</td>
          </tr>
          <tr>
            <td>
              Verificar se a ONG existe e é uma entidade de proteção animal
              (CNPJ e documentos)
            </td>
            <td>
              Legítimo interesse (inciso IX): proteger quem adota de anúncios
              falsos e golpes
            </td>
          </tr>
          <tr>
            <td>Enviar e-mails de confirmação, troca de senha e resultado da verificação</td>
            <td>Execução do contrato (inciso V)</td>
          </tr>
          <tr>
            <td>Registros de acesso e limites contra abuso</td>
            <td>Legítimo interesse (inciso IX): segurança do site</td>
          </tr>
          <tr>
            <td>Guardar a prova do aceite destes termos</td>
            <td>Exercício regular de direitos (inciso VI)</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'o-que-e-publico',
    title: 'O que fica público',
    content: (
      <>
        <p>
          Depois que a ONG é aprovada, ficam visíveis para qualquer pessoa: o
          nome da ONG, a cidade, o endereço, o <strong>número de
          WhatsApp</strong> e os pets publicados, com fotos e descrições.
          Enquanto a ONG não é aprovada, nada disso aparece.
        </p>
        <p>
          O e-mail, o CNPJ, os documentos e o resultado da verificação nunca
          ficam públicos.
        </p>
        <p>
          <strong>Atenção:</strong> se o WhatsApp cadastrado for o número
          pessoal de um voluntário, ele ficará público. Se preferir, use um
          número da própria ONG.
        </p>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem os dados são compartilhados',
    content: (
      <>
        <p>
          O Tailhop <strong>não vende nem aluga dados</strong>. Para funcionar,
          usa serviços de terceiros que tratam dados em nosso nome
          (operadores):
        </p>
        <ul>
          <li><strong>Render</strong> — hospeda o servidor da aplicação.</li>
          <li><strong>Neon</strong> — hospeda o banco de dados.</li>
          <li>
            <strong>Cloudflare R2</strong> — guarda as fotos dos pets e, em
            área privada, os documentos de verificação.
          </li>
          <li><strong>Vercel</strong> — hospeda as páginas do site.</li>
          <li><strong>Resend</strong> — envia os e-mails do Tailhop.</li>
          <li>
            <strong>Sentry</strong> — recebe relatórios de erros do site e do
            servidor, para que possam ser corrigidos. Os relatórios dizem o que
            falhou e em que parte do código, sem senhas, cookies, conteúdo de
            formulários, endereço IP ou os códigos dos links enviados por
            e-mail.
          </li>
          <li>
            <strong>BrasilAPI</strong> — recebe só o número do CNPJ, para
            consultar os dados públicos da Receita Federal.
          </li>
        </ul>
        <p>
          Alguns desses serviços guardam dados em servidores fora do Brasil,
          principalmente nos Estados Unidos. Essa transferência internacional
          acontece porque é necessária para prestar o serviço (LGPD, art. 33),
          e escolhemos provedores que adotam medidas de segurança compatíveis
          com a lei.
        </p>
        <p>
          Os dados também podem ser fornecidos a autoridades quando houver
          obrigação legal ou ordem judicial.
        </p>
      </>
    ),
  },
  {
    id: 'por-quanto-tempo',
    title: 'Por quanto tempo guardamos',
    content: (
      <ul>
        <li>
          <strong>Documentos de verificação:</strong> apagados assim que a
          análise termina, seja ela aprovação ou recusa. Fica guardado só o
          resultado.
        </li>
        <li>
          <strong>Links de confirmação de e-mail e de troca de senha:</strong>{' '}
          valem 24 horas e 1 hora, e só podem ser usados uma vez.
        </li>
        <li>
          <strong>Sessão de login:</strong> expira depois de 7 dias sem uso.
        </li>
        <li>
          <strong>Conta, pets e demais dados da ONG:</strong> enquanto a conta
          existir. Pedido de exclusão é atendido em até 15 dias, salvo o que a
          lei obrigue a manter.
        </li>
        <li>
          <strong>Registros técnicos de acesso:</strong> pelo prazo definido
          pelo provedor de hospedagem, de poucos dias.
        </li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e armazenamento no navegador',
    content: (
      <>
        <p>O Tailhop usa só o necessário para o login funcionar:</p>
        <ul>
          <li>
            <strong>Cookie de sessão</strong> (<code>refreshToken</code>), só
            para quem entra na área da ONG. É protegido contra leitura por
            scripts e expira em 7 dias.
          </li>
          <li>
            <strong>Uma marcação no navegador</strong> (<code>tailhop.has-session</code>)
            que só diz se vale a pena tentar restaurar o login. Não contém
            dados pessoais.
          </li>
        </ul>
        <p>
          Como não há cookies de publicidade ou de análise, não exibimos aviso
          de cookies: os que existem são indispensáveis para o serviço.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Como protegemos os dados',
    content: (
      <ul>
        <li>Toda a comunicação com o site é cifrada (HTTPS).</li>
        <li>Senhas e códigos de acesso são guardados só em forma cifrada.</li>
        <li>
          Os documentos ficam em armazenamento privado, sem endereço público,
          e só são abertos pela equipe por links que expiram em 10 minutos.
        </li>
        <li>Tentativas de login e outros pedidos sensíveis têm limite por minuto.</li>
        <li>Só a equipe do Tailhop tem acesso ao painel de verificação.</li>
        <li>Falhas no site são registradas para correção, sempre sem dados pessoais.</li>
      </ul>
    ),
  },
  {
    id: 'seus-direitos',
    title: 'Seus direitos',
    content: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir, a qualquer momento:</p>
        <ul>
          <li>confirmação de que tratamos dados seus e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou exclusão de dados desnecessários;</li>
          <li>exclusão da conta e dos dados tratados com o seu consentimento;</li>
          <li>portabilidade dos dados;</li>
          <li>informação sobre com quem os dados são compartilhados;</li>
          <li>revisão de decisões tomadas sobre você.</li>
        </ul>
        <p>
          Escreva para {mail} a partir do e-mail da conta. Respondemos em até
          15 dias. Se não ficar satisfeito, você pode reclamar à Autoridade
          Nacional de Proteção de Dados (ANPD), em{' '}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer">
            gov.br/anpd
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'incidentes',
    title: 'Se algo der errado',
    content: (
      <p>
        Se acontecer um incidente de segurança que possa trazer risco ou dano
        relevante, avisaremos as pessoas afetadas e a ANPD, como manda a LGPD
        (art. 48), dizendo o que aconteceu, quais dados foram envolvidos e o
        que está sendo feito.
      </p>
    ),
  },
  {
    id: 'menores',
    title: 'Crianças e adolescentes',
    content: (
      <p>
        As contas de ONG devem ser criadas por maiores de 18 anos que
        representem a entidade. O Tailhop não coleta, de propósito, dados de
        crianças e adolescentes.
      </p>
    ),
  },
  {
    id: 'mudancas',
    title: 'Mudanças nesta política',
    content: (
      <p>
        Quando esta política mudar, a data no topo é atualizada. Se a mudança
        for relevante para quem já tem conta, avisamos por e-mail antes de ela
        valer.
      </p>
    ),
  },
]

export function Privacy() {
  return (
    <LegalPage
      title="Política de privacidade"
      updatedAt={TERMS_UPDATED_AT}
      intro={
        <p>
          O Tailhop existe para aproximar pets resgatados de quem quer adotar.
          Aqui explicamos, sem juridiquês além do necessário, quais dados
          guardamos, por quê, por quanto tempo e como você pode pedir que
          sejam corrigidos ou apagados.
        </p>
      }
      sections={SECTIONS}
      related={{ to: '/termos', label: 'Termos de uso' }}
    />
  )
}
