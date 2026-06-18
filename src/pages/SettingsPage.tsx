import { useMemo, useState } from "react";
import { Bell, Camera, Check, CreditCard, Download, KeyRound, Shield, Trash2, User } from "lucide-react";
import { Badge, Button, Card, Field, PageHeader, inputClass } from "../components/ui";
import { Modal, useFeedback } from "../components/feedback";
import { getProfilePhoto, saveProfilePhoto } from "../lib/profile";

export default function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [code, setCode] = useState("");
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(() => getProfilePhoto());
  const { notify } = useFeedback();

  function selectPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify("Selecione um arquivo de imagem.", "error");
    if (file.size > 2 * 1024 * 1024) return notify("A imagem deve ter no máximo 2 MB.", "error");
    const reader = new FileReader();
    reader.onload = () => {
      const photo = String(reader.result);
      setProfilePhotoState(photo);
      saveProfilePhoto(photo);
      notify("Foto de perfil atualizada.");
    };
    reader.readAsDataURL(file);
  }

  function activate2FA() {
    if (code.length !== 6) return notify("Informe o código de 6 dígitos.", "error");
    setTwoFactorEnabled(true);
    setSetupOpen(false);
    setCode("");
    notify("Autenticação em dois fatores ativada.");
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Perfil, segurança, preferências e licença" />
      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <section className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 font-semibold"><User className="h-5 w-5 text-primary" /> Perfil</h2>
            <div className="mt-5 flex flex-col gap-4 rounded-lg border bg-slate-50 p-4 sm:flex-row sm:items-center">
              {profilePhoto ? <img src={profilePhoto} alt="Prévia da foto de perfil" className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white ring-4 ring-white">JF</div>}
              <div className="flex-1"><p className="text-sm font-semibold text-slate-900">Foto de perfil</p><p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG ou WebP de até 2 MB. Será sincronizada com o banco posteriormente.</p><div className="mt-3 flex flex-wrap gap-2"><label className="focus-ring inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-blue-700"><Camera className="h-4 w-4" />Escolher foto<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => selectPhoto(event.target.files?.[0])} /></label>{profilePhoto && <Button className="h-9" variant="outline" icon={Trash2} onClick={() => { setProfilePhotoState(null); saveProfilePhoto(null); notify("Foto removida."); }}>Remover</Button>}</div></div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Nome completo"><input className={inputClass} defaultValue="João Ferreira" /></Field>
              <Field label="E-mail"><input className={inputClass} defaultValue="joao@exemplo.com.br" /></Field>
              <Field label="Tipo de perfil"><select className={inputClass} defaultValue="Pessoa Física"><option>Pessoa Física</option><option>MEI / Autônomo</option><option>Empresa (PME)</option></select></Field>
              <Field label="Moeda padrão"><input className={inputClass} defaultValue="BRL" /></Field>
            </div>
            <Button className="mt-4" onClick={() => notify("Dados do perfil salvos.")}>Salvar alterações</Button>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 font-semibold"><Bell className="h-5 w-5 text-primary" /> Alertas</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Contas a vencer", "Orçamento em 80%", "Saldo baixo previsto", "Recomendações da IA"].map((item) => (
                <label key={item} className="flex items-center justify-between rounded-lg border p-3 text-sm">{item}<input type="checkbox" defaultChecked className="h-4 w-4" /></label>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <h2 className="flex items-center gap-2 font-semibold"><Shield className="h-5 w-5 text-primary" /> Segurança</h2>
              <Badge variant={twoFactorEnabled ? "positive" : "neutral"}>{twoFactorEnabled ? "2FA ativado" : "2FA desativado"}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">Exija um código temporário ao acessar sua conta em um novo dispositivo.</p>
            {twoFactorEnabled ? <Button className="mt-4 w-full" variant="outline" onClick={() => { setTwoFactorEnabled(false); notify("2FA desativado."); }}>Desativar 2FA</Button> : <Button className="mt-4 w-full" icon={KeyRound} onClick={() => setSetupOpen(true)}>Ativar 2FA</Button>}
          </Card>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-5 w-5 text-primary" /> Licença</h2>
              <Badge variant="positive">Ativa</Badge>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Tipo" value="Licença única vitalícia" />
              <Detail label="Ativada em" value="18/06/2026" />
              <Detail label="Referência" value="FAI-2026-0618-0042" />
            </dl>
            <Button className="mt-5 w-full" variant="outline" icon={Download} onClick={() => setReceiptOpen(true)}>Ver comprovante</Button>
          </Card>
        </aside>
      </div>

      <Modal open={setupOpen} title="Ativar autenticação em dois fatores" subtitle="Escaneie o QR Code e confirme o código gerado." onClose={() => setSetupOpen(false)} footer={<><Button variant="outline" onClick={() => setSetupOpen(false)}>Cancelar</Button><Button onClick={activate2FA}>Ativar 2FA</Button></>}>
        <div className="flex flex-col items-center">
          <QrCodeMock />
          <p className="mt-4 text-center text-sm text-slate-500">Use Google Authenticator, Authy ou outro app compatível com TOTP.</p>
          <div className="mt-5 w-full"><Field label="Código de confirmação"><input className={inputClass} inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></Field></div>
        </div>
      </Modal>

      <Modal open={receiptOpen} title="Comprovante da licença" onClose={() => setReceiptOpen(false)} footer={<Button onClick={() => notify("Comprovante preparado para download.")} icon={Download}>Baixar comprovante</Button>}>
        <div className="rounded-lg border bg-slate-50 p-5 text-sm">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100"><Check className="h-5 w-5 text-emerald-700" /></span><div><strong>Pagamento confirmado</strong><p className="text-slate-500">Licença vitalícia</p></div></div>
          <dl className="mt-5 space-y-3"><Detail label="Titular" value="João Ferreira" /><Detail label="Valor" value="R$ 497,00" /><Detail label="Data" value="18/06/2026" /><Detail label="Pagamento" value="Cartão final 4242" /></dl>
        </div>
      </Modal>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-800">{value}</dd></div>; }

function QrCodeMock() {
  const cells = useMemo(() => Array.from({ length: 441 }, (_, index) => ((index * 17 + Math.floor(index / 21) * 11) % 7) < 3), []);
  return <div className="grid h-48 w-48 grid-cols-[repeat(21,1fr)] border-8 border-white bg-white shadow-md">{cells.map((active, index) => <span key={index} className={active ? "bg-slate-950" : "bg-white"} />)}</div>;
}
