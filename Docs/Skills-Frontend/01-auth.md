# Prompt 01 — Autenticação

> Pré-requisito: Prompt 00 (project setup) já aplicado.

---

## PROMPT PARA O LOVABLE

```
Implemente as telas de autenticação do FinanceAI.
Todas as telas usam layout centralizado SEM sidebar (fundo slate-50).

## Tela de Login (/login)

Layout em dois painéis lado a lado (desktop):
  - Esquerda (bg-blue-600, 45% da tela):
    · Logo "💰 FinanceAI" em branco (topo)
    · Headline: "Suas finanças, inteligentes."
    · Subtítulo: "Gerencie receitas, despesas e metas com o poder da IA."
    · 3 bullet points com ícone check em branco:
      · Categorização automática por IA
      · Previsão de fluxo de caixa
      · Alertas e recomendações personalizadas

  - Direita (bg-white, 55% da tela, centralizado):
    · "Bem-vindo de volta" (H1)
    · "Entre na sua conta para continuar" (subtítulo slate-500)
    · Formulário com:
      - Input "E-mail" (type email, ícone Mail)
      - Input "Senha" (type password, ícone Eye para mostrar/ocultar)
      - Checkbox "Lembrar de mim" + link "Esqueci minha senha" à direita
      - Botão primário "Entrar" (full width, blue-600)
      - Divisor "ou continue com"
      - Botão social Google (branco, borda, ícone SVG do Google)
      - Botão social GitHub (branco, borda, ícone Github do lucide)
    · Link "Não tem conta? Criar conta grátis" (blue-600)

Ao clicar em "Entrar", redirecionar para /dashboard.

## Tela de Cadastro (/register)

Layout de painel único centralizado (max-w-md), card branco com sombra.

Conteúdo:
  · Logo "💰 FinanceAI" centralizado (topo)
  · "Criar sua conta" (H1 centralizado)
  · "14 dias grátis, sem cartão de crédito" (badge azul centralizado)
  · Formulário:
    - Input "Nome completo" (ícone User)
    - Input "E-mail" (ícone Mail)
    - Input "Senha" (ícone Lock, com indicador de força: fraca/média/forte)
    - Input "Confirmar senha" (ícone Lock)
    - Select "Perfil de uso":
        · 👤 Pessoa Física
        · 💼 MEI / Autônomo
        · 🏢 Empresa (PME)
    - Checkbox "Concordo com os Termos de Uso e Política de Privacidade"
    - Botão "Criar conta" (full width, blue-600)
  · Divisor "ou"
  · Botões sociais Google e GitHub (lado a lado)
  · Link "Já tenho conta. Entrar" abaixo

## Tela de Recuperação de Senha (/forgot-password)

Card centralizado simples (max-w-sm):
  · Ícone Lock grande em azul (centralizado)
  · "Recuperar senha" (H1)
  · "Enviaremos um link de redefinição para seu e-mail."
  · Input "E-mail cadastrado"
  · Botão "Enviar link de recuperação" (blue-600, full width)
  · Link "← Voltar ao login"

  Estado de sucesso (após envio):
  · Ícone Mail em verde centralizado
  · "E-mail enviado!"
  · "Verifique sua caixa de entrada e clique no link que enviamos para
    joao@exemplo.com.br. O link expira em 1 hora."
  · Botão "Reenviar e-mail" (secundário)
  · Link "← Voltar ao login"

## Tela de 2FA (/two-factor)

Card centralizado (max-w-sm):
  · Ícone Shield em azul
  · "Verificação em dois fatores" (H1)
  · "Digite o código de 6 dígitos do seu aplicativo autenticador."
  · 6 inputs individuais para cada dígito (tab automático entre eles)
  · Botão "Verificar" (blue-600, full width)
  · Link "Usar código de backup"
  · Link "← Voltar"

## Notas de design

- Todas as telas são responsivas (mobile-first)
- Inputs com estado de erro: borda red-500 + mensagem de erro abaixo em red-600
- Inputs com estado de sucesso: borda emerald-500 + ícone check
- Loading nos botões: spinner animado + texto "Aguarde..."
- Toast de erro para credenciais inválidas (canto superior direito)
```
