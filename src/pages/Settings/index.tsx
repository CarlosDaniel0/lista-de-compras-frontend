import { useState } from 'react'
import Switch from '../../components/Input/switch'
import TabBar from '../../components/TabBar'
import Form, { FormContextProps } from '../../contexts/Form'
import { Container } from '../Lists'
import { Settings as SettingsTypes } from '../../util/types'
import { store } from '../../redux/store'
import Card from '../../components/Card'
import { useDispatch } from 'react-redux'
import { updateSettings } from '../../redux/slices/config'
import useEffectOnce from '../../hooks/useEffectOnce'
import { databaseSync, delay } from '../../util'

export default function Settings() {
  const { settings, user } = store.getState()
  const [form, setForm] = useState<SettingsTypes>(settings)
  const obj = { form, setForm } as FormContextProps
  const dispatch = useDispatch()

  useEffectOnce(() => {
    delay(() => databaseSync(form.localPersistence, user?.id), 250)
  }, [form?.localPersistence])
  useEffectOnce(() => dispatch(updateSettings(form)), [form])

  return (
    <Form {...obj}>
      <TabBar label="Configurações" />
      <Container>
        <Card style={{ padding: '0.6em 1.2em', borderRadius: '0.4em', margin: '5px 10px' }}>
          <p style={{ fontSize: '1.4em', textAlign: 'center', fontWeight: 500 }}>Geral</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <Switch field="groupProducts" label="Agrupar Produtos da Lista" />
            <Switch
              field="localPersistence"
              label="Persistência Local"
            />
          </div>
        </Card>
      </Container>
    </Form>
  )
}
