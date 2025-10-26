import type { ObjectWithId, ZormDatabase } from '@zorm-ts/core'
import type { App } from 'vue'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { watch } from 'vue'

export function setupZormDevtools(app: App, database: ZormDatabase): void {
  const inspectorId = 'zorm-database'
  const timelineLayerId = 'zorm-operations'

  setupDevtoolsPlugin({
    id: 'zorm-devtools-plugin',
    label: 'Zorm',
    packageName: 'zorm',
    homepage: 'https://github.com/joris-gallot/zorm',
    logo: 'https://vuejs.org/images/icons/favicon-96x96.png',
    componentStateTypes: [],
    app,
  }, (api) => {
    // Add the database inspector
    api.addInspector({
      id: inspectorId,
      label: 'Zorm',
      icon: 'storage',
    })

    // Add timeline layer for tracking operations
    api.addTimelineLayer({
      id: timelineLayerId,
      color: 0x42B883,
      label: 'Zorm Operations',
    })

    // Get inspector tree - list all entities
    api.on.getInspectorTree((payload) => {
      if (payload.inspectorId !== inspectorId) {
        return
      }

      const dbData = database.getData()
      const entities = Object.keys(dbData)

      payload.rootNodes = entities.map((entityName) => {
        const entityData = dbData[entityName]
        const count = Object.keys(entityData || {}).length

        return {
          id: entityName,
          label: entityName,
          tags: [
            {
              label: `${count} records`,
              textColor: 0xFFFFFF,
              backgroundColor: count > 0 ? 0x42B883 : 0x999999,
            },
          ],
          children: Object.values(entityData || {}).map((record: ObjectWithId) => ({
            id: `${entityName}-${record.id}`,
            label: `${entityName}#${record.id}`,
          })),
        }
      })
    })

    // Get inspector state - show entity or record details
    api.on.getInspectorState((payload) => {
      if (payload.inspectorId !== inspectorId) {
        return
      }

      const dbData = database.getData()

      // Check if it's a specific record (format: entityName-id)
      if (payload.nodeId.includes('-')) {
        const [entityName, recordId] = payload.nodeId.split('-')
        const entity = database.getEntity(entityName!, recordId!)

        if (!entity) {
          return
        }

        payload.state = {
          [`${entityName}#${recordId}`]: Object.entries(entity).map(([key, value]) => ({
            key,
            value,
            editable: key !== 'id',
          })),
        }
      }
      // It's an entity node
      else {
        const entityName = payload.nodeId
        const entityData = dbData[entityName]

        if (!entityData) {
          return
        }

        const records = Object.values(entityData)
        const recordCount = records.length

        payload.state = {
          'Entity Info': [
            {
              key: 'name',
              value: entityName,
              editable: false,
            },
            {
              key: 'count',
              value: recordCount,
              editable: false,
            },
          ],
          'Records': records.map((record: ObjectWithId) => ({
            key: `${entityName}#${record.id}`,
            value: record,
            editable: true,
          })),
        }
      }
    })

    const addFieldUpdateEvent = (entityName: string, recordId: string, key: string, newValue: unknown): void => {
      api.addTimelineEvent({
        layerId: timelineLayerId,
        event: {
          time: Date.now(),
          data: {
            entity: entityName,
            recordId,
            field: key,
            newValue,
          },
          title: 'Field Updated',
          subtitle: `${entityName}#${recordId}.${key}`,
        },
      })
    }

    const updateEntityField = (entityName: string, recordId: string, key: string, value: unknown): void => {
      database.setEntityKey(entityName, recordId, key, value)
      addFieldUpdateEvent(entityName, recordId, key, value)
    }

    // Edit inspector state
    api.on.editInspectorState((payload) => {
      if (payload.inspectorId !== inspectorId) {
        return
      }

      const { path, state } = payload

      if (path.length === 0) {
        return
      }

      // Check if it's a specific record (format: entityName-id)
      if (payload.nodeId.includes('-')) {
        const [entityName, recordId] = payload.nodeId.split('-')
        const key = path[path.length - 1]

        if (!entityName || !recordId || !key) {
          throw new Error('Invalid path for editing inspector state', { cause: { path } })
        }

        updateEntityField(entityName, recordId, key, state.value)
      }
      // It's an entity node
      else {
        const [entityName, recordId] = path[0]!.split('#')

        if (!recordId || !entityName) {
          throw new Error('Invalid path for editing inspector state', { cause: { path } })
        }

        // Edit entire entity record
        if (path.length === 1) {
          Object.entries(state.value).forEach(([key, value]) => {
            updateEntityField(entityName, recordId, key, value)
          })
        }
        // Edit single field
        else {
          const key = path[1]

          if (!key) {
            throw new Error('Invalid path for editing inspector state', { cause: { path } })
          }

          updateEntityField(entityName, recordId, key, state.value)
        }
      }

      // Refresh inspector
      api.sendInspectorState(inspectorId)
    })

    // Watch for database changes and notify inspector
    if (typeof database.getData === 'function') {
      const dbRef = database.getData()

      // For Vue reactive database
      if (dbRef && typeof dbRef === 'object' && '__v_isRef' in dbRef) {
        watch(() => database.getData(), () => {
          api.sendInspectorTree(inspectorId)
          api.sendInspectorState(inspectorId)
        }, { deep: true })
      }
    }
  })
}
