import type { ZormDatabase } from '@zorm-ts/core'
import type { App } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, triggerRef } from 'vue'
import { setupZormDevtools } from '../src/devtools'

// Mock @vue/devtools-api with hoisted variables
const { mockApi, setupDevtoolsPluginMock } = vi.hoisted(() => {
  const mockApi = {
    addInspector: vi.fn(),
    addTimelineLayer: vi.fn(),
    on: {
      getInspectorTree: vi.fn(),
      getInspectorState: vi.fn(),
      editInspectorState: vi.fn(),
    },
    addTimelineEvent: vi.fn(),
    sendInspectorState: vi.fn(),
    sendInspectorTree: vi.fn(),
  }

  const setupDevtoolsPluginMock = vi.fn((options, callback) => {
    callback(mockApi)
  })

  return { mockApi, setupDevtoolsPluginMock }
})

vi.mock('@vue/devtools-api', () => ({
  setupDevtoolsPlugin: setupDevtoolsPluginMock,
}))

const { getDbMock } = vi.hoisted(() => {
  const getDbMock = vi.fn()
  return { getDbMock }
})

vi.mock('@zorm-ts/core', async () => {
  const actual = await vi.importActual('@zorm-ts/core')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

describe('setupZormDevtools', () => {
  let mockApp: App
  let mockDatabase: any
  let getInspectorTreeCallback: (payload: any) => void
  let getInspectorStateCallback: (payload: any) => void
  let editInspectorStateCallback: (payload: any) => void

  beforeEach(() => {
    vi.clearAllMocks()

    mockApp = {} as App

    mockDatabase = {
      getData: vi.fn(() => ({
        users: {
          1: { id: '1', name: 'John', email: 'john@example.com' },
          2: { id: '2', name: 'Jane', email: 'jane@example.com' },
        },
        posts: {
          10: { id: '10', title: 'First Post', content: 'Hello World' },
        },
        comments: {},
      })),
      getEntity: vi.fn((entityName: string, id: string) => {
        const data = mockDatabase.getData()
        return data[entityName]?.[id]
      }),
      setEntityKey: vi.fn(),
    }

    getDbMock.mockReturnValue(mockDatabase)

    // Capture the callbacks
    mockApi.on.getInspectorTree.mockImplementation((callback) => {
      getInspectorTreeCallback = callback
    })
    mockApi.on.getInspectorState.mockImplementation((callback) => {
      getInspectorStateCallback = callback
    })
    mockApi.on.editInspectorState.mockImplementation((callback) => {
      editInspectorStateCallback = callback
    })
  })

  it('should setup devtools plugin with correct config', () => {
    setupZormDevtools(mockApp)

    expect(setupDevtoolsPluginMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'zorm-devtools-plugin',
        label: 'Zorm',
        packageName: 'zorm',
        homepage: 'https://github.com/joris-gallot/zorm',
        logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
        componentStateTypes: [],
        app: mockApp,
      }),
      expect.any(Function),
    )
  })

  it('should add inspector with correct config', () => {
    setupZormDevtools(mockApp)

    expect(mockApi.addInspector).toHaveBeenCalledWith({
      id: 'zorm-database',
      label: 'Zorm',
      icon: 'storage',
    })
  })

  it('should add timeline layer with correct config', () => {
    setupZormDevtools(mockApp)

    expect(mockApi.addTimelineLayer).toHaveBeenCalledWith({
      id: 'zorm-operations',
      color: 0x42B883,
      label: 'Zorm Operations',
    })
  })

  describe('getInspectorTree', () => {
    it('should return root nodes for correct inspector', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        rootNodes: [] as any[],
      }

      getInspectorTreeCallback(payload)

      expect(payload.rootNodes).toHaveLength(3)
      expect(payload.rootNodes[0]).toMatchObject({
        id: 'users',
        label: 'users',
        tags: [
          {
            label: '2 records',
            textColor: 0xFFFFFF,
            backgroundColor: 0x42B883,
          },
        ],
      })
      expect(payload.rootNodes[0].children).toHaveLength(2)
      expect(payload.rootNodes[0].children[0]).toEqual({
        id: 'users#1',
        label: 'users#1',
      })
    })

    it('should show gray tag for empty entities', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        rootNodes: [] as any[],
      }

      getInspectorTreeCallback(payload)

      const commentsNode = payload.rootNodes.find(node => node.id === 'comments')
      expect(commentsNode?.tags[0]).toMatchObject({
        label: '0 records',
        backgroundColor: 0x999999,
      })
    })

    it('should not modify payload for different inspector', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'other-inspector',
        rootNodes: [] as any[],
      }

      getInspectorTreeCallback(payload)

      expect(payload.rootNodes).toEqual([])
    })
  })

  describe('getInspectorState', () => {
    it('should return state for specific record', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#1',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(mockDatabase.getEntity).toHaveBeenCalledWith('users', '1')
      expect(payload.state).toHaveProperty('users#1')
      expect(payload.state['users#1']).toEqual([
        { key: 'id', value: '1', editable: false },
        { key: 'name', value: 'John', editable: true },
        { key: 'email', value: 'john@example.com', editable: true },
      ])
    })

    it('should return early if entity not found for record', () => {
      mockDatabase.getEntity.mockReturnValue(null)
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users-999',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toEqual({})
    })

    it('should return state for entity node', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'posts',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toHaveProperty('Entity Info')
      expect(payload.state['Entity Info']).toEqual([
        { key: 'name', value: 'posts', editable: false },
        { key: 'count', value: 1, editable: false },
      ])
      expect(payload.state).toHaveProperty('Records')
      expect(payload.state.Records).toEqual([
        {
          key: 'posts#10',
          value: { id: '10', title: 'First Post', content: 'Hello World' },
          editable: true,
        },
      ])
    })

    it('should return early if entity data not found', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'nonexistent',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toEqual({})
    })

    it('should not modify payload for different inspector', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'other-inspector',
        nodeId: 'users#1',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toEqual({})
    })
  })

  describe('editInspectorState', () => {
    it('should update field for specific record node', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#1',
        path: ['name'],
        state: { value: 'John Doe' },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('users', '1', 'name', 'John Doe')
      expect(mockApi.addTimelineEvent).toHaveBeenCalledWith({
        layerId: 'zorm-operations',
        event: {
          time: expect.any(Number),
          data: {
            entity: 'users',
            recordId: '1',
            field: 'name',
            newValue: 'John Doe',
          },
          title: 'Field Updated',
          subtitle: 'users#1.name',
        },
      })
      expect(mockApi.sendInspectorState).toHaveBeenCalledWith('zorm-database')
    })

    it('should update entire entity record from entity node', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'posts',
        path: ['posts#10'],
        state: { value: { id: '10', title: 'Updated Title', content: 'Updated Content' } },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('posts', '10', 'id', '10')
      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('posts', '10', 'title', 'Updated Title')
      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('posts', '10', 'content', 'Updated Content')
      expect(mockApi.addTimelineEvent).toHaveBeenCalledTimes(3)
    })

    it('should update single field from entity node', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'posts',
        path: ['posts#10', 'title'],
        state: { value: 'New Title' },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('posts', '10', 'title', 'New Title')
      expect(mockApi.addTimelineEvent).toHaveBeenCalledWith({
        layerId: 'zorm-operations',
        event: {
          time: expect.any(Number),
          data: {
            entity: 'posts',
            recordId: '10',
            field: 'title',
            newValue: 'New Title',
          },
          title: 'Field Updated',
          subtitle: 'posts#10.title',
        },
      })
    })

    it('should return early for different inspector', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'other-inspector',
        nodeId: 'users#1',
        path: ['name'],
        state: { value: 'John Doe' },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).not.toHaveBeenCalled()
    })

    it('should return early for empty path', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#1',
        path: [],
        state: { value: 'test' },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).not.toHaveBeenCalled()
    })
  })

  describe('reactive database watch', () => {
    it('should setup watch for Vue reactive database with __v_isRef', async () => {
      // Create a ref to hold the data
      const dataRef = ref({
        users: {
          1: { id: '1', name: 'John' },
        },
      })

      // Add __v_isRef to the value object to simulate the condition
      Object.defineProperty(dataRef.value, '__v_isRef', {
        value: true,
        enumerable: false,
        writable: false,
      })

      const reactiveDatabase = {
        getData: vi.fn(() => dataRef.value),
        getEntity: vi.fn((entityName: string, id: string) => {
          // @ts-expect-error index signature
          return dataRef.value[entityName]?.[id]
        }),
        setEntityKey: vi.fn(),
      } as unknown as ZormDatabase

      // Override getDb to return our reactive database
      getDbMock.mockReturnValue(reactiveDatabase)

      setupZormDevtools(mockApp)

      // Track initial calls
      const initialTreeCalls = mockApi.sendInspectorTree.mock.calls.length
      const initialStateCalls = mockApi.sendInspectorState.mock.calls.length

      // Modify the data deeply
      dataRef.value.users[1].name = 'John Updated'

      // Trigger the ref to notify watchers
      triggerRef(dataRef)

      // Wait for Vue's reactivity system and watch to trigger
      await new Promise(resolve => setTimeout(resolve, 150))

      // Verify the watch callback was triggered
      expect(mockApi.sendInspectorTree.mock.calls.length).toBeGreaterThan(initialTreeCalls)
      expect(mockApi.sendInspectorState.mock.calls.length).toBeGreaterThan(initialStateCalls)
    })

    it('should not setup watch for non-reactive database', () => {
      // This should not setup watch and not throw
      expect(() => {
        setupZormDevtools(mockApp)
      }).not.toThrow()
    })

    it('should handle database with getData returning null', () => {
      const nullDatabase = {
        getData: vi.fn(() => null),
        getEntity: vi.fn(),
        setEntityKey: vi.fn(),
      } as unknown as ZormDatabase

      getDbMock.mockReturnValue(nullDatabase)

      expect(() => {
        setupZormDevtools(mockApp)
      }).not.toThrow()
    })

    it('should handle database with getData returning non-object', () => {
      const primitiveDatabase = {
        getData: vi.fn(() => 'string'),
        getEntity: vi.fn(),
        setEntityKey: vi.fn(),
      }

      getDbMock.mockReturnValue(primitiveDatabase as any)

      expect(() => {
        setupZormDevtools(mockApp)
      }).not.toThrow()
    })

    it('should handle database with getData returning object without __v_isRef', () => {
      const plainObjectDatabase = {
        getData: vi.fn(() => ({ users: {} })),
        getEntity: vi.fn(),
        setEntityKey: vi.fn(),
      } as unknown as ZormDatabase

      getDbMock.mockReturnValue(plainObjectDatabase)

      expect(() => {
        setupZormDevtools(mockApp)
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should return early if entityName is empty in getInspectorState', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: '#1',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toEqual({})
    })

    it('should return early if recordId is empty in getInspectorState', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#',
        state: {} as any,
      }

      getInspectorStateCallback(payload)

      expect(payload.state).toEqual({})
    })

    it('should throw error if key is empty in editInspectorState for record node', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#1',
        path: [''],
        state: { value: 'test' },
      }

      expect(() => editInspectorStateCallback(payload)).toThrow('Invalid path for editing inspector state')
    })

    it('should handle empty database', () => {
      const emptyDatabase = {
        getData: vi.fn(() => ({})),
        getEntity: vi.fn(),
        setEntityKey: vi.fn(),
      } as unknown as ZormDatabase

      getDbMock.mockReturnValue(emptyDatabase)

      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        rootNodes: [] as any[],
      }

      getInspectorTreeCallback(payload)

      expect(payload.rootNodes).toEqual([])
    })

    it('should handle entities with null values', () => {
      const nullEntityDatabase = {
        getData: vi.fn(() => ({
          users: null,
        })),
        getEntity: vi.fn(),
        setEntityKey: vi.fn(),
      } as unknown as ZormDatabase

      getDbMock.mockReturnValue(nullEntityDatabase)

      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        rootNodes: [] as any[],
      }

      getInspectorTreeCallback(payload)

      expect(payload.rootNodes[0]).toMatchObject({
        id: 'users',
        label: 'users',
        tags: [{ label: '0 records' }],
        children: [],
      })
    })

    it('should handle deep path for record field update', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users#1',
        path: ['deeply', 'nested', 'email'],
        state: { value: 'newemail@example.com' },
      }

      editInspectorStateCallback(payload)

      expect(mockDatabase.setEntityKey).toHaveBeenCalledWith('users', '1', 'email', 'newemail@example.com')
    })

    it('should throw error for invalid record node path', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'users-',
        path: ['name'],
        state: { value: 'test' },
      }

      expect(() => editInspectorStateCallback(payload)).toThrow('Invalid path for editing inspector state')
    })

    it('should throw error for invalid entity node path without recordId', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'posts',
        path: ['posts'],
        state: { value: 'test' },
      }

      expect(() => editInspectorStateCallback(payload)).toThrow('Invalid path for editing inspector state')
    })

    it('should throw error for invalid entity node path with empty key', () => {
      setupZormDevtools(mockApp)

      const payload = {
        inspectorId: 'zorm-database',
        nodeId: 'posts',
        path: ['posts#10', ''],
        state: { value: 'test' },
      }

      expect(() => editInspectorStateCallback(payload)).toThrow('Invalid path for editing inspector state')
    })
  })
})
