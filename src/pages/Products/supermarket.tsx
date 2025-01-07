import { useParams } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import useEffectOnce from '../../hooks/useEffectOnce'
import { useState } from 'react'
import { request } from '../../util'
import { List as ListType } from '../../util/types'
import styled from 'styled-components'

const Container = styled.div`
  height: calc(100dvh - 46px);
  overflow: auto;
`

export default function List() {
  const { id } = useParams()
  const [list, setList] = useState<ListType>({ date: '', id: '', name: '', user_id: ''})
  const loadList = async (id: string) => {
    // setProducts(loadingProducts)
    request<{
      status: boolean
      message: string
      data: { list: ListType }
    }>(`/list/${id}`).then((res) => setList(res.data.list))
  }

  useEffectOnce(() => loadList(id!), [])
  return (
    <>
      <TabBar label={list.name || "Carregando..."} back />
      <Container>

        
      </Container>
    </>
  )
}
