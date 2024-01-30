import {
  render,
  screen,
  fireEvent,
  waitFor,
  Screen,
} from '@testing-library/react'
import App from './App'
import { DutyRemoteService, InMemoryDutyService } from './services/duty'

describe('App', () => {
  beforeAll(() => {
    // Ref: https://github.com/ant-design/ant-design/issues/21096#issuecomment-732368647
    Object.defineProperty(window, 'matchMedia', {
      value: () => {
        return {
          matches: false,
          addListener: () => {},
          removeListener: () => {},
        }
      },
    })
  })

  let dutyRemoteService: DutyRemoteService

  beforeEach(() => {
    dutyRemoteService = new InMemoryDutyService()
  })

  it('should display created duties', async () => {
    await dutyRemoteService.createDuty('Sample Duty 1')
    await dutyRemoteService.createDuty('Sample Duty 2')

    render(<App dutyRemoteService={dutyRemoteService} />)
    expect(await screen.findByText('Sample Duty 1')).toBeVisible()
    screen.getByText('Sample Duty 2')
  })

  it('should create new duty', async () => {
    await dutyRemoteService.createDuty('Initial Duty')

    render(<App dutyRemoteService={dutyRemoteService} />)
    // If not wait for this and add new duty directly, the test can't cover the behavior of displaying new duty
    // because the useEffect hook may be triggered after the add button is clicked.
    await screen.findByText('Initial Duty')

    addDutyViaUI(screen, { name: 'New Duty' })

    // Input should be cleared
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add new duty')).toHaveValue('')
    })

    // New Duty should be displayed
    expect(await screen.findByText('New Duty')).toBeVisible()

    // New Duty should be saved
    const savedDuties = await dutyRemoteService.listDuties()
    expect(savedDuties).toHaveLength(2)
    expect(savedDuties[1].name).toEqual('New Duty')
  })

  it('should handle error when remote service rejected to create duty', async () => {
    dutyRemoteService.createDuty = () => {
      return Promise.reject(new Error('Create duty failed'))
    }

    render(<App dutyRemoteService={dutyRemoteService} />)

    addDutyViaUI(screen)

    expect(await screen.findByText('Create duty failed')).toBeVisible()

    const savedDuties = await dutyRemoteService.listDuties()
    expect(savedDuties).toHaveLength(0)
  })

  it('should able to edit duty', async () => {
    await dutyRemoteService.createDuty('Initial Duty')

    render(<App dutyRemoteService={dutyRemoteService} />)

    const editButton = await screen.findByTestId('edit-button-0')
    fireEvent.click(editButton)

    const input = screen.getByDisplayValue('Initial Duty')
    fireEvent.change(input, { target: { value: 'Updated Duty' } })

    const saveButton = screen.getByTestId('save-button-0')
    fireEvent.click(saveButton)

    await screen.findByTestId('edit-button-0')
    expect(screen.getByText('Updated Duty')).toBeVisible()

    const savedDuties = await dutyRemoteService.listDuties()
    expect(savedDuties).toHaveLength(1)
    expect(savedDuties[0].name).toEqual('Updated Duty')
  })

  it('should handle error when remote service rejected to update duty', async () => {
    dutyRemoteService.updateDuty = () => {
      return Promise.reject(new Error('Update duty failed'))
    }

    render(<App dutyRemoteService={dutyRemoteService} />)
    addDutyViaUI(screen)

    const editButton = await screen.findByTestId('edit-button-0')
    fireEvent.click(editButton)

    const saveButton = screen.getByTestId('save-button-0')
    fireEvent.click(saveButton)

    expect(await screen.findByText('Update duty failed')).toBeVisible()
  })

  it('should able to complete duty', async () => {
    await dutyRemoteService.createDuty('Initial Duty')

    render(<App dutyRemoteService={dutyRemoteService} />)

    const completeButton = await screen.findByTestId('complete-button-0')
    fireEvent.click(completeButton)

    await waitFor(() => expect(screen.queryByText('Initial Duty')).toBeNull())

    const savedDuties = await dutyRemoteService.listDuties()
    expect(savedDuties).toHaveLength(0)
  })

  it('should handle error when remote service rejected to complete duty', async () => {
    dutyRemoteService.completeDuty = () => {
      return Promise.reject(new Error('Complete duty failed'))
    }

    render(<App dutyRemoteService={dutyRemoteService} />)
    addDutyViaUI(screen)

    const completeButton = await screen.findByTestId('complete-button-0')
    fireEvent.click(completeButton)

    expect(await screen.findByText('Complete duty failed')).toBeVisible()
  })

  function addDutyViaUI(
    screen: Screen,
    { name = 'Duty 1' }: { name?: string } = {},
  ) {
    const input = screen.getByPlaceholderText('Add new duty')
    fireEvent.change(input, { target: { value: name } })

    const addButton = screen.getByText('Add')
    fireEvent.click(addButton)
  }
})
