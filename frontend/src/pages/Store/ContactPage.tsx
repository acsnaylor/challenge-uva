import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { RequiredMark } from '../../components/ui/RequiredMark'
import { useToast } from '../../components/ui/toast'
import { shop, errorMessage, type ContactMessageInput } from '../../services/shop'

export function ContactPage() {
  const { show } = useToast()
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactMessageInput>({
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })
  const submit = handleSubmit(async data => {
    if (sending.current) return
    sending.current = true; setBusy(true)
    try {
      const receipt = await shop.contact({
        name: data.name.trim(), email: data.email.trim(), subject: data.subject.trim(), message: data.message.trim(),
      })
      show(`${receipt.confirmation} Protocolo #${receipt.id}.`, { variant: 'success' })
      reset()
    } catch (error) { show(errorMessage(error), { variant: 'error' }) }
    finally { sending.current = false; setBusy(false) }
  }, () => show('Confira os campos obrigatórios e informe um e-mail válido.', { variant: 'error' }))

  return <section className="page">
    <span className="eyebrow">UMA CONVERSA COM CARINHO</span>
    <h1>Fale Conosco</h1>
    <div className="contact-layout">
      <aside className="contact-intro">
        <Mail size={36} aria-hidden="true" />
        <h2>Quer falar com o nosso ateliê?</h2>
        <p>Envie sua dúvida, sugestão ou comentário. Sua mensagem ajuda a tornar a experiência na Doce Ateliê ainda melhor.</p>
        <p className="muted">Nesta versão acadêmica, a mensagem é registrada no sistema. Não há envio automático de e-mail.</p>
      </aside>
      <form className="panel" onSubmit={submit}>
        <p className="muted">Os campos com asterisco (*) são obrigatórios.</p>
        <label>Nome<RequiredMark />
          <Input {...register('name', { required: true, validate: value => value.trim().length >= 2, maxLength: 100 })}
            required minLength={2} maxLength={100} autoComplete="name" aria-invalid={!!errors.name} />
        </label>
        <label>E-mail<RequiredMark />
          <Input {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength: 254 })}
            type="email" required maxLength={254} autoComplete="email" aria-invalid={!!errors.email} />
        </label>
        <label>Assunto<RequiredMark />
          <Input {...register('subject', { required: true, validate: value => !!value.trim(), maxLength: 150 })}
            required maxLength={150} aria-invalid={!!errors.subject} />
        </label>
        <label>Mensagem<RequiredMark />
          <textarea {...register('message', { required: true, validate: value => !!value.trim(), maxLength: 3000 })}
            required maxLength={3000} rows={6} aria-invalid={!!errors.message} aria-describedby="message-help" />
        </label>
        <p id="message-help" className="muted">Até 3000 caracteres. Não inclua senhas ou dados de cartão.</p>
        <Button type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar mensagem'}</Button>
      </form>
    </div>
  </section>
}
