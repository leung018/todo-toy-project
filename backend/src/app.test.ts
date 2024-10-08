import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { ExpressAppFactory } from './app'
import { Express } from 'express'
import { assertErrorResponse } from './test_utils/assert'

interface Duty {
  id: string
  name: string
}

describe('API', () => {
  let app: Express

  beforeEach(() => {
    app = ExpressAppFactory.createNullApp()
  })

  it('should return back duty tend to create', async () => {
    const duty = await createDuty({ name: 'My Duty' })
    expect(duty.name).toBe('My Duty')
    expect(typeof duty.id).toBe('string')
  })

  it('should return bad request if invalid duty name', async () => {
    const response = await callCreateDutyApi({ name: '' })
    assertErrorResponse(
      {
        status: 400,
        message: 'Name of duty cannot be empty',
      },
      response,
    )
  })

  it('should return bad request if input is not the format stated in openapi', async () => {
    const response = await request(app).post('/duties').send({})
    assertErrorResponse(
      {
        status: 400,
        message: "request/body must have required property 'name'", // This is the error message from express-openapi-validator
      },
      response,
    )
  })

  it('should create single duty and list it', async () => {
    const createdDuty = await createDuty({ name: 'My Duty' })

    const listedDuties = await listDuties()
    expect(listedDuties.length).toBe(1)
    expect(listedDuties[0]).toEqual(createdDuty)
  })

  it('should create multiple duties and list them', async () => {
    await createDuty({ name: 'Duty 1' })
    await createDuty({ name: 'Duty 2' })
    await createDuty({ name: 'Duty 3' })

    const duties = await listDuties()
    expect(duties.length).toBe(3)
    expect(duties[0].name).toBe('Duty 1')
    expect(duties[1].name).toBe('Duty 2')
    expect(duties[2].name).toBe('Duty 3')
  })

  it('should delete all duties', async () => {
    await createDuty()
    await createDuty()

    await deleteAllDuties()

    const duties = await listDuties()
    expect(duties.length).toBe(0)
  })

  it('should return 404 if duty not found for update api', async () => {
    const response = await callUpdateDutyApi({
      id: 'non-existing-id',
    })
    assertErrorResponse(
      {
        status: 404,
        message: 'Duty not found',
      },
      response,
    )
  })

  it('should update duty', async () => {
    const createdDuty = await createDuty({ name: 'Original Name' })

    await updateDuty({
      id: createdDuty.id,
      name: 'Updated Name',
    })

    const duties = await listDuties()
    expect(duties[0].id).toBe(createdDuty.id)
    expect(duties[0].name).toBe('Updated Name')
  })

  it('should return 400 if invalid duty name for update api', async () => {
    const createdDuty = await createDuty()

    const response = await callUpdateDutyApi({
      id: createdDuty.id,
      name: '',
    })

    assertErrorResponse(
      { status: 400, message: 'Name of duty cannot be empty' },
      response,
    )
  })

  it('should delete duty', async () => {
    const createdDuty = await createDuty()

    await deleteDuty(createdDuty.id)

    const duties = await listDuties()
    expect(duties.length).toBe(0)
  })

  it('should return 404 if duty not found for delete api', async () => {
    const response = await callDeleteDutyApi('non-existing-id')
    assertErrorResponse({ status: 404, message: 'Duty not found' }, response)
  })

  async function createDuty({ name = 'Name of Duty' } = {}): Promise<Duty> {
    const response = await callCreateDutyApi({ name })
    expect(response.status).toBe(201)
    return response.body
  }

  async function callCreateDutyApi({ name }: { name: string }) {
    return request(app).post('/duties').send({ name })
  }

  async function updateDuty({ id, name }: Duty): Promise<void> {
    const response = await callUpdateDutyApi({ id, name })
    expect(response.status).toBe(204)
  }

  async function callUpdateDutyApi({
    id,
    name = 'Updated Name',
  }: {
    id: string
    name?: string
  }) {
    return request(app).put(`/duties/${id}`).send({ name })
  }

  async function listDuties(): Promise<Duty[]> {
    const response = await callListDutiesApi()
    expect(response.status).toBe(200)
    return response.body
  }

  async function callListDutiesApi() {
    return request(app).get('/duties')
  }

  async function deleteDuty(id: string) {
    const response = await callDeleteDutyApi(id)
    expect(response.status).toBe(204)
  }

  async function callDeleteDutyApi(id: string) {
    return request(app).delete(`/duties/${id}`)
  }

  async function deleteAllDuties() {
    const response = await callDeleteAllDutiesApi()
    expect(response.status).toBe(204)
  }

  async function callDeleteAllDutiesApi() {
    return request(app).delete('/duties')
  }
})
