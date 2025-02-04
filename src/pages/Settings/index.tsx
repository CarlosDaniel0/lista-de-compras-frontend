import { useEffect, useState } from 'react'
import Switch from '../../components/Input/switch'
import TabBar from '../../components/TabBar'
import Form, { FormContextProps } from '../../contexts/Form'
import { Container } from '../Lists'
import { Settings as SettingsTypes } from '../../util/types'
import { store } from '../../redux/store'
import Card from '../../components/Card'
import { useDispatch } from 'react-redux'
import { updateSettings } from '../../redux/slices/config'

export default function Settings() {
  const { settings } = store.getState()
  const [form, setForm] = useState<SettingsTypes>(settings)
  const dispatch = useDispatch()
  const obj = { form, setForm } as FormContextProps

  useEffect(() => {
    dispatch(updateSettings(form))
  }, [form])

  return (
    <Form {...obj}>
      <TabBar label="Configurações" />
      <Container>
        <Card style={{ padding: '0.6em 1.2em'}}>
          <Switch 
            field='groupProducts' 
            label="Agrupar Produtos da Lista" />
        </Card>
      </Container>
    </Form>
  )
}
