import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade — Meu Mapa Financeiro",
  description: "Quais dados o Meu Mapa Financeiro coleta, para que usa e com quem compartilha.",
};

/*
 * Esta página descreve o que o site faz de verdade. Mudou a coleta (novo campo no quiz, novo
 * fornecedor, GA ligado, e-mail de marketing)? Atualize o texto e a data em PRIVACY.updatedAt.
 */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacidadePage() {
  const mail = (
    <a href={`mailto:${PRIVACY.contactEmail}`} className="font-medium text-brand-strong underline underline-offset-2">
      {PRIVACY.contactEmail}
    </a>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
      <header className="py-4">
        <Logo />
      </header>

      <main className="pt-6">
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.4rem]">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted">Atualizada em {PRIVACY.updatedAt}.</p>

        <p className="mt-6 text-lg leading-relaxed text-ink/85">
          Aqui explicamos, sem juridiquês, quais dados o Meu Mapa Financeiro coleta, para que usa e com quem
          compartilha. Em resumo: usamos seus dados para montar e liberar o seu Mapa e para medir os nossos
          anúncios. Não pedimos senha de banco, não acessamos sua conta bancária e não vendemos seus dados.
        </p>

        <Section title="Quem é responsável pelos seus dados">
          <p>
            O Meu Mapa Financeiro é mantido por <strong>{PRIVACY.controller}</strong>, responsável pelos dados
            tratados neste site. Para qualquer dúvida ou pedido sobre os seus dados, escreva para {mail}.
          </p>
        </Section>

        <Section title="Quais dados coletamos">
          <List
            items={[
              <>
                <strong>Respostas do diagnóstico:</strong> renda, moradia, contas essenciais, gastos do dia a dia,
                parcelas, dívidas, quanto você guarda, reserva e objetivo. São valores que você mesmo informa.
              </>,
              <>
                <strong>Nome e e-mail</strong>, pedidos no último passo do diagnóstico.
              </>,
              <>
                <strong>Dados da compra</strong>, enviados pela Kiwify quando você compra: número do pedido, situação
                do pagamento (aprovado ou reembolsado), e-mail e telefone. Os dados do cartão ficam só com a Kiwify;
                nós não recebemos.
              </>,
              <>
                <strong>Dados técnicos:</strong> endereço IP, navegador e os cookies do Meta (<code>_fbp</code> e{" "}
                <code>_fbc</code>), guardados junto com o diagnóstico para identificar de qual anúncio veio a compra.
              </>,
              <>
                <strong>No seu aparelho:</strong> o andamento do quiz e o endereço do seu último Mapa ficam salvos no
                próprio navegador, para você não perder o que preencheu.
              </>,
            ]}
          />
        </Section>

        <Section title="Para que usamos">
          <List
            items={[
              "Calcular o seu score, o pré-diagnóstico e o Mapa completo — é o serviço que você pediu.",
              "Liberar o Mapa completo depois que o pagamento é confirmado e ligar a compra ao seu diagnóstico.",
              "Medir os nossos anúncios no Facebook e no Instagram: saber quantas pessoas visitam o site, fazem o diagnóstico, vão para o pagamento e compram.",
              "Atender os seus pedidos e cumprir obrigações legais.",
            ]}
          />
          <p>
            Suas respostas financeiras são usadas só para calcular o seu Mapa. Elas não são enviadas para o Meta nem
            para nenhuma plataforma de anúncios.
          </p>
        </Section>

        <Section title="Com quem compartilhamos">
          <List
            items={[
              <>
                <strong>Kiwify</strong>, que processa o pagamento. Levamos seu nome e e-mail já preenchidos para o
                checkout dela.
              </>,
              <>
                <strong>Meta (Facebook e Instagram)</strong>, pelo Pixel no site e pela API de Conversões no nosso
                servidor. O Meta recebe os passos que você dá no site (visita, diagnóstico, ida ao pagamento e
                compra), o identificador do diagnóstico, os cookies do Meta, o IP e o navegador. E-mail, telefone e
                nome só vão criptografados (hash SHA-256), nunca em texto aberto.
              </>,
              <>
                <strong>Supabase</strong> (banco de dados) e <strong>Vercel</strong> (hospedagem do site), que guardam
                e processam os dados para o site funcionar.
              </>,
            ]}
          />
          <p>
            Alguns desses fornecedores guardam dados fora do Brasil, principalmente nos Estados Unidos. Escolhemos
            serviços que adotam medidas de segurança e de proteção de dados reconhecidas no mercado.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Usamos os cookies do Pixel do Meta para medir os anúncios. O site funciona sem eles: você pode bloqueá-los
            nas configurações do navegador ou ajustar suas preferências de anúncio no Facebook e no Instagram.
          </p>
        </Section>

        <Section title="Por quanto tempo guardamos">
          <p>
            Pelo tempo necessário para você continuar acessando o seu Mapa e para cumprir obrigações legais, como os
            registros de compra. Você pode pedir a exclusão a qualquer momento; apagamos tudo o que a lei não nos
            obrigar a manter.
          </p>
        </Section>

        <Section title="Segurança e o link do seu Mapa">
          <p>
            Os dados ficam num banco protegido, acessado só pelo nosso servidor, e o Mapa completo só é liberado
            depois do pagamento. O seu Mapa fica num endereço único e difícil de adivinhar. Quem tiver esse link
            consegue abri-lo, então compartilhe só com quem você quiser.
          </p>
        </Section>

        <Section title="Seus direitos">
          <p>Pela Lei Geral de Proteção de Dados (LGPD), você pode, a qualquer momento:</p>
          <List
            items={[
              "confirmar se tratamos dados seus e pedir uma cópia deles;",
              "corrigir dados incompletos ou errados;",
              "pedir a exclusão dos seus dados;",
              "saber com quem compartilhamos;",
              "se opor ao uso para medir anúncios.",
            ]}
          />
          <p>
            É só escrever para {mail} com o e-mail que você usou no diagnóstico. Respondemos em até 15 dias. Você
            também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </Section>

        <Section title="Mudanças nesta política">
          <p>
            Se mudarmos a forma de tratar seus dados, atualizamos esta página e a data no topo.
          </p>
        </Section>
      </main>
    </div>
  );
}
